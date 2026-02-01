from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text, Float, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

# Allowed values for emotion_analysis (enum-like strings, PostgreSQL-compatible)
EMOTION_LABELS = (
    "joy", "sadness", "anger", "fear", "surprise", "neutral",
    "anxiety", "stress", "depression"
)
RISK_LEVELS = ("low", "medium", "high")

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
    emotion_analysis = relationship(
        "EmotionAnalysis",
        back_populates="message",
        uselist=False,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class EmotionAnalysis(Base):
    """One-to-one with Message. Every message MUST have exactly one emotion_analysis record."""
    __tablename__ = "emotion_analysis"
    __table_args__ = (
        UniqueConstraint("message_id", name="uq_emotion_analysis_message_id"),
    )

    analysis_id = Column(String, primary_key=True, default=generate_uuid)
    message_id = Column(
        String,
        ForeignKey("messages.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    emotion_label = Column(String(32), nullable=False)
    confidence_score = Column(Float, nullable=False)
    risk_level = Column(String(16), nullable=False)
    risk_score = Column(Float, nullable=False)
    model_version = Column(String(64), nullable=False)
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    message = relationship("Message", back_populates="emotion_analysis")


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
