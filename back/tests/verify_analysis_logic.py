import asyncio
import sys
import os

# Add strict parent path to sys.path to ensure 'app' is found
# Add parent path to sys.path to ensure 'app' is found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.resume_analyzer_service import resume_analyzer
from app.core.config import settings
from app.schemas.analysis import AnalysisRequest

# Sample Resume
resume_text = """
John Doe
Email: john.doe@example.com
Phone: 123-456-7890

PROFESSIONAL SUMMARY
Experienced Software Engineer with a focus on backend development.

WORK EXPERIENCE
Senior Backend Engineer at TechCorp
Jan 2020 - Present
- Built scalable APIs using Python and FastAPI.
- Managed PostgreSQL databases.
- Deployed services to AWS using Docker.

EDUCATION
B.S. Computer Science, University of Tech
"""

# Sample JD (requiring things in the resume AND things missing)
job_description = """
We are looking for a Senior Python Developer.
Must have experience with:
- Python and FastAPI
- Docker and Kubernetes
- AWS (EC2, S3)
- React.js (nice to have)
- Redis
"""

async def main():
    print("--- Starting Resume Analysis Verification ---")
    
    if not settings.GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY not set.")
        return

    try:
        result = await resume_analyzer.analyze_job_match(resume_text, job_description)
        
        print("\n[RESULT]")
        print(f"Match Score: {result['match_score']}%")
        print(f"Total Keywords found in JD: {result['total_keywords']}")
        print(f"Found in Resume: {result['found_keywords']}")
        print(f"Missing from Resume: {result['missing_keywords']}")
        
        print("\n[ATS CHECK]")
        print(f"ATS Score: {result['ats_check']['ats_score']}")
        print(f"Issues: {result['ats_check']['issues']}")
        print(f"Recommendations: {result['ats_check']['recommendations']}")
        
        # Validation Logic for the test
        assert "Python" in result['found_keywords'] or "FastAPI" in result['found_keywords']
        assert result['ats_check']['ats_score'] > 0
        
        print("\n✅ Verification SUCCESS: Logic works and LLM responded.")
        
    except Exception as e:
        print(f"\n❌ Verification FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
