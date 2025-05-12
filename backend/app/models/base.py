
"""
Base models for request and response schemas
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date

class ApiResponse(BaseModel):
    """Base API response model"""
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None
    errors: Optional[List[str]] = None
