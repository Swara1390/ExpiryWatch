@echo off
title ExpiryWatch Frontend
echo ========================================================
echo Starting ExpiryWatch Vite Frontend Server (Port 5173)
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
