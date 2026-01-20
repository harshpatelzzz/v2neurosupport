# Testing New Features - Quick Guide

## ✅ Both Servers Running

- **Backend**: http://localhost:8000 ✅
- **Frontend**: http://localhost:3002 ✅

---

## 🔔 Test 1: Notifications

### Scenario A: User Books Appointment

1. Go to: http://localhost:3002
2. Click **"Book Appointment"**
3. Enter name: "TestUser"
4. Click **"Book Appointment"**
5. Go to: http://localhost:3002/appointments
6. **Look for 🔔 bell icon in top-right**
7. Click the bell icon
8. ✅ You should see: "Appointment Scheduled" notification

### Scenario B: AI Creates Appointment

1. Go to: http://localhost:3002/chatbot
2. Enter name: "Alice"
3. Type: **"I need a therapist"**
4. AI will create appointment
5. Click **"End Chat & Go to Appointments"**
6. **Click the 🔔 bell icon**
7. ✅ You should see: "Appointment Created" notification

### Scenario C: Therapist Gets Notifications

1. Go to: http://localhost:3002/therapist/appointments
2. **Click the 🔔 bell icon**
3. ✅ You should see notifications for new appointments

### Scenario D: Therapist Joins Notification

1. **User Side**: Open appointment chat (http://localhost:3002/appointments/{id})
2. **Therapist Side**: Open same appointment in new incognito window
   - Go to: http://localhost:3002/therapist/appointments/{id}
3. **User Side**: Click 🔔 bell icon
4. ✅ You should see: "Therapist Joined - Your therapist has joined the session"

---

## 📝 Test 2: Therapist Session Notes

### Test A: Write and Save Notes

1. Open: http://localhost:3002/therapist/appointments
2. Click on any appointment
3. **Look at the right panel** (amber/yellow background)
4. You should see: "📝 Session Notes" header
5. Type some notes in the textarea:
   ```
   Patient appears calm and engaged.
   Discussed coping strategies.
   Good progress noted.
   ```
6. Click **"Save Notes"**
7. ✅ You should see: "Last saved: [timestamp]"

### Test B: Notes Persist

1. After saving notes (Test A)
2. Navigate away (go back to appointments list)
3. Return to the same appointment
4. ✅ Your notes should still be there

### Test C: User Cannot See Notes

1. **User Side**: Open the same appointment
   - Go to: http://localhost:3002/appointments/{id}
2. ✅ You should see:
   - Chat interface ONLY
   - NO notes panel
   - NO notes visible anywhere

---

## 🎯 Acceptance Checklist

| Test | Expected Result | Status |
|------|----------------|--------|
| Bell icon appears on user appointments page | 🔔 visible | ⬜ |
| Bell icon appears on therapist appointments page | 🔔 visible | ⬜ |
| User books appointment → gets notification | Notification appears | ⬜ |
| Therapist gets notification for new appointment | Notification appears | ⬜ |
| Therapist joins → user gets notified | "Therapist Joined" notification | ⬜ |
| Click unread notification → marks as read | Blue background disappears | ⬜ |
| Unread count badge shows correct number | Red badge with count | ⬜ |
| Therapist can write session notes | Textarea works | ⬜ |
| Notes save successfully | "Last saved" timestamp updates | ⬜ |
| Notes persist after navigation | Notes still there on return | ⬜ |
| User CANNOT see therapist notes | No notes panel for user | ⬜ |
| Chat still works (user & therapist) | Messages send/receive | ⬜ |
| AI chatbot still works | AI responds | ⬜ |

---

## 📸 Visual Confirmation

### Notification Bell (Both Roles)
```
┌──────────────────────────────────────┐
│  My Appointments        🔔 (2)  ← Home │
└──────────────────────────────────────┘
                          ↑
                   Bell with badge
```

### Notification Dropdown
```
┌────────────────────────────────┐
│  Notifications                  │
├────────────────────────────────┤
│ 🟦 Therapist Joined            │
│    Your therapist has joined   │
│    5m ago                  ●    │
├────────────────────────────────┤
│    Appointment Scheduled       │
│    Your appointment has been   │
│    2h ago                       │
└────────────────────────────────┘
```

### Therapist Split-Screen Layout
```
┌─────────────────────────────────────────────┐
│            Therapist Session                │
├───────────────────────┬─────────────────────┤
│                       │ 📝 Session Notes    │
│   💬 Chat Messages    │ ─────────────────── │
│                       │                     │
│   Patient: Hello      │ [Large Textarea]    │
│                       │                     │
│   You: Hi, how are    │ Patient showed      │
│        you feeling?   │ improvement...      │
│                       │                     │
│                       │ [Save Notes]        │
│ [Type message...]     │ Last saved: 10:30   │
└───────────────────────┴─────────────────────┘
```

---

## 🚨 Troubleshooting

### Notifications Not Appearing?

1. Check backend is running: http://localhost:8000/docs
2. Refresh the page to fetch latest notifications
3. Check browser console for errors (F12)

### Notes Not Saving?

1. Check browser console for API errors
2. Verify backend logs show POST request
3. Try refreshing and re-entering notes

### Bell Icon Not Showing?

1. Clear browser cache
2. Hard refresh (Ctrl+F5)
3. Check if component imported correctly

---

## 🎉 Success Indicators

You'll know everything works when:

✅ Bell icon appears with unread badge
✅ Notifications appear in dropdown
✅ Clicking notification marks it as read
✅ Therapist sees notes panel (amber background)
✅ User DOES NOT see notes panel
✅ Notes save and persist
✅ Chat still works perfectly
✅ AI chatbot unchanged

---

## 🔍 Backend API Testing

### Test Notifications API

```bash
# Get user notifications
curl "http://localhost:8000/notifications?role=user&name=TestUser"

# Get therapist notifications
curl "http://localhost:8000/notifications?role=therapist&name=All%20Therapists"
```

### Test Session Notes API

```bash
# Create/Update notes
curl -X POST "http://localhost:8000/appointments/{appointmentId}/notes" \
  -H "Content-Type: application/json" \
  -d '{"therapist_name":"Dr.Smith","notes":"Test notes here"}'

# Get notes
curl "http://localhost:8000/appointments/{appointmentId}/notes"
```

---

**Happy Testing! 🎊**

Report any issues and we'll fix them immediately.
