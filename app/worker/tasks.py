import time
import uuid
import subprocess
import os
import json
import concurrent.futures
from sqlmodel import Session, select
from app.worker.celery_app import celery_app
from app.database import engine
from app.models import Job, JobStatus
from typing import List, Dict, Any, Optional
from app.parsers import parse_nmap, parse_nuclei, parse_nikto, parse_zap, parse_wappalyzer, parse_metasploit
from app.enrichment import get_cisa_kev_data, enrich_vulnerability

# Path inside container
INTERNAL_OUTPUTS_DIR = os.path.abspath("outputs")
os.makedirs(INTERNAL_OUTPUTS_DIR, exist_ok=True)

# Path on host (for Docker -v)
HOST_PROJECT_PATH = os.environ.get("HOST_PROJECT_PATH", os.path.abspath("."))
HOST_OUTPUTS_DIR = os.path.join(HOST_PROJECT_PATH, "outputs")

# --- HELPER FUNCTIONS FOR INDIVIDUAL SCANNERS ---

def run_nmap(target: str, host_dir: str, internal_dir: str) -> Optional[str]:
    print(f"Starting Nmap for {target}...")
    output_file = os.path.join(internal_dir, "nmap.xml")
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{host_dir}:/output",
        "instrumentisto/nmap",
        "-sV", "-T4", "-oX", "/output/nmap.xml",
        target
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)
    print("Nmap completed.")
    return output_file

def run_nuclei(target: str, host_dir: str, internal_dir: str) -> Optional[str]:
    print(f"Starting Nuclei for {target}...")
    output_file = os.path.join(internal_dir, "nuclei.jsonl")
    cmd = [
        "docker", "run", "--rm",
        "-v", f"{host_dir}:/output",
        "projectdiscovery/nuclei",
        "-target", target,
        "-tags", "cve", 
        "-jsonl", "-o", "/output/nuclei.jsonl"
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)
    print("Nuclei completed.")
    return output_file

def run_nikto(target: str, host_dir: str, internal_dir: str) -> Optional[str]:
    print(f"Starting Nikto for {target}...")
    output_file = os.path.join(internal_dir, "nikto.json")
    cmd = [
        "docker", "run", "--rm",
        "--user", "root",
        "-v", f"{host_dir}:/output",
        "ghcr.io/sullo/nikto:latest",
        "-h", target,
        "-Format", "json",
        "-o", "/output/nikto.json",
        "-Tuning", "4"
    ]
    subprocess.run(cmd, check=True, capture_output=True, text=True)
    print("Nikto completed.")
    return output_file

def run_zap(target: str, host_dir: str, internal_dir: str) -> Optional[str]:
    print(f"Starting ZAP for {target}...")
    output_file = os.path.join(internal_dir, "zap.json")
    target_url = target if target.startswith("http") else f"http://{target}"
    
    cmd = [
        "docker", "run", "--rm",
        "--user", "root",
        "-v", f"{host_dir}:/zap/wrk/:rw",
        "ghcr.io/zaproxy/zaproxy:stable",
        "zap-baseline.py",
        "-t", target_url,
        "-J", "zap.json"
    ]
    # ZAP returns exit code 1/2 for findings, so check=False
    subprocess.run(cmd, check=False, capture_output=True, text=True)
    print("ZAP completed.")
    return output_file

def run_wappalyzer(target: str, host_dir: str, internal_dir: str) -> Optional[str]:
    print(f"Starting Wappalyzer for {target}...")
    output_file = os.path.join(internal_dir, "wappalyzer.json")
    target_url = target if target.startswith("http") else f"http://{target}"
    
    cmd = [
        "docker", "run", "--rm",
        "local/wappalyzer",
        target_url
    ]
    # Wappalyzer outputs to stdout
    result = subprocess.run(cmd, check=False, capture_output=True, text=True)
    
    try:
        json.loads(result.stdout) # Validate JSON
        with open(output_file, 'w') as f:
            f.write(result.stdout)
        print("Wappalyzer completed.")
        return output_file
    except json.JSONDecodeError:
        print(f"Wappalyzer failed: {result.stderr}")
        return None

