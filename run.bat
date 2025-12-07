@echo off
cd /d "%~dp0"

echo Recipe Book - Baking Recipe Converter
echo =====================================
echo.

if not exist "package.json" (
    echo ERROR: package.json not found
    pause
    exit
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    pause
    exit
)

echo Starting screenshot server...
start cmd /c "node server/screenshot-server.cjs"
echo Screenshot server will save files to: %CD%
echo.

timeout /t 3 /nobreak >nul

echo Starting development server...
echo.
npm run dev
pause