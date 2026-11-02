@echo off
title AI Fire Evacuation Simulator - Python AI Engine
echo ==========================================================
echo Starting AI Fire Evacuation Simulator - Python AI Engine
echo ==========================================================
cd /d "%~dp0\..\ai_pipeline"

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Python is not detected on PATH.
    echo The backend will automatically use its built-in analytical ML fallback engine.
    pause
    exit /b 0
)

echo [INFO] Starting AI Pipeline server on port 8000...
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python AI Engine stopped with code %ERRORLEVEL%.
    pause
)

