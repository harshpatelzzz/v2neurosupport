@echo off
echo ========================================
echo   Starting NeuroSupport-V2 Frontend
echo ========================================
echo.

cd frontend

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Next.js development server...
echo Frontend will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
call npm run dev
