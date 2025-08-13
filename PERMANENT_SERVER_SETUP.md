# Permanent Server Setup Guide

This guide provides multiple options to run your chatbot servers permanently so they work always.

## Option 1: Simple Batch Script (Recommended for most users)

### Quick Start
1. Double-click `start-servers-permanent.bat`
2. The script will start both servers and keep them running
3. Close the command windows to stop the servers

### Features
- Automatically starts both backend (port 5000) and client (port 3000)
- Monitors servers every 30 seconds and restarts if they crash
- Shows status messages in the console

## Option 2: PowerShell Script (More reliable)

### Quick Start
1. Right-click `start-servers-permanent.ps1`
2. Select "Run with PowerShell"
3. The script will start both servers with better process management

### Features
- Better error handling and process management
- Colored output for better visibility
- More reliable port checking

## Option 3: Windows Services (Most permanent)

### Setup (Run as Administrator)
1. Right-click `setup-windows-service.ps1`
2. Select "Run as Administrator"
3. The script will create two Windows services

### Start Services
1. Press `Win + R`, type `services.msc`, press Enter
2. Find "ChatbotBackend" and "ChatbotClient"
3. Right-click each and select "Start"
4. Set startup type to "Automatic" for auto-start on boot

### Remove Services
```cmd
sc delete ChatbotBackend
sc delete ChatbotClient
```

## Option 4: Windows Startup Folder

### Setup
1. Double-click `add-to-startup.bat`
2. The script will add the servers to Windows startup
3. Servers will start automatically when you log in

### Remove from Startup
1. Press `Win + R`, type `shell:startup`, press Enter
2. Delete the "ChatbotServers.lnk" file

## Manual Commands

If you prefer to run servers manually:

### Backend Server
```cmd
cd C:\Academics\Programming\Scaler-Assignment
npm start
```

### React Client
```cmd
cd C:\Academics\Programming\Scaler-Assignment\client
npm start
```

## Server URLs

Once running, access your application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Troubleshooting

### Port Already in Use
If you get "address already in use" errors:
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Services Not Starting
1. Check Windows Event Viewer for service errors
2. Ensure Node.js and npm are installed
3. Verify all dependencies are installed (`npm install` in both directories)

### Permission Issues
- Run scripts as Administrator if needed
- Check Windows Defender or antivirus settings
- Ensure PowerShell execution policy allows scripts

## Monitoring

### Check Server Status
```cmd
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

### View Logs
- Services: Check Windows Event Viewer
- Manual: Check the command windows for output

## Recommended Setup

For most users, we recommend:
1. **Option 1** (Batch script) for simple permanent operation
2. **Option 4** (Startup folder) for automatic startup on login
3. **Option 3** (Windows Services) for enterprise/production use

## Security Notes

- These scripts run with your user permissions
- Services run with system permissions (use with caution)
- Consider firewall settings for external access
- Keep your Node.js and dependencies updated

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed
3. Check Windows Event Viewer for detailed error messages
4. Ensure ports 3000 and 5000 are not used by other applications
