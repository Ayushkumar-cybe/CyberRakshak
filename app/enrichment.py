import requests
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# CISA Known Exploited Vulnerabilities Catalog URL
CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

def get_cisa_kev_data() -> Dict[str, Any]:
    """
    Fetches the CISA Known Exploited Vulnerabilities (KEV) catalog.
    Returns a dictionary mapping CVE IDs to their KEV data.
    """
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
                    "vendor_project": vuln.get("vendorProject"),
                    "product": vuln.get("product"),
                    "date_added": vuln.get("dateAdded"),
                    "short_description": vuln.get("shortDescription"),
                    "required_action": vuln.get("requiredAction")
                }
    except Exception as e:
        logger.error(f"Failed to fetch CISA KEV data: {e}")

    return cve_map

def enrich_vulnerability(vuln: Dict[str, Any], cisa_cache: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enriches a single vulnerability object with CISA data.
    """
    # Nuclei often puts the CVE in 'template_id' (e.g., CVE-2023-48795)
    # or we might have to parse it from the title.
    cve_id = vuln.get("template_id", "").upper()

    # Simple check: Does it look like a CVE?
    if not cve_id.startswith("CVE-"):
        return vuln # Return generic vulns unenriched

    enrichment_data = {
        "cve_id": cve_id,
        "cisa_kev": False,
        "cisa_details": None
    }

    # Check CISA KEV (Fast Lookup)
    if cve_id in cisa_cache:
        enrichment_data["cisa_kev"] = True
        enrichment_data["cisa_details"] = cisa_cache[cve_id]

    # Attach enrichment to the vuln object
    vuln["enrichment"] = enrichment_data
    return vuln
