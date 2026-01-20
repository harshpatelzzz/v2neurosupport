from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import json
from datetime import datetime

from database import engine, get_db, Base
from models import Appointment, Message, Notification, SessionNote
from schemas import (
    AppointmentCreate, AppointmentResponse, MessageResponse,
    NotificationCreate, NotificationResponse,
    SessionNoteCreate, SessionNoteUpdate, SessionNoteResponse
)
import uuid

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeuroSupport-V2 Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================================================
# REST API ENDPOINTS
# ====================================================

@app.post("/appointments", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """Create a new appointment manually"""
    db_appointment = Appointment(
        id=str(uuid.uuid4()),
        user_name=appointment.user_name,
        therapist_name=appointment.therapist_name,
        status="scheduled",
        created_from=appointment.created_from
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Send notifications
    create_notification(
        db, "user", appointment.user_name,
        "Appointment Scheduled",
        f"Your appointment has been scheduled successfully. ID: {db_appointment.id[:8]}"
    )
    create_notification(
        db, "therapist", "All Therapists",
        "New Appointment",
        f"New appointment from {appointment.user_name}"
    )
    
    return db_appointment

@app.get("/appointments", response_model=List[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    """Get all appointments"""
    appointments = db.query(Appointment).order_by(Appointment.created_at.desc()).all()
    return appointments

@app.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    """Get appointment details"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

@app.get("/appointments/{appointment_id}/messages", response_model=List[MessageResponse])
def get_appointment_messages(appointment_id: str, db: Session = Depends(get_db)):
    """Get messages for an appointment"""
    messages = db.query(Message).filter(Message.appointment_id == appointment_id).order_by(Message.timestamp).all()
    return messages

@app.post("/appointments/{appointment_id}/end-session")
def end_appointment_session(appointment_id: str, db: Session = Depends(get_db)):
    """End an appointment session (THERAPIST ONLY)"""
    # Get appointment
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Mark as completed
    appointment.status = "completed"
    db.commit()
    
    # Send notification to user
    create_notification(
        db, "user", appointment.user_name,
        "Session Ended",
        "Your therapist has ended the session."
    )
    
    return {
        "status": "success",
        "message": "Session ended successfully",
        "appointment_id": appointment_id
    }

# ====================================================
# NOTIFICATION SERVICE
# ====================================================

def create_notification(db: Session, role: str, recipient: str, title: str, message: str) -> Notification:
    """Helper function to create notifications"""
    notification = Notification(
        id=str(uuid.uuid4()),
        recipient_role=role,
        recipient_name=recipient,
        title=title,
        message=message
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@app.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    role: str = Query(..., description="Role: user or therapist"),
    name: str = Query(..., description="Recipient name"),
    db: Session = Depends(get_db)
):
    """Get notifications for a specific user or therapist"""
    notifications = db.query(Notification).filter(
        Notification.recipient_role == role,
        Notification.recipient_name == name
    ).order_by(Notification.created_at.desc()).all()
    return notifications

@app.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    """Mark a notification as read"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    return {"status": "success", "message": "Notification marked as read"}

# ====================================================
# SESSION NOTES APIs (THERAPIST ONLY)
# ====================================================

@app.post("/appointments/{appointment_id}/notes", response_model=SessionNoteResponse)
def create_session_note(
    appointment_id: str,
    note: SessionNoteCreate,
    db: Session = Depends(get_db)
):
    """Create or update session notes for an appointment (THERAPIST ONLY)"""
    # Check if appointment exists
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if notes already exist for this appointment
    existing_note = db.query(SessionNote).filter(
        SessionNote.appointment_id == appointment_id
    ).first()
    
    if existing_note:
        # Update existing note
        existing_note.notes = note.notes
        existing_note.therapist_name = note.therapist_name
        existing_note.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_note)
        return existing_note
    else:
        # Create new note
        session_note = SessionNote(
            id=str(uuid.uuid4()),
            appointment_id=appointment_id,
            therapist_name=note.therapist_name,
            notes=note.notes
        )
        db.add(session_note)
        db.commit()
        db.refresh(session_note)
        return session_note

@app.get("/appointments/{appointment_id}/notes", response_model=SessionNoteResponse)
def get_session_note(appointment_id: str, db: Session = Depends(get_db)):
    """Get session notes for an appointment (THERAPIST ONLY)"""
    session_note = db.query(SessionNote).filter(
        SessionNote.appointment_id == appointment_id
    ).first()
    
    if not session_note:
        raise HTTPException(status_code=404, detail="Session notes not found")
    
    return session_note

@app.put("/appointments/{appointment_id}/notes", response_model=SessionNoteResponse)
def update_session_note(
    appointment_id: str,
    note_update: SessionNoteUpdate,
    db: Session = Depends(get_db)
):
    """Update session notes for an appointment (THERAPIST ONLY)"""
    session_note = db.query(SessionNote).filter(
        SessionNote.appointment_id == appointment_id
    ).first()
    
    if not session_note:
        raise HTTPException(status_code=404, detail="Session notes not found")
    
    session_note.notes = note_update.notes
    session_note.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(session_note)
    return session_note

# ====================================================
# AI CHATBOT WEBSOCKET (COMPLETELY ISOLATED)
# ====================================================

class AIChat:
    """AI Chatbot Manager - NO ACCESS TO APPOINTMENT CHAT"""
    
    def __init__(self):
        self.active_sessions: Dict[str, WebSocket] = {}
        self.session_states: Dict[str, str] = {}  # Track state: IDLE or BOOKED
    
    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_sessions[session_id] = websocket
        self.session_states[session_id] = "IDLE"  # Initialize state
    
    def disconnect(self, session_id: str):
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
        if session_id in self.session_states:
            del self.session_states[session_id]
    
    def detect_appointment_request(self, message: str) -> bool:
        """Detect if user wants to book an appointment with explicit keywords"""
        keywords = [
            "book appointment",
            "schedule appointment",
            "need a therapist",
            "see a therapist",
            "talk to therapist",
            "book session",
            "schedule session",
            "need therapist",
            "want therapist",
            "talk to someone",
            "need someone to talk",
            "book a session",
            "make appointment"
        ]
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in keywords)
    
    def create_appointment_from_ai(self, user_name: str, db: Session) -> str:
        """AI creates appointment - internal function only"""
        appointment = Appointment(
            id=str(uuid.uuid4()),
            user_name=user_name,
            therapist_name=None,
            status="scheduled",
            created_from="ai"
        )
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        
        # Send notifications
        create_notification(
            db, "user", user_name,
            "Appointment Created",
            f"Your appointment has been created by AI assistant. A therapist will join soon."
        )
        create_notification(
            db, "therapist", "All Therapists",
            "New AI Appointment",
            f"AI created appointment for {user_name}"
        )
        
        return appointment.id
    
    def generate_ai_response(self, user_message: str) -> str:
        """Simple rule-based AI responses"""
        message_lower = user_message.lower()
        
        if "hello" in message_lower or "hi" in message_lower:
            return "Hello! I'm here to help you with mental health support. How can I assist you today?"
        elif "how are you" in message_lower:
            return "I'm doing well, thank you for asking! How are you feeling today?"
        elif "sad" in message_lower or "depressed" in message_lower:
            return "I'm sorry to hear you're feeling this way. Would you like to book an appointment with one of our therapists?"
        elif "anxious" in message_lower or "anxiety" in message_lower:
            return "Anxiety can be challenging. Our therapists can help you develop coping strategies. Would you like to schedule a session?"
        elif "help" in message_lower:
            return "I can help you book an appointment with a therapist, answer general questions about mental health, or just listen. What would you like to do?"
        else:
            return "I understand. If you'd like to speak with a professional therapist, just let me know and I can book an appointment for you."

ai_chat_manager = AIChat()

@app.websocket("/ws/ai-chat/{session_id}")
async def ai_chatbot_websocket(websocket: WebSocket, session_id: str):
    """
    AI CHATBOT WEBSOCKET - AI ONLY
    NO ACCESS TO APPOINTMENT CHAT
    NO THERAPIST COMMUNICATION
    """
    await ai_chat_manager.connect(session_id, websocket)
    
    # Get DB session
    db = next(get_db())
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "ai_message",
            "content": "Hello! I'm your AI mental health support assistant. How can I help you today?",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        while True:
            data = await websocket.receive_json()
            user_message = data.get("content", "")
            user_name = data.get("user_name", "Anonymous")
            
            # Get current session state
            current_state = ai_chat_manager.session_states.get(session_id, "IDLE")
            
            # Check if user wants to book appointment AND hasn't already booked
            if ai_chat_manager.detect_appointment_request(user_message) and current_state == "IDLE":
                # AI creates appointment internally
                appointment_id = ai_chat_manager.create_appointment_from_ai(user_name, db)
                
                # Update session state to BOOKED
                ai_chat_manager.session_states[session_id] = "BOOKED"
                
                # AI responds with confirmation - APPOINTMENT_BOOKED event
                await websocket.send_json({
                    "type": "APPOINTMENT_BOOKED",
                    "content": f"Perfect! I've scheduled an appointment for you. A therapist will be available soon.",
                    "appointment_id": appointment_id,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
                # RETURN immediately - don't continue processing
                continue
            
            # If already booked, don't offer to book again
            if current_state == "BOOKED":
                await websocket.send_json({
                    "type": "ai_message",
                    "content": "Your appointment has already been scheduled. You can close this chat and go to your appointments to connect with a therapist.",
                    "timestamp": datetime.utcnow().isoformat()
                })
                continue
            
            # Normal AI response (only if not booked)
            ai_response = ai_chat_manager.generate_ai_response(user_message)
            await websocket.send_json({
                "type": "ai_message",
                "content": ai_response,
                "timestamp": datetime.utcnow().isoformat()
            })
    
    except WebSocketDisconnect:
        ai_chat_manager.disconnect(session_id)
    finally:
        db.close()

# ====================================================
# APPOINTMENT CHAT WEBSOCKET (HUMAN ONLY - COMPLETELY ISOLATED)
# ====================================================

class AppointmentChat:
    """
    HUMAN-ONLY APPOINTMENT CHAT MANAGER
    NO AI IMPORTS
    NO CHATBOT LOGIC
    NO EMOTION DETECTION
    ONLY RELAY MESSAGES BETWEEN USER AND THERAPIST
    """
    
    def __init__(self):
        # Store one user and one therapist socket per appointment
        self.connections: Dict[str, Dict[str, WebSocket]] = {}
    
    async def connect(self, appointment_id: str, role: str, websocket: WebSocket):
        await websocket.accept()
        
        if appointment_id not in self.connections:
            self.connections[appointment_id] = {}
        
        self.connections[appointment_id][role] = websocket
    
    def disconnect(self, appointment_id: str, role: str):
        if appointment_id in self.connections:
            if role in self.connections[appointment_id]:
                del self.connections[appointment_id][role]
            if not self.connections[appointment_id]:
                del self.connections[appointment_id]
    
    async def broadcast_to_appointment(self, appointment_id: str, message: dict, sender_role: str):
        """Send message to the other party in the appointment"""
        if appointment_id not in self.connections:
            return
        
        # Send to the OTHER role (not the sender)
        target_role = "therapist" if sender_role == "user" else "user"
        
        if target_role in self.connections[appointment_id]:
            await self.connections[appointment_id][target_role].send_json(message)

appointment_chat_manager = AppointmentChat()

@app.websocket("/ws/appointment-chat/{appointment_id}")
async def appointment_chat_websocket(websocket: WebSocket, appointment_id: str, role: str = None):
    """
    HUMAN-ONLY APPOINTMENT CHAT WEBSOCKET
    NO AI - PHYSICALLY IMPOSSIBLE
    ONLY RELAY BETWEEN USER AND THERAPIST
    """
    
    # Validate role
    if not role or role not in ["user", "therapist"]:
        await websocket.close(code=1008, reason="Invalid or missing role parameter")
        return
    
    # Get DB session
    db = next(get_db())
    
    # Check if appointment exists
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        await websocket.close(code=1008, reason="Appointment not found")
        db.close()
        return
    
    await appointment_chat_manager.connect(appointment_id, role, websocket)
    
    # Update appointment status to active
    if appointment.status == "scheduled":
        appointment.status = "active"
        db.commit()
    
    # Send notification when therapist joins
    if role == "therapist":
        create_notification(
            db, "user", appointment.user_name,
            "Therapist Joined",
            "Your therapist has joined the session"
        )
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "system",
            "content": f"Connected as {role}",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        while True:
            data = await websocket.receive_json()
            
            # Check for special commands
            if data.get("type") == "END_SESSION":
                # Therapist is ending the session
                if role == "therapist":
                    # Mark appointment as completed
                    appointment.status = "completed"
                    db.commit()
                    
                    # Broadcast SESSION_ENDED to both parties
                    session_ended_event = {
                        "type": "SESSION_ENDED",
                        "message": "The therapist has ended the session.",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    # Send to therapist
                    await websocket.send_json(session_ended_event)
                    
                    # Send to user
                    await appointment_chat_manager.broadcast_to_appointment(
                        appointment_id,
                        session_ended_event,
                        role
                    )
                continue
            
            content = data.get("content", "")
            
            if not content:
                continue
            
            # SAFETY CHECK: Ignore messages if session is completed
            current_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
            if current_appointment and current_appointment.status == "completed":
                # Session ended - ignore message
                await websocket.send_json({
                    "type": "error",
                    "message": "Cannot send messages - session has ended"
                })
                continue
            
            # Save message to database
            message = Message(
                id=str(uuid.uuid4()),
                appointment_id=appointment_id,
                sender=role,
                content=content,
                timestamp=datetime.utcnow()
            )
            db.add(message)
            db.commit()
            
            # Broadcast to the other party
            message_data = {
                "type": "message",
                "sender": role,
                "content": content,
                "timestamp": message.timestamp.isoformat()
            }
            
            await appointment_chat_manager.broadcast_to_appointment(
                appointment_id, 
                message_data, 
                role
            )
    
    except WebSocketDisconnect:
        appointment_chat_manager.disconnect(appointment_id, role)
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "NeuroSupport-V2 Backend API", "status": "running"}
