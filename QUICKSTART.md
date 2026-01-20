# 🚀 Quick Start Guide

Get NeuroSupport-V2 running in under 5 minutes!

## Step 1: Start Backend (Terminal 1)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

✅ Backend running at: `http://localhost:8000`

## Step 2: Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

## Step 3: Test the Application

### Test 1: AI Chatbot
1. Open `http://localhost:3000`
2. Click "AI Chatbot Support"
3. Enter your name
4. Type: "I need a therapist"
5. ✅ AI should create an appointment

### Test 2: Appointment Chat
1. Click "End Chat & Go to Appointments"
2. Note the appointment ID
3. Open a new incognito/private window
4. Go to `http://localhost:3000/therapist`
5. Click "View Appointments"
6. Click on the appointment
7. ✅ Send messages between user and therapist windows

### Test 3: Manual Booking
1. Go to home page
2. Click "Book Appointment"
3. Enter your name
4. Click "Book Appointment"
5. ✅ See appointment in list

## Verification Checklist

- [ ] Backend API docs accessible at `http://localhost:8000/docs`
- [ ] Home page shows 3 cards
- [ ] AI chatbot responds to messages
- [ ] AI creates appointment when requested
- [ ] User can view appointments list
- [ ] User can send messages in appointment chat
- [ ] Therapist can view appointments
- [ ] Therapist can send messages in appointment chat
- [ ] Messages appear in real-time
- [ ] AI never appears in appointment chat

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.10+)
- Try: `python3` instead of `python`
- Check if port 8000 is already in use

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is already in use

### WebSocket connection fails
- Make sure backend is running first
- Check browser console for errors
- Verify URL is `ws://localhost:8000` not `wss://`

## Next Steps

- Read `README.md` for detailed documentation
- Read `ARCHITECTURE.md` to understand the design
- Customize AI responses in `backend/main.py`
- Modify UI styling in frontend components

## API Testing

### Create Appointment via API
```bash
curl -X POST http://localhost:8000/appointments \
  -H "Content-Type: application/json" \
  -d '{"user_name": "Test User", "created_from": "manual"}'
```

### Get All Appointments
```bash
curl http://localhost:8000/appointments
```

## Development Tips

- Backend auto-reloads on file changes (--reload flag)
- Frontend auto-reloads on file changes
- Database file is `backend/neurosupport.db`
- Delete database file to reset all data

---

**Happy Coding! 🎉**
