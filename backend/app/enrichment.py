import requests
import logging
import time
from typing import Dict, Any, Optional
from sqlmodel import Session, select
from app.database import engine
from app.models import VulnerabilityMetadata
from datetime import datetime

logger = logging.getLogger(__name__)

CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

def get_cisa_kev_data() -> Dict[str, Any]:
    """Fetches CISA KEV catalog."""
    cve_map = {}
    try:
        response = requests.get(CISA_KEV_URL, timeout=10)
        response.raise_for_status()
        data = response.json()
        for vuln in data.get("vulnerabilities", []):
            cve_id = vuln.get("cveID")
            if cve_id:
                cve_map[cve_id] = {
                    "is_exploited": True,
                    "date_added": vuln.get("dateAdded"),
                    "required_action": vuln.get("requiredAction")
                }
    except Exception as e:
        logger.error(f"Failed to fetch CISA KEV: {e}")
    return cve_map

def fetch_nvd_data(cve_id: str) -> Optional[Dict[str, Any]]:
    """Queries NIST NVD API for a single CVE (Rate Limited)."""
    try:
        time.sleep(6) # Respect rate limits
        
        resp = requests.get(f"{NVD_API_URL}?cveId={cve_id}", timeout=10)
        if resp.status_code != 200: return None
            
        data = resp.json()
        vulnerabilities = data.get("vulnerabilities", [])
        if not vulnerabilities: return None
            
        cve_item = vulnerabilities[0].get("cve", {})
        metrics = cve_item.get("metrics", {})
        
        cvss_data = None
        if "cvssMetricV31" in metrics:
            cvss_data = metrics["cvssMetricV31"][0].get("cvssData", {})
        elif "cvssMetricV30" in metrics:
            cvss_data = metrics["cvssMetricV30"][0].get("cvssData", {})
        elif "cvssMetricV2" in metrics:
             cvss_data = metrics["cvssMetricV2"][0].get("cvssData", {})

        desc_list = cve_item.get("descriptions", [])
        description = desc_list[0].get("value", "No description") if desc_list else "No description"

        return {
            "description": description,
            "cvss_score": cvss_data.get("baseScore") if cvss_data else 0.0,
            "severity": cvss_data.get("baseSeverity") if cvss_data else "UNKNOWN",
            "vector_string": cvss_data.get("vectorString") if cvss_data else None
        }
    except Exception as e:
        logger.error(f"NVD API failed for {cve_id}: {e}")
        return None

def enrich_vulnerability(vuln: Dict[str, Any], cisa_cache: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enriches a vuln object using Local DB Cache + NVD API + CISA.
    """
    # 1. Try to find a CVE ID from multiple sources
    cve_id = vuln.get("cve") or vuln.get("template_id", "")
    
    # Handle list vs string (Nuclei sometimes returns list)
    if isinstance(cve_id, list) and len(cve_id) > 0:
        cve_id = cve_id[0]
    
    if not isinstance(cve_id, str):
        cve_id = ""

    cve_id = cve_id.upper()
    
    # If it doesn't look like a CVE, skip complex enrichment
    if not cve_id.startswith("CVE-"):
        return {**vuln, "enrichment": {"cisa_kev": False, "cvss": "N/A"}}

    enrichment_data = {
        "cve_id": cve_id,
        "cisa_kev": False,
        "cisa_details": None,
        "nvd_data": None
    }

    # 2. CISA Check
    if cve_id in cisa_cache:
        enrichment_data["cisa_kev"] = True
        enrichment_data["cisa_details"] = cisa_cache[cve_id]

    # 3. NVD / Smart Cache Lookup
    with Session(engine) as session:
        cached_vuln = session.get(VulnerabilityMetadata, cve_id)
        
        if cached_vuln:
            # HIT: Use cached data
            enrichment_data["nvd_data"] = {
                "score": cached_vuln.cvss_score,
                "severity": cached_vuln.severity,
                "vector": cached_vuln.vector_string,
                "description": cached_vuln.description
            }
            # Inject cached remediation if available
            if cached_vuln.remediation:
                vuln["remediation"] = cached_vuln.remediation
                vuln["remediation_source"] = cached_vuln.remediation_source

        else:
            # MISS: Fetch from NVD API
            print(f"Fetching NVD data for {cve_id}...")
            nvd_info = fetch_nvd_data(cve_id)
            
            if nvd_info:
                # Determine Remediation (Priority: CISA -> Default)
                rem_text = None
                rem_source = None
                
                if enrichment_data["cisa_kev"]:
                    rem_text = enrichment_data["cisa_details"].get("required_action")
                    rem_source = "CISA KEV"
                
                new_meta = VulnerabilityMetadata(
                    cve_id=cve_id,
                    description=nvd_info["description"],
                    cvss_score=nvd_info["cvss_score"],
                    severity=nvd_info["severity"],
                    vector_string=nvd_info["vector_string"],
                    is_cisa_kev=enrichment_data["cisa_kev"],
                    remediation=rem_text,         # <--- Save it
                    remediation_source=rem_source # <--- Save it
                )
                session.add(new_meta)
                session.commit()
                
                enrichment_data["nvd_data"] = {
                    "score": nvd_info["cvss_score"],
                    "severity": nvd_info["severity"],
                    "vector": nvd_info["vector_string"],
                    "description": nvd_info["description"]
                }
            else:
                enrichment_data["nvd_data"] = {"error": "Not found in NVD"}

    vuln["enrichment"] = enrichment_data
    return vuln
