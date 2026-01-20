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
