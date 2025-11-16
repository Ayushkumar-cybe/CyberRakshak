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

# This is the path INSIDE the container (e.g., /app/outputs)
INTERNAL_OUTPUTS_DIR = os.path.abspath("outputs")
os.makedirs(INTERNAL_OUTPUTS_DIR, exist_ok=True)

# --- THIS IS THE FIX ---
# This is the path ON THE HOST VM (e.g., /home/tanishaq/CyberRakshak)
# It's read from the docker-compose environment
HOST_PROJECT_PATH = os.environ.get("HOST_PROJECT_PATH", os.path.abspath("."))
HOST_OUTPUTS_DIR = os.path.join(HOST_PROJECT_PATH, "outputs")
# --- END FIX ---


@celery_app.task(bind=True)
def run_scan_task(self, job_id: str, scanners: List[str]):
    """
    Main Celery task:
    Runs the requested scanners (nmap, nuclei, nikto) using DOCKER
    and saves their output file paths to the database.
    """
    print(f"Task received for job_id: {job_id} with scanners: {scanners}")
    
    with Session(engine) as session:
        job = None
        output_paths: Dict[str, str] = {} 

        try:
            # 1. Get Job and set to RUNNING
            job_uuid = uuid.UUID(job_id)
            job = session.get(Job, job_uuid)
            if not job:
                print(f"Error: Job {job_id} not found.")
                return

            job.status = JobStatus.RUNNING
            session.add(job)
            session.commit()
            session.refresh(job)
            print(f"Job {job_id} marked as RUNNING for target: {job.target}")

            # --- PATH FIX ---
            # Path on the HOST VM for the docker -v flag
            # e.g., /home/tanishaq/CyberRakshak/outputs/JOB_ID
            host_job_output_dir = os.path.join(HOST_OUTPUTS_DIR, job_id)
            
            # Path INSIDE this container for saving to the DB
            # e.g., /app/outputs/JOB_ID
            internal_job_output_dir = os.path.join(INTERNAL_OUTPUTS_DIR, job_id)
            # We only need to create the *internal* directory
            os.makedirs(internal_job_output_dir, exist_ok=True)
            # --- END FIX ---


            # --- 2. CONDITIONAL DOCKER-BASED SCANNING ---
            
            if "nmap" in scanners:
                print(f"Starting Nmap (Docker) for {job.target}...")
                nmap_output_in_container = "/output/nmap.xml"
                nmap_file_on_host = os.path.join(internal_job_output_dir, "nmap.xml")
                
                nmap_command = [
                    "docker", "run", "--rm",
                    # --- THIS IS THE FIX ---
                    # Use the *host* path for the -v flag
                    "-v", f"{host_job_output_dir}:/output",
                    # --- END FIX ---
                    "instrumentisto/nmap",
                    "-sV", "-T4", 
                    "-oX", nmap_output_in_container,
                    job.target
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
                    # --- THIS IS THE FIX ---
                    # Use the *host* path for the -v flag
                    "-v", f"{host_job_output_dir}:/output",
                    # --- END FIX ---
                    "projectdiscovery/nuclei",
                    "-target", job.target,
                    "-tags", "cve", 
                    "-jsonl",
                    "-o", nuclei_output_in_container
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
                    "--user", str(os.getuid()),
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
            
            # 3. --- SKIPPING NORMALIZATION (for now) ---
            print("All requested scans complete.")

            # 4. --- SAVE AND COMPLETE ---
            job.status = JobStatus.COMPLETED
            job.output_files = output_paths
            
            session.add(job)
            session.commit()
            print(f"Job {job_id} marked as COMPLETED and output files saved.")
            
            return {"status": "Completed", "target": job.target, "files": output_paths}

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
