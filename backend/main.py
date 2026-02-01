from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Dict, List, Optional
import json
from datetime import datetime
import os
from groq import Groq
from dotenv import load_dotenv

# Load .env from backend directory so GROQ_API_KEY is always found
_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))
load_dotenv()  # also allow project root .env

from database import engine, get_db, Base
from models import Appointment, Message, Notification, SessionNote, User, Therapist
from schemas import (
    AppointmentCreate, AppointmentResponse, MessageResponse,
    NotificationCreate, NotificationResponse,
    SessionNoteCreate, SessionNoteUpdate, SessionNoteResponse,
    UserRegister, TherapistRegister, UserLogin, TherapistLogin,
    Token, UserResponse, TherapistResponse, AnalyticsResponse
)
import uuid
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_therapist
)
from datetime import timedelta

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeuroSupport-V2 Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
def get_system_status():
    """Check if GROQ AI is enabled"""
    api_key = os.getenv("GROQ_API_KEY", "")
    return {
        "groq_enabled": bool(api_key and api_key.strip()),
        "api_key_present": bool(api_key),
        "use_groq": ai_chat_manager.use_groq if 'ai_chat_manager' in globals() else False
    }

@app.on_event("startup")
async def startup_event():
    """Log system status on startup"""
    api_key = os.getenv("GROQ_API_KEY", "")
    if api_key and api_key.strip():
        print("=" * 60)
        print("[STARTUP] GROQ AI: ENABLED")
        print(f"[STARTUP] API Key: {api_key[:20]}...")
        print("=" * 60)
    else:
        print("=" * 60)
        print("[STARTUP] GROQ AI: DISABLED (using fallback)")
        print("=" * 60)

# ====================================================
# AUTHENTICATION ENDPOINTS
# ====================================================

