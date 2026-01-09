from datetime import datetime

from pydantic import BaseModel

from app.models.job import JobStatus


class JobCreate(BaseModel):
    job_id: str
    job_title: str
    company_name: str | None = None
    status: JobStatus = JobStatus.VIEWED


class JobUpdate(BaseModel):
    status: JobStatus


class JobResponse(BaseModel):
    id: int
    user_id: int
    job_id: str
    job_title: str
    company_name: str | None
    status: JobStatus
    viewed_at: datetime
    applied_at: datetime | None

    class Config:
        from_attributes = True
