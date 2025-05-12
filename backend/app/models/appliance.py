
"""
Appliance models for request and response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
import uuid

class ApplianceBase(BaseModel):
    """Base model for appliances"""
    name: str
    category: str
    purchase_date: date
    warranty_expiration_date: Optional[date] = None
    warranty_document: Optional[str] = None
    notes: Optional[str] = None

class ApplianceCreate(ApplianceBase):
    """Model for creating appliances"""
    home_profile_id: str

class ApplianceUpdate(BaseModel):
    """Model for updating appliances"""
    name: Optional[str] = None
    category: Optional[str] = None
    purchase_date: Optional[date] = None
    warranty_expiration_date: Optional[date] = None
    warranty_document: Optional[str] = None
    notes: Optional[str] = None
    home_profile_id: Optional[str] = None

class ApplianceResponse(ApplianceBase):
    """Model for appliance responses"""
    id: str
    home_profile_id: str
    
    model_config = {
        "from_attributes": True
    }
