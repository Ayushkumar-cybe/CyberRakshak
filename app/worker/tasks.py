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
from app.parsers import parse_nmap, parse_nuclei, parse_nikto, parse_zap, parse_wappalyzer
from app.enrichment import get_cisa_kev_data, enrich_vulnerability

# Path inside container
INTERNAL_OUTPUTS_DIR = os.path.abspath("outputs")
os.makedirs(INTERNAL_OUTPUTS_DIR, exist_ok=True)

# Path on host (for Docker -v)
HOST_PROJECT_PATH = os.environ.get("HOST_PROJECT_PATH", os.path.abspath("."))
HOST_OUTPUTS_DIR = os.path.join(HOST_PROJECT_PATH, "outputs")


@celery_app.task(bind=True)
def run_scan_task(self, job_id: str, scanners: List[str]):
    print(f"Task received for job_id: {job_id} with scanners: {scanners}")
    
    with Session(engine) as session:
        job = None
        output_paths: Dict[str, str] = {} 
        normalized_data = {"ports": [], "vulnerabilities": [], "technologies": []}
        vulnerabilities = []

        try:
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

            host_job_output_dir = os.path.join(HOST_OUTPUTS_DIR, job_id)
            internal_job_output_dir = os.path.join(INTERNAL_OUTPUTS_DIR, job_id)
            os.makedirs(internal_job_output_dir, exist_ok=True)

            target_url = job.target
            if not target_url.startswith("http"):
                target_url = f"http://{job.target}"

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

            if "zap" in scanners:
                print(f"Starting OWASP ZAP (Docker) for {job.target}...")
                zap_output_filename = "zap.json"
                zap_file_on_host = os.path.join(internal_job_output_dir, zap_output_filename)

                zap_command = [
                    "docker", "run", "--rm",
                    "--user", "root",
                    "-v", f"{host_job_output_dir}:/zap/wrk/:rw",
                    "ghcr.io/zaproxy/zaproxy:stable",
                    "zap-baseline.py",
                    "-t", target_url,
                    "-J", zap_output_filename
                ]
                subprocess.run(zap_command, check=False, capture_output=True, text=True)
                output_paths["zap"] = zap_file_on_host
                print("ZAP scan complete.")

            if "wappalyzer" in scanners:
                print(f"Starting Wappalyzer (Docker) for {job.target}...")
                wappalyzer_file = os.path.join(internal_job_output_dir, "wappalyzer.json")

                # Use the local image we built
                wappalyzer_command = [
                    "docker", "run", "--rm",
                    "local/wappalyzer",
                    target_url
                ]
                
                result = subprocess.run(wappalyzer_command, check=False, capture_output=True, text=True)
                
                try:
                    # Wappalyzer outputs JSON to stdout
                    json.loads(result.stdout)
                    with open(wappalyzer_file, 'w') as f:
                        f.write(result.stdout)
                    output_paths["wappalyzer"] = wappalyzer_file
                    print("Wappalyzer scan complete.")
                except json.JSONDecodeError:
                    print(f"Wappalyzer failed: {result.stderr}")

            print("All requested scans complete. Starting normalization...")

            if "nmap" in output_paths:
                nmap_results = parse_nmap(output_paths["nmap"])
                normalized_data["host_info"] = nmap_results["host_info"]
                normalized_data["ports"].extend(nmap_results["open_ports"])

            if "nuclei" in output_paths:
                vulnerabilities.extend(parse_nuclei(output_paths["nuclei"]))

            if "nikto" in output_paths:
                vulnerabilities.extend(parse_nikto(output_paths["nikto"]))

            if "zap" in output_paths:
                vulnerabilities.extend(parse_zap(output_paths["zap"]))

            if "wappalyzer" in output_paths:
                normalized_data["technologies"] = parse_wappalyzer(output_paths["wappalyzer"])
            
            print("Starting enrichment...")
            cisa_cache = get_cisa_kev_data()
            enriched_vulnerabilities = []
            for vuln in vulnerabilities:
                enriched_vuln = enrich_vulnerability(vuln, cisa_cache)
                enriched_vulnerabilities.append(enriched_vuln)
            
            normalized_data["vulnerabilities"] = enriched_vulnerabilities

            job.status = JobStatus.COMPLETED
            job.output_files = output_paths
            job.normalized_report = normalized_data
            
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
