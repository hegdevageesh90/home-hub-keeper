
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import httpx
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime, date

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

app = FastAPI(title="Home Maintenance API")

# Configure CORS
origins_str = os.getenv("BACKEND_CORS_ORIGINS", '["http://localhost:3000","http://localhost:5173"]')
origins = eval(origins_str)  # Convert string to list

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth middleware to verify JWT token
async def get_current_user(authorization: str = None):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Extract token
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify token with Supabase
        response = httpx.post(
            f"{supabase_url}/auth/v1/token/revoke",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        
        if response.status_code != 200:
            # If revocation fails, token is invalid or expired
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Get user details
        user_response = httpx.get(
            f"{supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": os.getenv("SUPABASE_ANON_KEY")
            }
        )
        
        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to get user details",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return user_response.json()
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Define Pydantic models
class HomeProfileCreate(BaseModel):
    address: str
    construction_year: int
    images: Optional[List[str]] = None

class HomeProfile(HomeProfileCreate):
    id: str
    user_id: str

class ApplianceCreate(BaseModel):
    name: str
    category: str
    purchase_date: date
    warranty_expiration_date: Optional[date] = None
    warranty_document: Optional[str] = None
    notes: Optional[str] = None
    home_profile_id: str

class Appliance(ApplianceCreate):
    id: str

class ServiceRecordCreate(BaseModel):
    appliance_id: str
    date: date
    service_type: str
    provider_name: str
    provider_contact: Optional[str] = None
    cost: float
    notes: Optional[str] = None
    invoice_document: Optional[str] = None

class ServiceRecord(ServiceRecordCreate):
    id: str

class ReminderCreate(BaseModel):
    appliance_id: str
    title: str
    description: Optional[str] = None
    due_date: date
    recurring: bool = False
    recurrence_pattern: Optional[str] = None
    completed: bool = False

class Reminder(ReminderCreate):
    id: str

# API routes
@app.get("/")
async def root():
    return {"message": "Welcome to the Home Maintenance API"}

# Home Profile routes
@app.post("/home_profiles/", response_model=HomeProfile)
async def create_home_profile(home_profile: HomeProfileCreate, user: Dict = Depends(get_current_user)):
    try:
        result = supabase.table("home_profiles").insert({
            "address": home_profile.address,
            "construction_year": home_profile.construction_year,
            "images": home_profile.images,
            "user_id": user["id"]
        }).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create home profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/home_profiles/", response_model=List[HomeProfile])
async def get_home_profiles(user: Dict = Depends(get_current_user)):
    try:
        result = supabase.table("home_profiles").select("*").eq("user_id", user["id"]).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/home_profiles/{profile_id}", response_model=HomeProfile)
async def get_home_profile(profile_id: str, user: Dict = Depends(get_current_user)):
    try:
        result = supabase.table("home_profiles").select("*").eq("id", profile_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Home profile not found")
        
        # Check if the profile belongs to the user
        if result.data[0]["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to access this profile")
        
        return result.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Appliance routes
@app.post("/appliances/", response_model=Appliance)
async def create_appliance(appliance: ApplianceCreate, user: Dict = Depends(get_current_user)):
    try:
        # Verify that the home_profile_id belongs to the user
        home_profile = supabase.table("home_profiles").select("*").eq("id", appliance.home_profile_id).execute()
        
        if not home_profile.data:
            raise HTTPException(status_code=404, detail="Home profile not found")
        
        if home_profile.data[0]["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to add appliances to this home profile")
        
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
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create appliance")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/appliances/", response_model=List[Appliance])
async def get_appliances(user: Dict = Depends(get_current_user)):
    try:
        # Get all home profiles for the user
        home_profiles = supabase.table("home_profiles").select("id").eq("user_id", user["id"]).execute()
        
        if not home_profiles.data:
            return []
        
        # Get appliances for all home profiles
        home_profile_ids = [profile["id"] for profile in home_profiles.data]
        result = supabase.table("appliances").select("*").in_("home_profile_id", home_profile_ids).execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Service Record routes
@app.post("/service_records/", response_model=ServiceRecord)
async def create_service_record(service_record: ServiceRecordCreate, user: Dict = Depends(get_current_user)):
    try:
        # Verify that the appliance belongs to the user
        appliance = supabase.table("appliances").select("home_profile_id").eq("id", service_record.appliance_id).execute()
        
        if not appliance.data:
            raise HTTPException(status_code=404, detail="Appliance not found")
        
        home_profile = supabase.table("home_profiles").select("user_id").eq("id", appliance.data[0]["home_profile_id"]).execute()
        
        if not home_profile.data or home_profile.data[0]["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to add service records to this appliance")
        
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
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create service record")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Maintenance Reminder routes
@app.post("/reminders/", response_model=Reminder)
async def create_reminder(reminder: ReminderCreate, user: Dict = Depends(get_current_user)):
    try:
        # Verify that the appliance belongs to the user
        appliance = supabase.table("appliances").select("home_profile_id").eq("id", reminder.appliance_id).execute()
        
        if not appliance.data:
            raise HTTPException(status_code=404, detail="Appliance not found")
        
        home_profile = supabase.table("home_profiles").select("user_id").eq("id", appliance.data[0]["home_profile_id"]).execute()
        
        if not home_profile.data or home_profile.data[0]["user_id"] != user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to add reminders to this appliance")
        
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
            return result.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to create reminder")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/reminders/", response_model=List[Reminder])
async def get_reminders(user: Dict = Depends(get_current_user)):
    try:
        # Get all appliances that belong to the user
        home_profiles = supabase.table("home_profiles").select("id").eq("user_id", user["id"]).execute()
        
        if not home_profiles.data:
            return []
        
        home_profile_ids = [profile["id"] for profile in home_profiles.data]
        appliances = supabase.table("appliances").select("id").in_("home_profile_id", home_profile_ids).execute()
        
        if not appliances.data:
            return []
        
        appliance_ids = [appliance["id"] for appliance in appliances.data]
        result = supabase.table("maintenance_reminders").select("*").in_("appliance_id", appliance_ids).execute()
        
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Run the application with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
