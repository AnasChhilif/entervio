from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Optional
from app.services.francetravail_service import francetravail_service
from app.services.smart_job_service import smart_job_service
from app.core.auth import get_current_db_user
from app.models.user import User

router = APIRouter()

@router.get("/search", response_model=List[Dict])
async def search_jobs(
    keywords: Optional[str] = None,
    location: Optional[str] = None,
    current_user: User = Depends(get_current_db_user)
):
    """
    Search for jobs using France Travail API.
    """
    try:
        jobs = await francetravail_service.search_jobs(keywords, location)
        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/smart-search", response_model=List[Dict])
async def smart_search_jobs(
    location: Optional[str] = None,
    query: Optional[str] = None,
    current_user: User = Depends(get_current_db_user)
):
    """
    Perform a smart search based on the user's resume and optional query.
    """
    try:
        jobs = await smart_job_service.smart_search(current_user, location, query)
        return jobs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/locations", response_model=List[Dict])
async def search_locations(
    query: str = Query(..., min_length=2),
    current_user: User = Depends(get_current_db_user)
):
    """
    Search for cities (communes) in France.
    """
    from app.services.location_service import location_service
    return await location_service.search_cities(query)

