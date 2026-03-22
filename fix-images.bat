@echo off
echo =========================================
echo       Fixing Medicine AI Images
echo =========================================

echo Copying successfully generated AI Images...
node copyImages.js

echo.
echo Updating Database with all 35 unique medicine image profiles...
cd backend
node seed.js

echo.
echo Success! The images have been fixed and database updated.
echo Please restart your backend server (close the API window and double click start-medease.bat again)
echo Or simply restart your npm start command.
pause
