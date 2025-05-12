
"""
API routes for maintenance reminders
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
import logging

from app.models.reminder import ReminderCreate, ReminderResponse, ReminderUpdate
from app.core.dependencies import get_current_user
from app.core.supabase import supabase

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(reminder: ReminderCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Create a new maintenance reminder
    """
    try:
        logger.info(f"Creating reminder for appliance {reminder.appliance_id}")
        # Verify that the appliance belongs to the user
        appliance = supabase.table("appliances").select("home_profile_id").eq("id", reminder.appliance_id).execute()
        
        if not appliance.data:
            logger.warning(f"Appliance {reminder.appliance_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appliance not found")
        
        home_profile = supabase.table("home_profiles").select("user_id").eq("id", appliance.data[0]["home_profile_id"]).execute()
        
        if not home_profile.data or home_profile.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to add reminder to appliance {reminder.appliance_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add reminders to this appliance")
        
        # Insert the reminder
        result = supabase.table("maintenance_reminders").insert({
            "appliance_id": reminder.appliance_id,
            "title": reminder.title,
            "description": reminder.description,
            "due_date": str(reminder.due_date),
            "recurring": reminder.recurring,
            "recurrence_pattern": reminder.recurrence_pattern,
            "completed": reminder.completed
        }).execute()
        
        if result.data:
            logger.info(f"Reminder created with ID {result.data[0]['id']}")
            return result.data[0]
        else:
            logger.error("Failed to create reminder")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create reminder")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating reminder: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.get("/", response_model=List[ReminderResponse])
async def get_reminders(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get all reminders for the current user's appliances
    """
    try:
        logger.info(f"Fetching reminders for user {user['id']}")
        # Get all home profiles for the user
        home_profiles = supabase.table("home_profiles").select("id").eq("user_id", user["id"]).execute()
        
        if not home_profiles.data:
            logger.info(f"No home profiles found for user {user['id']}")
            return []
        
        # Get appliances for all home profiles
        home_profile_ids = [profile["id"] for profile in home_profiles.data]
        appliances = supabase.table("appliances").select("id").in_("home_profile_id", home_profile_ids).execute()
        
        if not appliances.data:
            logger.info(f"No appliances found for user {user['id']}")
            return []
        
        # Get reminders for all appliances
        appliance_ids = [appliance["id"] for appliance in appliances.data]
        result = supabase.table("maintenance_reminders").select("*").in_("appliance_id", appliance_ids).execute()
        
        return result.data
    except Exception as e:
        logger.error(f"Error fetching reminders: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.get("/{reminder_id}", response_model=ReminderResponse)
async def get_reminder(reminder_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get a specific reminder by ID
    """
    try:
        logger.info(f"Fetching reminder {reminder_id}")
        # Get the reminder
        reminder = supabase.table("maintenance_reminders").select("*").eq("id", reminder_id).execute()
        
        if not reminder.data:
            logger.warning(f"Reminder {reminder_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
            
        # Verify that the reminder belongs to an appliance owned by the user
        appliance_id = reminder.data[0]["appliance_id"]
        appliance = supabase.table("appliances").select("home_profile_id").eq("id", appliance_id).execute()
        
        if not appliance.data:
            logger.warning(f"Appliance {appliance_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appliance not found")
            
        home_profile = supabase.table("home_profiles").select("user_id").eq("id", appliance.data[0]["home_profile_id"]).execute()
        
        if not home_profile.data or home_profile.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to access reminder {reminder_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this reminder")
            
        return reminder.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching reminder {reminder_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: str, 
    reminder_update: ReminderUpdate, 
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a reminder
    """
    try:
        logger.info(f"Updating reminder {reminder_id}")
        # Check if reminder exists and belongs to the user
        await get_reminder(reminder_id, user)
        
        # Update the reminder
        update_data = {k: v for k, v in reminder_update.model_dump().items() if v is not None}
        
        # Handle date fields
        if "due_date" in update_data:
            update_data["due_date"] = str(update_data["due_date"])
            
        if not update_data:
            return await get_reminder(reminder_id, user)
            
        result = supabase.table("maintenance_reminders").update(update_data).eq("id", reminder_id).execute()
        
        if result.data:
            logger.info(f"Reminder {reminder_id} updated successfully")
            return result.data[0]
        else:
            logger.error(f"Failed to update reminder {reminder_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update reminder")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating reminder {reminder_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.patch("/{reminder_id}/complete", response_model=ReminderResponse)
async def mark_reminder_complete(reminder_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Mark a reminder as completed
    """
    try:
        logger.info(f"Marking reminder {reminder_id} as complete")
        # Check if reminder exists and belongs to the user
        await get_reminder(reminder_id, user)
        
        # Update the reminder
        result = supabase.table("maintenance_reminders").update({"completed": True}).eq("id", reminder_id).execute()
        
        if result.data:
            logger.info(f"Reminder {reminder_id} marked as complete")
            return result.data[0]
        else:
            logger.error(f"Failed to update reminder {reminder_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to mark reminder as complete")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating reminder {reminder_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(reminder_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Delete a reminder
    """
    try:
        logger.info(f"Deleting reminder {reminder_id}")
        # Check if reminder exists and belongs to the user
        await get_reminder(reminder_id, user)
        
        # Delete the reminder
        result = supabase.table("maintenance_reminders").delete().eq("id", reminder_id).execute()
        
        if result.data:
            logger.info(f"Reminder {reminder_id} deleted successfully")
            return None
        else:
            logger.error(f"Failed to delete reminder {reminder_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete reminder")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting reminder {reminder_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")
