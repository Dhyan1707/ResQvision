@echo off
title AI Fire Evacuation Simulator - Health Check Diagnostics
echo ==========================================================
echo Running Health Diagnostics across modules
echo ==========================================================

echo [Node Environment]
node -v
npm -v

echo.
echo [Python Environment]
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python --version
) else (
    echo Python not found on PATH. Backend will use internal analytical ML fallback.
)

echo.
echo [Backend Module Check]
cd /d "%~dp0\..\backend"
if exist "node_modules\" (
    echo [OK] Backend node_modules present.
    echo Running Backend Test Suite...
    call npm test
) else (
    echo [WARNING] Backend node_modules missing.
)

echo.
echo [Desktop Module Check]
cd /d "%~dp0\..\desktop-app"
if exist "node_modules\" (
    echo [OK] Desktop-app node_modules present.
) else (
    echo [WARNING] Desktop-app node_modules missing.
)

echo.
echo [AI Pipeline Check]
cd /d "%~dp0\..\ai_pipeline"
if exist "ml\model\hazard_rf_model.pkl" (
    echo [OK] Trained Hazard Random Forest model present.
) else (
    echo [WARNING] Trained model not found in ml\model.
)

echo ==========================================================
echo Health Check Completed.
echo ==========================================================
pause

