
"""
Service record models for request and response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
import uuid

class ServiceRecordBase(BaseModel):
    """Base model for service records"""
    date: date
    service_type: str
    provider_name: str
    provider_contact: Optional[str] = None
    cost: float
    notes: Optional[str] = None
    invoice_document: Optional[str] = None

class ServiceRecordCreate(ServiceRecordBase):
    """Model for creating service records"""
    appliance_id: str

class ServiceRecordUpdate(BaseModel):
    """Model for updating service records"""
    date: Optional[date] = None
    service_type: Optional[str] = None
    provider_name: Optional[str] = None
    provider_contact: Optional[str] = None
    cost: Optional[float] = None
    notes: Optional[str] = None
    invoice_document: Optional[str] = None

class ServiceRecordResponse(ServiceRecordBase):
    """Model for service record responses"""
    id: str
    appliance_id: str
    
    model_config = {
        "from_attributes": True
    }
