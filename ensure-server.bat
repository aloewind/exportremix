@echo off
REM Quick script to ensure server is running before opening browser
echo Checking if dev server is running on port 3000...

node scripts/ensure-server.js

echo.
echo ========================================
echo Server is ready!
echo ========================================
echo.
echo Now you can click the Browser tab in Cursor
echo to open http://localhost:3000
echo.
echo The browser will open positioned to the right.
echo.
pause

