@echo off
echo ========================================
echo   Starting NeuroSupport-V2
echo   (Backend + Frontend)
echo ========================================
echo.
echo Opening 2 new terminal windows...
echo.

REM Start backend in new terminal
start "NeuroSupport Backend" cmd /k "cd /d %~dp0 && start-backend.bat"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new terminal
start "NeuroSupport Frontend" cmd /k "cd /d %~dp0 && start-frontend.bat"

echo.
echo Both services starting...
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo.
echo Check the new terminal windows for logs.
echo.
pause
