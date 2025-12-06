import asyncio
import os
from app.services.francetravail_service import francetravail_service
from app.schemas.job import JobSearchCriteria

# Mock the auth token to avoid needing real credentials if possible, 
# but the error comes from the API so we might need real credentials.
# Assuming the environment variables are set in the user's session.
# If not, we might fail on auth. But let's try to reuse the service.

async def reproduce():
    print("--- Attempting to reproduce 400 Error ---")
    
    # Test case 1: Paris INSEE code (what the frontend likely sends)
    print("\nTest 1: Location '75056' (Paris INSEE)")
    criteria = JobSearchCriteria(keywords="developer", location="75056")
    try:
        results = await francetravail_service.search_jobs(criteria)
        print(f"✅ Success! Found {len(results)} jobs.")
    except Exception as e:
        print(f"❌ Failed: {e}")

    # Test case 2: Department '75'
    print("\nTest 2: Location '75' (Paris Dept)")
    criteria = JobSearchCriteria(keywords="developer", location="75")
    try:
        results = await francetravail_service.search_jobs(criteria)
        print(f"✅ Success! Found {len(results)} jobs.")
    except Exception as e:
        print(f"❌ Failed: {e}")

    # Test case 3: Invalid code
    print("\nTest 3: Location '99999' (Invalid)")
    criteria = JobSearchCriteria(keywords="developer", location="99999")
    try:
        results = await francetravail_service.search_jobs(criteria)
        print(f"✅ Success! Found {len(results)} jobs.")
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    # Ensure we can run this. We might need to set up the app context or env vars.
    # We'll assume the environment is set up similar to the app.
    asyncio.run(reproduce())
