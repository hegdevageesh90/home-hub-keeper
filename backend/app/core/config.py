
"""
Configuration settings loaded from environment variables with sensible defaults
"""
from typing import List, Optional, Union, Dict, Any
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Project info
    PROJECT_NAME: str = "Home Maintenance API"
    PROJECT_VERSION: str = "1.0.0"
    PROJECT_DESCRIPTION: str = "API for managing home maintenance tasks and appliances"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # API settings
    API_PREFIX: str = "/api"
    
    # CORS configuration
    BACKEND_CORS_ORIGINS_STR: str = os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:3000","http://localhost:5173"]')
    BACKEND_CORS_ORIGINS: List[str] = []
    
    # Supabase configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    
    # JWT configuration
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-jwt-secret-key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    @field_validator("BACKEND_CORS_ORIGINS")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]], values: Dict[str, Any]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        if isinstance(v, (list, str)):
            import ast
            cors_origins_str = values.data.get("BACKEND_CORS_ORIGINS_STR")
            if cors_origins_str:
                try:
                    return ast.literal_eval(cors_origins_str)
                except Exception:
                    return [x.strip() for x in cors_origins_str.split(",") if x.strip()]
        return []

settings = Settings()
