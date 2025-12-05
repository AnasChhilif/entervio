import httpx
from typing import List, Dict, Any

class LocationService:
    GEO_API_URL = "https://geo.api.gouv.fr/communes"

    async def search_cities(self, query: str) -> List[Dict[str, Any]]:
        if not query or len(query) < 2:
            return []

        params = {
            "nom": query,
            "fields": "nom,code,codesPostaux,departement,region",
            "boost": "population",
            "limit": 10
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.GEO_API_URL, params=params)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                print(f"Error fetching cities: {e}")
                return []

location_service = LocationService()
