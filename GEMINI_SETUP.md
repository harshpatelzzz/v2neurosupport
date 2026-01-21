# Google Gemini AI Integration

## 🤖 Overview

The chatbot now uses **Google Gemini AI** for intelligent, context-aware responses while maintaining the existing appointment booking functionality.

---

## 🔑 Get Your Gemini API Key

1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

---

## ⚙️ Setup Instructions

### Step 1: Add API Key to Environment

**Option A: Using .env file (Recommended)**

1. Open `z:\completelynewdbmsproject\.env`
2. Replace `your_api_key_here` with your actual Gemini API key:

```env
GEMINI_API_KEY=AIzaSyD_your_actual_api_key_here
```

**Option B: Using Windows Environment Variable**

```powershell
# PowerShell
$env:GEMINI_API_KEY = "AIzaSyD_your_actual_api_key_here"

# Or set permanently
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaSyD_your_actual_api_key_here', 'User')
```

---

### Step 2: Install Dependencies

```powershell
cd z:\completelynewdbmsproject\backend
.\venv\Scripts\Activate.ps1
pip install google-generativeai==0.3.2
```

---

### Step 3: Load Environment Variables

The backend needs to read the `.env` file. Install `python-dotenv`:

```powershell
pip install python-dotenv
```

Then the backend will automatically load your API key from `.env`.

---

## 🚀 How It Works

### Architecture

```
User Message
    ↓
Intent Detection (Keyword-based)
    ↓
Booking Intent?  ──YES──→  Create Appointment Immediately
    ↓ NO
    ↓
Generate Response with Gemini AI
    ↓
Send Response to User
```

---

### Appointment Booking (Unchanged)

The appointment booking logic remains **exactly the same**:

```python
# These keywords trigger immediate appointment booking
keywords = [
    "book appointment",
    "need a therapist",
    "want therapist",
    "talk to someone",
    # ... etc
]

# When detected:
if detect_appointment_request(message) and state == "IDLE":
    appointment_id = create_appointment_from_ai(user_name, db)
    # Send APPOINTMENT_BOOKED event
```

**This happens BEFORE Gemini is called**, so booking is instant and reliable.

---

### Gemini AI Responses

For **non-booking messages**, Gemini generates intelligent responses:

**Features**:
- ✅ Context-aware (remembers conversation history)
- ✅ Empathetic mental health support
- ✅ Suggests booking appointments when appropriate
- ✅ Keeps responses concise (2-4 sentences)
- ✅ Never claims to be a licensed therapist

**Example Conversation**:

```
User: I've been feeling really stressed lately
AI: I'm sorry to hear you're experiencing stress. It's completely 
    normal to feel overwhelmed sometimes. Would you like to talk 
    about what's been causing this stress, or would you prefer 
    to book an appointment with a licensed therapist?

User: I think I need professional help
AI: [APPOINTMENT BOOKED AUTOMATICALLY]
    "Perfect! I've scheduled an appointment for you..."
```

---

## 🔄 Fallback Mechanism

If **Gemini API is unavailable** (no API key, network error, etc.):

```
✅ Chatbot continues working with rule-based responses
✅ Appointment booking still works perfectly
✅ No crashes or errors
```

You'll see this message in backend logs:
```
⚠️ GEMINI_API_KEY not found. Using fallback responses.
```

---

## 📊 Features Comparison

| Feature | Without API Key | With Gemini API |
|---------|----------------|-----------------|
| Appointment Booking | ✅ Works | ✅ Works |
| Basic Responses | ✅ Rule-based | ✅ AI-powered |
| Context Awareness | ❌ None | ✅ Full history |
| Empathy & Nuance | ⚠️ Limited | ✅ Advanced |
| Custom Advice | ❌ Generic | ✅ Personalized |

---

## 🧪 Testing

### Test 1: Appointment Booking (Should work with or without API key)

1. Go to chatbot
2. Type: **"I need a therapist"**
3. ✅ Appointment created instantly

---

### Test 2: General Conversation (Requires API key)

1. Type: **"I've been feeling anxious about work"**
2. With API key: ✅ Personalized, empathetic response
3. Without API key: ✅ Generic supportive response

---

### Test 3: Context Awareness (Requires API key)

```
User: I have trouble sleeping
AI: [Gemini provides sleep advice]

User: What else can I do?
AI: [Gemini remembers context, provides additional tips]
```

---

## 🛡️ Safety Features

**Appointment Booking**:
- ✅ Keyword-based (doesn't rely on Gemini)
- ✅ State tracking prevents duplicate bookings
- ✅ Works even if Gemini API fails

**Conversation**:
- ✅ System prompt ensures appropriate mental health support
- ✅ AI suggests professional help when needed
- ✅ Never claims to replace licensed therapists

---

## 📝 Configuration

### Conversation History

The bot remembers the **last 3 exchanges** (6 messages) per session:

```python
# Modify in main.py if you want longer memory
history[-6:]  # Change 6 to desired number
```

---

### Response Length

Responses are kept concise (2-4 sentences) via system prompt:

```python
# Modify system_context in main.py to change
"Keep responses concise (2-4 sentences)"
```

---

## 🔍 Debugging

### Check if Gemini is Active

```python
# Backend logs on startup:
✅ "Gemini API configured successfully"
❌ "⚠️ GEMINI_API_KEY not found. Using fallback responses."
```

### Check API Key

```powershell
# PowerShell
echo $env:GEMINI_API_KEY

# Should output: AIzaSyD_your_actual_api_key_here
```

### Test API Key Manually

```python
import google.generativeai as genai
genai.configure(api_key="YOUR_KEY")
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("Hello!")
print(response.text)
```

---

## 💰 Pricing

**Google Gemini API (as of 2024)**:

- **Free tier**: 60 requests per minute
- **Cost**: Free for moderate use
- **Paid tier**: Available for high volume

Check: https://ai.google.dev/pricing

---

## 🎯 Summary

| What Changed | Impact |
|--------------|--------|
| Added Gemini AI | ✅ Better conversations |
| Kept booking logic | ✅ No breaking changes |
| Added fallback | ✅ Always works |
| Added conversation history | ✅ Context awareness |

---

## 🚀 Quick Start

```powershell
# 1. Get API key from https://makersuite.google.com/app/apikey

# 2. Add to .env file
GEMINI_API_KEY=AIzaSyD_your_key_here

# 3. Install dependency
cd backend
pip install google-generativeai python-dotenv

# 4. Restart backend
# Backend will automatically use Gemini!
```

---

**Now your chatbot is powered by Google Gemini AI! 🎉**

Test it at: http://localhost:3000/chatbot
