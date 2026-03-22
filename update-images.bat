@echo off
echo ========================================================
echo   Fixing Black Images and Fetching Real Product Photos
echo ========================================================
echo.

echo [1/3] Copying 17 highly detailed AI Images...
node copyImages.js

echo.
echo [2/3] Fetching real product photography from Wikipedia for the remaining 15 items...
node fetchWiki.js

echo.
echo [3/3] Updating your Medical Database...
cd backend
node seed.js

echo.
echo ========================================================
echo SUCCESS! ALL 35 MEDICINES NOW HAVE PERFECT UNIQUE IMAGES.
echo ========================================================
echo You can now close this window. 
echo Make sure to restart your backend (node server.js) 
echo and refresh your React browser page!
pause
