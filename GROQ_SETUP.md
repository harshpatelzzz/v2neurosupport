# GROQ AI Chatbot Setup

The AI chatbot uses **GROQ** for conversational responses. Get your API key and add it to the backend.

## 1. Get a GROQ API key

1. Go to [Groq Console](https://console.groq.com).
2. Sign up or log in.
3. Create an API key (e.g. under API Keys).

## 2. Configure the backend

1. In the project root, go to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the example env file and add your key:
   ```bash
   copy .env.example .env
   ```
   (On macOS/Linux: `cp .env.example .env`)
3. Edit `backend/.env` and set:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```
4. Restart the backend server.

## 3. Verify

- Open the app and go to **AI Chatbot** (`/chatbot`).
- Send a message. If GROQ is configured, you get full AI replies; otherwise you get short fallback replies.
- Backend logs on startup: `[STARTUP] GROQ AI: ENABLED` when the key is set.

## Model

The bot uses **llama-3.1-8b-instant** by default (fast, good for chat). To use a different model, change `AIChat.GROQ_MODEL` in `backend/main.py` (e.g. `llama-3.3-70b-versatile`).

## Fallback

If `GROQ_API_KEY` is missing or invalid, the chatbot uses built-in rule-based responses so the app still works.
