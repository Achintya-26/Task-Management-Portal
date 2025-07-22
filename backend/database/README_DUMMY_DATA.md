# Dummy Data for Task Management Application

This directory contains scripts and SQL files to populate your PostgreSQL database with realistic dummy data for testing the Task Management Application.

## 📋 What's Included

### Users
- **21 dummy users** with different roles:
  - 15 regular employees (EMP001-EMP015)
  - 4 team leads (TL001-TL004)
  - 2 managers (MGR001-MGR002)

### Domains
- 8 business domains (Engineering, Product Management, Marketing, Sales, HR, Finance, Operations, Customer Support)

### Teams
- 4 teams with realistic names and descriptions
- Teams have proper members assigned
- Team leads are assigned as team leaders

### Activities
- Multiple activities per team
- Different statuses (pending, in_progress, completed, on_hold)
- Various priorities (low, medium, high, urgent)
- Realistic target dates

### Additional Data
- Team member assignments
- Activity assignments to users
- Activity remarks and comments
- User notifications

## 🚀 Quick Start

### Option 1: Using the Node.js Script (Recommended)

**For Windows:**
```bash
# Navigate to the backend directory
cd backend

# Run the batch file
insert_dummy_data.bat
```

**For Linux/Mac:**
```bash
# Navigate to the backend directory
cd backend

# Make the script executable
chmod +x insert_dummy_data.sh

# Run the script
./insert_dummy_data.sh
```

**Manual Node.js execution:**
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install bcrypt pg dotenv

# Run the script
node scripts/insert_dummy_data.js
```

### Option 2: Using SQL File Directly

```bash
# Navigate to the backend directory
cd backend

# Execute the SQL file (requires manual password hashing)
psql -h localhost -U postgres -d task_management -f database/dummy_data.sql
```

⚠️ **Note:** The SQL file contains placeholder password hashes. For security, use the Node.js script which generates proper bcrypt hashes.

## 🔐 Login Credentials

After inserting dummy data, you can log in with any of these credentials:

**Regular Users:**
- Username: `EMP001`, `EMP002`, ... `EMP015`
- Password: `password123`

**Team Leads:**
- Username: `TL001`, `TL002`, `TL003`, `TL004`
- Password: `password123`

**Managers:**
- Username: `MGR001`, `MGR002`
- Password: `password123`

## 📊 Data Overview

| Data Type | Count | Description |
|-----------|--------|-------------|
| Users | 21 | Employees, team leads, and managers |
| Domains | 8 | Business domains for organizing teams |
| Teams | 4 | Development and operational teams |
| Activities | 10+ | Tasks with various statuses and priorities |
| Team Members | 15+ | User-team relationships |
| Activity Assignments | 20+ | User-activity assignments |
| Remarks | 5+ | Activity comments and updates |
| Notifications | 10+ | User notifications |

## 🗂️ Team Structure

### Frontend Development Team
- **Lead:** Sarah Connor (TL001)
- **Members:** Alice Johnson, Bob Smith, Carol Davis, David Wilson
- **Domain:** Engineering

### Backend Development Team
- **Lead:** Michael Roberts (TL002)
- **Members:** Emma Brown, Frank Miller, Grace Lee, Henry Taylor
- **Domain:** Engineering

### Mobile App Team
- **Lead:** Jennifer Lopez (TL003)
- **Members:** Ivy Chen, Jack Anderson, Kate Williams
- **Domain:** Engineering

### DevOps & Infrastructure
- **Lead:** Robert Johnson (TL004)
- **Members:** Lucas Garcia, Maya Patel
- **Domain:** Operations

## 🔄 Resetting Data

To remove dummy data and start fresh:

```sql
-- Connect to your database and run:
DELETE FROM activity_remarks;
DELETE FROM activity_attachments;
DELETE FROM activity_assignments;
DELETE FROM activities;
DELETE FROM team_members;
DELETE FROM teams;
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE emp_id LIKE 'EMP%' OR emp_id LIKE 'TL%' OR emp_id LIKE 'MGR%');
DELETE FROM users WHERE emp_id LIKE 'EMP%' OR emp_id LIKE 'TL%' OR emp_id LIKE 'MGR%';
DELETE FROM domains WHERE name != 'Administration';
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check your `.env` file for correct database credentials
- Verify database name and connection parameters

### Permission Issues
- Make sure your database user has CREATE, INSERT, and SELECT permissions
- Check if the database and tables exist

### Script Execution Issues
- Ensure Node.js is installed (version 14 or higher)
- Make sure you're running the script from the `backend` directory
- Check that all required npm packages are installed

## 📝 Customization

To modify the dummy data:

1. **Edit the Node.js script:** `scripts/insert_dummy_data.js`
2. **Modify user data:** Update the `users` array with different names, empIds, and emails
3. **Change teams:** Update the `teams` array with different team structures
4. **Add more activities:** Extend the activities arrays for each team
5. **Adjust relationships:** Modify team member assignments and activity assignments

## 🤝 Contributing

When adding new dummy data:
1. Keep data realistic and professional
2. Maintain referential integrity
3. Use proper password hashing
4. Add appropriate comments
5. Test the script thoroughly

## 📄 License

This dummy data is part of the Task Management Application and follows the same license terms.
