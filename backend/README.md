# Backend - NeuroSupport-V2

FastAPI backend with separate WebSocket endpoints for AI chatbot and human appointment chat.

## Quick Start

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run server:
```bash
uvicorn main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Database

SQLite database (`neurosupport.db`) is created automatically on first run.

## Testing WebSocket Endpoints

### Test AI Chatbot
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/ai-chat/test-session-123')

ws.onopen = () => {
  ws.send(JSON.stringify({
    content: "I need a therapist",
    user_name: "Test User"
  }))
}

ws.onmessage = (event) => {
  console.log(JSON.parse(event.data))
}
```

### Test Appointment Chat
```javascript
// As user
const ws = new WebSocket('ws://localhost:8000/ws/appointment-chat/appointment-id-here?role=user')

ws.onopen = () => {
  ws.send(JSON.stringify({
    content: "Hello therapist"
  }))
}
```

## File Structure

- `main.py` - FastAPI app, routes, WebSocket handlers
- `models.py` - SQLAlchemy database models
- `schemas.py` - Pydantic validation schemas
- `database.py` - Database configuration
- `neurosupport.db` - SQLite database (auto-generated)
