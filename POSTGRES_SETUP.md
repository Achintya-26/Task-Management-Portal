# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for the Task Management Application.

## Prerequisites

### 1. Install PostgreSQL

#### Windows:
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the 'postgres' user
4. Default port is 5432 (keep this unless you have a conflict)

#### macOS:
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

1. Open PostgreSQL command line (psql) or use pgAdmin
2. Connect as the postgres user
3. Create the database:

```sql
CREATE DATABASE task_management;
CREATE USER task_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE task_management TO task_user;
```

## Configuration

### 1. Environment Variables

Update the `.env` file in the backend directory with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=postgres
DB_PASSWORD=your_password_here
```

**Important**: Replace `your_password_here` with your actual PostgreSQL password.

### 2. Initialize Database Schema

Run the database setup script to create all tables and initial data:

```bash
cd backend
npm run setup-db
```

This will:
- Create all necessary tables
- Set up indexes and constraints
- Insert default domains
- Create the default admin user

## Default Admin User

After setup, you can login with:
- **Employee ID**: ADMIN001
- **Password**: password

## Database Schema Overview

### Tables Created:
- `domains` - Business domains for organizing teams
- `users` - User accounts with roles
- `teams` - Team information
- `team_members` - Team membership relationships
- `activities` - Tasks/activities
- `activity_assignments` - User-activity assignments
- `activity_attachments` - File attachments
- `activity_remarks` - Comments and remarks
- `notifications` - System notifications

### Key Features:
- UUID primary keys for better security
- Proper foreign key relationships
- Indexes for performance
- Automatic timestamp updates
- Data validation constraints

## Troubleshooting

### Connection Issues:
1. Ensure PostgreSQL service is running
2. Check firewall settings (port 5432)
3. Verify database name and credentials
4. Check if PostgreSQL is listening on localhost

### Permission Issues:
```sql
-- Grant additional permissions if needed
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO task_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO task_user;
```

### Reset Database:
To start fresh, you can drop and recreate the database:
```sql
DROP DATABASE task_management;
CREATE DATABASE task_management;
```
Then run `npm run setup-db` again.

## Production Considerations

1. **Security**:
   - Change default passwords
   - Use environment variables for credentials
   - Enable SSL connections
   - Restrict database access by IP

2. **Performance**:
   - Configure appropriate connection pool sizes
   - Monitor query performance
   - Set up regular backups

3. **Backup**:
   ```bash
   pg_dump task_management > backup.sql
   ```

4. **Restore**:
   ```bash
   psql task_management < backup.sql
   ```
