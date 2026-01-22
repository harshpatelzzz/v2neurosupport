# 🐳 Docker Setup Guide

**The easiest way to run NeuroSupport-V2 - No Python, Node.js, or manual configuration needed!**

---

## ✅ Prerequisites

**Only ONE thing needed:**
- **Docker Desktop** - Download from: https://www.docker.com/products/docker-desktop/

**That's it!** No Python, no Node.js, no virtual environments, no npm installs!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Clone Repository

```powershell
git clone https://github.com/harshpatelzzz/v2neurosupport.git
cd v2neurosupport
```

---

### Step 2: (Optional) Add Gemini API Key

**Create `.env` file in project root:**

```env
GEMINI_API_KEY=your_api_key_here
```

**To get API key:**
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy and paste into `.env` file

**Note:** This is optional - chatbot works without it (just better with it).

---

### Step 3: Run Everything

```powershell
docker-compose up
```

**That's it!** 🎉

---

## 📊 What Happens

Docker will:
1. ✅ Build backend container (Python + all dependencies)
2. ✅ Build frontend container (Node.js + all dependencies)
3. ✅ Start both services
4. ✅ Create database automatically
5. ✅ Connect everything together

**You'll see:**
```
backend_1  | INFO:     Uvicorn running on http://0.0.0.0:8000
frontend_1 | ▲ Next.js 14.1.0
frontend_1 | - Local:        http://localhost:3000
```

---

## 🌐 Access Your Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |

---

## 🛑 Stop the Application

**Press `Ctrl+C` in the terminal, or:**

```powershell
docker-compose down
```

---

## 🔄 Common Commands

### Start Services
```powershell
docker-compose up
```

### Start in Background (Detached Mode)
```powershell
docker-compose up -d
```

### Stop Services
```powershell
docker-compose down
```

### Rebuild After Code Changes
```powershell
docker-compose up --build
```

### View Logs
```powershell
docker-compose logs
```

### View Backend Logs Only
```powershell
docker-compose logs backend
```

### View Frontend Logs Only
```powershell
docker-compose logs frontend
```

### Restart a Service
```powershell
docker-compose restart backend
docker-compose restart frontend
```

---

## 🐛 Troubleshooting

### Issue: Docker Desktop not running

**Solution:**
- Open Docker Desktop application
- Wait for it to fully start (whale icon in system tray)
- Try `docker-compose up` again

---

### Issue: Port 8000 or 3000 already in use

**Solution:**
```powershell
# Stop any existing services using those ports
# Or modify docker-compose.yml to use different ports:
# ports:
#   - "8001:8000"  # Backend on 8001
#   - "3001:3000"  # Frontend on 3001
```

---

### Issue: "Cannot connect to Docker daemon"

**Solution:**
- Make sure Docker Desktop is running
- Restart Docker Desktop
- On Linux, you might need: `sudo docker-compose up`

---

### Issue: Build fails

**Solution:**
```powershell
# Clean build (removes old images)
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

### Issue: Changes not reflecting

**Solution:**
```powershell
# Rebuild containers
docker-compose up --build
```

---

### Issue: Database not persisting

**Solution:**
- Database is stored in Docker volume `backend-db`
- It persists between restarts
- To reset: `docker-compose down -v` (removes volumes)

---

## 📁 Project Structure with Docker

```
v2neurosupport/
├── docker-compose.yml      # Docker orchestration
├── Dockerfile.backend      # Backend container config
├── Dockerfile.frontend     # Frontend container config
├── .dockerignore          # Files to exclude from Docker
├── .env                   # Environment variables (create this)
│
├── backend/
│   ├── main.py
│   ├── models.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    └── package.json
```

---

## 🔍 How It Works

### Backend Container
- **Base Image:** `python:3.11-slim`
- **Port:** 8000
- **Volumes:** Code is mounted for live reload
- **Environment:** Loads `.env` file for API keys

### Frontend Container
- **Base Image:** `node:18-alpine`
- **Port:** 3000
- **Volumes:** Code is mounted for live reload
- **Depends on:** Backend (waits for it to start)

### Database
- **Type:** SQLite
- **Location:** Docker volume (persists data)
- **Auto-created:** On first run

---

## 💡 Pro Tips

1. **First run takes time** - Docker downloads images and builds containers (5-10 minutes)
2. **Subsequent runs are fast** - Only rebuilds if code changes
3. **Code changes auto-reload** - Both backend and frontend support hot reload
4. **Database persists** - Data survives container restarts
5. **No local Python/Node needed** - Everything runs in containers

---

## 🆚 Docker vs Manual Setup

| Feature | Docker | Manual |
|---------|--------|--------|
| **Setup Time** | 5 minutes | 30+ minutes |
| **Prerequisites** | Just Docker | Python, Node.js, Git |
| **Dependencies** | Auto-installed | Manual install |
| **Isolation** | Complete | Shared system |
| **Portability** | Works anywhere | OS-specific |
| **Cleanup** | `docker-compose down` | Manual uninstall |

---

## ✅ Quick Checklist

- [ ] Docker Desktop installed
- [ ] Repository cloned
- [ ] `.env` file created (optional)
- [ ] `docker-compose up` executed
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8000

---

## 🎉 You're Done!

**That's literally it!** With Docker, your friend needs to:

1. Install Docker Desktop
2. Clone the repo
3. Run `docker-compose up`

**No Python, no Node.js, no virtual environments, no npm installs!**

---

**Enjoy your containerized application!** 🐳🚀
