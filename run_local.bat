@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

echo.
echo ====================================
echo  Quan Ly Ho So An - Local Startup
echo ====================================
echo.

REM Check for Python virtual environment
if not exist ".venv\Scripts\python.exe" (
    echo ERROR: Python virtual environment not found!
    echo Please create it first with: python -m venv .venv
    pause
    exit /b 1
)

REM Kill any existing processes on ports 8001 and 3000
echo Cleaning up any existing processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8001"') do taskkill /PID %%a /F 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /PID %%a /F 2>nul
timeout /t 1 >nul

REM Start Backend
echo.
echo Starting Backend (Port 8001)...
echo.
start "Backend" cmd /k "cd /d "%~dp0" && .venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload"

REM Wait for backend to be ready
echo Waiting for backend to start...
set /a retries=0
:wait_backend
if %retries% geq 30 (
    echo ERROR: Backend failed to start!
    pause
    exit /b 1
)
.venv\Scripts\python.exe -c "import requests; requests.get('http://127.0.0.1:8001/docs', timeout=2)" >nul 2>&1
if errorlevel 1 (
    timeout /t 1 >nul
    set /a retries+=1
    goto wait_backend
)
echo Backend is running at http://127.0.0.1:8001

REM Start Frontend
echo.
echo Starting Frontend (Port 3000)...
echo.
start "Frontend" cmd /k "cd /d "%~dp0\frontend" && npm run dev"

echo.
echo ====================================
echo  Services Started!
echo ====================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8001
echo Docs:      http://localhost:8001/docs
echo.
echo Press Ctrl+C in the terminal windows to stop services.
echo.

timeout /t 3 >nul
