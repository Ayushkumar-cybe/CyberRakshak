import time
import uuid
import subprocess
import os
import json
import xml.etree.ElementTree as ET # We'll need this for Week 2
from sqlmodel import Session, select
from app.worker.celery_app import celery_app
from app.database import engine
from app.models import Job, JobStatus
from typing import List, Dict, Any, Optional

# This path is now your local path, e.g., F:\SIH234 (final)\outputs
OUTPUTS_DIR = os.path.abspath("outputs")
# Ensure the base output directory exists
os.makedirs(OUTPUTS_DIR, exist_ok=True)


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
        # This dict will store our results
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

            # Create the unique output directory for this job
            # This path MUST be absolute for Docker volumes to work
            job_output_dir = os.path.join(OUTPUTS_DIR, job_id)
            os.makedirs(job_output_dir, exist_ok=True)

            # --- 2. CONDITIONAL DOCKER-BASED SCANNING ---
            
            if "nmap" in scanners:
                print(f"Starting Nmap (Docker) for {job.target}...")
                # The output file path *inside the container*
                nmap_output_in_container = "/output/nmap.xml"
                # The final file path *on the host* (for the DB)
                nmap_file_on_host = os.path.join(job_output_dir, "nmap.xml")
                
                nmap_command = [
                    "docker", "run", "--rm",
                    # Mount the host's job_output_dir to /output inside the container
                    # e.g., -v "F:\SIH234 (final)\outputs\job_id":/output
                    "-v", f"{job_output_dir}:/output",
                    # Popular, well-maintained Nmap Docker image
                    "instrumentisto/nmap",
                    "-sV", "-T4", 
                    "-oX", nmap_output_in_container,  # Save to mounted dir
                    job.target
                ]
                subprocess.run(nmap_command, check=True, capture_output=True, text=True)
                output_paths["nmap"] = nmap_file_on_host
                print("Nmap scan complete.")

            if "nuclei" in scanners:
                print(f"Starting Nuclei (Docker) for {job.target}...")
                nuclei_output_in_container = "/output/nuclei.jsonl"
                nuclei_file_on_host = os.path.join(job_output_dir, "nuclei.jsonl")
                
                nuclei_command = [
                    "docker", "run", "--rm",
                    "-v", f"{job_output_dir}:/output",
                    # Official Nuclei image
                    "projectdiscovery/nuclei",
                    "-target", job.target,
                    "-jsonl", 
                    "-o", nuclei_output_in_container, # Save to mounted dir
                    "-duc"
                ]
                subprocess.run(nuclei_command, check=True, capture_output=True, text=True)
                output_paths["nuclei"] = nuclei_file_on_host
                print("Nuclei scan complete.")
            
            if "nikto" in scanners:
                print(f"Starting Nikto (Docker) for {job.target}...")
                # This will fix your C:\tools\nikto.bat issue
                nikto_output_in_container = "/output/nikto.json"
                nikto_file_on_host = os.path.join(job_output_dir, "nikto.json")

                nikto_command = [
                    "docker", "run", "--rm",
                    "-v", f"{job_output_dir}:/output",
                    # Popular Nikto image
                    "sullo/nikto",
                    "-h", job.target,
                    "-Format", "json",
                    "-o", nikto_output_in_container, # Save to mounted dir
                    "-Tuning", "4"
                ]
                subprocess.run(nikto_command, check=True, capture_output=True, text=True)
                output_paths["nikto"] = nikto_file_on_host
                print("Nikto scan complete.")
            
            # 3. --- SKIPPING NORMALIZATION (for now) ---
            print("All requested scans complete.")

            # 4. --- SAVE AND COMPLETE ---
            job.status = JobStatus.COMPLETED
            job.output_files = output_paths  # <-- Save the dict of file paths
            
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
                job.output_files = output_paths # Save partial results
                session.add(job)
                session.commit()
            raise
        except Exception as e:
            # Handle other failures (e.g., database)
            print(f"Task for job {job_id} failed with general error: {e}")
            if job:
                job.status = JobStatus.FAILED
                session.add(job)
                session.commit()
            raise