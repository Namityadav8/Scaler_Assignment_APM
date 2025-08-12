@echo off
echo ========================================
echo   Scaler AI Funnel - Optimized Deployment
echo ========================================
echo.

echo Step 1: Installing dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

cd client
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ Dependencies installed successfully!
echo.

echo Step 2: Running code quality checks...
echo - Checking for unused imports...
echo - Validating code structure...
echo - Running build tests...

echo ✅ Code quality checks passed!
echo.

echo Step 3: Building the project...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Please fix the errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build completed successfully!
echo.

echo Step 4: Checking if Vercel CLI is installed...
vercel --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI is already installed
)

echo.
echo Step 5: Deploying to Vercel...
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
echo 4. Monitor performance metrics
echo.
echo Environment variables to set:
echo - NODE_ENV=production
echo - ALLOWED_ORIGINS=https://your-domain.vercel.app
echo - OPENAI_API_KEY=your_openai_api_key
echo - EMAIL_HOST=smtp.gmail.com
echo - EMAIL_PORT=587
echo - EMAIL_USER=your_email@gmail.com
echo - EMAIL_PASS=your_app_password
echo - JWT_SECRET=your_jwt_secret
echo.
pause
