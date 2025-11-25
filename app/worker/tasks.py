import time
import uuid
import subprocess
import os
import json
import requests
import concurrent.futures
from sqlmodel import Session, select
from app.worker.celery_app import celery_app
from app.database import engine
from app.models import Job, JobStatus
from typing import List, Dict, Any, Optional
from app.parsers import parse_nmap, parse_nuclei, parse_nikto, parse_zap, parse_wappalyzer, parse_metasploit, parse_openvas
from app.enrichment import get_cisa_kev_data, enrich_vulnerability

INTERNAL_OUTPUTS_DIR = os.path.abspath("outputs")
os.makedirs(INTERNAL_OUTPUTS_DIR, exist_ok=True)
HOST_PROJECT_PATH = os.environ.get("HOST_PROJECT_PATH", os.path.abspath("."))
HOST_OUTPUTS_DIR = os.path.join(HOST_PROJECT_PATH, "outputs")

# --- HELPER: STATUS UPDATER ---
def update_tool_status(job_id: uuid.UUID, tool_name: str, status: str):
    """Updates the status of a single tool in the DB"""
    with Session(engine) as session:
        job = session.get(Job, job_id)
        if job:
            # We must copy, update, and re-assign to trigger SQLModel change detection for JSON fields
            current_status = job.tool_status.copy()
            current_status[tool_name] = status
            job.tool_status = current_status
            session.add(job)
            session.commit()

# --- SCANNERS ---

def run_nmap(target: str, host_dir: str, internal_dir: str, config: Dict[str, Any]) -> Optional[str]:
    print(f"Starting Nmap for {target}...")
    output_file = os.path.join(internal_dir, "nmap.xml")
    
    speed = config.get("speed", "T4")
    ports = config.get("ports")
    script = config.get("script")
    raw_args = config.get("raw_args") # New: Power User Args

    cmd = [
        "docker", "run", "--rm",
        "-v", f"{host_dir}:/output",
        "instrumentisto/nmap",
        "-sV", f"-{speed}", 
        "-oX", "/output/nmap.xml"
    ]
    if ports: cmd.extend(["-p", ports])
    if script: cmd.extend(["--script", script])
    if raw_args: cmd.extend(raw_args) # Inject custom flags

    cmd.append(target)
    
    subprocess.run(cmd, check=True, capture_output=True, text=True)
    print("Nmap completed.")
    return output_file

def run_nuclei(target: str, host_dir: str, internal_dir: str, config: Dict[str, Any]) -> Optional[str]:
    print(f"Starting Nuclei for {target}...")
    output_file = os.path.join(internal_dir, "nuclei.jsonl")
    
    tags = config.get("tags", "cve")
    severity = config.get("severity")
    raw_args = config.get("raw_args")

    cmd = [
        "docker", "run", "--rm",
        "-v", f"{host_dir}:/output",
        "projectdiscovery/nuclei",
        "-target", target,
        "-tags", tags, 
        "-jsonl", "-o", "/output/nuclei.jsonl"
    ]
    if severity: cmd.extend(["-severity", severity])
    if raw_args: cmd.extend(raw_args)

    subprocess.run(cmd, check=True, capture_output=True, text=True)
    print("Nuclei completed.")
    return output_file

def run_nikto(target: str, host_dir: str, internal_dir: str, config: Dict[str, Any]) -> Optional[str]:
    print(f"Starting Nikto for {target}...")
    output_file = os.path.join(internal_dir, "nikto.json")
    
    tuning = config.get("tuning", "4")
    raw_args = config.get("raw_args")
    
    cmd = [
        "docker", "run", "--rm",
        "--user", "root",
        "-v", f"{host_dir}:/output",
        "ghcr.io/sullo/nikto:latest",
        "-h", target,
        "-Format", "json",
        "-o", "/output/nikto.json",
        "-Tuning", tuning
    ]
    if raw_args: cmd.extend(raw_args)

    subprocess.run(cmd, check=True, capture_output=True, text=True)
    print("Nikto completed.")
    return output_file