@app.post("/auth/user/register", response_model=UserResponse)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if username already exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        full_name=user_data.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/user/login", response_model=Token)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login as user"""
    user = db.query(User).filter(User.username == credentials.username).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Create access token
    access_token_expires = timedelta(minutes=60 * 24 * 7)  # 7 days
    access_token = create_access_token(
        data={"sub": user.username, "role": "user", "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "user",
        "user_id": user.id,
        "username": user.username
    }

@app.post("/auth/therapist/register", response_model=TherapistResponse)
def register_therapist(therapist_data: TherapistRegister, db: Session = Depends(get_db)):
    """Register a new therapist"""
    # Check if username already exists
    if db.query(Therapist).filter(Therapist.username == therapist_data.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    if db.query(Therapist).filter(Therapist.email == therapist_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new therapist
    hashed_password = get_password_hash(therapist_data.password)
    db_therapist = Therapist(
        username=therapist_data.username,
        email=therapist_data.email,
        password_hash=hashed_password,
        full_name=therapist_data.full_name,
        license_number=therapist_data.license_number
    )
    db.add(db_therapist)
    db.commit()
    db.refresh(db_therapist)
    
    return db_therapist

@app.post("/auth/therapist/login", response_model=Token)
def login_therapist(credentials: TherapistLogin, db: Session = Depends(get_db)):
    """Login as therapist"""
    therapist = db.query(Therapist).filter(Therapist.username == credentials.username).first()
    
    if not therapist or not verify_password(credentials.password, therapist.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # Create access token
    access_token_expires = timedelta(minutes=60 * 24 * 7)  # 7 days
    access_token = create_access_token(
        data={"sub": therapist.username, "role": "therapist", "user_id": therapist.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": "therapist",
        "user_id": therapist.id,
        "username": therapist.username
    }

@app.get("/auth/me", response_model=dict)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": "user"
    }

@app.get("/auth/therapist/me", response_model=dict)
def get_current_therapist_info(current_therapist: Therapist = Depends(get_current_therapist)):
    """Get current therapist information"""
    return {
        "id": current_therapist.id,
        "username": current_therapist.username,
        "email": current_therapist.email,
        "full_name": current_therapist.full_name,
        "license_number": current_therapist.license_number,
        "role": "therapist"
    }

# ====================================================
# REST API ENDPOINTS
# ====================================================

@app.post("/appointments", response_model=AppointmentResponse)
def create_appointment(
    appointment: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new appointment manually (requires user authentication)"""
    db_appointment = Appointment(
        id=str(uuid.uuid4()),
        user_name=current_user.full_name,  # Use authenticated user's name
        therapist_name=appointment.therapist_name,
        status="scheduled",
        created_from=appointment.created_from
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Send notifications
    create_notification(
        db, "user", current_user.full_name,
        "Appointment Scheduled",
        f"Your appointment has been scheduled successfully. ID: {db_appointment.id[:8]}"
    )
    create_notification(
        db, "therapist", "All Therapists",
        "New Appointment",
        f"New appointment from {current_user.full_name}"
    )
    
    return db_appointment

@app.get("/appointments", response_model=List[AppointmentResponse])
def get_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all appointments for the current user"""
    # Filter appointments by user's name
    appointments = db.query(Appointment).filter(
        Appointment.user_name == current_user.full_name
    ).order_by(Appointment.created_at.desc()).all()
    return appointments

@app.get("/appointments/all", response_model=List[AppointmentResponse])
def get_all_appointments(
    current_therapist: Therapist = Depends(get_current_therapist),
    db: Session = Depends(get_db)
):
    """Get all appointments (THERAPIST ONLY)"""
    appointments = db.query(Appointment).order_by(Appointment.created_at.desc()).all()
    return appointments

@app.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get appointment details (user can only see their own appointments)"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Verify user owns this appointment
    if appointment.user_name != current_user.full_name:
        raise HTTPException(status_code=403, detail="Not authorized to view this appointment")
    
    return appointment

@app.get("/appointments/{appointment_id}/messages", response_model=List[MessageResponse])
def get_appointment_messages(appointment_id: str, db: Session = Depends(get_db)):
    """Get messages for an appointment"""
    messages = db.query(Message).filter(Message.appointment_id == appointment_id).order_by(Message.timestamp).all()
    return messages

@app.post("/appointments/{appointment_id}/end-session")
def end_appointment_session(
    appointment_id: str,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: Session = Depends(get_db)
):
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for the current user"""
    notifications = db.query(Notification).filter(
        Notification.recipient_role == "user",
        Notification.recipient_name == current_user.full_name
    ).order_by(Notification.created_at.desc()).all()
    return notifications

@app.get("/notifications/therapist", response_model=List[NotificationResponse])
def get_therapist_notifications(
    current_therapist: Therapist = Depends(get_current_therapist),
    db: Session = Depends(get_db)
):
    """Get notifications for the current therapist"""
    notifications = db.query(Notification).filter(
        Notification.recipient_role == "therapist",
        Notification.recipient_name == "All Therapists"
    ).order_by(Notification.created_at.desc()).all()
    return notifications

@app.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read (user only)"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Verify user owns this notification
    if notification.recipient_name != current_user.full_name:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    notification.is_read = True
    db.commit()
    return {"status": "success", "message": "Notification marked as read"}

@app.post("/notifications/{notification_id}/read/therapist")
def mark_therapist_notification_read(
    notification_id: str,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: Session = Depends(get_db)
):
    """Mark a notification as read (therapist only)"""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Verify therapist notification
    if notification.recipient_role != "therapist":
        raise HTTPException(status_code=403, detail="Not authorized")
    
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
    current_therapist: Therapist = Depends(get_current_therapist),
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
        existing_note.therapist_name = current_therapist.full_name
        existing_note.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_note)
        return existing_note
    else:
        # Create new note
        session_note = SessionNote(
            id=str(uuid.uuid4()),
            appointment_id=appointment_id,
            therapist_name=current_therapist.full_name,
            notes=note.notes
        )
        db.add(session_note)
        db.commit()
        db.refresh(session_note)
        return session_note

@app.get("/appointments/{appointment_id}/notes", response_model=SessionNoteResponse)
def get_session_note(
    appointment_id: str,
    current_therapist: Therapist = Depends(get_current_therapist),
    db: Session = Depends(get_db)
):
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
    current_therapist: Therapist = Depends(get_current_therapist),
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
# ANALYTICS ENDPOINTS (THERAPIST ONLY)
# ====================================================

@app.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    current_therapist: Therapist = Depends(get_current_therapist),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics for therapist"""
    from collections import defaultdict
    from datetime import timedelta
    
    # Get all appointments
    all_appointments = db.query(Appointment).all()
    
    # Basic counts
    total_appointments = len(all_appointments)
    scheduled_appointments = len([a for a in all_appointments if a.status == "scheduled"])
    active_appointments = len([a for a in all_appointments if a.status == "active"])
    completed_appointments = len([a for a in all_appointments if a.status == "completed"])
    
    # Creation source counts
    ai_referred_appointments = len([a for a in all_appointments if a.created_from == "ai"])
    manual_appointments = len([a for a in all_appointments if a.created_from == "manual"])
    
    # Unique patients
    unique_patients = len(set([a.user_name for a in all_appointments]))
    
    # Session notes count
    total_session_notes = db.query(SessionNote).count()
    
    # Appointments by day (last 30 days)
    appointments_by_day = defaultdict(int)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    for appointment in all_appointments:
        if appointment.created_at >= thirty_days_ago:
            day_key = appointment.created_at.strftime("%Y-%m-%d")
            appointments_by_day[day_key] += 1
    
    # Convert to list of dicts
    appointments_by_day_list = [
        {"date": date, "count": count}
        for date, count in sorted(appointments_by_day.items())
    ]
    
    # Recent appointments (last 10)
    recent_appointments = db.query(Appointment).order_by(
        Appointment.created_at.desc()
    ).limit(10).all()
    
    return {
        "total_appointments": total_appointments,
        "scheduled_appointments": scheduled_appointments,
        "active_appointments": active_appointments,
        "completed_appointments": completed_appointments,
        "ai_referred_appointments": ai_referred_appointments,
        "manual_appointments": manual_appointments,
        "total_patients": unique_patients,
        "total_session_notes": total_session_notes,
        "appointments_by_day": appointments_by_day_list,
        "recent_appointments": recent_appointments
    }

# ====================================================
# AI CHATBOT WEBSOCKET (COMPLETELY ISOLATED)
# ====================================================

# System prompt for the health-support chatbot (used with GROQ)
HEALTH_CHATBOT_SYSTEM = """You are NeuroSupport, a warm and knowledgeable mental health support assistant. You talk to people about their wellbeing, emotions, and daily life.

Your role:
- Have real, natural conversations. Ask follow-up questions and show you're listening.
- Offer emotional support and gentle guidance (sleep, stress, mood, anxiety, relationships, habits).
- Suggest healthy coping strategies and small steps they can take.
- If someone wants to speak to a professional, tell them they can say "book appointment" or "I need a therapist" and you'll schedule one.
- You are NOT a doctor or therapist. Never diagnose. For serious or urgent concerns, encourage professional help.

How to respond:
- Be conversational and human. Reply in 2–5 sentences unless they need more.
- Use their name when it fits. Be empathetic and non-judgmental.
- Sometimes ask a short follow-up (e.g. "How long has this been going on?" or "What usually helps you?") to understand and guide better.
- Keep a supportive, calm tone. Never give medical advice or medication suggestions."""


class AIChat:
    """AI Chatbot Manager with GROQ - real conversation about health. NO ACCESS TO APPOINTMENT CHAT."""
    
    GROQ_MODEL = "llama-3.1-8b-instant"
    
    def __init__(self):
        self.active_sessions: Dict[str, WebSocket] = {}
        self.session_states: Dict[str, str] = {}
        self.conversation_history: Dict[str, List] = {}
        
        api_key = (os.getenv("GROQ_API_KEY") or "").strip()
        if api_key:
            try:
                self.client = Groq(api_key=api_key)
                self.use_groq = True
                print(f"[SUCCESS] GROQ AI configured (key length {len(api_key)}) – chatbot will have real conversations.")
            except Exception as e:
                print(f"[ERROR] GROQ init failed: {e}")
                self.client = None
                self.use_groq = False
        else:
            self.client = None
            self.use_groq = False
            print("[WARNING] GROQ_API_KEY not found. Check backend/.env exists and contains GROQ_API_KEY=your_key (no quotes).")
    
    def disconnect(self, session_id: str):
        for d in (self.active_sessions, self.session_states, self.conversation_history):
            if session_id in d:
                del d[session_id]
    
    def detect_appointment_request(self, message: str) -> bool:
        keywords = [
            "book appointment", "schedule appointment", "need a therapist", "see a therapist",
            "talk to therapist", "book session", "schedule session", "need therapist",
            "want therapist", "talk to someone", "need someone to talk", "book a session",
            "make appointment", "i need a therapist", "want to see a therapist"
        ]
        lower = message.lower().strip()
        return any(k in lower for k in keywords)
    
    def create_appointment_from_ai(self, user_name: str, db: Session) -> str:
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
        create_notification(db, "user", user_name, "Appointment Created",
            "Your appointment has been created. A therapist will join soon.")
        create_notification(db, "therapist", "All Therapists", "New AI Appointment",
            f"AI created appointment for {user_name}")
        return appointment.id
    
    def generate_ai_response(self, user_message: str, session_id: str, user_name: str) -> str:
        """Generate response via GROQ (real conversation) or minimal fallback."""
        if self.use_groq and self.client:
            try:
                system_content = HEALTH_CHATBOT_SYSTEM + f"\n\nThe person you're talking to is called {user_name}. Use their name occasionally."
                history = self.conversation_history.get(session_id, [])
                messages: List[dict] = [{"role": "system", "content": system_content}]
                for msg in history[-10:]:
                    role = "user" if msg["role"] == "User" else "assistant"
                    messages.append({"role": role, "content": msg["content"]})
                messages.append({"role": "user", "content": user_message})
                
                completion = self.client.chat.completions.create(
                    messages=messages,
                    model=self.GROQ_MODEL,
                    max_tokens=512,
                    temperature=0.7,
                )
                ai_text = (completion.choices[0].message.content or "").strip()
                if not ai_text:
                    ai_text = "I'm here for you. Could you tell me a bit more about what's on your mind?"
                
                history.append({"role": "User", "content": user_message})
                history.append({"role": "Assistant", "content": ai_text})
                self.conversation_history[session_id] = history
                return ai_text
            except Exception as e:
                import traceback
                print(f"[ERROR] GROQ API failed: {e}")
                traceback.print_exc()
                return (
                    "Sorry, I couldn't reach the AI just now. Please try again in a moment. "
                    "If it keeps happening, check your GROQ API key at https://console.groq.com and the backend terminal for the exact error."
                )
        # Key not loaded or client not created
        return (
            "I'd love to chat with you properly. Add GROQ_API_KEY to backend/.env (see GROQ_SETUP.md) and restart the backend. "
            "Until then, you can say 'book appointment' or 'I need a therapist' and I'll schedule one for you."
        )


ai_chat_manager = AIChat()

@app.websocket("/ws/ai-chat/{session_id}")
async def ai_chatbot_websocket(websocket: WebSocket, session_id: str):
    """
    AI CHATBOT WEBSOCKET - AI ONLY
    NO ACCESS TO APPOINTMENT CHAT
    NO THERAPIST COMMUNICATION
    """
    print(f"[WEBSOCKET] Connection attempt for session {session_id}")
    print(f"[WEBSOCKET] Client: {websocket.client}")
    
    try:
        # Accept WebSocket connection first
        await websocket.accept()
        print(f"[WEBSOCKET] Connection accepted for session {session_id}")
        
        # Now register the session
        ai_chat_manager.active_sessions[session_id] = websocket
        ai_chat_manager.session_states[session_id] = "IDLE"
        ai_chat_manager.conversation_history[session_id] = []
        print(f"[WEBSOCKET] Session {session_id} registered")
        
        # Get DB session
        db = next(get_db())
        
        try:
            # Send welcome message
            await websocket.send_json({
                "type": "ai_message",
                "content": "Hello! I'm your AI mental health support assistant. How can I help you today?",
                "timestamp": datetime.utcnow().isoformat()
            })
            print(f"[WEBSOCKET] Welcome message sent to session {session_id}")
            
            while True:
                data = await websocket.receive_json()
                user_message = data.get("content", "")
                user_name = data.get("user_name", "Anonymous")
                
                print(f"[WEBSOCKET] Received message from {user_name}: {user_message[:50]}...")
                
                # Get current session state
                current_state = ai_chat_manager.session_states.get(session_id, "IDLE")
                
                # Check if user wants to book appointment AND hasn't already booked
                if ai_chat_manager.detect_appointment_request(user_message) and current_state == "IDLE":
                    print(f"[WEBSOCKET] Booking appointment for {user_name}")
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
                    print(f"[WEBSOCKET] Appointment created: {appointment_id}")
                    
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
                print(f"[WEBSOCKET] Generating AI response for session {session_id}")
                ai_response = ai_chat_manager.generate_ai_response(user_message, session_id, user_name)
                await websocket.send_json({
                    "type": "ai_message",
                    "content": ai_response,
                    "timestamp": datetime.utcnow().isoformat()
                })
                print(f"[WEBSOCKET] AI response sent: {ai_response[:50]}...")
        
        except WebSocketDisconnect:
            print(f"[WEBSOCKET] Client disconnected for session {session_id}")
            ai_chat_manager.disconnect(session_id)
        except Exception as e:
            print(f"[WEBSOCKET ERROR] Error in message loop: {e}")
            import traceback
            traceback.print_exc()
        finally:
            db.close()
            ai_chat_manager.disconnect(session_id)
        
    except Exception as e:
        print(f"[WEBSOCKET ERROR] Failed to accept connection: {e}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.close(code=1011, reason=str(e))
        except:
            pass
        return

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
