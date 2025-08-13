@echo off
echo ========================================
echo    Quick Vercel Deployment
echo ========================================
echo.

echo 🚀 Deploying your chatbot to Vercel...
echo.

echo 📋 Step 1: Building the client...
cd client
call npm run build
if errorlevel 1 (
    echo ❌ Build failed! Please check for errors above.
    pause
    exit /b 1
)
cd ..
echo ✅ Client built successfully!

echo.
echo 📋 Step 2: Deploying to Vercel...
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
echo 🎯 Next Steps:
echo 1. Set environment variables in Vercel dashboard:
echo    - OPENAI_API_KEY (optional for demo)
echo    - ALLOWED_ORIGINS=https://your-app-name.vercel.app
echo.
echo 2. Test your chatbot:
echo    - Visit your Vercel URL
echo    - Open the chatbot
echo    - Send a message - it should respond!
echo.
echo 3. If it doesn't work, check:
echo    - Browser console for errors
echo    - Vercel function logs: vercel logs
echo.
echo 🎉 Your chatbot should now work on Vercel!
echo.
pause
