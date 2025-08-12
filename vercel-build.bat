@echo off
echo 🚀 Starting Vercel build process...

echo 📦 Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    exit /b 1
)

cd client
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    exit /b 1
)
cd ..

echo 🏗️ Building client application...
call npm run build:client
if %errorlevel% neq 0 (
    echo ❌ Client build failed
    exit /b 1
)

if exist "client\build" (
    echo ✅ Client build completed successfully
    echo 📁 Build output: client\build\
    dir client\build
) else (
    echo ❌ Build output directory not found
    exit /b 1
)

echo 🎉 Build process completed successfully!
