import json
import xml.etree.ElementTree as ET
from typing import Dict, Any, List
import re
import logging

# Configure logging
logger = logging.getLogger(__name__)

def parse_nmap(file_path: str) -> Dict[str, Any]:
    """
    Parses Nmap XML output to extract host info and open ports.
    """
    results = {"host_info": {}, "open_ports": []}
    
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()
    except Exception as e:
        logger.error(f"Error reading Nmap file {file_path}: {e}")
        return results

    # Find the <host> element. 
    # Note: If scanning multiple IPs, this usually finds the first one.
    # For this project, we assume one target per job.
    host = root.find("host")
    if not host:
        return results

    # 1. Extract Host Info (IP, Hostnames)
    address = host.find("address")
    if address is not None:
        results["host_info"]["ip"] = address.get("addr")
        results["host_info"]["type"] = address.get("addrtype")

    hostnames = host.find("hostnames")
    if hostnames:
        # Extract all hostname tags
        names = [hn.get("name") for hn in hostnames.findall("hostname")]
        results["host_info"]["hostnames"] = names

    # 2. Extract Open Ports and Services
    ports_element = host.find("ports")
    if ports_element:
        for port in ports_element.findall("port"):
            state = port.find("state")
            # We only care about open ports
            if state is not None and state.get("state") == "open":
                port_id = int(port.get("portid"))
                protocol = port.get("protocol")
                
                service = port.find("service")
                service_name = "unknown"
                product = ""
                version = ""
                
                if service is not None:
                    service_name = service.get("name", "unknown")
                    product = service.get("product", "")
                    version = service.get("version", "")

                results["open_ports"].append({
                    "port": port_id,
                    "protocol": protocol,
                    "service": service_name,
                    "product": product,
                    "version": version
                })

    return results


def parse_nuclei(file_path: str) -> List[Dict[str, Any]]:
    """
    Parses Nuclei JSONL output.
    Each line is a separate JSON object representing a vulnerability.
    """
    vulnerabilities = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    
                    # Extract key fields for our normalized report
                    info = data.get("info", {})
                    
                    # Build a standardized vulnerability object
                    vuln = {
                        "tool": "nuclei",
                        "title": info.get("name", "Unknown Vulnerability"),
                        "severity": info.get("severity", "info"),
                        "description": info.get("description", ""),
                        "matcher_name": data.get("matcher-name"),
                        "template_id": data.get("template-id"),
                        "matched_at": data.get("matched-at"),
                        "ip": data.get("ip"),
                        "port": data.get("port"),
                        "references": info.get("reference", [])
                    }
                    vulnerabilities.append(vuln)
                except json.JSONDecodeError:
                    continue
    except Exception as e:
        logger.error(f"Error reading Nuclei file {file_path}: {e}")
        
    return vulnerabilities


def parse_nikto(file_path: str) -> List[Dict[str, Any]]:
    """
    Parses Nikto JSON output.
    Based on your sample, the root is a LIST of hosts.
    [ { "host": "...", "vulnerabilities": [ ... ] } ]
    """
    vulnerabilities = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Nikto output is a list of host objects
            if isinstance(data, list):
                for host_data in data:
                    # Each host has a 'vulnerabilities' list
                    for item in host_data.get("vulnerabilities", []):
                         vuln = {
                            "tool": "nikto",
                            "title": item.get("msg", "Web Server Issue"),
                            # Nikto doesn't standard severity, default to 'info' or 'low'
                            "severity": "unknown", 
                            "description": f"OSVDB: {item.get('osvdb', 'N/A')}. Method: {item.get('method')}",
                            "url": item.get("url"),
                            "id": item.get("id"),
                            "references": [item.get("references", "")]
                         }
                         vulnerabilities.append(vuln)
            
            # Fallback: sometimes it might be a dict if single target (older versions)
            elif isinstance(data, dict):
                 for item in data.get("vulnerabilities", []):
                     vuln = {
                        "tool": "nikto",
                        "title": item.get("msg", "Web Server Issue"),
                        "severity": "unknown",
                        "description": f"OSVDB: {item.get('osvdb', 'N/A')}. Method: {item.get('method')}",
                        "url": item.get("url"),
                        "id": item.get("id"),
                        "references": [item.get("references", "")]
                     }
                     vulnerabilities.append(vuln)

    except Exception as e:
        logger.error(f"Error reading Nikto file {file_path}: {e}")

    return vulnerabilities

