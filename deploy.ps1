Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Scaler AI Funnel - Vercel Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Building the project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix the errors before deploying." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Checking if Vercel CLI is installed..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "✅ Vercel CLI is already installed" -ForegroundColor Green
} catch {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host ""
Write-Host "Step 3: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please follow the prompts:" -ForegroundColor White
Write-Host "- Link to existing project or create new" -ForegroundColor White
Write-Host "- Set project name" -ForegroundColor White
Write-Host "- Confirm deployment settings" -ForegroundColor White
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Deployment completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Set environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "2. Configure custom domain (optional)" -ForegroundColor White
Write-Host "3. Test your deployed application" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
