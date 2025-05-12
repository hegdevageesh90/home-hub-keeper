
"""
API routes for home profiles
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
import logging

from app.models.home_profile import HomeProfileCreate, HomeProfileResponse, HomeProfileUpdate
from app.core.dependencies import get_current_user
from app.core.supabase import supabase

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=HomeProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_home_profile(home_profile: HomeProfileCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Create a new home profile
    """
    try:
        logger.info(f"Creating home profile for user {user['id']}")
        result = supabase.table("home_profiles").insert({
            "address": home_profile.address,
            "construction_year": home_profile.construction_year,
            "images": home_profile.images,
            "user_id": user["id"]
        }).execute()
        
        if result.data:
            logger.info(f"Home profile created with ID {result.data[0]['id']}")
            return result.data[0]
        else:
            logger.error("Failed to create home profile")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create home profile")
    except Exception as e:
        logger.error(f"Error creating home profile: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.get("/", response_model=List[HomeProfileResponse])
async def get_home_profiles(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get all home profiles for the current user
    """
    try:
        logger.info(f"Fetching home profiles for user {user['id']}")
        result = supabase.table("home_profiles").select("*").eq("user_id", user["id"]).execute()
        return result.data
    except Exception as e:
        logger.error(f"Error fetching home profiles: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.get("/{profile_id}", response_model=HomeProfileResponse)
async def get_home_profile(profile_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get a specific home profile by ID
    """
    try:
        logger.info(f"Fetching home profile {profile_id} for user {user['id']}")
        result = supabase.table("home_profiles").select("*").eq("id", profile_id).execute()
        
        if not result.data:
            logger.warning(f"Home profile {profile_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home profile not found")
        
        # Check if the profile belongs to the user
        if result.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to access profile {profile_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this profile")
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching home profile {profile_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.put("/{profile_id}", response_model=HomeProfileResponse)
async def update_home_profile(
    profile_id: str, 
    profile_update: HomeProfileUpdate, 
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a home profile
    """
    try:
        # First check if profile exists and belongs to user
        logger.info(f"Updating home profile {profile_id} for user {user['id']}")
        profile_check = supabase.table("home_profiles").select("user_id").eq("id", profile_id).execute()
        
        if not profile_check.data:
            logger.warning(f"Home profile {profile_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home profile not found")
            
        if profile_check.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to update profile {profile_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this profile")
        
        # Update the profile
        update_data = {k: v for k, v in profile_update.model_dump().items() if v is not None}
        if not update_data:
            return await get_home_profile(profile_id, user)
            
        result = supabase.table("home_profiles").update(update_data).eq("id", profile_id).execute()
        
        if result.data:
            logger.info(f"Home profile {profile_id} updated successfully")
            return result.data[0]
        else:
            logger.error(f"Failed to update home profile {profile_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update home profile")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating home profile {profile_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_home_profile(profile_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Delete a home profile
    """
    try:
        # First check if profile exists and belongs to user
        logger.info(f"Deleting home profile {profile_id} for user {user['id']}")
        profile_check = supabase.table("home_profiles").select("user_id").eq("id", profile_id).execute()
        
        if not profile_check.data:
            logger.warning(f"Home profile {profile_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home profile not found")
            
        if profile_check.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to delete profile {profile_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this profile")
        
        # Delete the profile
        result = supabase.table("home_profiles").delete().eq("id", profile_id).execute()
        
        if result.data:
            logger.info(f"Home profile {profile_id} deleted successfully")
            return None
        else:
            logger.error(f"Failed to delete home profile {profile_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete home profile")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting home profile {profile_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")
