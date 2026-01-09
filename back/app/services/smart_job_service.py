import asyncio
import logging
from typing import Any

from app.models.job import JobStatus
from app.models.user import User
from app.services.dspy_job_service import dspy_job_service
from app.services.francetravail_service import francetravail_service
from app.services.location_service import location_service
from app.services.ranking_service import ranking_service

logger = logging.getLogger(__name__)


class SmartJobService:
    def __init__(self):
        pass

    def _build_profile_summary(self, user: User) -> str:
        parts = []

        tech_skills = [s.name for s in user.skills_list if s.category == "technical"]
        if tech_skills:
            parts.append(f"Technical Skills: {', '.join(tech_skills[:10])}")

        if user.work_experiences:
            exp_summary = []
            for w in user.work_experiences[:3]:
                exp_summary.append(f"{w.role} at {w.company}")
            parts.append(f"Experience: {'; '.join(exp_summary)}")

        if user.projects:
            proj_summary = [p.name for p in user.projects[:3]]
            parts.append(f"Projects: {', '.join(proj_summary)}")

        return "\n".join(parts) if parts else "No profile data available."

    async def _resolve_location(
        self, raw: str, type_hint: str
    ) -> tuple[dict[str, str], dict[str, Any]]:
        if type_hint == "region" or type_hint == "unknown":
            regions = await location_service.search_regions(raw)
            if regions:
                logger.info(
                    f"Resolved '{raw}' to Region: {regions[0]['nom']} ({regions[0]['code']})"
                )
                return {"region": regions[0]["code"]}, {}

        if type_hint == "departement" or type_hint == "unknown":
            depts = await location_service.search_departments(raw)
            if depts:
                logger.info(
                    f"Resolved '{raw}' to Department: {depts[0]['nom']} ({depts[0]['code']})"
                )
                return {"departement": depts[0]["code"]}, {}

        if type_hint == "commune" or type_hint == "unknown":
            cities = await location_service.search_cities(raw)
            if cities:
                city = cities[0]
                logger.info(f"Resolved '{raw}' to City: {city['nom']} ({city['code']})")

                meta = {}
                if "departement" in city and "code" in city["departement"]:
                    meta["dept"] = city["departement"]["code"]

                return {"location": city["code"]}, meta

        logger.warning(f"Could not resolve location '{raw}' (Hint: {type_hint})")
        return {}, {}

    async def smart_search(
        self, user: User, query: str | None = None
    ) -> list[dict[str, Any]]:
        logger.info(f"Starting smart search for user {user.id}")

        profile_summary = self._build_profile_summary(user)
        user_query = query or "Find jobs matching my profile"

        try:
            raw_variations = dspy_job_service.predict_params(
                user_query, profile_summary
            )
        except Exception as e:
            logger.error(f"DSPy failed: {e}")
            return []

        variations = []
        if isinstance(raw_variations, list):
            for v in raw_variations:
                if isinstance(v, list):
                    variations.extend(v)
                else:
                    variations.append(v)
        else:
            variations = [raw_variations]

        tasks = []

        for params in variations:
            ft_location_params = {}
            location_meta = {}

            loc_raw = getattr(params, "location_raw", None)
            loc_type = getattr(params, "location_type", "unknown")

            if loc_raw:
                ft_location_params, location_meta = await self._resolve_location(
                    loc_raw, loc_type
                )

            tasks.append(
                francetravail_service.search_jobs(
                    keywords=getattr(params, "keywords", ""),
                    experience=getattr(params, "experience_level", None),
                    experience_exigence=getattr(params, "experience_exigence", None),
                    contract_type=getattr(params, "contract_type", None),
                    is_full_time=getattr(params, "is_full_time", None),
                    **ft_location_params,
                )
            )

            if "dept" in location_meta and "departement" not in ft_location_params:
                tasks.append(
                    francetravail_service.search_jobs(
                        keywords=getattr(params, "keywords", ""),
                        experience=getattr(params, "experience_level", None),
                        experience_exigence=getattr(
                            params, "experience_exigence", None
                        ),
                        contract_type=getattr(params, "contract_type", None),
                        is_full_time=getattr(params, "is_full_time", None),
                        departement=location_meta["dept"],
                    )
                )

        logger.info(
            f"Executing {len(tasks)} search tasks in parallel (from {len(variations)} variations)..."
        )
        results_list = await asyncio.gather(*tasks, return_exceptions=True)

        all_jobs = []
        seen_ids = set()

        for i, res in enumerate(results_list):
            if isinstance(res, list):
                count = 0
                for job in res:
                    job_id = job.get("id")
                    if job_id and job_id not in seen_ids:
                        all_jobs.append(job)
                        seen_ids.add(job_id)
                        count += 1
                logger.info(f"Task {i} returned {len(res)} jobs ({count} new).")
            else:
                logger.warning(f"Task {i} failed: {res}")

        if not all_jobs:
            logger.info("No jobs found in any scope. Retrying national search...")
            try:
                fallback_keywords = (
                    getattr(variations[0], "keywords", user_query)
                    if variations
                    else user_query
                )

                found_jobs = await francetravail_service.search_jobs(
                    keywords=fallback_keywords
                )
                logger.info(f"Found {len(found_jobs)} jobs via National fallback.")
                all_jobs = found_jobs
            except Exception as e:
                logger.error(f"National fallback search also failed: {e}")
                return []

        found_jobs = all_jobs

        reranked_jobs = await ranking_service.compute_similarity_ranking(
            profile_summary, found_jobs, query=query
        )

        job_statuses = {job.job_id: job.status for job in user.jobs}

        for job in reranked_jobs:
            job_id = job.get("id")
            status = job_statuses.get(job_id)

            job["is_viewed"] = status in [JobStatus.VIEWED, JobStatus.APPLIED]
            job["is_applied"] = status == JobStatus.APPLIED

        return reranked_jobs


_smart_job_instance = None


def get_smart_job_service() -> SmartJobService:
    global _smart_job_instance
    if _smart_job_instance is None:
        logger.info("Creating job_service singleton...")
        _smart_job_instance = SmartJobService()
        logger.info("Job service singleton created")
    return _smart_job_instance


smart_job_service = get_smart_job_service()