def run_metasploit(target: str, host_dir: str, internal_dir: str) -> Optional[str]:
    print(f"Starting Metasploit for {target}...")
    output_file = os.path.join(internal_dir, "metasploit.txt")
    
    # Chain commands
    msf_commands = (
        f"use auxiliary/scanner/http/http_version; set RHOSTS {target}; run; "
        f"use auxiliary/scanner/http/title; set RHOSTS {target}; run; "
        f"use auxiliary/scanner/ssh/ssh_version; set RHOSTS {target}; run; "
        f"exit"
    )

    cmd = [
        "docker", "run", "--rm",
        "metasploitframework/metasploit-framework",
        "./msfconsole",
        "-q", 
        "-x", msf_commands 
    ]
    
    result = subprocess.run(cmd, check=False, capture_output=True, text=True)
    
    with open(output_file, 'w') as f:
        f.write(result.stdout)
    
    print("Metasploit completed.")
    return output_file

# --- MAIN TASK ---

@celery_app.task(bind=True)
def run_scan_task(self, job_id: str, scanners: List[str]):
    print(f"Task received for job_id: {job_id} with scanners: {scanners}")
    
    with Session(engine) as session:
        job = None
        output_paths: Dict[str, str] = {} 
        normalized_data = {"ports": [], "vulnerabilities": [], "technologies": []}
        vulnerabilities = []

        try:
            # 1. Get Job & Idempotency Check
            job_uuid = uuid.UUID(job_id)
            job = session.get(Job, job_uuid)
            if not job: return
            
            if job.status == JobStatus.COMPLETED:
                print(f"Job {job_id} already COMPLETED. Skipping.")
                return {"status": "Skipped", "reason": "Already Completed"}

            job.status = JobStatus.RUNNING
            session.add(job)
            session.commit()

            # Setup Paths
            host_dir = os.path.join(HOST_OUTPUTS_DIR, job_id)
            internal_dir = os.path.join(INTERNAL_OUTPUTS_DIR, job_id)
            os.makedirs(internal_dir, exist_ok=True)

            # 2. PARALLEL EXECUTION
            print("Launching parallel scans...")
            # Map scanner names to functions
            scanner_map = {
                "nmap": run_nmap,
                "nuclei": run_nuclei,
                "nikto": run_nikto,
                "zap": run_zap,
                "wappalyzer": run_wappalyzer,
                "metasploit": run_metasploit
            }

            with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
                future_to_scanner = {}
                for name in scanners:
                    if name in scanner_map:
                        future = executor.submit(scanner_map[name], job.target, host_dir, internal_dir)
                        future_to_scanner[future] = name
                
                # Wait for results
                for future in concurrent.futures.as_completed(future_to_scanner):
                    name = future_to_scanner[future]
                    try:
                        result_path = future.result()
                        if result_path:
                            output_paths[name] = result_path
                    except Exception as e:
                        print(f"Scanner {name} failed: {e}")

            print("All scans finished. Starting normalization...")

            # 3. Normalization
            if "nmap" in output_paths:
                res = parse_nmap(output_paths["nmap"])
                normalized_data["host_info"] = res["host_info"]
                normalized_data["ports"].extend(res["open_ports"])
            
            if "nuclei" in output_paths:
                vulnerabilities.extend(parse_nuclei(output_paths["nuclei"]))
            
            if "nikto" in output_paths:
                vulnerabilities.extend(parse_nikto(output_paths["nikto"]))
            
            if "zap" in output_paths:
                vulnerabilities.extend(parse_zap(output_paths["zap"]))
            
            if "wappalyzer" in output_paths:
                normalized_data["technologies"] = parse_wappalyzer(output_paths["wappalyzer"])
                
            if "metasploit" in output_paths:
                vulnerabilities.extend(parse_metasploit(output_paths["metasploit"]))

            # 4. Enrichment
            print("Enriching data...")
            cisa_cache = get_cisa_kev_data()
            enriched_vulns = [enrich_vulnerability(v, cisa_cache) for v in vulnerabilities]
            normalized_data["vulnerabilities"] = enriched_vulns

            # 5. Save
            job.status = JobStatus.COMPLETED
            job.output_files = output_paths
            job.normalized_report = normalized_data
            session.add(job)
            session.commit()
            print(f"Job {job_id} COMPLETED successfully.")
            
            return {"status": "Completed", "files": output_paths}

        except Exception as e:
            print(f"Task failed: {e}")
            if job:
                job.status = JobStatus.FAILED
                session.add(job)
                session.commit()
            raise
