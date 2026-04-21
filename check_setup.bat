@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

echo.
echo ====================================
echo  Kiem Tra Cau Hinh Ung Dung
echo ====================================
echo.

REM Check Python
echo [1] Checking Python environment...
if exist ".venv\Scripts\python.exe" (
    echo   ✓ Python virtual environment found
    .venv\Scripts\python.exe --version
) else (
    echo   ✗ Python virtual environment NOT found
    echo   Please run: python -m venv .venv
    goto error
)

REM Check Backend requirements
echo.
echo [2] Checking backend requirements...
if exist "backend\requirements.txt" (
    echo   ✓ Backend requirements.txt found
    REM Check if main packages are installed
    .venv\Scripts\python.exe -c "import fastapi" >nul 2>&1
    if errorlevel 0 (
        echo   ✓ FastAPI is installed
    ) else (
        echo   ✗ FastAPI NOT installed
        echo   Run: pip install -r backend/requirements.txt
    )
) else (
    echo   ✗ Backend requirements.txt NOT found
)

REM Check Frontend
echo.
echo [3] Checking frontend setup...
if exist "frontend\package.json" (
    echo   ✓ Frontend package.json found
    if exist "frontend\node_modules" (
        echo   ✓ node_modules directory exists
    ) else (
        echo   ! node_modules not found
        echo   Run: cd frontend ^&^& npm install
    )
) else (
    echo   ✗ Frontend package.json NOT found
)

REM Check Database
echo.
echo [4] Checking database...
if exist "data\cases.db" (
    echo   ✓ Database file found: data\cases.db
) else (
    echo   ! Database not found (will be created on first run)
)

REM Check .env files
echo.
echo [5] Checking environment variables...
if exist "frontend\.env.local" (
    echo   ✓ Frontend .env.local found
    type frontend\.env.local
) else (
    echo   ! Frontend .env.local not found
)

REM Summary
echo.
echo ====================================
echo  Thong Tin Cau Hinh
echo ====================================
echo.
echo Backend Port:        8001
echo Frontend Port:       3000
echo API Base URL:        http://localhost:8001
echo API Docs:            http://localhost:8001/docs
echo Database:            ./data/cases.db
echo.
echo ====================================
echo  De Chay Ung Dung
echo ====================================
echo.
echo Chay: run_local.bat
echo.
goto end

:error
echo.
echo ✗ Setup incomplete. Please fix the issues above.
echo.
pause
exit /b 1

:end
pause