def parse_zap(file_path: str) -> List[Dict[str, Any]]:
    """
    Parses OWASP ZAP JSON output.
    """
    vulnerabilities = []
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            # ZAP reports are hierarchical: site -> alerts
            for site in data.get("site", []):
                for alert in site.get("alerts", []):
                    vuln = {
                        "tool": "zap",
                        "title": alert.get("name", "Unknown Vulnerability"),
                        # ZAP uses "High", "Medium", "Low", "Informational"
                        "severity": alert.get("riskdesc", "Info").split()[0].lower(),
                        "description": alert.get("desc", ""),
                        "solution": alert.get("solution", ""),
                        "url": site.get("@name", "") + alert.get("instances", [{}])[0].get("uri", ""),
                        "references": alert.get("reference", "").split("\n")
                    }
                    vulnerabilities.append(vuln)
    except Exception as e:
        logger.error(f"Error reading ZAP file {file_path}: {e}")
    return vulnerabilities

def parse_wappalyzer(file_path: str) -> List[Dict[str, Any]]:
    """
    Parses Wappalyzer JSON output.
    """
    technologies = []
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)

            # Wappalyzer structure: {"urls": {"http://target/": {"technologies": [...]}}}
            for url, info in data.get("urls", {}).items():
                for tech in info.get("technologies", []):
                    technologies.append({
                        "name": tech.get("name"),
                        "version": tech.get("version"),
                        "categories": [cat.get("name") for cat in tech.get("categories", [])],
                        "confidence": tech.get("confidence")
                    })
    except Exception as e:
        logger.error(f"Error reading Wappalyzer file {file_path}: {e}")

    return technologies

def parse_metasploit(file_path: str) -> List[Dict[str, Any]]:
    """
    Parses Metasploit (msfconsole) text output.
    Extracts information from auxiliary scanner modules, ignoring warnings.
    """
    vulnerabilities = []
    try:
        with open(file_path, 'r') as f:
            content = f.read()

        # Debug: Log what we read (optional, good for troubleshooting)
        # logger.info(f"Parsing Metasploit output: {content[:200]}...")

        for line in content.splitlines():
            line = line.strip()
            
            # Skip empty lines or warnings
            if not line or "deprecated" in line.lower() or "Gem::" in line:
                continue

            # Look for lines starting with "[+]" (Success in Metasploit)
            if line.startswith("[+]"):
                vuln = {
                    "tool": "metasploit",
                    "title": "Metasploit Finding",
                    "severity": "info", 
                    "description": line,
                    "raw_output": line
                }
                
                # Try to make the title more specific
                if "SSH server version" in line:
                    vuln["title"] = "SSH Version Detected"
                elif "Anonymous READ" in line:
                    vuln["title"] = "Anonymous FTP Access"
                    vuln["severity"] = "medium"
                elif "OS:" in line:
                    vuln["title"] = "OS Detection (SMB)"
                elif "Apache" in line or "nginx" in line:
                     vuln["title"] = "Web Server Version Detected"

                vulnerabilities.append(vuln)

    except Exception as e:
        logger.error(f"Error reading Metasploit file {file_path}: {e}")
    
    return vulnerabilities

def parse_openvas(file_path: str) -> List[Dict[str, Any]]:
    """
    Parses OpenVAS XML report.
    """
    vulnerabilities = []
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()

        # Iterate over results
        for result in root.findall(".//result"):
            name = result.find("name").text
            description = result.find("description").text
            severity_score = result.find("severity").text

            # Convert score to label
            score = float(severity_score)
            if score >= 9.0: severity = "critical"
            elif score >= 7.0: severity = "high"
            elif score >= 4.0: severity = "medium"
            elif score > 0.0: severity = "low"
            else: severity = "info"

            vuln = {
                "tool": "openvas",
                "title": name,
                "severity": severity,
                "description": description,
                "cvss_score": severity_score,
                "host": result.find("host").text,
                "port": result.find("port").text,
                "nvt_oid": result.find("nvt").get("oid")
            }
            vulnerabilities.append(vuln)
    except Exception as e:
        logger.error(f"Error reading OpenVAS file {file_path}: {e}")

    return vulnerabilities
