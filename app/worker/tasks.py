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
from app.parsers import parse_nmap, parse_nuclei, parse_nikto, parse_zap, parse_wappalyzer, parse_metasploit, parse_openvas
from app.enrichment import get_cisa_kev_data, enrich_vulnerability

# Path inside container
INTERNAL_OUTPUTS_DIR = os.path.abspath("outputs")
os.makedirs(INTERNAL_OUTPUTS_DIR, exist_ok=True)

# Path on host (for Docker -v)
HOST_PROJECT_PATH = os.environ.get("HOST_PROJECT_PATH", os.path.abspath("."))
HOST_OUTPUTS_DIR = os.path.join(HOST_PROJECT_PATH, "outputs")

# --- HELPER FUNCTIONS ---

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
    result = subprocess.run(cmd, check=False, capture_output=True, text=True)
    
    try:
        json.loads(result.stdout)
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

def run_openvas(target: str, host_dir: str, internal_dir: str) -> Optional[str]:
    print(f"Starting OpenVAS for {target}...")
    output_file = os.path.join(internal_dir, "openvas.xml")
    script_filename = "openvas_scan.gmp.py"
    
    gmp_script = f"""
import sys
import time
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeTransform
from lxml import etree

connection = UnixSocketConnection(path='/run/gvmd/gvmd.sock')
transform = EtreeTransform()

with Gmp(connection, transform=transform) as gmp:
    gmp.authenticate('admin', 'admin')

    response = gmp.create_target(name="Scan-{target}-" + str(time.time()), hosts=["{target}"], port_list_id="33d0cd82-57c6-11e1-8ed1-406186ea4fc5")
    target_id = response.get('id')

    response = gmp.create_task(name="Task-{target}", config_id="daba56c8-73ec-11df-a475-002264764cea", target_id=target_id, scanner_id="08b69003-5fc2-4037-a479-93b440211c73")
    task_id = response.get('id')

    gmp.start_task(task_id)
    
    while True:
        response = gmp.get_task(task_id)
        status = response.xpath('task/status/text()')[0]
        if status == 'Done': break
        if status in ['Stopped', 'Interrupted']: break
        time.sleep(30)
    
    response = gmp.get_task(task_id)
    report_id = response.xpath('task/last_report/report/@id')[0]
    
    response = gmp.get_report(report_id, report_format_id="a994b278-1f62-11e1-96ac-406186ea4fc5")
    print(etree.tostring(response, encoding='unicode'))
"""
    
    script_path = os.path.join(internal_dir, script_filename)
    with open(script_path, 'w') as f:
        f.write(gmp_script)
    os.chmod(script_path, 0o644)

    cmd = [
        "docker", "run", "--rm",
        "--user", "1001",
        "--network", "greenbone-community-edition_default",
        "-v", "greenbone-community-edition_gvmd_socket_vol:/run/gvmd",
        "-v", f"{host_dir}:/scan",
        "local/gvm-tools",
        "--gmp-username", "admin", 
        "--gmp-password", "admin", 
        "socket", 
        "--socketpath", "/run/gvmd/gvmd.sock",
        f"/scan/{script_filename}"
    ]
    
    try:
        result = subprocess.run(cmd, check=False, capture_output=True, text=True)
        if result.returncode != 0:
             print(f"OpenVAS failed: {result.stderr}")
             return None

        xml_content = result.stdout
        xml_start = xml_content.find('<report')
        if xml_start != -1:
             final_xml = xml_content[xml_start:]
             xml_end = final_xml.rfind('</report>') + 9
             final_xml = final_xml[:xml_end]
             with open(output_file, 'w') as f:
                 f.write(final_xml)
             print("OpenVAS scan complete.")
             return output_file
        return None

    except Exception as e:
        print(f"OpenVAS exception: {e}")
        return None

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
            job_uuid = uuid.UUID(job_id)
            job = session.get(Job, job_uuid)
            if not job: return
            
            if job.status == JobStatus.COMPLETED:
                return {"status": "Skipped", "reason": "Already Completed"}

            job.status = JobStatus.RUNNING
            session.add(job)
            session.commit()

            host_dir = os.path.join(HOST_OUTPUTS_DIR, job_id)
            internal_dir = os.path.join(INTERNAL_OUTPUTS_DIR, job_id)
            os.makedirs(internal_dir, exist_ok=True)

            print("Launching parallel scans...")
            scanner_map = {
                "nmap": run_nmap,
                "nuclei": run_nuclei,
                "nikto": run_nikto,
                "zap": run_zap,
                "wappalyzer": run_wappalyzer,
                "metasploit": run_metasploit,
                "openvas": run_openvas
            }

            with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
                future_to_scanner = {}
                for name in scanners:
                    if name in scanner_map:
                        future = executor.submit(scanner_map[name], job.target, host_dir, internal_dir)
                        future_to_scanner[future] = name
                
                for future in concurrent.futures.as_completed(future_to_scanner):
                    name = future_to_scanner[future]
                    try:
                        result_path = future.result()
                        if result_path:
                            output_paths[name] = result_path
                    except Exception as e:
                        print(f"Scanner {name} failed: {e}")

            print("Starting normalization...")
            
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

            if "openvas" in output_paths:
                vulnerabilities.extend(parse_openvas(output_paths["openvas"]))

            print("Enriching data...")
            cisa_cache = get_cisa_kev_data()
            enriched_vulns = [enrich_vulnerability(v, cisa_cache) for v in vulnerabilities]
            normalized_data["vulnerabilities"] = enriched_vulns

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
