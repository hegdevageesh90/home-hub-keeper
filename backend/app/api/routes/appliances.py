
"""
API routes for appliances
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
import logging

from app.models.appliance import ApplianceCreate, ApplianceResponse, ApplianceUpdate
from app.core.dependencies import get_current_user
from app.core.supabase import supabase

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ApplianceResponse, status_code=status.HTTP_201_CREATED)
async def create_appliance(appliance: ApplianceCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Create a new appliance
    """
    try:
        # Verify that the home_profile_id belongs to the user
        logger.info(f"Creating appliance for home profile {appliance.home_profile_id}")
        home_profile = supabase.table("home_profiles").select("*").eq("id", appliance.home_profile_id).execute()
        
        if not home_profile.data:
            logger.warning(f"Home profile {appliance.home_profile_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home profile not found")
        
        if home_profile.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to add appliance to home profile {appliance.home_profile_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add appliances to this home profile")
        
        # Insert the appliance
        result = supabase.table("appliances").insert({
            "name": appliance.name,
            "category": appliance.category,
            "purchase_date": str(appliance.purchase_date),
            "warranty_expiration_date": str(appliance.warranty_expiration_date) if appliance.warranty_expiration_date else None,
            "warranty_document": appliance.warranty_document,
            "notes": appliance.notes,
            "home_profile_id": appliance.home_profile_id
        }).execute()
        
        if result.data:
            logger.info(f"Appliance created with ID {result.data[0]['id']}")
            return result.data[0]
        else:
            logger.error("Failed to create appliance")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create appliance")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating appliance: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.get("/", response_model=List[ApplianceResponse])
async def get_appliances(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get all appliances for the current user's home profiles
    """
    try:
        # Get all home profiles for the user
        logger.info(f"Fetching appliances for user {user['id']}")
        home_profiles = supabase.table("home_profiles").select("id").eq("user_id", user["id"]).execute()
        
        if not home_profiles.data:
            logger.info(f"No home profiles found for user {user['id']}")
            return []
        
        # Get appliances for all home profiles
        home_profile_ids = [profile["id"] for profile in home_profiles.data]
        result = supabase.table("appliances").select("*").in_("home_profile_id", home_profile_ids).execute()
        
        return result.data
    except Exception as e:
        logger.error(f"Error fetching appliances: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.get("/{appliance_id}", response_model=ApplianceResponse)
async def get_appliance(appliance_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get a specific appliance by ID
    """
    try:
        logger.info(f"Fetching appliance {appliance_id}")
        # Get the appliance
        appliance = supabase.table("appliances").select("*").eq("id", appliance_id).execute()
        
        if not appliance.data:
            logger.warning(f"Appliance {appliance_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appliance not found")
            
        # Verify that the appliance belongs to a home profile owned by the user
        home_profile_id = appliance.data[0]["home_profile_id"]
        home_profile = supabase.table("home_profiles").select("user_id").eq("id", home_profile_id).execute()
        
        if not home_profile.data or home_profile.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to access appliance {appliance_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this appliance")
            
        return appliance.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching appliance {appliance_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.put("/{appliance_id}", response_model=ApplianceResponse)
async def update_appliance(
    appliance_id: str, 
    appliance_update: ApplianceUpdate, 
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update an appliance
    """
    try:
        logger.info(f"Updating appliance {appliance_id}")
        # Check if appliance exists and belongs to the user
        appliance_check = await get_appliance(appliance_id, user)
        
        # If home_profile_id is being updated, check if the new home profile belongs to the user
        if appliance_update.home_profile_id:
            home_profile = supabase.table("home_profiles").select("user_id").eq("id", appliance_update.home_profile_id).execute()
            
            if not home_profile.data:
                logger.warning(f"Home profile {appliance_update.home_profile_id} not found")
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="New home profile not found")
                
            if home_profile.data[0]["user_id"] != user["id"]:
                logger.warning(f"User {user['id']} attempted to move appliance {appliance_id} to home profile {appliance_update.home_profile_id} belonging to another user")
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to move appliance to this home profile")
        
        # Update the appliance
        update_data = {k: v for k, v in appliance_update.model_dump().items() if v is not None}
        
        # Handle date fields
        if "purchase_date" in update_data:
            update_data["purchase_date"] = str(update_data["purchase_date"])
        if "warranty_expiration_date" in update_data:
            update_data["warranty_expiration_date"] = str(update_data["warranty_expiration_date"]) if update_data["warranty_expiration_date"] else None
            
        if not update_data:
            return appliance_check
            
        result = supabase.table("appliances").update(update_data).eq("id", appliance_id).execute()
        
        if result.data:
            logger.info(f"Appliance {appliance_id} updated successfully")
            return result.data[0]
        else:
            logger.error(f"Failed to update appliance {appliance_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update appliance")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating appliance {appliance_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.delete("/{appliance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_appliance(appliance_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Delete an appliance
    """
    try:
        logger.info(f"Deleting appliance {appliance_id}")
        # Check if appliance exists and belongs to the user
        await get_appliance(appliance_id, user)
        
        # Delete the appliance
        result = supabase.table("appliances").delete().eq("id", appliance_id).execute()
        
        if result.data:
            logger.info(f"Appliance {appliance_id} deleted successfully")
            return None
        else:
            logger.error(f"Failed to delete appliance {appliance_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete appliance")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting appliance {appliance_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")
