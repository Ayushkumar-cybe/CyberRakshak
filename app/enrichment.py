import requests
import logging
import time
from typing import Dict, Any, Optional
from sqlmodel import Session
from app.database import engine
from app.models import VulnerabilityMetadata
from app.utils.exploitdb import exploit_db # Import our new loader
from datetime import datetime

logger = logging.getLogger(__name__)

# Keep for lightweight checks
CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

def get_cisa_kev_data() -> Dict[str, Any]:
    cve_map = {}
    try:
        response = requests.get(CISA_KEV_URL, timeout=10)
        if response.status_code == 200:
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

def fetch_nvd_data_live(cve_id: str) -> Optional[Dict[str, Any]]:
    """Fallback: Fetches single CVE from NVD API if not in DB."""
    try:
        # Rate limit protection for fallback calls
        time.sleep(2) 
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
        description = desc_list[0].get("value", "") if desc_list else ""

        return {
            "description": description,
            "cvss_score": cvss_data.get("baseScore", 0.0) if cvss_data else 0.0,
            "severity": cvss_data.get("baseSeverity", "UNKNOWN") if cvss_data else "UNKNOWN",
            "vector_string": cvss_data.get("vectorString") if cvss_data else None
        }
    except Exception as e:
        logger.error(f"Live NVD fetch failed for {cve_id}: {e}")
        return None

def enrich_vulnerability(vuln: Dict[str, Any], cisa_cache: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hybrid Enrichment:
    1. Check CISA KEV (Memory)
    2. Check ExploitDB (Memory)
    3. Check Local DB (Postgres)
    4. FALLBACK: Call NVD API -> Save to DB
    """
    cve_id = vuln.get("template_id", "").upper()
    
    # If it's not a CVE, return basic info
    if not cve_id.startswith("CVE-"):
        return {**vuln, "enrichment": {"cisa_kev": False, "exploit_available": False, "cvss": "N/A"}}

    enrichment_data = {
        "cve_id": cve_id,
        "cisa_kev": False,
        "exploit_available": False,
        "exploit_ids": [],
        "nvd_data": None
    }

    # 1. CISA Check
    if cve_id in cisa_cache:
        enrichment_data["cisa_kev"] = True

    # 2. ExploitDB Check
    edb_ids = exploit_db.get_exploits(cve_id)
    if edb_ids:
        enrichment_data["exploit_available"] = True
        enrichment_data["exploit_ids"] = edb_ids

    # 3. DB Check with API Fallback
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
        else:
            # MISS: Fetch Live
            print(f"Cache miss: Fetching {cve_id} from NVD...")
            nvd_info = fetch_nvd_data_live(cve_id)
            
            if nvd_info:
                # Save to DB for next time
                new_meta = VulnerabilityMetadata(
                    cve_id=cve_id,
                    description=nvd_info["description"],
                    cvss_score=nvd_info["cvss_score"],
                    severity=nvd_info["severity"],
                    vector_string=nvd_info["vector_string"],
                    is_cisa_kev=enrichment_data["cisa_kev"],
                    exploit_ids=enrichment_data["exploit_ids"]
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
