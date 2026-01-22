# Quick Start - Command Only

## Docker Method (Easiest)

```bash
git clone https://github.com/harshpatelzzz/v2neurosupport.git
cd v2neurosupport
docker-compose up
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Manual Method

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Optional: Add Gemini API Key

**Create `.env` in project root:**
```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```