def run_zap(target: str, host_dir: str, internal_dir: str, config: Dict[str, Any]) -> Optional[str]:
    print(f"Starting ZAP for {target}...")
    output_file = os.path.join(internal_dir, "zap.json")
    target_url = target if target.startswith("http") else f"http://{target}"
    
    mode = config.get("mode", "baseline")
    raw_args = config.get("raw_args")
    script = "zap-full-scan.py" if mode == "full" else "zap-baseline.py"
    
    cmd = [
        "docker", "run", "--rm",
        "--user", "root",
        "-v", f"{host_dir}:/zap/wrk/:rw",
        "ghcr.io/zaproxy/zaproxy:stable",
        script,
        "-t", target_url,
        "-J", "zap.json"
    ]
    if raw_args: cmd.extend(raw_args)

    subprocess.run(cmd, check=False, capture_output=True, text=True)
    print("ZAP completed.")
    return output_file

def run_wappalyzer(target: str, host_dir: str, internal_dir: str, config: Dict[str, Any]) -> Optional[str]:
    print(f"Starting Wappalyzer for {target}...")
    output_file = os.path.join(internal_dir, "wappalyzer.json")
    target_url = target if target.startswith("http") else f"http://{target}"
    
    cmd = [ "docker", "run", "--rm", "local/wappalyzer", target_url ]
    result = subprocess.run(cmd, check=False, capture_output=True, text=True)
    try:
        json.loads(result.stdout)
        with open(output_file, 'w') as f: f.write(result.stdout)
        print("Wappalyzer completed.")
        return output_file
    except: return None

def run_metasploit(target: str, host_dir: str, internal_dir: str, config: Dict[str, Any]) -> Optional[str]:
    print(f"Starting Metasploit for {target}...")
    output_file = os.path.join(internal_dir, "metasploit.txt")
    
    modules = config.get("modules", ["auxiliary/scanner/http/http_version"])
    
    msf_commands = ""
    for mod in modules:
        msf_commands += f"use {mod}; set RHOSTS {target}; run; "
    msf_commands += "exit"

    cmd = [
        "docker", "run", "--rm",
        "metasploitframework/metasploit-framework",
        "./msfconsole", "-q", "-x", msf_commands 
    ]
    result = subprocess.run(cmd, check=False, capture_output=True, text=True)
    with open(output_file, 'w') as f: f.write(result.stdout)
    print("Metasploit completed.")
    return output_file

def run_openvas(target: str, host_dir: str, internal_dir: str, config: Dict[str, Any]) -> Optional[str]:
    print(f"Starting OpenVAS for {target}...")
    output_file = os.path.join(internal_dir, "openvas.xml")
    script_filename = "openvas_scan.gmp.py"
    
    profile = config.get("profile", "Full and fast")
    config_id = "daba56c8-73ec-11df-a475-002264764cea"
    if profile == "Discovery": config_id = "8715c877-47a0-471c-8f13-5266c9931727"
    
    # Note: raw_args not easily supported for GMP script injection yet
    
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
    response = gmp.create_task(name="Task-{target}", config_id="{config_id}", target_id=target_id, scanner_id="08b69003-5fc2-4037-a479-93b440211c73")
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
    with open(script_path, 'w') as f: f.write(gmp_script)
    os.chmod(script_path, 0o644)

    cmd = [
        "docker", "run", "--rm", "--user", "1001",
        "--network", "greenbone-community-edition_default",
        "-v", "greenbone-community-edition_gvmd_socket_vol:/run/gvmd",
        "-v", f"{host_dir}:/scan",
        "local/gvm-tools",
        "--gmp-username", "admin", "--gmp-password", "admin", 
        "socket", "--socketpath", "/run/gvmd/gvmd.sock",
        f"/scan/{script_filename}"
    ]
    try:
        result = subprocess.run(cmd, check=False, capture_output=True, text=True)
        if result.returncode != 0: return None
        
        xml_content = result.stdout
        xml_start = xml_content.find('<report')
        if xml_start != -1:
             final_xml = xml_content[xml_start:]
             xml_end = final_xml.rfind('</report>') + 9
             final_xml = final_xml[:xml_end]
             with open(output_file, 'w') as f: f.write(final_xml)
             print("OpenVAS scan complete.")
             return output_file
        return None
    except: return None

