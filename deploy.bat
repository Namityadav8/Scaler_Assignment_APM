@echo off
echo ========================================
echo   Scaler AI Funnel - Vercel Deployment
echo ========================================
echo.

echo Step 1: Building the project...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Please fix the errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo.

echo Step 2: Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI is already installed
)

echo.
echo Step 3: Deploying to Vercel...
echo.
echo Please follow the prompts:
echo - Link to existing project or create new
echo - Set project name
echo - Confirm deployment settings
echo.

vercel --prod

echo.
echo ========================================
echo   Deployment completed!
echo ========================================
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Configure custom domain (optional)
echo 3. Test your deployed application
echo.
pause
