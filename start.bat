@echo off
echo Starting Scaler AI Funnel...
echo.

echo Installing server dependencies...
npm install

echo.
echo Installing client dependencies...
cd client
npm install
cd ..

echo.
echo Starting backend server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Starting frontend client...
cd client
start "Frontend Client" cmd /k "npm start"
cd ..

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this launcher...
pause > nul
