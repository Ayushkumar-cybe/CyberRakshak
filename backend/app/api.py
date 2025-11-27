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
from app.chat_assistant import chat_assistant_service
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union, Literal
import asyncio

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

# === Chat Assistant Models ===
class ChatMessageRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    response: str

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

# NEW RESPONSE MODELS
class DashboardStatsResponse(BaseModel):
    total_vulnerabilities: int
    critical_findings: int
    high_findings: int
    asset_criticality_score: int
    open_ports_detected: int
    unified_cyber_score: int

class AssetResponse(BaseModel):
    id: uuid.UUID
    name: str
    ip: str
    os: str
    exposure: str
    risk: str
    cloud: str
    discovered_by: str
    last_seen: str

class VulnerabilityResponse(BaseModel):
    id: uuid.UUID
    cve: str
    title: str
    severity: str
    cvss: float
    asset: str
    tool: str
    date: str

class JobHistoryResponse(BaseModel):
    job_id: uuid.UUID
    target: str
    status: JobStatus
    created_at: str
    scanners_used: List[str]

class ReportResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    date: str
    status: str

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

# === CHAT ASSISTANT ENDPOINTS ===
@router.post("/chat/message", response_model=ChatMessageResponse)
async def send_chat_message(request: ChatMessageRequest):
    """Send a message to the chat assistant and get a response"""
    response = await chat_assistant_service.get_response_async(request.message)
    return ChatMessageResponse(response=response)

@router.post("/chat/stream")
async def stream_chat_response(request: ChatMessageRequest):
    """Stream a response from the chat assistant"""
    chunks = await chat_assistant_service.stream_response(request.message)
    
    # Simulate streaming by yielding chunks with delays
    for chunk in chunks:
        await asyncio.sleep(0.01)  # Small delay to simulate streaming
        yield chunk

# NEW ENDPOINTS
@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(session: Session = Depends(get_session)):
    # For now, returning mock data
    # In a real implementation, this would query the database for actual stats
    return DashboardStatsResponse(
        total_vulnerabilities=15392,
        critical_findings=1247,
        high_findings=3546,
        asset_criticality_score=9512,
        open_ports_detected=2341,
        unified_cyber_score=742
    )

@router.get("/assets", response_model=List[AssetResponse])
def get_assets(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    # For now, returning mock data
    # In a real implementation, this would query the database for actual assets
    return []

@router.get("/vulnerabilities", response_model=List[VulnerabilityResponse])
def get_vulnerabilities(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    # For now, returning mock data
    # In a real implementation, this would query the database for actual vulnerabilities
    return []

@router.get("/jobs", response_model=List[JobHistoryResponse])
def get_job_history(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    jobs = session.exec(select(Job).offset(skip).limit(limit)).all()
    return [
        JobHistoryResponse(
            job_id=job.id,
            target=job.target,
            status=job.status,
            created_at=str(job.created_at),
            scanners_used=job.scanners_requested or []
        )
        for job in jobs
    ]

@router.get("/reports", response_model=List[ReportResponse])
def get_reports(skip: int = 0, limit: int = 100, session: Session = Depends(get_session)):
    # For now, returning mock data
    # In a real implementation, this would query the database for actual reports
    return []

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