# --- WRAPPER FOR THREADING ---
def run_scanner_wrapper(scanner_func, job_id, tool_name, *args):
    """Wrapper to update DB status before and after scan"""
    try:
        update_tool_status(job_id, tool_name, "running")
        result = scanner_func(*args)
        if result:
            update_tool_status(job_id, tool_name, "completed")
            return result
        else:
            update_tool_status(job_id, tool_name, "failed")
            return None
    except Exception as e:
        print(f"Error in {tool_name}: {e}")
        update_tool_status(job_id, tool_name, "failed")
        return None

# --- MAIN TASK ---

@celery_app.task(bind=True)
def run_scan_task(self, job_id: str, scanners: Dict[str, Any]):
    print(f"Task received for job_id: {job_id}. Scanners: {list(scanners.keys())}")
    
    with Session(engine) as session:
        job_uuid = uuid.UUID(job_id)
        job = session.get(Job, job_uuid)
        if not job: return
        
        # Initialize tool status
        initial_status = {name: "pending" for name in scanners.keys()}
        job.tool_status = initial_status
        job.status = JobStatus.RUNNING
        session.add(job)
        session.commit()

        output_paths: Dict[str, str] = {} 
        normalized_data = {"ports": [], "vulnerabilities": [], "technologies": []}
        vulnerabilities = []

        host_dir = os.path.join(HOST_OUTPUTS_DIR, job_id)
        internal_dir = os.path.join(INTERNAL_OUTPUTS_DIR, job_id)
        os.makedirs(internal_dir, exist_ok=True)

        scanner_map = {
            "nmap": run_nmap,
            "nuclei": run_nuclei,
            "nikto": run_nikto,
            "zap": run_zap,
            "wappalyzer": run_wappalyzer,
            "metasploit": run_metasploit,
            "openvas": run_openvas
        }

        print("Launching parallel scans...")
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            future_to_scanner = {}
            for name, config in scanners.items():
                if name in scanner_map:
                    # Use the WRAPPER to handle DB updates
                    future = executor.submit(run_scanner_wrapper, scanner_map[name], job_uuid, name, job.target, host_dir, internal_dir, config)
                    future_to_scanner[future] = name
            
            for future in concurrent.futures.as_completed(future_to_scanner):
                name = future_to_scanner[future]
                try:
                    result_path = future.result()
                    if result_path: output_paths[name] = result_path
                except Exception as e: 
                    print(f"Scanner {name} exception: {e}")

        # Check for partial success
        failed_tools = [n for n, s in job.tool_status.items() if s == "failed"]
        all_failed = len(failed_tools) == len(scanners)
        
        print("Starting normalization...")
        if "nmap" in output_paths:
            res = parse_nmap(output_paths["nmap"])
            normalized_data["host_info"] = res["host_info"]
            normalized_data["ports"].extend(res["open_ports"])
        if "nuclei" in output_paths: vulnerabilities.extend(parse_nuclei(output_paths["nuclei"]))
        if "nikto" in output_paths: vulnerabilities.extend(parse_nikto(output_paths["nikto"]))
        if "zap" in output_paths: vulnerabilities.extend(parse_zap(output_paths["zap"]))
        if "wappalyzer" in output_paths: normalized_data["technologies"] = parse_wappalyzer(output_paths["wappalyzer"])
        if "metasploit" in output_paths: vulnerabilities.extend(parse_metasploit(output_paths["metasploit"]))
        if "openvas" in output_paths: vulnerabilities.extend(parse_openvas(output_paths["openvas"]))

        print("Enriching data...")
        cisa_cache = get_cisa_kev_data()
        enriched_vulns = [enrich_vulnerability(v, cisa_cache) for v in vulnerabilities]
        normalized_data["vulnerabilities"] = enriched_vulns

        # Final Status Update
        job.status = JobStatus.FAILED if all_failed else (JobStatus.PARTIAL_SUCCESS if failed_tools else JobStatus.COMPLETED)
        job.output_files = output_paths
        job.normalized_report = normalized_data
        
        session.add(job)
        session.commit()
        
        return {"status": job.status, "files": output_paths}
