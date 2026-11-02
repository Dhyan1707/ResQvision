@echo off
title AI Fire Evacuation Simulator - Dependency Installer
echo ==========================================================
echo Installing Dependencies across all modules
echo ==========================================================

echo [1/3] Installing Root Dependencies...
cd /d "%~dp0\.."
call npm install

echo [2/3] Installing Backend Dependencies...
cd /d "%~dp0\..\backend"
call npm install

echo [3/3] Installing Desktop Application Dependencies...
cd /d "%~dp0\..\desktop-app"
call npm install

echo ==========================================================
echo All dependencies installed successfully.
echo ==========================================================
pause

