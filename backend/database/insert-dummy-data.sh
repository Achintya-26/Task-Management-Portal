#!/bin/bash

# Script to insert dummy data into PostgreSQL database
# This script will insert sample users, teams, activities, and other data for testing

# Database connection settings
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="task_management"
DB_USER="your_username"
DB_PASSWORD="your_password"

echo "🚀 Inserting dummy data into Task Management database..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo "❌ Error: PostgreSQL is not running or not accessible"
    echo "Please ensure PostgreSQL is running on $DB_HOST:$DB_PORT"
    exit 1
fi

# Run the dummy data SQL file
if [ -f "dummy-data.sql" ]; then
    echo "📝 Executing dummy data insertion..."
    
    # Option 1: Using psql command (you may need to enter password)
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f dummy-data.sql
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Dummy data inserted successfully!"
        echo ""
        echo "📊 Summary of inserted data:"
        echo "• 15 dummy users (EMP001 - EMP015)"
        echo "• 5 business domains"
        echo "• 5 teams with members"
        echo "• 13 sample activities"
        echo "• Activity assignments and progress tracking"
        echo "• Sample notifications and remarks"
        echo ""
        echo "🔑 Login credentials:"
        echo "• Use any Employee ID from EMP001 to EMP015"
        echo "• Password: password123"
        echo ""
        echo "🎯 You can now test the application with realistic data!"
    else
        echo "❌ Error occurred while inserting dummy data"
        echo "Please check the SQL file and database connection"
        exit 1
    fi
else
    echo "❌ Error: dummy-data.sql file not found"
    echo "Please ensure you're running this script from the database directory"
    exit 1
fi
