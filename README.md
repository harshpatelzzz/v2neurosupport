# NeuroSupport-V2

A full-stack mental health support platform with completely isolated AI chatbot and human appointment chat systems.

> **📖 New to this project?** 
> - **🐳 Easiest:** [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Just Docker needed!
> - **📋 Manual:** [SETUP_NEW_LAPTOP.md](./SETUP_NEW_LAPTOP.md) - Complete step-by-step guide

## 🏗️ Architecture Overview

This project features **TWO COMPLETELY SEPARATE CHAT SYSTEMS**:

### 1. AI Chatbot Chat (AI ONLY)
- **Purpose**: Provide immediate AI support to users
- **Features**: 
  - Rule-based AI responses
  - Detects appointment booking requests
  - Creates appointments automatically when user requests
  - NO access to therapist chat
  - NO human involvement

### 2. Appointment Chat (HUMAN ONLY)
- **Purpose**: Enable direct communication between users and therapists
- **Features**:
  - Real-time messaging between user and therapist
  - Message persistence in database
  - NO AI involvement
  - NO emotion detection
  - ONLY human-to-human communication

## 🚀 Tech Stack

### Backend
- **Python 3.10+**
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **WebSockets** - Real-time communication
- **UUID-based IDs**

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Native WebSocket API**

## 📁 Project Structure

```
NeuroSupport-V2/
├── backend/
│   ├── main.py              # FastAPI app with REST APIs + WebSockets
│   ├── models.py            # SQLAlchemy models (Appointment, Message)
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── src/
    │   └── app/
    │       ├── page.tsx                           # Home (3 cards)
    │       ├── chatbot/page.tsx                   # AI Chatbot
    │       ├── book-appointment/page.tsx          # Manual booking
    │       ├── appointments/
    │       │   ├── page.tsx                       # User appointments list
    │       │   └── [id]/page.tsx                  # User appointment chat (HUMAN)
    │       └── therapist/
    │           ├── page.tsx                       # Therapist dashboard
    │           ├── appointments/
    │           │   ├── page.tsx                   # Therapist appointments list
    │           │   └── [id]/page.tsx              # Therapist chat (HUMAN)
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Start the backend server:
```bash
uvicorn main:app --reload --port 8000
```

Backend will run on: `http://localhost:8000`

### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 🎯 Usage Guide

### For Users

1. **Home Page** (`/`)
   - Three options: AI Chatbot, Book Appointment, My Appointments

2. **AI Chatbot** (`/chatbot`)
   - Chat with AI assistant
   - Say phrases like "I need a therapist" or "book appointment"
   - AI automatically creates appointment
   - Click button to view appointments

3. **Book Appointment** (`/book-appointment`)
   - Manually book appointment
   - Enter your name
   - Redirects to appointments list

4. **My Appointments** (`/appointments`)
   - View all your appointments
   - See status and creation source (AI or Manual)
   - Click to join chat

5. **Appointment Chat** (`/appointments/[id]`)
   - **HUMAN-ONLY CHAT**
   - Send messages to therapist
   - Receive therapist responses
   - Real-time communication

### For Therapists

1. **Therapist Dashboard** (`/therapist`)
   - Entry point for therapists
   - View quick stats

2. **Appointments List** (`/therapist/appointments`)
   - See all patient appointments
   - View appointment details
   - Click to join session

3. **Therapist Chat** (`/therapist/appointments/[id]`)
   - **HUMAN-ONLY CHAT**
   - Communicate with patient
   - No AI interference

## 🔌 API Endpoints

### REST APIs

#### Create Appointment
```http
POST /appointments
Content-Type: application/json

{
  "user_name": "John Doe",
  "created_from": "manual"
}
```

#### Get All Appointments
```http
GET /appointments
```

#### Get Single Appointment
```http
GET /appointments/{appointment_id}
```

#### Get Appointment Messages
```http
GET /appointments/{appointment_id}/messages
```

### WebSocket Endpoints

#### AI Chatbot WebSocket
```
ws://localhost:8000/ws/ai-chat/{sessionId}
```

**Message Format (Client → Server):**
```json
{
  "content": "I need a therapist",
  "user_name": "John Doe"
}
```

**Response Format (Server → Client):**
```json
{
  "type": "ai_message",
  "content": "I've booked an appointment for you!",
  "appointment_created": true,
  "appointment_id": "uuid-here",
  "timestamp": "2024-01-20T10:30:00"
}
```

#### Appointment Chat WebSocket
```
ws://localhost:8000/ws/appointment-chat/{appointmentId}?role=user
ws://localhost:8000/ws/appointment-chat/{appointmentId}?role=therapist
```

**Message Format (Client → Server):**
```json
{
  "content": "Hello, how are you?"
}
```

**Response Format (Server → Client):**
```json
{
  "type": "message",
  "sender": "user",
  "content": "Hello, how are you?",
  "timestamp": "2024-01-20T10:30:00"
}
```

## 🗄️ Database Schema

### Appointment Table
| Column          | Type     | Description                    |
|-----------------|----------|--------------------------------|
| id              | String   | UUID primary key               |
| user_name       | String   | User's name                    |
| therapist_name  | String   | Therapist name (nullable)      |
| status          | String   | scheduled/active/completed     |
| created_from    | String   | "ai" or "manual"               |
| created_at      | DateTime | Timestamp                      |

### Message Table
| Column          | Type     | Description                    |
|-----------------|----------|--------------------------------|
| id              | String   | UUID primary key               |
| appointment_id  | String   | Foreign key to Appointment     |
| sender          | String   | "user" or "therapist"          |
| content         | String   | Message text                   |
| timestamp       | DateTime | Timestamp                      |

## ✅ Acceptance Test Checklist

1. ✅ User opens home page → sees 3 cards
2. ✅ User opens chatbot → AI replies
3. ✅ User says "I need a therapist"
4. ✅ AI creates appointment and confirms
5. ✅ User ends chatbot chat
6. ✅ User opens My Appointments
7. ✅ Therapist opens same appointment
8. ✅ User sends message → therapist receives
9. ✅ Therapist replies → user receives
10. ✅ **AI NEVER replies in appointment chat**

## 🔒 System Guarantees

### Isolation Guarantees

1. **Separate WebSocket Managers**
   - `AIChat` class handles ONLY AI chatbot
   - `AppointmentChat` class handles ONLY human chat
   - No shared code between them

2. **No AI in Appointment Chat**
   - Appointment chat files have explicit comments prohibiting AI
   - No AI imports in appointment chat code
   - WebSocket validates role parameter (user/therapist only)
   - AI physically cannot access appointment chat WebSocket

3. **Separate Frontend Components**
   - `/chatbot` uses AI WebSocket
   - `/appointments/[id]` uses appointment WebSocket
   - No shared chat components
   - Different styling and behavior

## 🎨 UI Design

- **Modern Gradient Backgrounds**
- **Card-based Navigation**
- **Responsive Design**
- **Clean Message Bubbles**
- **Color-coded Messages**:
  - User (right, blue)
  - Therapist (left, white)
  - AI (left, white with purple accent)
- **Real-time Status Indicators**

## 🔧 Development Notes

### Adding New AI Responses

Edit `ai_chat_manager.generate_ai_response()` in `backend/main.py`:

```python
def generate_ai_response(self, user_message: str) -> str:
    message_lower = user_message.lower()
    
    # Add your conditions here
    if "your_keyword" in message_lower:
        return "Your AI response"
```

### Adding New Appointment Keywords

Edit `ai_chat_manager.detect_appointment_request()` in `backend/main.py`:

```python
def detect_appointment_request(self, message: str) -> bool:
    keywords = [
        "book appointment",
        "your new keyword",  # Add here
    ]
```

## 📝 License

This project is created for educational purposes.

## 🤝 Support

For issues or questions, please refer to the code documentation.

---

**Built with ❤️ for Mental Health Support**
