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
    therapist_name: str
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
