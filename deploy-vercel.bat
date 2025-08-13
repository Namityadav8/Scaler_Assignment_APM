@echo off
echo ========================================
echo    Vercel Deployment Script
echo ========================================
echo.

echo Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
    if errorlevel 1 (
        echo Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

echo.
echo Preparing for deployment...
echo.

echo 1. Building client...
cd client
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo 2. Deploying to Vercel...
echo.
echo Please follow the prompts:
echo - Link to existing project or create new
echo - Confirm deployment settings
echo.

vercel --prod

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Redeploy: vercel --prod
echo 3. Test your chatbot
echo.
echo For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md
echo.
pause
