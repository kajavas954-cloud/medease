@echo off
title MedEase Backend Server (Port 5000)
color 0A
echo =======================================================
echo          Starting MedEase Node.js Backend...
echo =======================================================
cd backend
npm install
npm run dev
pause
