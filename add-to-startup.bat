@echo off
echo Adding Chatbot Servers to Windows Startup...
echo.

:: Get the current directory
set "SCRIPT_DIR=%~dp0"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

:: Create a shortcut to the permanent startup script
echo Creating startup shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP_FOLDER%\ChatbotServers.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%start-servers-permanent.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Save()"

echo.
echo Success! The chatbot servers will now start automatically when you log in.
echo.
echo To remove from startup:
echo 1. Press Win+R, type "shell:startup" and press Enter
echo 2. Delete the "ChatbotServers.lnk" file
echo.
pause
