import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from app.database import get_session
from app.models import Job, JobStatus
from app.worker.tasks import run_scan_task
from app.enrichment import get_cisa_kev_data, enrich_vulnerability
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Union

# === NEW: Flexible Configuration Models ===

class ScannerConfig(BaseModel):
    """Generic configuration for any scanner"""
    enabled: bool = True
    # Allow any extra parameters (e.g., ports, mode, profile)
    params: Optional[Dict[str, Any]] = {}

class ScanStartRequest(BaseModel):
    """Request model to start a scan."""
    target: str
    # Scanners can now be a list of strings (old way) OR a config dict (new way)
    # Example Dict: {"nmap": {"enabled": true, "params": {"ports": "80,443"}}}
    scanners: Optional[Union[List[str], Dict[str, ScannerConfig]]] = None

# === Response Models ===
class ScanStartResponse(BaseModel):
    job_id: uuid.UUID
    status: JobStatus
    target: str
    scanners_requested: List[str] # We still just list the names for simplicity

class ScanStatusResponse(BaseModel):
    job_id: uuid.UUID
    status: JobStatus
    target: str
    created_at: str
    scanners_requested: Optional[List[str]]
    results: Optional[dict] = None


router = APIRouter(prefix="/api", tags=["Scans"])

@router.post("/scan/start", response_model=ScanStartResponse)
def start_scan(
    request: ScanStartRequest, 
    session: Session = Depends(get_session)
):
    """
    Start a new vulnerability scan.
    Supports simple list: ["nmap", "zap"]
    OR detailed config: 
    {
      "nmap": {"enabled": true, "params": {"ports": "top-100"}},
      "zap": {"enabled": true, "params": {"mode": "aggressive"}}
    }
    """
    
    # Normalize input to a standard dictionary format for the worker
    # Final format passed to worker: {"nmap": {"ports": "..."}, "zap": {...}}
    worker_config = {}
    
    if not request.scanners:
        # Default: Run standard suite
        worker_config = {
            "nmap": {},
            "nuclei": {},
            "nikto": {},
            "zap": {},
            "wappalyzer": {},
            "metasploit": {}
        }
    elif isinstance(request.scanners, list):
        # Old style list -> convert to dict with empty params
        for name in request.scanners:
            worker_config[name] = {}
    elif isinstance(request.scanners, dict):
        # New style config -> filter enabled ones
        for name, cfg in request.scanners.items():
            if cfg.enabled:
                worker_config[name] = cfg.params

    # Extract just names for DB logging
    scanner_names = list(worker_config.keys())

    # 1. Create Job
    new_job = Job(
        target=request.target, 
        status=JobStatus.PENDING,
        scanners_requested=scanner_names
    )
    session.add(new_job)
    session.commit()
    session.refresh(new_job)
    
    print(f"New job created: {new_job.id}")

    # 2. Enqueue Task
    # We pass the FULL configuration dictionary to the worker now
    task = run_scan_task.delay(
        job_id=str(new_job.id), 
        scanners=worker_config 
    )
    print(f"Task enqueued: {task.id}")
    
    return ScanStartResponse(
        job_id=new_job.id,
        status=new_job.status,
        target=new_job.target,
        scanners_requested=scanner_names
    )


@router.get("/scan/status/{job_id}", response_model=ScanStatusResponse)
def get_scan_status(
    job_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # --- ENRICHMENT ON RETRIEVAL (Optional Layer) ---
    # The worker does the heavy lifting, but we can do light touches here if needed.
    # For now, we just return the worker's result.
    
    return ScanStatusResponse(
        job_id=job.id,
        status=job.status,
        target=job.target,
        created_at=str(job.created_at),
        scanners_requested=job.scanners_requested,
        results=job.normalized_report 
    )
