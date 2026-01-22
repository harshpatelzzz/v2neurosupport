# 🚀 Complete Setup Guide - New Laptop

**Step-by-step instructions to run NeuroSupport-V2 on a fresh laptop.**

---

## 🐳 Quick Start with Docker (Easiest Method!)

**If you have Docker installed, you can skip all the manual setup!**

### Prerequisites for Docker:
- **Docker Desktop** installed (https://www.docker.com/products/docker-desktop/)
- **Git** installed

### Steps:

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/harshpatelzzz/v2neurosupport.git
   cd v2neurosupport
   ```

2. **Create `.env` file (optional, for Gemini API):**
   ```powershell
   # Create .env in project root
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   ```

3. **Run everything with one command:**
   ```powershell
   docker-compose up
   ```

4. **That's it!** 🎉
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

**To stop:**
```powershell
docker-compose down
```

**To rebuild after code changes:**
```powershell
docker-compose up --build
```

---

## 📋 Manual Setup (If you prefer or don't have Docker)

**Prerequisites:**

### 1. Install Python 3.10+ (Recommended: Python 3.11 or 3.12)

**Windows:**
1. Download from: https://www.python.org/downloads/
2. **IMPORTANT**: Check "Add Python to PATH" during installation
3. Verify installation:
   ```powershell
   python --version
   # Should show: Python 3.11.x or similar
   ```

**Mac/Linux:**
```bash
# Check if Python 3 is installed
python3 --version

# If not installed (Mac):
brew install python3

# If not installed (Linux):
sudo apt-get update
sudo apt-get install python3 python3-pip python3-venv
```

---

### 2. Install Node.js 18+ and npm

**Windows/Mac/Linux:**
1. Download from: https://nodejs.org/
2. Install the LTS version (recommended)
3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

---

### 3. Install Git (if not already installed)

**Windows:**
- Download from: https://git-scm.com/download/win
- Use default settings during installation

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

---

## 📥 Step 1: Clone the Repository

```powershell
# Navigate to where you want the project
cd C:\Users\YourName\Projects

# Clone the repository
git clone https://github.com/harshpatelzzz/v2neurosupport.git

# Navigate into project
cd v2neurosupport
```

---

## 🔧 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```powershell
cd backend
```

### 2.2 Create Virtual Environment

**Windows:**
```powershell
python -m venv venv
```

**Mac/Linux:**
```bash
python3 -m venv venv
```

### 2.3 Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

**You should see `(venv)` in your terminal prompt.**

### 2.4 Install Python Dependencies

```powershell
pip install -r requirements.txt
```

**This installs:**
- FastAPI
- Uvicorn
- SQLAlchemy
- WebSockets
- Google Generative AI (Gemini)
- python-dotenv

### 2.5 Create .env File for API Key (Optional but Recommended)

**Create file:** `backend\.env`

```env
# Google Gemini API Key (Optional)
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_api_key_here
```

**To get API key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
5. Replace `your_api_key_here` in `.env` file

**Note:** The chatbot works without API key (uses fallback), but Gemini provides better responses.

---

## 🎨 Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

```powershell
# From project root
cd frontend
```

### 3.2 Install Node Dependencies

```powershell
npm install
```

**This installs:**
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- All frontend dependencies

**Wait for installation to complete (may take 2-5 minutes).**

---

## 🗄️ Step 4: Database Setup

**The database is automatically created on first run!**

No manual setup needed. SQLite database file will be created at:
```
backend/neurosupport.db
```

---

## 🚀 Step 5: Run the Project

### Option A: Run Both Servers Manually (Recommended for First Time)

**Terminal 1 - Backend:**
```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
venv\Scripts\activate.bat      # Windows CMD
# OR
source venv/bin/activate       # Mac/Linux

# Start backend server
python -m uvicorn main:app --reload --port 8000
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
[SUCCESS] Gemini AI configured and ready to use!  (if API key is set)
```

**Terminal 2 - Frontend:**
```powershell
# Navigate to frontend
cd frontend

# Start frontend server
npm run dev
```

**You should see:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
✓ Ready in 2.9s
```

---

### Option B: Use Batch Scripts (Windows Only)

**From project root:**

```powershell
# Start backend
.\start-backend.bat

# In another terminal, start frontend
.\start-frontend.bat
```

---

## ✅ Step 6: Verify Everything Works

### 6.1 Check Backend

Open browser: http://localhost:8000/appointments

**Expected:** JSON response (may be empty array `[]`)

### 6.2 Check Frontend

Open browser: http://localhost:3000

**Expected:** Home page with 3 cards:
- Chatbot Support
- Book Appointment  
- My Appointments

### 6.3 Test AI Chatbot

1. Click "Chatbot Support"
2. Enter your name
3. Send message: "Hello"
4. **Expected:** AI responds (Gemini if API key set, or fallback)

### 6.4 Test Appointment Booking

1. In chatbot, type: **"I need a therapist"**
2. **Expected:** 
   - Green banner appears
   - Appointment created
   - "View My Appointments" button

---

## 🐛 Troubleshooting

### Issue: Python not found

**Solution:**
```powershell
# Check if Python is installed
python --version

# If not found, reinstall Python and check "Add to PATH"
```

---

### Issue: `pip` not found

**Solution:**
```powershell
# Use python -m pip instead
python -m pip install -r requirements.txt
```

---

### Issue: Virtual environment activation fails

**Windows PowerShell:**
```powershell
# If you get "execution policy" error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Issue: Port 8000 or 3000 already in use

**Solution:**
```powershell
# Windows - Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different ports:
# Backend: python -m uvicorn main:app --reload --port 8001
# Frontend: npm run dev -- -p 3001
```

---

### Issue: npm install fails

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -r node_modules package-lock.json

# Reinstall
npm install
```

---

### Issue: Backend shows "GEMINI_API_KEY not found"

**Solution:**
- This is **normal** if you haven't added API key
- Chatbot still works with fallback responses
- To enable Gemini: Add API key to `backend\.env`

---

### Issue: Database errors

**Solution:**
```powershell
# Delete database file (will be recreated)
cd backend
rm neurosupport.db  # Mac/Linux
del neurosupport.db  # Windows

# Restart backend
python -m uvicorn main:app --reload --port 8000
```

---

## 📁 Project Structure

```
v2neurosupport/
├── backend/
│   ├── venv/              # Virtual environment (created)
│   ├── .env               # API keys (create this)
│   ├── neurosupport.db    # Database (auto-created)
│   ├── main.py            # FastAPI backend
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── database.py        # Database connection
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── node_modules/      # Node packages (created)
│   ├── src/
│   │   └── app/           # Next.js pages
│   └── package.json       # Node dependencies
│
└── README.md
```

---

## 🎯 Quick Start Checklist

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` file created (optional, for Gemini API)
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Tested chatbot
- [ ] Tested appointment booking

---

## 🔗 Important URLs

| Service | URL | Purpose |
|--------|-----|---------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000 | REST API |
| Backend Docs | http://localhost:8000/docs | API documentation |
| Chatbot | http://localhost:3000/chatbot | AI chatbot |
| Appointments | http://localhost:3000/appointments | User appointments |
| Therapist | http://localhost:3000/therapist | Therapist dashboard |

---

## 💡 Pro Tips

1. **Keep both terminals open** - Backend and Frontend need to run simultaneously
2. **Check terminal logs** - Errors appear in the terminal where server is running
3. **Auto-reload enabled** - Changes to code automatically restart servers
4. **Database is SQLite** - No separate database server needed
5. **Gemini API is optional** - Everything works without it (just better with it)

---

## 📞 Need Help?

**Common Commands:**

```powershell
# Check Python version
python --version

# Check Node version
node --version

# Check if backend is running
curl http://localhost:8000/appointments

# Check if frontend is running
curl http://localhost:3000

# View backend logs
# (Check the terminal where backend is running)

# View frontend logs
# (Check the terminal where frontend is running)
```

---

## ✅ You're All Set!

Once both servers are running:

1. **Open:** http://localhost:3000
2. **Test chatbot:** Click "Chatbot Support"
3. **Test booking:** Type "I need a therapist"
4. **Enjoy!** 🎉

---

**Happy coding!** 🚀
