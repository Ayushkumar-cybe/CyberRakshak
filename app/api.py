import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from app.database import get_session
from app.models import Job, JobStatus
from app.worker.tasks import run_scan_task
from pydantic import BaseModel
from typing import Optional, List # <-- Make sure List is imported

# === NEW: Updated Request Model ===
class ScanStartRequest(BaseModel):
    """Request model to start a scan."""
    target: str
    # User can now provide a list, e.g., ["nmap", "nikto"]
    scanners: Optional[List[str]] = None

# === NEW: Updated Response Models ===
class ScanStartResponse(BaseModel):
    job_id: uuid.UUID
    status: JobStatus
    target: str
    scanners_requested: Optional[List[str]]

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
    Start a new vulnerability scan for a target.
    You can specify which scanners to run, e.g.:
    {
        "target": "scanme.nmap.org",
        "scanners": ["nmap", "nikto"]
    }
    """
    
    # === MODIFIED: Make the scanner list smart ===
    # If user sends nothing, default to nmap and nuclei
    scanners_to_run = request.scanners
    if not scanners_to_run:
        scanners_to_run = ["nmap", "nuclei"] # Default scan

    # 1. Create and save the Job record
    new_job = Job(
        target=request.target, 
        status=JobStatus.PENDING,
        scanners_requested=scanners_to_run  # <-- Save the list
    )
    session.add(new_job)
    session.commit()
    session.refresh(new_job)
    
    print(f"New job created in DB with ID: {new_job.id}")

    # 2. Enqueue the Celery task
    task = run_scan_task.delay(
        job_id=str(new_job.id), 
        scanners=scanners_to_run  # <-- Pass the list here
    )
    print(f"Task enqueued with Celery ID: {task.id}")
    
    return ScanStartResponse(
        job_id=new_job.id,
        status=new_job.status,
        target=new_job.target,
        scanners_requested=new_job.scanners_requested
    )


@router.get("/scan/status/{job_id}", response_model=ScanStatusResponse)
def get_scan_status(
    job_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    """
    Get the status and results of a scan job.
    """
    job = session.get(Job, job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return ScanStatusResponse(
        job_id=job.id,
        status=job.status,
        target=job.target,
        created_at=str(job.created_at),
        scanners_requested=job.scanners_requested,
        results=job.normalized_report 
    )