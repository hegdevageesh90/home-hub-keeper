
"""
Home profile models for request and response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
import uuid

class HomeProfileBase(BaseModel):
    """Base model for home profiles"""
    address: str
    construction_year: int
    images: Optional[List[str]] = None

class HomeProfileCreate(HomeProfileBase):
    """Model for creating home profiles"""
    pass

class HomeProfileUpdate(BaseModel):
    """Model for updating home profiles"""
    address: Optional[str] = None
    construction_year: Optional[int] = None
    images: Optional[List[str]] = None

class HomeProfileResponse(HomeProfileBase):
    """Model for home profile responses"""
    id: str
    user_id: str
    
    model_config = {
        "from_attributes": True
    }
