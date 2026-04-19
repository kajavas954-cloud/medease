@echo off
echo ===================================================
echo     MedEase Full-Stack Application Launcher
echo ===================================================

echo [1/2] Launching Backend Server...
start "MedEase Backend" cmd /k "cd backend && echo Installing backend dependencies (if any)... && npm install && echo Seeding database... && node seed.js && echo Starting backend server... && npm run dev"

echo [2/2] Launching React Frontend...
start "MedEase Frontend" cmd /k "npm start"

echo.
echo Both servers are starting up! 
echo The frontend will open in your browser automatically.
