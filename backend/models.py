from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_name = Column(String, nullable=False)
    therapist_name = Column(String, nullable=True)
    status = Column(String, default="scheduled")  # scheduled | active | completed
    created_from = Column(String, nullable=False)  # "ai" | "manual"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    messages = relationship("Message", back_populates="appointment", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    appointment_id = Column(String, ForeignKey("appointments.id"), nullable=False)
    sender = Column(String, nullable=False)  # "user" | "therapist"
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    appointment = relationship("Appointment", back_populates="messages")
