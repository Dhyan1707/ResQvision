@echo off
title AI Fire Evacuation Simulator - Node.js Backend Server
echo ==========================================================
echo Starting AI Fire Evacuation Simulator - Backend Server
echo ==========================================================
cd /d "%~dp0\..\backend"

if not exist "node_modules\" (
    echo [ERROR] backend node_modules not found.
    echo Please run "npm install" in the backend directory first.
    pause
    exit /b 1
)

echo [INFO] Starting Express.js Backend on port 5000...
npm start
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend crashed or failed to start with code %ERRORLEVEL%.
    pause
)

