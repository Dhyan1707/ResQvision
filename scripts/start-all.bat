@echo off
title AI Fire Evacuation Simulator - Master Launch
echo ==========================================================
echo Starting AI Fire Evacuation Simulator - All Services
echo ==========================================================

echo [1/3] Launching Node.js Backend Server...
start "AI Evacuation - Backend" cmd /k "%~dp0start-backend.bat"

timeout /t 2 /nobreak >nul

echo [2/3] Launching Python AI Engine...
start "AI Evacuation - AI Pipeline" cmd /k "%~dp0start-ai-engine.bat"

timeout /t 2 /nobreak >nul

echo [3/3] Launching Electron Desktop Application...
cd /d "%~dp0\..\desktop-app"
npm start

