import time
import requests
import logging
from datetime import datetime, timedelta
from sqlmodel import Session, select, delete
from app.database import engine
from app.models import VulnerabilityMetadata

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nvd_sync")

NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"

def remove_stale_data(days: int = 180):
    """
    Removes records that haven't been updated in 'days'.
    NOTE: In production, you usually want to REFRESH these instead of deleting.
    Deleting them means the next scan will force a slow API call.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    logger.info(f"Cleaning up data older than {cutoff_date}...")
    
    with Session(engine) as session:
        statement = delete(VulnerabilityMetadata).where(VulnerabilityMetadata.last_updated < cutoff_date)
        result = session.exec(statement)
        session.commit()
        logger.info(f"Deleted {result.rowcount} stale records.")

def sync_nvd(days_back: int = 90):
    """
    Fetches CVEs modified in the last `days_back` days and upserts them to DB.
    """
    start_date = (datetime.utcnow() - timedelta(days=days_back)).isoformat()
    pub_start = start_date.split(".")[0] # ISO format without microseconds
    
    logger.info(f"Starting NVD Sync (Changes since {pub_start})...")

    start_index = 0
    results_per_page = 2000
    
    with Session(engine) as session:
        while True:
            try:
                params = {
                    "lastModStartDate": pub_start,
                    "lastModEndDate": datetime.utcnow().isoformat().split(".")[0],
                    "resultsPerPage": results_per_page,
                    "startIndex": start_index
                }
                
                logger.info(f"Fetching batch index {start_index}...")
                resp = requests.get(NVD_API_URL, params=params, timeout=30)
                
                if resp.status_code == 403:
                    logger.warning("Rate limit hit. Sleeping 6s...")
                    time.sleep(6)
                    continue
                
                if resp.status_code != 200:
                    logger.error(f"NVD Error: {resp.status_code}")
                    break

                data = resp.json()
                vulnerabilities = data.get("vulnerabilities", [])
                
                if not vulnerabilities:
                    break

                for item in vulnerabilities:
                    cve_item = item.get("cve", {})
                    cve_id = cve_item.get("id")
                    
                    # Extract Metrics
                    metrics = cve_item.get("metrics", {})
                    cvss_data = None
                    # Try V3.1, fallback to V3.0, then V2
                    if "cvssMetricV31" in metrics:
                        cvss_data = metrics["cvssMetricV31"][0].get("cvssData", {})
                    elif "cvssMetricV30" in metrics:
                        cvss_data = metrics["cvssMetricV30"][0].get("cvssData", {})
                    elif "cvssMetricV2" in metrics:
                        cvss_data = metrics["cvssMetricV2"][0].get("cvssData", {})

                    # Extract Description
                    descriptions = cve_item.get("descriptions", [])
                    desc_text = descriptions[0].get("value", "") if descriptions else ""

                    # UPSERT Logic
                    vuln_meta = session.get(VulnerabilityMetadata, cve_id)
                    if not vuln_meta:
                        vuln_meta = VulnerabilityMetadata(cve_id=cve_id)

                    vuln_meta.description = desc_text
                    vuln_meta.cvss_score = cvss_data.get("baseScore", 0.0) if cvss_data else 0.0
                    vuln_meta.severity = cvss_data.get("baseSeverity", "UNKNOWN") if cvss_data else "UNKNOWN"
                    vuln_meta.vector_string = cvss_data.get("vectorString") if cvss_data else None
                    vuln_meta.last_updated = datetime.utcnow()

                    session.add(vuln_meta)

                session.commit()
                logger.info(f"Processed {len(vulnerabilities)} CVEs.")
                
                start_index += results_per_page
                if start_index >= data.get("totalResults", 0):
                    break
                
                time.sleep(2) # Polite delay

            except Exception as e:
                logger.error(f"Sync failed: {e}")
                time.sleep(5)
                
    logger.info("NVD Sync Completed.")

if __name__ == "__main__":
    # 1. Clean old data (optional, e.g., older than 6 months)
    remove_stale_data(days=180)
    
    # 2. Sync new data (e.g., last 30 days)
    # On first run, you might want to set days_back=365 to get a year of data
    sync_nvd(days_back=30)
