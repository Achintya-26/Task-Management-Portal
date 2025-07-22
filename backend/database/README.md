# Dummy Data for Task Management Application

This directory contains SQL scripts and utilities to populate your Task Management application with realistic test data.

## 📁 Files

- `dummy-data.sql` - Main SQL file containing all dummy data
- `insert-dummy-data.sh` - Linux/Mac script to insert data
- `insert-dummy-data.bat` - Windows script to insert data
- `README.md` - This file

## 🎯 What's Included

### Users (15 employees)
- **Employee IDs**: EMP001 through EMP015
- **Password**: `password123` (for all users)
- **Roles**: All are regular users (not admins)
- **Names**: Realistic names like John Smith, Sarah Johnson, etc.

### Domains (5 business areas)
- Software Development
- Marketing & Sales
- Human Resources
- Operations
- Quality Assurance

### Teams (5 teams with members)
- **Frontend Development Team** (3 members)
- **Backend Development Team** (3 members)
- **Marketing Campaign Team** (2 members)
- **QA Testing Team** (3 members)
- **HR Operations Team** (2 members)

### Activities (13 realistic tasks)
- Various priorities: Low, Medium, High, Urgent
- Different statuses: Pending, In Progress, Completed, On Hold
- Realistic descriptions and target dates
- Proper team and user assignments

### Additional Data
- Activity assignments and progress tracking
- Sample remarks and comments
- Notifications for various events
- Realistic timestamps and relationships

## 🚀 How to Use

### Prerequisites
1. PostgreSQL server running
2. Task Management database created with schema
3. Database connection details

### Option 1: Direct SQL Execution
```sql
-- Connect to your database and run:
\i dummy-data.sql
```

### Option 2: Using Scripts

#### On Windows:
1. Edit `insert-dummy-data.bat` to update database connection settings
2. Run the batch file:
```cmd
insert-dummy-data.bat
```

#### On Linux/Mac:
1. Edit `insert-dummy-data.sh` to update database connection settings
2. Make it executable and run:
```bash
chmod +x insert-dummy-data.sh
./insert-dummy-data.sh
```

### Option 3: Command Line
```bash
psql -h localhost -p 5432 -U your_username -d task_management -f dummy-data.sql
```

## 🔧 Configuration

Before running the scripts, update the database connection settings:

```bash
DB_HOST="localhost"      # Your PostgreSQL host
DB_PORT="5432"          # Your PostgreSQL port
DB_NAME="task_management" # Your database name
DB_USER="your_username"  # Your PostgreSQL username
DB_PASSWORD="your_password" # Your PostgreSQL password
```

## 🧪 Testing the Application

After inserting dummy data, you can:

1. **Login** with any employee ID (EMP001-EMP015) and password `password123`
2. **Explore Teams** - View 5 different teams with real members
3. **Check Activities** - See 13 activities with various statuses
4. **Test Features** - Try creating new activities, adding remarks, etc.
5. **View Notifications** - See sample notifications and alerts

## 📊 Data Overview

| Category | Count | Description |
|----------|-------|-------------|
| Users | 15 | Regular employees with realistic names |
| Domains | 5 | Business domains for team organization |
| Teams | 5 | Teams with 2-3 members each |
| Activities | 13 | Tasks with various priorities and statuses |
| Assignments | 17 | User-activity assignments |
| Remarks | 8 | Progress comments and updates |
| Notifications | 5 | Sample system notifications |

## 🔄 Resetting Data

To reset/reinsert dummy data:
1. Clear existing data (optional):
```sql
-- Be careful - this will delete all data!
TRUNCATE notifications, activity_remarks, activity_assignments, activities, team_members, teams, domains, users CASCADE;
```
2. Re-run the dummy data script

## ⚠️ Important Notes

- **Passwords**: All dummy users have the same password (`password123`)
- **Conflicts**: The script uses `ON CONFLICT DO NOTHING` to avoid duplicates
- **UUIDs**: All IDs are predefined UUIDs for consistency
- **Timestamps**: Uses `NOW()` and relative intervals for realistic dates
- **Safety**: Safe to run multiple times without creating duplicates

## 🎨 Customization

You can modify `dummy-data.sql` to:
- Change user names, employee IDs, or passwords
- Add more teams or domains
- Create different types of activities
- Adjust priorities and statuses
- Add more realistic data for your use case

## 🐛 Troubleshooting

**Connection Error**: Ensure PostgreSQL is running and connection details are correct
**Permission Error**: Make sure your user has INSERT permissions
**Constraint Error**: Ensure the database schema is properly created first
**File Not Found**: Run scripts from the `database` directory

## 📈 Next Steps

After inserting dummy data:
1. Test all application features
2. Verify team member functionality
3. Try creating activities with the new team creation process
4. Test the enhanced team creation with member selection
5. Explore the application with realistic data scenarios
