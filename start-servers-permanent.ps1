# Chatbot Servers Permanent Startup Script
# This script starts both the backend server and React client permanently

Write-Host "Starting Chatbot Servers Permanently..." -ForegroundColor Green
Write-Host ""
Write-Host "This script will start both the backend server and React client" -ForegroundColor Yellow
Write-Host "and keep them running permanently with automatic restart." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Red
Write-Host ""

# Set the project directory
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClientDir = Join-Path $ProjectDir "client"

# Function to start backend server
function Start-BackendServer {
    Write-Host "Starting Backend Server on port 5000..." -ForegroundColor Cyan
    Set-Location $ProjectDir
    Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -WindowStyle Normal -PassThru
    Start-Sleep -Seconds 5
}

# Function to start React client
function Start-ReactClient {
    Write-Host "Starting React Client on port 3000..." -ForegroundColor Cyan
    Set-Location $ClientDir
    Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -WindowStyle Normal -PassThru
    Start-Sleep -Seconds 5
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Start servers initially
Start-BackendServer
Start-ReactClient

Write-Host ""
Write-Host "Both servers are now running:" -ForegroundColor Green
Write-Host "- Backend Server: http://localhost:5000" -ForegroundColor White
Write-Host "- React Client: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "The servers will automatically restart if they crash." -ForegroundColor Yellow
Write-Host "To stop all servers, close the command windows or press Ctrl+C in this window." -ForegroundColor Yellow
Write-Host ""

# Monitor and restart servers if needed
while ($true) {
    Start-Sleep -Seconds 30
    
    # Check backend server
    if (-not (Test-Port -Port 5000)) {
        Write-Host "Backend server stopped, restarting..." -ForegroundColor Red
        Start-BackendServer
    }
    
    # Check React client
    if (-not (Test-Port -Port 3000)) {
        Write-Host "React client stopped, restarting..." -ForegroundColor Red
        Start-ReactClient
    }
    
    Write-Host "Servers are running normally..." -ForegroundColor Green
}
