# End Session Feature Documentation

## 🛑 Feature: Therapist Can End Appointment Session

This feature allows therapists to formally end an appointment session, making the chat read-only for both parties.

---

## 📋 Overview

**Purpose**: Give therapists control to end sessions cleanly, preventing further messages after session completion.

**Status Values**:
- `scheduled` - Appointment created, waiting to start
- `active` - Session in progress
- `completed` - Session ended by therapist

---

## 🔧 Backend Implementation

### REST API Endpoint

```http
POST /appointments/{appointmentId}/end-session
```

**Behavior**:
1. Sets `appointment.status = "completed"`
2. Sends notification to user
3. Returns success response

**Response**:
```json
{
  "status": "success",
  "message": "Session ended successfully",
  "appointment_id": "uuid-here"
}
```

---

### WebSocket Event Handling

**New Event Type**: `SESSION_ENDED`

When therapist clicks "End Session":

1. **Therapist sends** (via WebSocket):
```json
{
  "type": "END_SESSION"
}
```

2. **Server broadcasts** (to both user and therapist):
```json
{
  "type": "SESSION_ENDED",
  "message": "The therapist has ended the session.",
  "timestamp": "2026-01-20T20:30:00"
}
```

3. **Server marks** appointment status as `"completed"`

---

### Safety Mechanism

**Message Blocking After Session End**:

```python
# In WebSocket handler - Before processing any message:
current_appointment = db.query(Appointment).filter(
    Appointment.id == appointment_id
).first()

if current_appointment.status == "completed":
    # IGNORE incoming messages
    await websocket.send_json({
        "type": "error",
        "message": "Cannot send messages - session has ended"
    })
    continue
```

This ensures:
- ✅ No chat after session ends
- ✅ Both parties blocked from sending
- ✅ WebSocket stays open (graceful degradation)
- ✅ Chat history remains visible

---

## 🎨 Frontend Implementation

### Therapist UI Changes

**Location**: `/therapist/appointments/[id]`

**New Button**:
```tsx
{!sessionEnded && isConnected && (
  <button
    onClick={handleEndSession}
    className="bg-red-600 text-white hover:bg-red-700"
  >
    🛑 End Session
  </button>
)}
```

**Button Placement**: Next to session status in header

**Confirmation Dialog**: 
```
"Are you sure you want to end this session? 
This action cannot be undone."
```

**After Ending**:
- ✅ Chat input disabled
- ✅ Shows: "Session has ended - Chat is now read-only"
- ✅ Status changes to "● Session Completed"
- ✅ Notes remain accessible (can still save)
- ✅ Chat history preserved

---

### User UI Changes

**Location**: `/appointments/[id]`

**On Receiving SESSION_ENDED Event**:

1. **System message appears**:
   - "The therapist has ended the session."
   
2. **Input disabled**:
   - Shows: "Session has ended - Chat is now read-only"
   - Additional text: "Your therapist has completed this session"

3. **Status updated**:
   - "● Session Completed" (gray color)

4. **Chat remains visible**:
   - All messages preserved
   - Can scroll and review

---

## 🔔 Notifications

**User receives**:
```
Title: "Session Ended"
Message: "Your therapist has ended the session."
```

**Delivery**: Via existing notification system (bell icon)

---

## 🎯 User Flow

### Happy Path

1. **Therapist and user are chatting**
   - Status: `active`
   - Both can send messages

2. **Therapist clicks "End Session"**
   - Confirmation dialog appears
   - Therapist confirms

3. **Backend processes**:
   - REST API call: `POST /appointments/{id}/end-session`
   - Sets status to `completed`
   - Sends notification to user

4. **WebSocket event sent**:
   - Type: `END_SESSION` → Server
   - Type: `SESSION_ENDED` → Both clients

5. **Both UIs update**:
   - System message: "The therapist has ended the session."
   - Chat inputs disabled
   - Status: "Session Completed"

6. **Chat becomes read-only**:
   - No new messages can be sent
   - History remains viewable
   - Notes still accessible (therapist)

---

## 🔒 Security & Safety

### Prevents Message After End

**Backend check** (in WebSocket loop):
```python
if appointment.status == "completed":
    # IGNORE message - session ended
    return error
```

**Frontend check**:
```typescript
if (sessionEnded) {
    // Don't send - input disabled
    return
}
```

**Double protection**: Both client and server enforce read-only mode

---

### WebSocket Stays Open

**Important**: We DO NOT close the WebSocket immediately.

**Why?**
- Prevents connection errors
- Allows graceful UI updates
- Clients can close when ready
- Chat history remains accessible

---

## 📊 State Changes

```
┌─────────────┐
│  scheduled  │  ← Appointment created
└──────┬──────┘
       │
       │ (Therapist joins)
       ▼
┌─────────────┐
│   active    │  ← Chat in progress
└──────┬──────┘
       │
       │ (Therapist clicks "End Session")
       ▼
┌─────────────┐
│  completed  │  ← Session ended (READ-ONLY)
└─────────────┘
```

**Once `completed`**: Cannot return to `active`

---

## 🧪 Testing Checklist

### Manual Test Steps

1. **Start Session**:
   - [ ] User opens appointment chat
   - [ ] Therapist opens appointment chat
   - [ ] Both can send messages

2. **End Session**:
   - [ ] Therapist clicks "End Session"
   - [ ] Confirmation dialog appears
   - [ ] Therapist confirms

3. **Verify Backend**:
   - [ ] Appointment status = "completed"
   - [ ] User receives notification
   - [ ] WebSocket event broadcast

