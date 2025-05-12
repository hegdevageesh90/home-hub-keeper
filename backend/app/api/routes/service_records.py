
"""
API routes for service records
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
import logging

from app.models.service_record import ServiceRecordCreate, ServiceRecordResponse, ServiceRecordUpdate
from app.core.dependencies import get_current_user
from app.core.supabase import supabase

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ServiceRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_service_record(service_record: ServiceRecordCreate, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Create a new service record
    """
    try:
        logger.info(f"Creating service record for appliance {service_record.appliance_id}")
        # Verify that the appliance belongs to the user
        appliance = supabase.table("appliances").select("home_profile_id").eq("id", service_record.appliance_id).execute()
        
        if not appliance.data:
            logger.warning(f"Appliance {service_record.appliance_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appliance not found")
        
        home_profile = supabase.table("home_profiles").select("user_id").eq("id", appliance.data[0]["home_profile_id"]).execute()
        
        if not home_profile.data or home_profile.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to add service record to appliance {service_record.appliance_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add service records to this appliance")
        
        # Insert the service record
        result = supabase.table("service_records").insert({
            "appliance_id": service_record.appliance_id,
            "date": str(service_record.date),
            "service_type": service_record.service_type,
            "provider_name": service_record.provider_name,
            "provider_contact": service_record.provider_contact,
            "cost": service_record.cost,
            "notes": service_record.notes,
            "invoice_document": service_record.invoice_document
        }).execute()
        
        if result.data:
            logger.info(f"Service record created with ID {result.data[0]['id']}")
            return result.data[0]
        else:
            logger.error("Failed to create service record")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create service record")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating service record: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.get("/", response_model=List[ServiceRecordResponse])
async def get_service_records(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get all service records for the current user's appliances
    """
    try:
        logger.info(f"Fetching service records for user {user['id']}")
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
        
        # Get service records for all appliances
        appliance_ids = [appliance["id"] for appliance in appliances.data]
        result = supabase.table("service_records").select("*").in_("appliance_id", appliance_ids).execute()
        
        return result.data
    except Exception as e:
        logger.error(f"Error fetching service records: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.get("/{record_id}", response_model=ServiceRecordResponse)
async def get_service_record(record_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get a specific service record by ID
    """
    try:
        logger.info(f"Fetching service record {record_id}")
        # Get the service record
        service_record = supabase.table("service_records").select("*").eq("id", record_id).execute()
        
        if not service_record.data:
            logger.warning(f"Service record {record_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service record not found")
            
        # Verify that the service record belongs to an appliance owned by the user
        appliance_id = service_record.data[0]["appliance_id"]
        appliance = supabase.table("appliances").select("home_profile_id").eq("id", appliance_id).execute()
        
        if not appliance.data:
            logger.warning(f"Appliance {appliance_id} not found")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appliance not found")
            
        home_profile = supabase.table("home_profiles").select("user_id").eq("id", appliance.data[0]["home_profile_id"]).execute()
        
        if not home_profile.data or home_profile.data[0]["user_id"] != user["id"]:
            logger.warning(f"User {user['id']} attempted to access service record {record_id} belonging to another user")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this service record")
            
        return service_record.data[0]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching service record {record_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.put("/{record_id}", response_model=ServiceRecordResponse)
async def update_service_record(
    record_id: str, 
    record_update: ServiceRecordUpdate, 
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Update a service record
    """
    try:
        logger.info(f"Updating service record {record_id}")
        # Check if service record exists and belongs to the user
        await get_service_record(record_id, user)
        
        # Update the service record
        update_data = {k: v for k, v in record_update.model_dump().items() if v is not None}
        
        # Handle date fields
        if "date" in update_data:
            update_data["date"] = str(update_data["date"])
            
        if not update_data:
            return await get_service_record(record_id, user)
            
        result = supabase.table("service_records").update(update_data).eq("id", record_id).execute()
        
        if result.data:
            logger.info(f"Service record {record_id} updated successfully")
            return result.data[0]
        else:
            logger.error(f"Failed to update service record {record_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update service record")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating service record {record_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service_record(record_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Delete a service record
    """
    try:
        logger.info(f"Deleting service record {record_id}")
        # Check if service record exists and belongs to the user
        await get_service_record(record_id, user)
        
        # Delete the service record
        result = supabase.table("service_records").delete().eq("id", record_id).execute()
        
        if result.data:
            logger.info(f"Service record {record_id} deleted successfully")
            return None
        else:
            logger.error(f"Failed to delete service record {record_id}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to delete service record")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting service record {record_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error: {str(e)}")
