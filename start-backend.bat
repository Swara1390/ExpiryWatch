@echo off
title ExpiryWatch Backend
echo ========================================================
echo Starting ExpiryWatch FastAPI Backend Server (Port 8000)
echo ========================================================
cd /d "%~dp0backend"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
) else (
    echo [ERROR] Virtual environment not found in backend\venv!
    echo Please set up venv using: python -m venv venv
    pause
)
pause
