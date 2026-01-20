# Frontend - NeuroSupport-V2

Next.js 14 frontend with App Router, TypeScript, and Tailwind CSS.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open browser:
```
http://localhost:3000
```

## Build for Production

```bash
npm run build
npm start
```

## Page Routes

### User Pages
- `/` - Home page with 3 cards
- `/chatbot` - AI chatbot interface
- `/book-appointment` - Manual appointment booking form
- `/appointments` - List of user's appointments
- `/appointments/[id]` - User appointment chat (HUMAN ONLY)

### Therapist Pages
- `/therapist` - Therapist dashboard
- `/therapist/appointments` - List of all appointments
- `/therapist/appointments/[id]` - Therapist appointment chat (HUMAN ONLY)

## Key Features

### Complete Isolation
- AI chatbot and appointment chat are **completely separate**
- No shared components between them
- Different WebSocket connections
- Different page routes

### WebSocket Connections

**AI Chatbot:**
```typescript
const ws = new WebSocket(`ws://localhost:8000/ws/ai-chat/${sessionId}`)
```

**Appointment Chat (User):**
```typescript
const ws = new WebSocket(
  `ws://localhost:8000/ws/appointment-chat/${appointmentId}?role=user`
)
```

**Appointment Chat (Therapist):**
```typescript
const ws = new WebSocket(
  `ws://localhost:8000/ws/appointment-chat/${appointmentId}?role=therapist`
)
```

## Styling

- Tailwind CSS for all styling
- Gradient backgrounds for different sections
- Card-based UI components
- Responsive design for mobile and desktop

## Environment Variables

No environment variables needed for local development. Backend is assumed to be running on `http://localhost:8000`.

For production, update API URLs in the code.
