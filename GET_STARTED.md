# 🎯 GET STARTED - NeuroSupport-V2

## 🚀 Fastest Way to Start (Windows)

### Option 1: One-Click Start (Recommended)
Simply double-click: **`start-all.bat`**

This will:
- ✅ Open backend terminal (auto-installs dependencies)
- ✅ Open frontend terminal (auto-installs dependencies)
- ✅ Start both services
- ✅ You're ready in ~2 minutes!

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
Double-click: start-backend.bat
```

**Terminal 2 - Frontend:**
```bash
Double-click: start-frontend.bat
```

### Option 3: Command Line

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

Once started:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🎮 Try It Out

### 1. Test AI Chatbot (1 minute)

1. Open: http://localhost:3000
2. Click: **"AI Chatbot Support"**
3. Enter your name: "John"
4. Type: **"I need a therapist"**
5. ✅ AI creates appointment!

### 2. Test Appointment Chat (2 minutes)

**Step 1: User Side**
1. Click: **"End Chat & Go to Appointments"**
2. Click on the newly created appointment
3. You're now in the appointment chat

**Step 2: Therapist Side**
1. Open new incognito/private window
2. Go to: http://localhost:3000/therapist
3. Click: **"View Appointments"**
4. Click on the same appointment

**Step 3: Chat!**
1. Send message from user window
2. ✅ Therapist receives it instantly!
3. Send message from therapist window
4. ✅ User receives it instantly!

### 3. Test Manual Booking (30 seconds)

1. Go to home page
2. Click: **"Book Appointment"**
3. Enter your name
4. Click: **"Book Appointment"**
5. ✅ See it in appointments list!

## 📖 What to Read Next

### Just Want to Use It?
- ✅ You're done! Start exploring.

### Want to Understand the Code?
- Read: `PROJECT_SUMMARY.md` (high-level overview)

### Want to Customize?
- Read: `README.md` (detailed features & APIs)

### Want to Understand the Architecture?
- Read: `ARCHITECTURE.md` (design principles)

### Having Issues?
- Read: `QUICKSTART.md` (troubleshooting guide)

## 🎨 What You Can Do

### As a User:
- ✅ Chat with AI assistant
- ✅ Get AI to book appointments for you
- ✅ Manually book appointments
- ✅ View all your appointments
- ✅ Chat with therapist in real-time

### As a Therapist:
- ✅ View all appointments
- ✅ See which were AI-referred vs manual
- ✅ Join appointment sessions
- ✅ Chat with patients in real-time

## 🔥 Key Features

### 1. Smart AI Chatbot
The AI can:
- Answer mental health questions
- Detect when you need professional help
- **Automatically book appointments**
- Provide confirmation with appointment ID

### 2. Human-Only Appointment Chat
- **NO AI interference**
- Direct user ↔ therapist communication
- Real-time WebSocket messaging
- Messages saved to database
- Clean, professional UI

### 3. Dual View System
- User view (patient perspective)
- Therapist view (professional perspective)
- Same data, different interfaces

## 🏗️ System Architecture

```
┌─────────────┐
│   Browser   │
│  (User UI)  │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐                 ┌──────────────┐
│ AI Chatbot   │                 │ Appointment  │
│  WebSocket   │                 │    Chat      │
│              │                 │  WebSocket   │
│  (AI ONLY)   │                 │ (HUMAN ONLY) │
└──────┬───────┘                 └──────┬───────┘
       │                                 │
       │         ┌─────────────┐         │
       └────────►│   Backend   │◄────────┘
                 │  (FastAPI)  │
                 └──────┬──────┘
                        │
                        ▼
                  ┌──────────┐
                  │ Database │
                  │ (SQLite) │
                  └──────────┘
```

## 🎯 Complete Isolation

The AI and human chat systems are **completely separate**:

| Feature              | AI Chatbot       | Appointment Chat |
|---------------------|------------------|------------------|
| WebSocket Endpoint  | `/ws/ai-chat/`   | `/ws/appointment-chat/` |
| Purpose             | AI Support       | Human Therapy    |
| Participants        | User + AI        | User + Therapist |
| Can AI Join?        | ✅ Yes (AI only) | ❌ NO            |
| Message Storage     | No               | Yes (Database)   |
| Creates Appointments| ✅ Yes           | ❌ No            |

## 🛡️ Security Features

- **Role Validation**: Only "user" and "therapist" roles allowed in appointment chat
- **WebSocket Isolation**: Separate connection managers
- **No AI Access**: AI physically cannot join appointment chats
- **Clean Separation**: No shared code between chat systems

## 📊 Tech Stack

| Layer      | Technology       | Why?                              |
|-----------|------------------|-----------------------------------|
| Backend   | FastAPI          | Modern, fast, WebSocket support   |
| Database  | SQLite           | Simple, no setup required         |
| Frontend  | Next.js 14       | React with App Router, SSR        |
| Styling   | Tailwind CSS     | Beautiful, responsive UI          |
| Real-time | WebSocket        | Low latency, bidirectional        |
| Language  | TypeScript       | Type safety, better DX            |

## 💡 Pro Tips

1. **Test with Two Windows**: Open regular + incognito window to test user/therapist chat
2. **Check Network Tab**: See WebSocket messages in browser DevTools
3. **View API Docs**: http://localhost:8000/docs for interactive API testing
4. **Reset Database**: Delete `backend/neurosupport.db` to start fresh
5. **Auto-Reload**: Both backend and frontend auto-reload on file changes

## 🐛 Quick Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Need 3.10+

# Try python3 instead
python3 --version
```

### Frontend won't start
```bash
# Check Node version
node --version  # Need 18+

# Clear and reinstall
rm -rf node_modules
npm install
```

### WebSocket fails
- ✅ Make sure backend started first
- ✅ Check backend is on port 8000
- ✅ Use `ws://` not `wss://` for local

### Port already in use
```bash
# Backend (8000)
netstat -ano | findstr :8000

# Frontend (3000)
netstat -ano | findstr :3000
```

## 🎓 Learning Path

### Beginner
1. Run the app ✅
2. Test all features
3. Read `PROJECT_SUMMARY.md`

### Intermediate
1. Read `README.md`
2. Explore the code
3. Modify AI responses
4. Customize UI colors

### Advanced
1. Read `ARCHITECTURE.md`
2. Understand isolation mechanisms
3. Add new features
4. Deploy to production

## 🚀 Next Steps

### Immediate:
- [ ] Run the app
- [ ] Test AI chatbot
- [ ] Test appointment chat
- [ ] Verify AI never appears in appointment chat

### Soon:
- [ ] Customize AI responses
- [ ] Change UI colors/styling
- [ ] Add more appointment statuses
- [ ] Add user profiles

### Later:
- [ ] Add authentication
- [ ] Add video calls
- [ ] Deploy to production
- [ ] Add mobile app

## ❓ Need Help?

1. **Setup Issues**: Read `QUICKSTART.md`
2. **Feature Questions**: Read `README.md`
3. **Architecture Questions**: Read `ARCHITECTURE.md`
4. **Code Questions**: Read inline code comments

## ✅ You're Ready!

Everything is set up and ready to go. Just run **`start-all.bat`** and start exploring!

---

**Welcome to NeuroSupport-V2! 🎉**
