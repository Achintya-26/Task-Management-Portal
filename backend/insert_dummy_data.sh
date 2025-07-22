#!/bin/bash

# Insert Dummy Data Script
# This script inserts dummy data into the PostgreSQL database

echo "🚀 Task Management - Dummy Data Insertion"
echo "=========================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the script file exists
SCRIPT_PATH="./scripts/insert_dummy_data.js"
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Dummy data script not found at $SCRIPT_PATH"
    echo "Please make sure you're running this from the backend directory."
    exit 1
fi

# Run the dummy data insertion script
echo "📦 Installing required dependencies..."
npm install bcrypt pg dotenv

echo ""
echo "🎯 Running dummy data insertion..."
node "$SCRIPT_PATH"

echo ""
echo "✅ Script execution completed!"
