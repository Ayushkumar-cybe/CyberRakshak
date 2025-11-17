import time
import uuid
import subprocess
import os
import json
import xml.etree.ElementTree as ET 
from sqlmodel import Session, select
from app.worker.celery_app import celery_app
from app.database import engine
from app.models import Job, JobStatus
from typing import List, Dict, Any, Optional

# --- NEW: Import the parsing functions ---
from app.parsers import parse_nmap, parse_nuclei, parse_nikto
# ----------------------------------------

# Path inside container
INTERNAL_OUTPUTS_DIR = os.path.abspath("outputs")
os.makedirs(INTERNAL_OUTPUTS_DIR, exist_ok=True)

# Path on host (for Docker -v)
HOST_PROJECT_PATH = os.environ.get("HOST_PROJECT_PATH", os.path.abspath("."))
HOST_OUTPUTS_DIR = os.path.join(HOST_PROJECT_PATH, "outputs")


@celery_app.task(bind=True)
def run_scan_task(self, job_id: str, scanners: List[str]):
    """
    Main Celery task:
    Runs scanners, saves raw output, and generates a normalized report.
    """
    print(f"Task received for job_id: {job_id} with scanners: {scanners}")
    
    with Session(engine) as session:
        job = None
        output_paths: Dict[str, str] = {} 
        normalized_data = {"ports": [], "vulnerabilities": []}
        vulnerabilities = []

        try:
            # 1. Get Job and check for idempotency
            job_uuid = uuid.UUID(job_id)
            job = session.get(Job, job_uuid)
            if not job:
                print(f"Error: Job {job_id} not found.")
                return

            if job.status == JobStatus.COMPLETED:
                print(f"Job {job_id} is already COMPLETED. Skipping execution.")
                return {"status": "Skipped", "reason": "Already Completed"}

            job.status = JobStatus.RUNNING
            session.add(job)
            session.commit()
            session.refresh(job)
            print(f"Job {job_id} marked as RUNNING for target: {job.target}")

            # Define Paths
            host_job_output_dir = os.path.join(HOST_OUTPUTS_DIR, job_id)
            internal_job_output_dir = os.path.join(INTERNAL_OUTPUTS_DIR, job_id)
            os.makedirs(internal_job_output_dir, exist_ok=True)

            # --- 2. CONDITIONAL DOCKER-BASED SCANNING (Execution) ---
            
            if "nmap" in scanners:
                print(f"Starting Nmap (Docker) for {job.target}...")
                nmap_output_in_container = "/output/nmap.xml"
                nmap_file_on_host = os.path.join(internal_job_output_dir, "nmap.xml")
                
                nmap_command = [
                    "docker", "run", "--rm",
                    "-v", f"{host_job_output_dir}:/output",
                    "instrumentisto/nmap",
                    "-sV", "-T4", "-oX", nmap_output_in_container, job.target
                ]
                subprocess.run(nmap_command, check=True, capture_output=True, text=True)
                output_paths["nmap"] = nmap_file_on_host
                print("Nmap scan complete.")

            if "nuclei" in scanners:
                print(f"Starting Nuclei (Docker) for {job.target}...")
                nuclei_output_in_container = "/output/nuclei.jsonl"
                nuclei_file_on_host = os.path.join(internal_job_output_dir, "nuclei.jsonl")
                
                nuclei_command = [
                    "docker", "run", "--rm",
                    "-v", f"{host_job_output_dir}:/output",
                    "projectdiscovery/nuclei",
                    "-target", job.target,
                    "-tags", "cve", 
                    "-jsonl", "-o", nuclei_output_in_container
                ]
                subprocess.run(nuclei_command, check=True, capture_output=True, text=True)
                output_paths["nuclei"] = nuclei_file_on_host
                print("Nuclei scan complete.")
            
            if "nikto" in scanners:
                print(f"Starting Nikto (Docker) for {job.target}...")
                nikto_output_in_container = "/output/nikto.json"
                nikto_file_on_host = os.path.join(internal_job_output_dir, "nikto.json")

                nikto_command = [
                    "docker", "run", "--rm",
                    "--user", "root",
                    "-v", f"{host_job_output_dir}:/output",
                    "ghcr.io/sullo/nikto:latest",
                    "-h", job.target,
                    "-Format", "json",
                    "-o", nikto_output_in_container,
                    "-Tuning", "4"
                ]
                subprocess.run(nikto_command, check=True, capture_output=True, text=True)
                output_paths["nikto"] = nikto_file_on_host
                print("Nikto scan complete.")
            
            print("All requested scans complete. Starting normalization...")


            # --- 3. NORMALIZATION (Week 2 Goal) ---

            # A. Parse Nmap for ports
            if "nmap" in output_paths:
                nmap_results = parse_nmap(output_paths["nmap"])
                normalized_data["host_info"] = nmap_results["host_info"]
                normalized_data["ports"].extend(nmap_results["open_ports"])

            # B. Parse Nuclei for vulnerabilities
            if "nuclei" in output_paths:
                vulnerabilities.extend(parse_nuclei(output_paths["nuclei"]))

            # C. Parse Nikto for vulnerabilities
            if "nikto" in output_paths:
                vulnerabilities.extend(parse_nikto(output_paths["nikto"]))
                
            normalized_data["vulnerabilities"] = vulnerabilities

            # 4. --- SAVE AND COMPLETE ---
            job.status = JobStatus.COMPLETED
            job.output_files = output_paths
            job.normalized_report = normalized_data # <-- SAVE THE FINAL REPORT HERE
            
            session.add(job)
            session.commit()
            print(f"Job {job_id} marked as COMPLETED. Normalized data saved to DB.")
            
            return {"status": "Completed", "target": job.target, "files": output_paths, "report_id": str(job.id)}

        except subprocess.CalledProcessError as e:
            print(f"Scan failed for job {job_id}.")
            print(f"COMMAND: {' '.join(e.cmd)}")
            print(f"STDOUT: {e.stdout}")
            print(f"STDERR: {e.stderr}")
            if job:
                job.status = JobStatus.FAILED
                job.output_files = output_paths
                session.add(job)
                session.commit()
            raise
        except Exception as e:
            print(f"Task for job {job_id} failed with general error: {e}")
            if job:
                job.status = JobStatus.FAILED
                session.add(job)
                session.commit()
            raise
