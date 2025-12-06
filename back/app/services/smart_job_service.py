import asyncio
import logging
from typing import List, Dict, Optional, Any
from app.models.user import User
from app.services.francetravail_service import francetravail_service
from app.services.location_service import location_service
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class SmartJobService:
    def __init__(self):
        pass

    def _build_profile_summary(self, user: User) -> str:
        """Builds a profile summary from relational user data."""
        parts = []
        
        # Skills
        tech_skills = [s.name for s in user.skills_list if s.category == 'technical']
        if tech_skills:
            parts.append(f"Technical Skills: {', '.join(tech_skills[:10])}")
        
        # Experience
        if user.work_experiences:
            exp_summary = []
            for w in user.work_experiences[:3]:
                exp_summary.append(f"{w.role} at {w.company}")
            parts.append(f"Experience: {'; '.join(exp_summary)}")
        
        # Projects
        if user.projects:
            proj_summary = [p.name for p in user.projects[:3]]
            parts.append(f"Projects: {', '.join(proj_summary)}")
            
        return "\n".join(parts) if parts else "No profile data available."

    async def smart_search(self, user: User, location: Optional[str] = None, query: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Performs a smart job search for the user.
        
        1. Extracts keywords from user's relational resume data OR from manual query.
        2. Searches France Travail API for each keyword in parallel.
        3. Aggregates and deduplicates results.
        4. Reranks results using LLM based on user profile.
        """
        logger.info(f"🧠 Starting smart search for user {user.id}")

        # 1. Get keywords and location
        profile_summary = self._build_profile_summary(user)

        if query:
            extraction_result = await llm_service.extract_keywords_from_query(query, profile_summary)
            keywords = extraction_result.get("keywords", [])
            extracted_location = extraction_result.get("location")
            if extracted_location:
                location = extracted_location
        else:
            keywords = self._get_search_keywords(user)
            
        if not keywords:
            logger.warning("⚠️ No keywords found for user. Returning empty list.")
            return []
            
        # Resolve location name to code if necessary
        location_code = None
        if location:
            # Check if it looks like a code (5 digits)
            if location.isdigit() and len(location) == 5:
                location_code = location
            else:
                # Look up code from name
                logger.info(f"📍 Looking up code for location: {location}")
                cities = await location_service.search_cities(location)
                if cities:
                    # Use the first result's code
                    location_code = cities[0].get("code")
                    logger.info(f"✅ Found code {location_code} for {location}")
                else:
                    logger.warning(f"⚠️ Could not find code for location: {location}")

        logger.info(f"🔍 Searching for keywords: {keywords} in location: {location_code}")

        # 2. Parallel Search with Rate Limiting
        semaphore = asyncio.Semaphore(3) # Limit to 3 concurrent requests
        
        async def search_with_limit(keyword):
            async with semaphore:
                # Add a small delay to further spread out requests
                await asyncio.sleep(0.2) 
                return await francetravail_service.search_jobs(keyword, location_code)

        tasks = [search_with_limit(k) for k in keywords]
        
        results_list = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 3. Aggregate and Deduplicate
        all_jobs = []
        seen_ids = set()
        
        for result in results_list:
            if isinstance(result, Exception):
                logger.error(f"❌ Error in search task: {result}")
                continue
            
            if result:
                for job in result:
                    job_id = job.get("id")
                    if job_id and job_id not in seen_ids:
                        seen_ids.add(job_id)
                        all_jobs.append(job)
        
        logger.info(f"∑ Found {len(all_jobs)} unique jobs before reranking")
        
        if not all_jobs:
            return []

        # 4. Rerank with LLM
        # Limit to top 30 for reranking to save tokens/time
        jobs_to_rank = all_jobs[:30]
        
        reranked_jobs = await llm_service.compute_similarity_ranking(profile_summary, jobs_to_rank)
        
        return reranked_jobs

    def _get_search_keywords(self, user: User) -> List[str]:
        """Extracts top keywords from user's relational data."""
        keywords = []
        
        # Use top technical skills
        tech_skills = [s.name for s in user.skills_list if s.category == 'technical']
        if tech_skills:
            keywords.extend(tech_skills[:3])
            
        # Fallback: Use last job title
        if not keywords and user.work_experiences:
            last_role = user.work_experiences[0].role
            if last_role:
                keywords.append(last_role)
                
        return keywords

smart_job_service = SmartJobService()
