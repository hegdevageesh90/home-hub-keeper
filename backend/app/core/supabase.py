
"""
Supabase client initialization and utility functions
"""
from supabase import create_client
import httpx
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase client
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing Supabase client: {e}")
        supabase = None
else:
    logger.warning("Supabase URL or key not provided. Supabase integration will be unavailable.")
    supabase = None

async def verify_token(token: str):
    """
    Verify JWT token with Supabase
    
    Args:
        token: JWT token from Authorization header
        
    Returns:
        User data if token is valid, otherwise None
    """
    if not supabase or not settings.SUPABASE_URL:
        logger.error("Supabase configuration missing, cannot verify token")
        return None
    
    try:
        # Get user details
        user_response = httpx.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.SUPABASE_ANON_KEY
            }
        )
        
        if user_response.status_code == 200:
            return user_response.json()
        else:
            logger.warning(f"Failed to verify token: {user_response.status_code} - {user_response.text}")
            return None
    except Exception as e:
        logger.error(f"Error verifying token: {str(e)}")
        return None
