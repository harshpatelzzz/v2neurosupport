from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
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
    session_notes = relationship("SessionNote", back_populates="appointment", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    appointment_id = Column(String, ForeignKey("appointments.id"), nullable=False)
    sender = Column(String, nullable=False)  # "user" | "therapist"
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    appointment = relationship("Appointment", back_populates="messages")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    recipient_role = Column(String, nullable=False)  # "user" | "therapist"
    recipient_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SessionNote(Base):
    __tablename__ = "session_notes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    appointment_id = Column(String, ForeignKey("appointments.id"), nullable=False)
    therapist_name = Column(String, nullable=False)
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    appointment = relationship("Appointment", back_populates="session_notes")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Therapist(Base):
    __tablename__ = "therapists"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    license_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
