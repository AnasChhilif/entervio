import logging
from datetime import UTC, datetime
from typing import Any

from sqlalchemy.orm import Session

from app.core.auth import CurrentUser
from app.models.job import Job, JobStatus
from app.schemas.job import JobCreate

logger = logging.getLogger(__name__)


class JobService:
    def __init__(self):
        pass

    async def track_view(
        self,
        job_data: JobCreate,
        current_user: CurrentUser,
        db: Session,
    ) -> dict[str, Any]:
        existing_job = (
            db.query(Job)
            .filter(
                Job.user_id == current_user.id,
                Job.job_id == job_data.job_id,
            )
            .first()
        )

        if existing_job:
            return {
                "message": "Job already tracked",
                "id": existing_job.id,
                "status": existing_job.status.value,
                "viewed_at": existing_job.viewed_at.isoformat(),
                "applied_at": (
                    existing_job.applied_at.isoformat()
                    if existing_job.applied_at
                    else None
                ),
            }

        new_job = Job(
            user_id=current_user.id,
            job_id=job_data.job_id,
            job_title=job_data.job_title,
            company_name=job_data.company_name,
            status=JobStatus.VIEWED,
            viewed_at=datetime.now(UTC),
        )

        db.add(new_job)
        db.commit()
        db.refresh(new_job)

        return {
            "message": "Job view tracked",
            "id": new_job.id,
            "status": new_job.status.value,
            "viewed_at": new_job.viewed_at.isoformat(),
        }

    async def mark_applied(
        self,
        job_id: str,
        current_user: CurrentUser,
        db: Session,
    ) -> dict[str, Any]:
        job = (
            db.query(Job)
            .filter(
                Job.user_id == current_user.id,
                Job.job_id == job_id,
            )
            .first()
        )

        if not job:
            return {
                "error": "Job not found",
                "status": 404,
            }

        if job.status == JobStatus.APPLIED:
            return {
                "message": "Job already marked as applied",
                "id": job.id,
                "status": job.status.value,
                "applied_at": (job.applied_at.isoformat() if job.applied_at else None),
            }

        job.status = JobStatus.APPLIED
        job.applied_at = datetime.now(UTC)

        db.commit()
        db.refresh(job)

        return {
            "message": "Job marked as applied",
            "id": job.id,
            "status": job.status.value,
            "applied_at": job.applied_at.isoformat(),
        }

    async def get_user_jobs(
        self,
        current_user: CurrentUser,
        db: Session,
        status: JobStatus | None = None,
    ) -> list[Job]:
        query = db.query(Job).filter(Job.user_id == current_user.id)

        if status:
            query = query.filter(Job.status == status)

        return query.order_by(Job.viewed_at.desc()).all()

    async def check_status(
        self,
        job_id: str,
        current_user: CurrentUser,
        db: Session,
    ) -> dict[str, Any]:
        job = (
            db.query(Job)
            .filter(
                Job.user_id == current_user.id,
                Job.job_id == job_id,
            )
            .first()
        )

        if not job:
            return {"tracked": False}

        return {
            "tracked": True,
            "status": job.status.value,
            "viewed_at": job.viewed_at.isoformat(),
            "applied_at": job.applied_at.isoformat() if job.applied_at else None,
        }


job_service = JobService()
