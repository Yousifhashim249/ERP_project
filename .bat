@echo off
chcp 65001 >nul
title Start Frontend
setlocal

rem ---------- FRONTEND DIRECTORY ----------
set FRONTEND_DIR=C:\Users\Lenovo\OneDrive\Desktop\ERP_project\erp-frontend
set FRONTEND_PORT=5173
rem ---------------------------------------

cd /d "%FRONTEND_DIR%"

rem تشغيل السيرفر مباشرة
echo Running React frontend on port %FRONTEND_PORT%...
npm run dev -- --port %FRONTEND_PORT%

rem فتح المتصفح تلقائيًا
start "" http://127.0.0.1:%FRONTEND_PORT%

endlocal
