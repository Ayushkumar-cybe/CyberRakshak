import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict
from sqlmodel import Field, SQLModel, Column
from sqlalchemy.dialects.postgresql import JSON # <-- We need this

class JobStatus(str, Enum):
    """Enum for job status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class Job(SQLModel, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, primary_key=True, index=True
    )
    target: str = Field(index=True)
    status: JobStatus = Field(default=JobStatus.PENDING)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    # === NEW FLEXIBLE COLUMNS ===
    
    # Stores the list of scanners we requested, e.g., ["nmap", "nikto"]
    scanners_requested: Optional[List[str]] = Field(
        default=None, sa_column=Column(JSON)
    )

    # Stores a "map" of the results, e.g.:
    # { "nmap": "outputs/job_id/nmap.xml", "nikto": "outputs/job_id/nikto.json" }
    output_files: Optional[Dict[str, str]] = Field(
        default=None, sa_column=Column(JSON)
    )
    
    # This is for Week 2
    normalized_report: Optional[dict] = Field(
        default=None, sa_column=Column(JSON)
    )