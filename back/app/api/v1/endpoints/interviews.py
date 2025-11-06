# app/api/v1/endpoints/interviews.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# Pydantic models for request/response
class InterviewCreate(BaseModel):
    interview_type: str  # e.g., "technical", "behavioral", "case study"
    interviewer_style: str  # e.g., "friendly", "strict", "neutral"
    job_position: Optional[str] = None
    company: Optional[str] = None

class InterviewResponse(BaseModel):
    id: int
    interview_type: str
    interviewer_style: str
    status: str  # "pending", "in_progress", "completed"

# Temporary in-memory storage (replace with database later)
interviews_db = []

@router.post("/interviews", response_model=InterviewResponse)
async def create_interview(interview: InterviewCreate):
    """Create a new interview session"""
    new_interview = {
        "id": len(interviews_db) + 1,
        "interview_type": interview.interview_type,
        "interviewer_style": interview.interviewer_style,
        "job_position": interview.job_position,
        "company": interview.company,
        "status": "pending"
    }
    interviews_db.append(new_interview)
    return new_interview

@router.get("/interviews", response_model=List[InterviewResponse])
async def get_interviews():
    """Get all interview sessions"""
    return interviews_db

@router.get("/interviews/{interview_id}", response_model=InterviewResponse)
async def get_interview(interview_id: int):
    """Get a specific interview session"""
    for interview in interviews_db:
        if interview["id"] == interview_id:
            return interview
    raise HTTPException(status_code=404, detail="Interview not found")

@router.delete("/interviews/{interview_id}")
async def delete_interview(interview_id: int):
    """Delete an interview session"""
    for i, interview in enumerate(interviews_db):
        if interview["id"] == interview_id:
            interviews_db.pop(i)
            return {"message": "Interview deleted successfully"}
    raise HTTPException(status_code=404, detail="Interview not found")