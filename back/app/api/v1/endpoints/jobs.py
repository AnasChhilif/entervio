"""Jobs REST API Endpoints"""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.core.auth import CurrentUser
from app.core.deps import DbSession
from app.models.job import JobStatus
from app.schemas.job import JobCreate, JobResponse
from app.services.job_service import job_service
from app.services.smart_job_service import smart_job_service

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get("/smart-search", response_model=list[dict])
async def smart_search_jobs(
    current_user: CurrentUser,
    query: str | None = None,
):
    """
    Perform a smart search based on the user's resume and optional query.
    """
    try:
        jobs = await smart_job_service.smart_search(current_user, query)
        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/view", response_model=dict[str, Any])
async def track_job_view(
    job_data: JobCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> Any:
    try:
        result = await job_service.track_view(job_data, current_user, db)
        return result
    except Exception as e:
        logger.error(f"Error tracking job view: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to track job view: {str(e)}"
        ) from e


@router.post("/apply/{job_id}", response_model=dict[str, Any])
async def mark_job_applied(
    job_id: str,
    current_user: CurrentUser,
    db: DbSession,
) -> Any:
    try:
        result = await job_service.mark_applied(job_id, current_user, db)

        if "error" in result:
            raise HTTPException(
                status_code=result.get("status", 400), detail=result["error"]
            )

        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking job as applied: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to mark job as applied: {str(e)}"
        ) from e


@router.get("/status/{job_id}", response_model=dict[str, Any])
async def get_job_status(
    job_id: str,
    current_user: CurrentUser,
    db: DbSession,
) -> Any:
    try:
        result = await job_service.check_status(job_id, current_user, db)
        return result
    except Exception as e:
        logger.error(f"Error checking job status: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to check job status: {str(e)}"
        ) from e


@router.get("/my-jobs", response_model=list[JobResponse])
async def get_my_jobs(
    current_user: CurrentUser,
    db: DbSession,
    status: JobStatus | None = Query(None, description="Filter by status"),
) -> Any:
    try:
        jobs = await job_service.get_user_jobs(current_user, db, status)
        return jobs
    except Exception as e:
        logger.error(f"Error fetching user jobs: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch jobs: {str(e)}"
        ) from e
