# app/api/v1/router.py
from fastapi import APIRouter
from app.api.v1.endpoints import interviews

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    interviews.router,
    tags=["interviews"]
)