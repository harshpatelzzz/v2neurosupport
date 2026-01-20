# NeuroSupport-V2 Architecture

## System Design Principles

This document explains the architectural decisions and design principles that ensure complete isolation between AI chatbot and human appointment chat systems.

## Core Principle: Complete Isolation

The system is built on the principle that **AI and human communication must never intersect**. This is enforced at multiple levels:

### 1. Backend Isolation

#### Separate WebSocket Managers

```python
# AI-only manager - backend/main.py
class AIChat:
    """AI Chatbot Manager - NO ACCESS TO APPOINTMENT CHAT"""
    
    def __init__(self):
        self.active_sessions: Dict[str, WebSocket] = {}
    
    def detect_appointment_request(self, message: str) -> bool:
        # AI logic here
        
    def create_appointment_from_ai(self, user_name: str, db: Session) -> str:
        # Creates appointment in DB
        # Does NOT join appointment chat
```

```python
# Human-only manager - backend/main.py
class AppointmentChat:
    """
    HUMAN-ONLY APPOINTMENT CHAT MANAGER
    NO AI IMPORTS
    NO CHATBOT LOGIC
    ONLY RELAY MESSAGES BETWEEN USER AND THERAPIST
    """
    
    def __init__(self):
        # Store one user and one therapist socket per appointment
        self.connections: Dict[str, Dict[str, WebSocket]] = {}
```

#### Separate WebSocket Routes

1. **AI Chatbot Route**: `/ws/ai-chat/{sessionId}`
   - Accepts any session ID
   - Handles AI responses
   - Can create appointments in DB
   - Cannot access appointment chat connections

2. **Appointment Chat Route**: `/ws/appointment-chat/{appointmentId}?role=user|therapist`
   - Requires appointment ID
   - Requires role parameter (user or therapist)
   - Rejects connection if role is invalid
   - Only relays messages between user and therapist
   - No AI logic whatsoever

### 2. Frontend Isolation

#### Separate Page Components

**AI Chatbot Pages:**
- `/chatbot/page.tsx` - Connects to AI WebSocket only
- Uses session-based ID
- Shows AI responses
- Detects appointment creation

**Appointment Chat Pages:**
- `/appointments/[id]/page.tsx` (User view)
- `/therapist/appointments/[id]/page.tsx` (Therapist view)
- Connect to appointment WebSocket with role parameter
- Show human-only messages
- Explicit comments prohibiting AI code

#### No Shared Components

Each chat system has its own:
- Message state management
- WebSocket connection logic
- UI components
- Styling

This prevents accidental code reuse that could blur the separation.

### 3. Data Flow

#### AI Chatbot Flow

```
User → AI WebSocket → AI Manager
                    ↓
              Generate Response
                    ↓
        Detect Appointment Request?
                    ↓
              Yes → Create Appointment in DB
                    ↓
              Return appointment_id to user
```

**Important**: AI creates appointment record but does NOT join the appointment chat.

#### Appointment Chat Flow

```
User ←→ Appointment WebSocket ←→ Therapist
            ↓
    Save to Message DB
```

**Important**: No AI involvement at any point.

### 4. Database Design

#### Appointment Model

```python
class Appointment:
    id: UUID
    user_name: str
    therapist_name: str | None
    status: "scheduled" | "active" | "completed"
    created_from: "ai" | "manual"  # Tracks origin
    created_at: datetime
```

The `created_from` field tracks whether an appointment was:
- Created by AI chatbot detecting user intent
- Created manually via booking form

This is for informational purposes only - it does NOT affect chat behavior.

#### Message Model

```python
class Message:
    id: UUID
    appointment_id: UUID (FK)
    sender: "user" | "therapist"  # NOT "ai"
    content: str
    timestamp: datetime
```

Messages are **only** between user and therapist. There is no "ai" sender type.

### 5. Security Boundaries

#### WebSocket Role Validation

```python
@app.websocket("/ws/appointment-chat/{appointment_id}")
async def appointment_chat_websocket(websocket: WebSocket, appointment_id: str, role: str = None):
    # Validate role
    if not role or role not in ["user", "therapist"]:
        await websocket.close(code=1008, reason="Invalid or missing role parameter")
        return
```

This ensures:
- AI cannot connect to appointment chat (no "ai" role)
- Invalid roles are rejected immediately
- Only legitimate users and therapists can join

### 6. Frontend Guards

#### Explicit Documentation

Each appointment chat page file starts with:

```typescript
/**
 * HUMAN-ONLY APPOINTMENT CHAT
 * NO AI CODE
 * NO CHATBOT IMPORTS
 * NO EMOTION DETECTION
 * ONLY USER <-> THERAPIST COMMUNICATION
 */
```

This serves as:
- Developer reminder
- Code review checkpoint
- Clear intent documentation

### 7. Testing Isolation

#### Acceptance Test

The acceptance test verifies complete isolation:

1. User chats with AI ✅
2. AI creates appointment ✅
3. User opens appointment chat ✅
4. Therapist joins appointment chat ✅
5. User and therapist exchange messages ✅
6. **AI NEVER appears in appointment chat** ✅

## Why This Architecture?

### 1. Clear Separation of Concerns
- AI provides initial support and triage
- Humans handle actual therapy sessions
- No confusion about who is communicating

### 2. Privacy and Trust
- Users know when they're talking to AI vs. human
- Therapists have direct, unmediated communication with patients
- No AI "listening in" on therapy sessions

### 3. Scalability
- AI can handle unlimited concurrent users
- Appointment chats are 1:1 connections
- Different scaling strategies for each system

### 4. Maintainability
- Changes to AI logic don't affect appointment chat
- Changes to appointment chat don't affect AI
- Easy to understand and debug

### 5. Future Extensions

This architecture allows for:
- Adding more sophisticated AI models
- Implementing group therapy sessions
- Adding video/voice to appointment chats
- Creating AI analysis tools separate from live chats

All without compromising the isolation principle.

## Violation Prevention

### What Would Break Isolation?

❌ AI responding in appointment chat
❌ Shared WebSocket connection
❌ AI "monitoring" appointment chat for insights
❌ Appointment chat routing through AI
❌ Shared message state between systems

### How We Prevent It

✅ Separate WebSocket managers with no shared code
✅ Role-based connection validation
✅ Explicit comments and documentation
✅ Different page components
✅ Database schema enforces human-only messages
✅ Acceptance test verifies isolation

## Conclusion

The architecture ensures that AI and human communication systems are:
- **Physically separate** (different WebSockets)
- **Logically separate** (different code paths)
- **Semantically separate** (different purposes)
- **Verifiably separate** (testable isolation)

This creates a robust, trustworthy system for mental health support.