4. **Verify Therapist UI**:
   - [ ] System message appears
   - [ ] Chat input disabled
   - [ ] Status shows "Session Completed"
   - [ ] Notes still editable
   - [ ] Chat history visible

5. **Verify User UI**:
   - [ ] System message appears
   - [ ] Chat input disabled
   - [ ] Status shows "Session Completed"
   - [ ] Chat history visible
   - [ ] Notification bell shows new notification

6. **Verify Read-Only**:
   - [ ] User cannot send messages
   - [ ] Therapist cannot send messages
   - [ ] No WebSocket errors
   - [ ] No console errors

7. **Verify Persistence**:
   - [ ] Refresh page - still read-only
   - [ ] Close and reopen - still read-only
   - [ ] Appointment list shows "completed" status

---

## 🚫 What NOT to Do

❌ **Do NOT** close WebSocket immediately
❌ **Do NOT** allow messages after `completed`
❌ **Do NOT** hide chat history
❌ **Do NOT** make notes read-only (therapist needs access)
❌ **Do NOT** reactivate AI in appointment chat

---

## ✅ What WAS Changed

### Backend Files
```
backend/main.py
  - Added POST /appointments/{id}/end-session endpoint
  - Added END_SESSION WebSocket event handling
  - Added status check before message relay
  - Added SESSION_ENDED broadcast logic
```

### Frontend Files
```
frontend/src/app/therapist/appointments/[id]/page.tsx
  - Added sessionEnded state
  - Added handleEndSession function
  - Added "End Session" button
  - Added read-only chat input UI
  - Updated WebSocket message handler

frontend/src/app/appointments/[id]/page.tsx
  - Added sessionEnded state
  - Updated WebSocket message handler
  - Added read-only chat input UI
  - Updated status display
```

---

## ✅ What WAS NOT Changed

- ✅ AI chatbot logic (untouched)
- ✅ Appointment chat WebSocket connection logic
- ✅ Message sending logic (just added checks)
- ✅ Notification system (reused existing)
- ✅ Session notes system (still works)
- ✅ Database models (status already existed)

---

## 🎨 UI Screenshots (Text Representation)

### Therapist View - Active Session
```
┌────────────────────────────────────────────────┐
│ 👨‍⚕️ Therapist Session  [🛑 End Session]  ← Back │
│ ● Connected                                     │
└────────────────────────────────────────────────┘
```

### Therapist View - Ended Session
```
┌────────────────────────────────────────────────┐
│ 👨‍⚕️ Therapist Session              ← Back      │
│ ● Session Completed                            │
└────────────────────────────────────────────────┘
│                                                │
│ [Session has ended - Chat is now read-only]   │
│                                                │
```

### User View - Ended Session
```
┌────────────────────────────────────────────────┐
│ 💬 Appointment Chat                  ← Back    │
│ ● Session Completed                            │
└────────────────────────────────────────────────┘
│                                                │
│ [Session has ended - Chat is now read-only]   │
│ [Your therapist has completed this session]   │
│                                                │
```

---

## 🔄 API Call Flow

```
Therapist UI
    │
    │ (1) POST /appointments/{id}/end-session
    ▼
Backend REST API
    │
    │ (2) Set status = "completed"
    │ (3) Create notification
    ▼
Notification System → User gets notified
    
Therapist UI
    │
    │ (4) Send WebSocket: { type: "END_SESSION" }
    ▼
Backend WebSocket
    │
    │ (5) Broadcast { type: "SESSION_ENDED" }
    │
    ├──────────────┬──────────────┐
    ▼              ▼              ▼
Therapist UI   User UI       (Both receive event)
    │              │
    │              │
    ▼              ▼
Disable chat   Disable chat
```

---

## 📝 Code Examples

### Backend: End Session Endpoint
```python
@app.post("/appointments/{appointment_id}/end-session")
def end_appointment_session(appointment_id: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id
    ).first()
    
    appointment.status = "completed"
    db.commit()
    
    create_notification(
        db, "user", appointment.user_name,
        "Session Ended",
        "Your therapist has ended the session."
    )
    
    return {"status": "success"}
```

### Backend: Message Blocking
```python
# Before processing message:
if current_appointment.status == "completed":
    await websocket.send_json({
        "type": "error",
        "message": "Cannot send messages - session has ended"
    })
    continue
```

### Frontend: End Session Handler
```typescript
const handleEndSession = async () => {
  if (!confirm('End this session?')) return
  
  // REST API call
  await fetch(`/appointments/${id}/end-session`, {
    method: 'POST'
  })
  
  // WebSocket event
  ws.send(JSON.stringify({ type: 'END_SESSION' }))
  
  setSessionEnded(true)
}
```

### Frontend: Receive Session Ended
```typescript
websocket.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  if (data.type === 'SESSION_ENDED') {
    setSessionEnded(true)
    setMessages(prev => [...prev, {
      type: 'system',
      content: data.message
    }])
  }
}
```

---

## 🎯 Success Criteria

✅ **Therapist can end session** with one click
✅ **Both parties receive notification** immediately
✅ **Chat becomes read-only** for both
✅ **Status updates** to "completed"
✅ **Chat history preserved** (can still view)
✅ **Notes remain editable** (therapist only)
✅ **No WebSocket errors** after end
✅ **No message leakage** after end
✅ **User receives notification** in bell icon
✅ **AI does NOT resume** in appointment chat

---

**Feature successfully implemented! 🎉**
