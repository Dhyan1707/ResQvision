@echo off
title AI Fire Evacuation Simulator - Electron Desktop App
echo ==========================================================
echo Starting AI Fire Evacuation Simulator - Desktop App
echo ==========================================================
cd /d "%~dp0\..\desktop-app"

if not exist "node_modules\" (
    echo [ERROR] desktop-app node_modules not found.
    echo Please run "npm install" in the desktop-app directory first.
    pause
    exit /b 1
)

echo [INFO] Starting Electron Application...
npm start
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Desktop app exited with code %ERRORLEVEL%.
    pause
)

