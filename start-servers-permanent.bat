@echo off
echo Starting Chatbot Servers Permanently...
echo.
echo This script will start both the backend server and React client
echo and keep them running permanently with automatic restart.
echo.
echo Press Ctrl+C to stop all servers
echo.

:: Set the project directory
set PROJECT_DIR=%~dp0
set CLIENT_DIR=%PROJECT_DIR%client

:: Function to start server
:start_server
echo Starting Backend Server on port 5000...
cd /d "%PROJECT_DIR%"
start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul

:: Function to start client
:start_client
echo Starting React Client on port 3000...
cd /d "%CLIENT_DIR%"
start "React Client" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo Both servers are now running:
echo - Backend Server: http://localhost:5000
echo - React Client: http://localhost:3000
echo.
echo The servers will automatically restart if they crash.
echo To stop all servers, close the command windows or press Ctrl+C in this window.
echo.

:: Keep the script running and monitor servers
:monitor_loop
timeout /t 30 /nobreak >nul

:: Check if servers are still running
netstat -ano | findstr ":5000" >nul
if errorlevel 1 (
    echo Backend server stopped, restarting...
    goto start_server
)

netstat -ano | findstr ":3000" >nul
if errorlevel 1 (
    echo React client stopped, restarting...
    goto start_client
)

goto monitor_loop
