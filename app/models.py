from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
import uuid

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL_SUCCESS = "partial_success" # New status for mixed results

class Job(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    target: str
    status: JobStatus = Field(default=JobStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Stores the list of requested scanners
    scanners_requested: List[str] = Field(default=[], sa_column=Column(JSON))
    
    # --- NEW: Track status of each individual tool ---
    # e.g. {"nmap": "completed", "openvas": "failed"}
    tool_status: Dict[str, str] = Field(default={}, sa_column=Column(JSON))
    
    # Stores the file paths
    output_files: Dict[str, str] = Field(default={}, sa_column=Column(JSON))
    
    # Stores the final normalized JSON report
    normalized_report: Dict = Field(default={}, sa_column=Column(JSON))

# --- NEW: Audit Log Table ---
class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: str  # e.g., "SCAN_STARTED", "SCAN_FINISHED", "ERROR"
    details: Dict = Field(default={}, sa_column=Column(JSON))
    job_id: Optional[uuid.UUID] = Field(default=None, foreign_key="job.id")

class VulnerabilityMetadata(SQLModel, table=True):
    """
    Permanent cache for CVE information.
    """
    cve_id: str = Field(primary_key=True) # e.g., CVE-2021-44228

    # NVD Data
    description: Optional[str] = None
    cvss_score: Optional[float] = None  # e.g. 9.8
    severity: Optional[str] = None      # e.g. CRITICAL

    # --- FIX: Add this missing field ---
    vector_string: Optional[str] = None # e.g. CVSS:3.1/AV:N/AC:L...
    # -----------------------------------

    # Threat Intel
    is_cisa_kev: bool = Field(default=False) # Is it in CISA KEV?
    has_exploit: bool = Field(default=False) # Placeholder for ExploitDB

    last_updated: datetime = Field(default_factory=datetime.utcnow)
