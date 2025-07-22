@echo off
REM Insert Dummy Data Script for Windows
REM This script inserts dummy data into the PostgreSQL database

echo 🚀 Task Management - Dummy Data Insertion
echo ==========================================

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if the script file exists
if not exist "scripts\insert_dummy_data.js" (
    echo ❌ Dummy data script not found at scripts\insert_dummy_data.js
    echo Please make sure you're running this from the backend directory.
    pause
    exit /b 1
)

REM Run the dummy data insertion script
echo 📦 Installing required dependencies...
call npm install bcrypt pg dotenv

echo.
echo 🎯 Running dummy data insertion...
call node scripts\insert_dummy_data.js

echo.
echo ✅ Script execution completed!
pause
