@echo off
title ERP Project Starter
chcp 65001 >nul
echo ===========================================
echo   Starting ERP Project (Backend + Frontend)
echo ===========================================

setlocal

rem ---------- Paths ----------
set BASE_DIR=%~dp0
set BACKEND_DIR=%BASE_DIR%erp_project
set FRONTEND_DIR=%BASE_DIR%erp-frontend
set VENV_DIR=%BACKEND_DIR%\venv

rem ---------- Server Settings ----------
set UVICORN_APP=main:app
set BACKEND_PORT=8000
set FRONTEND_PORT=5173

echo Checking virtual environment...
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo Virtual environment not found.
    echo Creating new one...
    cd /d "%BACKEND_DIR%"
    python -m venv venv
)

rem ---------- Install Requirements ----------
if exist "%BACKEND_DIR%\requirements.txt" (
    echo Installing Python dependencies...
    call "%VENV_DIR%\Scripts\activate.bat"
    pip install -r "%BACKEND_DIR%\requirements.txt"
)

rem ---------- Start Backend ----------
echo Starting FastAPI server...
start "Backend" cmd /k ^
"cd /d "%BACKEND_DIR%" && ^
call "%VENV_DIR%\Scripts\activate.bat" && ^
echo Virtual environment activated. Running server... && ^
uvicorn main:app --reload --app-dir "%BACKEND_DIR%" --port %BACKEND_PORT%"


rem ---------- Start Frontend ----------
echo Starting React frontend...
start "Frontend" cmd /k ^
"cd /d "%FRONTEND_DIR%" && ^
npm install && ^
npm run dev -- --port %FRONTEND_PORT%"

rem ---------- Open Browser ----------
timeout /t 2 >nul
start "" http://127.0.0.1:%FRONTEND_PORT%

echo ===========================================
echo ERP Project is running.
echo Backend: http://127.0.0.1:%BACKEND_PORT%
echo Frontend: http://127.0.0.1:%FRONTEND_PORT%
echo ===========================================
pause
endlocal
