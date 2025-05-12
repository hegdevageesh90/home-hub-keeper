
"""
API router configuration
"""
from fastapi import APIRouter

from app.api.routes import home_profiles, appliances, service_records, reminders

# Create API router
api_router = APIRouter()

# Include all API endpoint routers
api_router.include_router(home_profiles.router, prefix="/home_profiles", tags=["home_profiles"])
api_router.include_router(appliances.router, prefix="/appliances", tags=["appliances"])
api_router.include_router(service_records.router, prefix="/service_records", tags=["service_records"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
