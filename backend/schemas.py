from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class AppointmentCreate(BaseModel):
    user_name: str
    therapist_name: Optional[str] = None
    created_from: str = "manual"

class AppointmentResponse(BaseModel):
    id: str
    user_name: str
    therapist_name: Optional[str]
    status: str
    created_from: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    id: str
    appointment_id: str
    sender: str
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class NotificationCreate(BaseModel):
    recipient_role: str  # "user" | "therapist"
    recipient_name: str
    title: str
    message: str

class NotificationResponse(BaseModel):
    id: str
    recipient_role: str
    recipient_name: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class SessionNoteCreate(BaseModel):
    notes: str

class SessionNoteUpdate(BaseModel):
    notes: str

class SessionNoteResponse(BaseModel):
    id: str
    appointment_id: str
    therapist_name: str
    notes: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Authentication Schemas
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: str

class TherapistRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: str
    license_number: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class TherapistLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str  # "user" | "therapist"
    user_id: str
    username: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class TherapistResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    license_number: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Schemas
class AnalyticsResponse(BaseModel):
    total_appointments: int
    scheduled_appointments: int
    active_appointments: int
    completed_appointments: int
    ai_referred_appointments: int
    manual_appointments: int
    total_patients: int
    total_session_notes: int
    appointments_by_day: List[dict]
    recent_appointments: List[AppointmentResponse]
