import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from app.database import get_session
from app.models import Job, JobStatus
from app.worker.tasks import run_scan_task
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union, Literal

# === Configuration Models ===

class NmapConfig(BaseModel):
    ports: Optional[str] = None
    speed: Literal["T1", "T2", "T3", "T4", "T5"] = "T4"
    script: Optional[str] = None

class NucleiConfig(BaseModel):
    tags: str = "cve"
    severity: Optional[str] = None

class ZapConfig(BaseModel):
    mode: Literal["baseline", "full"] = "baseline"

class NiktoConfig(BaseModel):
    tuning: Optional[str] = None

class MetasploitConfig(BaseModel):
    modules: List[str] = [
        "auxiliary/scanner/http/http_version",
        "auxiliary/scanner/http/title",
        "auxiliary/scanner/ssh/ssh_version"
    ]

class OpenVASConfig(BaseModel):
    profile: Literal["Full and fast", "Discovery", "Host Discovery", "System Discovery"] = "Full and fast"

class WappalyzerConfig(BaseModel):
    enabled: bool = True

class ScannerConfig(BaseModel):
    """Generic configuration wrapper"""
    enabled: bool = True
    params: Optional[Dict[str, Any]] = {}

class ScannerConfigs(BaseModel):
    """Specific configuration for known scanners"""
    nmap: Optional[NmapConfig] = NmapConfig()
    nuclei: Optional[NucleiConfig] = NucleiConfig()
    zap: Optional[ZapConfig] = ZapConfig()
    nikto: Optional[NiktoConfig] = NiktoConfig()
    metasploit: Optional[MetasploitConfig] = MetasploitConfig()
    openvas: Optional[OpenVASConfig] = OpenVASConfig()
    wappalyzer: Optional[WappalyzerConfig] = WappalyzerConfig()

# === Request Model (Moved AFTER ScannerConfig) ===
class ScanStartRequest(BaseModel):
    target: str
    # Accept List (old way) OR Dict (new way)
    scanners: Optional[Union[List[str], Dict[str, ScannerConfig]]] = None
    # Optional advanced config object
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
    results: Optional[dict] = None

router = APIRouter(prefix="/api", tags=["Scans"])

@router.post("/scan/start", response_model=ScanStartResponse)
def start_scan(
    request: ScanStartRequest, 
    session: Session = Depends(get_session)
):
    worker_config = {}
    
    # 1. Determine which scanners to run
    selected_scanners = []
    if not request.scanners:
        # Default suite
        selected_scanners = ["nmap", "nuclei", "nikto", "zap", "wappalyzer", "metasploit", "openvas"]
    elif isinstance(request.scanners, list):
        selected_scanners = request.scanners
    elif isinstance(request.scanners, dict):
        selected_scanners = [k for k, v in request.scanners.items() if v.enabled]
        # Merge params from the dict immediately
        for name, cfg in request.scanners.items():
            if cfg.enabled:
                worker_config[name] = cfg.params

    # 2. Merge with Advanced Config object (if provided)
    # This allows cleaner JSON like: "config": {"nmap": {"speed": "T5"}}
    for name in selected_scanners:
        if name not in worker_config:
            worker_config[name] = {}
            
        # Check if 'config' field has settings for this scanner
        if request.config:
            cfg_model = getattr(request.config, name, None)
            if cfg_model:
                worker_config[name].update(cfg_model.dict(exclude_none=True))

    # 3. Create Job
    new_job = Job(
        target=request.target, 
        status=JobStatus.PENDING,
        scanners_requested=list(worker_config.keys())
    )
    session.add(new_job)
    session.commit()
    session.refresh(new_job)
    
    print(f"New job created: {new_job.id}")

    # 4. Enqueue Task
    run_scan_task.delay(
        job_id=str(new_job.id), 
        scanners=worker_config 
    )
    
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
