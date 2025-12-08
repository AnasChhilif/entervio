from pydantic import BaseModel
from typing import List

class AnalysisRequest(BaseModel):
    job_description: str

class AnalysisResponse(BaseModel):
    match_score: float
    total_keywords: int
    found_keywords: List[str]
    missing_keywords: List[str]
    ats_score: int
    ats_issues: List[str]
    ats_recommendations: List[str]
    strategic_critique: List[str]
