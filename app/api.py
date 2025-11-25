import uuid
import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlmodel import Session, select
from app.database import get_session
from app.models import Job, JobStatus, AuditLog
from app.worker.tasks import run_scan_task
from app.graph import build_attack_graph
from app.reporting import generate_pdf_report
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union, Literal

# === Configuration Models ===
class NmapConfig(BaseModel):
    ports: Optional[str] = None
    speed: Literal["T1", "T2", "T3", "T4", "T5"] = "T4"
    script: Optional[str] = None
    raw_args: Optional[List[str]] = None

class NucleiConfig(BaseModel):
    tags: str = "cve"
    severity: Optional[str] = None
    raw_args: Optional[List[str]] = None

class ZapConfig(BaseModel):
    mode: Literal["baseline", "full"] = "baseline"
    raw_args: Optional[List[str]] = None

class NiktoConfig(BaseModel):
    tuning: Optional[str] = None
    raw_args: Optional[List[str]] = None

class MetasploitConfig(BaseModel):
    modules: List[str] = ["auxiliary/scanner/http/http_version"]
    raw_args: Optional[List[str]] = None

class OpenVASConfig(BaseModel):
    profile: Literal["Full and fast", "Discovery"] = "Full and fast"
    raw_args: Optional[List[str]] = None

class WappalyzerConfig(BaseModel):
    enabled: bool = True

class ScannerConfig(BaseModel):
    enabled: bool = True
    params: Optional[Dict[str, Any]] = {}

class ScannerConfigs(BaseModel):
    nmap: Optional[NmapConfig] = NmapConfig()
    nuclei: Optional[NucleiConfig] = NucleiConfig()
    zap: Optional[ZapConfig] = ZapConfig()
    nikto: Optional[NiktoConfig] = NiktoConfig()
    metasploit: Optional[MetasploitConfig] = MetasploitConfig()
    openvas: Optional[OpenVASConfig] = OpenVASConfig()
    wappalyzer: Optional[WappalyzerConfig] = WappalyzerConfig()

class ScanStartRequest(BaseModel):
    target: str
    scanners: Optional[Union[List[str], Dict[str, ScannerConfig]]] = None
    config: Optional[ScannerConfigs] = ScannerConfigs()

# === Response Models ===
class ScanStartResponse(BaseModel):
    job_id: uuid.UUID
    status: JobStatus
    target: str
    scanners_requested: List[str]

class ScanStatusResponse(BaseModel):
    job_id: uuid.UUID
    status: JobStatus
    target: str
    created_at: str
    scanners_requested: Optional[List[str]]
    tool_status: Optional[Dict[str, str]] = None
    results: Optional[dict] = None

router = APIRouter(prefix="/api", tags=["Scans"])

@router.post("/scan/start", response_model=ScanStartResponse)
def start_scan(request: ScanStartRequest, session: Session = Depends(get_session)):
    worker_config = {}
    
    selected_scanners = []
    if not request.scanners:
        selected_scanners = ["nmap", "nuclei", "nikto", "zap", "wappalyzer", "metasploit", "openvas"]
    elif isinstance(request.scanners, list):
        selected_scanners = request.scanners
    elif isinstance(request.scanners, dict):
        selected_scanners = [k for k, v in request.scanners.items() if v.enabled]
        for name, cfg in request.scanners.items():
            if cfg.enabled: worker_config[name] = cfg.params

    for name in selected_scanners:
        if name not in worker_config: worker_config[name] = {}
        if request.config:
            cfg_model = getattr(request.config, name, None)
            if cfg_model: worker_config[name].update(cfg_model.dict(exclude_none=True))

    new_job = Job(
        target=request.target, 
        status=JobStatus.PENDING,
        scanners_requested=list(worker_config.keys()),
        tool_status={name: "pending" for name in worker_config.keys()}
    )
    session.add(new_job)
    session.commit()
    session.refresh(new_job)
    
    audit = AuditLog(event_type="SCAN_STARTED", details={"target": request.target, "scanners": list(worker_config.keys())}, job_id=new_job.id)
    session.add(audit)
    session.commit()

    run_scan_task.delay(job_id=str(new_job.id), scanners=worker_config)
    
    return ScanStartResponse(
        job_id=new_job.id, status=new_job.status, target=new_job.target, scanners_requested=new_job.scanners_requested
    )

@router.get("/scan/status/{job_id}", response_model=ScanStatusResponse)
def get_scan_status(job_id: uuid.UUID, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job: raise HTTPException(status_code=404, detail="Job not found")
    return ScanStatusResponse(
        job_id=job.id, status=job.status, target=job.target, created_at=str(job.created_at),
        scanners_requested=job.scanners_requested, tool_status=job.tool_status, results=job.normalized_report 
    )

@router.get("/scan/logs", tags=["Audit"])
def get_audit_logs(limit: int = 50, session: Session = Depends(get_session)):
    return session.exec(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit)).all()

@router.get("/scan/graph/{job_id}")
def get_scan_graph(job_id: uuid.UUID, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job: raise HTTPException(status_code=404, detail="Job not found")
    if not job.normalized_report: return {"nodes": [], "links": []}
    return build_attack_graph(job.normalized_report)

# --- REPORT GENERATION WITH AUTO-DELETE ---
def remove_file(path: str):
    try:
        os.remove(path)
        print(f"Deleted temp report: {path}")
    except Exception as e:
        print(f"Error deleting file {path}: {e}")

@router.get("/scan/report/{job_id}")
def get_scan_report_pdf(
    job_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    job = session.get(Job, job_id)
    if not job: raise HTTPException(status_code=404, detail="Job not found")
    if not job.normalized_report: raise HTTPException(status_code=400, detail="Scan not completed")

    # Generate
    filename = f"report_{job_id}.pdf"
    file_path = f"/tmp/{filename}"
    generate_pdf_report({
        "job_id": str(job.id), "target": job.target, "created_at": job.created_at, "results": job.normalized_report
    }, file_path)
    
    # Schedule Deletion (Runs AFTER response is sent)
    background_tasks.add_task(remove_file, file_path)
    
    return FileResponse(path=file_path, filename=filename, media_type='application/pdf')
