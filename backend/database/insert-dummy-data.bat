@echo off
REM Script to insert dummy data into PostgreSQL database
REM This script will insert sample users, teams, activities, and other data for testing

REM Database connection settings
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=task_management
set DB_USER=your_username
set DB_PASSWORD=your_password

echo 🚀 Inserting dummy data into Task Management database...
echo Database: %DB_NAME% on %DB_HOST%:%DB_PORT%
echo.

REM Check if the SQL file exists
if not exist "dummy-data.sql" (
    echo ❌ Error: dummy-data.sql file not found
    echo Please ensure you're running this script from the database directory
    pause
    exit /b 1
)

echo 📝 Executing dummy data insertion...

REM Run the dummy data SQL file using psql
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f dummy-data.sql

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Dummy data inserted successfully!
    echo.
    echo 📊 Summary of inserted data:
    echo • 15 dummy users ^(EMP001 - EMP015^)
    echo • 5 business domains
    echo • 5 teams with members
    echo • 13 sample activities
    echo • Activity assignments and progress tracking
    echo • Sample notifications and remarks
    echo.
    echo 🔑 Login credentials:
    echo • Use any Employee ID from EMP001 to EMP015
    echo • Password: password123
    echo.
    echo 🎯 You can now test the application with realistic data!
) else (
    echo ❌ Error occurred while inserting dummy data
    echo Please check the SQL file and database connection
)

echo.
pause
