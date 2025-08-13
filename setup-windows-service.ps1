# Windows Service Setup for Chatbot Servers
# This script creates Windows Services for permanent server operation
# Run this script as Administrator

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit
}

Write-Host "Setting up Windows Services for Chatbot Servers..." -ForegroundColor Green
Write-Host ""

# Set the project directory
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClientDir = Join-Path $ProjectDir "client"

# Create the service executable paths
$BackendServicePath = "powershell.exe"
$BackendServiceArgs = "-ExecutionPolicy Bypass -File `"$ProjectDir\start-backend-service.ps1`""

$ClientServicePath = "powershell.exe"
$ClientServiceArgs = "-ExecutionPolicy Bypass -File `"$ProjectDir\start-client-service.ps1`""

# Create backend service script
$BackendServiceScript = @"
# Backend Service Script
Set-Location '$ProjectDir'
while (`$true) {
    try {
        npm start
    }
    catch {
        Write-Host "Backend service crashed, restarting in 5 seconds..." -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
}
"@

# Create client service script
$ClientServiceScript = @"
# Client Service Script
Set-Location '$ClientDir'
while (`$true) {
    try {
        npm start
    }
    catch {
        Write-Host "Client service crashed, restarting in 5 seconds..." -ForegroundColor Red
        Start-Sleep -Seconds 5
    }
}
"@

# Save service scripts
$BackendServiceScript | Out-File -FilePath "$ProjectDir\start-backend-service.ps1" -Encoding UTF8
$ClientServiceScript | Out-File -FilePath "$ProjectDir\start-client-service.ps1" -Encoding UTF8

Write-Host "Creating Windows Services..." -ForegroundColor Cyan

# Create backend service
try {
    New-Service -Name "ChatbotBackend" -DisplayName "Chatbot Backend Server" -Description "Backend server for the chatbot application" -StartupType Automatic -BinaryPathName "$BackendServicePath $BackendServiceArgs"
    Write-Host "Backend service created successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error creating backend service: $_" -ForegroundColor Red
}

# Create client service
try {
    New-Service -Name "ChatbotClient" -DisplayName "Chatbot React Client" -Description "React client for the chatbot application" -StartupType Automatic -BinaryPathName "$ClientServicePath $ClientServiceArgs"
    Write-Host "Client service created successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error creating client service: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Services created! To start them:" -ForegroundColor Yellow
Write-Host "1. Open Services (services.msc)" -ForegroundColor White
Write-Host "2. Find 'ChatbotBackend' and 'ChatbotClient'" -ForegroundColor White
Write-Host "3. Right-click and select 'Start'" -ForegroundColor White
Write-Host "4. Set them to 'Automatic' startup if desired" -ForegroundColor White
Write-Host ""
Write-Host "To remove services later:" -ForegroundColor Yellow
Write-Host "sc delete ChatbotBackend" -ForegroundColor White
Write-Host "sc delete ChatbotClient" -ForegroundColor White
