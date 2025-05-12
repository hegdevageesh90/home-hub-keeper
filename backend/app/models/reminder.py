
"""
Maintenance reminder models for request and response schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date
import uuid

class ReminderBase(BaseModel):
    """Base model for maintenance reminders"""
    title: str
    description: Optional[str] = None
    due_date: date
    recurring: bool = False
    recurrence_pattern: Optional[str] = None
    completed: bool = False

class ReminderCreate(ReminderBase):
    """Model for creating maintenance reminders"""
    appliance_id: str

class ReminderUpdate(BaseModel):
    """Model for updating maintenance reminders"""
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    completed: Optional[bool] = None

class ReminderResponse(ReminderBase):
    """Model for reminder responses"""
    id: str
    appliance_id: str
    
    model_config = {
        "from_attributes": True
    }
