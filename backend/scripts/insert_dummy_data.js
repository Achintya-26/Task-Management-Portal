#!/usr/bin/env node

/**
 * Generate Dummy Data with Proper Password Hashing
 * This script generates hashed passwords and inserts dummy data into the database
 */

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'task_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

const SALT_ROUNDS = 10;

async function generateHashedPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function insertDummyData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔐 Generating hashed passwords...');
    const hashedPassword = await generateHashedPassword('password123');
    
    console.log('👥 Inserting dummy users...');
    
    // Insert dummy users
    const users = [
      { empId: 'EMP001', name: 'Alice Johnson', email: 'alice.johnson@company.com' },
      { empId: 'EMP002', name: 'Bob Smith', email: 'bob.smith@company.com' },
      { empId: 'EMP003', name: 'Carol Davis', email: 'carol.davis@company.com' },
      { empId: 'EMP004', name: 'David Wilson', email: 'david.wilson@company.com' },
      { empId: 'EMP005', name: 'Emma Brown', email: 'emma.brown@company.com' },
      { empId: 'EMP006', name: 'Frank Miller', email: 'frank.miller@company.com' },
      { empId: 'EMP007', name: 'Grace Lee', email: 'grace.lee@company.com' },
      { empId: 'EMP008', name: 'Henry Taylor', email: 'henry.taylor@company.com' },
      { empId: 'EMP009', name: 'Ivy Chen', email: 'ivy.chen@company.com' },
      { empId: 'EMP010', name: 'Jack Anderson', email: 'jack.anderson@company.com' },
      { empId: 'EMP011', name: 'Kate Williams', email: 'kate.williams@company.com' },
      { empId: 'EMP012', name: 'Lucas Garcia', email: 'lucas.garcia@company.com' },
      { empId: 'EMP013', name: 'Maya Patel', email: 'maya.patel@company.com' },
      { empId: 'EMP014', name: 'Noah Thompson', email: 'noah.thompson@company.com' },
      { empId: 'EMP015', name: 'Olivia Martinez', email: 'olivia.martinez@company.com' },
      { empId: 'TL001', name: 'Sarah Connor', email: 'sarah.connor@company.com' },
      { empId: 'TL002', name: 'Michael Roberts', email: 'michael.roberts@company.com' },
      { empId: 'TL003', name: 'Jennifer Lopez', email: 'jennifer.lopez@company.com' },
      { empId: 'TL004', name: 'Robert Johnson', email: 'robert.johnson@company.com' },
      { empId: 'MGR001', name: 'James Wilson', email: 'james.wilson@company.com' },
      { empId: 'MGR002', name: 'Lisa Anderson', email: 'lisa.anderson@company.com' }
    ];
    
    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, emp_id, name, email, password, role, is_active) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, 'user', true)
         ON CONFLICT (emp_id) DO NOTHING`,
        [user.empId, user.name, user.email, hashedPassword]
      );
    }
    
    console.log('🏢 Inserting domains...');
    
    // Insert domains
    const domains = [
      { name: 'Engineering', description: 'Software Development and Engineering teams' },
      { name: 'Product Management', description: 'Product strategy and management teams' },
      { name: 'Marketing', description: 'Marketing and brand management teams' },
      { name: 'Sales', description: 'Sales and customer acquisition teams' },
      { name: 'Human Resources', description: 'HR and people operations teams' },
      { name: 'Finance', description: 'Finance and accounting teams' },
      { name: 'Operations', description: 'Operations and infrastructure teams' },
      { name: 'Customer Support', description: 'Customer service and support teams' }
    ];
    
    for (const domain of domains) {
      await client.query(
        `INSERT INTO domains (id, name, description) 
         VALUES (gen_random_uuid(), $1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [domain.name, domain.description]
      );
    }
    
    console.log('👥 Creating teams...');
    
    // Get domain IDs
    const engineeringDomain = await client.query("SELECT id FROM domains WHERE name = 'Engineering'");
    const productDomain = await client.query("SELECT id FROM domains WHERE name = 'Product Management'");
    const operationsDomain = await client.query("SELECT id FROM domains WHERE name = 'Operations'");
    
    // Get user IDs for team leads
    const tl001 = await client.query("SELECT id FROM users WHERE emp_id = 'TL001'");
    const tl002 = await client.query("SELECT id FROM users WHERE emp_id = 'TL002'");
    const tl003 = await client.query("SELECT id FROM users WHERE emp_id = 'TL003'");
    const tl004 = await client.query("SELECT id FROM users WHERE emp_id = 'TL004'");
    
    // Insert teams
    const teams = [
      {
        name: 'Frontend Development Team',
        description: 'React and Angular development team',
        domainId: engineeringDomain.rows[0]?.id,
        createdBy: tl001.rows[0]?.id,
        members: ['TL001', 'EMP001', 'EMP002', 'EMP003', 'EMP004']
      },
      {
        name: 'Backend Development Team',
        description: 'Node.js and Python backend development',
        domainId: engineeringDomain.rows[0]?.id,
        createdBy: tl002.rows[0]?.id,
        members: ['TL002', 'EMP005', 'EMP006', 'EMP007', 'EMP008']
      },
      {
        name: 'Mobile App Team',
        description: 'iOS and Android mobile application development',
        domainId: engineeringDomain.rows[0]?.id,
        createdBy: tl003.rows[0]?.id,
        members: ['TL003', 'EMP009', 'EMP010', 'EMP011']
      },
      {
        name: 'DevOps & Infrastructure',
        description: 'Cloud infrastructure and deployment automation',
        domainId: operationsDomain.rows[0]?.id,
        createdBy: tl004.rows[0]?.id,
        members: ['TL004', 'EMP012', 'EMP013']
      }
    ];
    
    for (const team of teams) {
      if (!team.domainId || !team.createdBy) continue;
      
      // Insert team
      const teamResult = await client.query(
        `INSERT INTO teams (id, name, description, domain_id, created_by) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4) 
         ON CONFLICT (name) DO UPDATE SET 
           description = EXCLUDED.description
         RETURNING id`,
        [team.name, team.description, team.domainId, team.createdBy]
      );
      
      const teamId = teamResult.rows[0].id;
      
      // Add team members
      for (const empId of team.members) {
        const userResult = await client.query("SELECT id FROM users WHERE emp_id = $1", [empId]);
        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          const role = empId.startsWith('TL') ? 'lead' : 'member';
          
          await client.query(
            `INSERT INTO team_members (team_id, user_id, role, joined_at) 
             VALUES ($1, $2, $3, NOW() - INTERVAL '30 days')
             ON CONFLICT (team_id, user_id) DO NOTHING`,
            [teamId, userId, role]
          );
        }
      }
    }
    
    console.log('📋 Creating activities...');
    
    // Get team IDs and create activities
    const frontendTeam = await client.query("SELECT id FROM teams WHERE name = 'Frontend Development Team'");
    const backendTeam = await client.query("SELECT id FROM teams WHERE name = 'Backend Development Team'");
    
    if (frontendTeam.rows.length > 0 && tl001.rows.length > 0) {
      const activities = [
        {
          title: 'Implement User Authentication UI',
          description: 'Create login, register, and password reset components using Angular Material',
          status: 'in-progress',
          priority: 'high',
          teamId: frontendTeam.rows[0].id,
          createdBy: tl001.rows[0].id,
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Responsive Dashboard Design',
          description: 'Design and implement responsive dashboard layout for all screen sizes',
          status: 'pending',
          priority: 'medium',
          teamId: frontendTeam.rows[0].id,
          createdBy: tl001.rows[0].id,
          targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      ];
      
      for (const activity of activities) {
        const activityResult = await client.query(
          `INSERT INTO activities (id, title, description, status, priority, team_id, created_by, target_date) 
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) 
           RETURNING id`,
          [activity.title, activity.description, activity.status, activity.priority, 
           activity.teamId, activity.createdBy, activity.targetDate]
        );
        
        // Assign some team members to activities
        const teamMembers = await client.query(
          "SELECT user_id FROM team_members WHERE team_id = $1 LIMIT 2",
          [activity.teamId]
        );
        
        for (const member of teamMembers.rows) {
          await client.query(
            `INSERT INTO activity_assignments (activity_id, user_id, assigned_at) 
             VALUES ($1, $2, NOW())`,
            [activityResult.rows[0].id, member.user_id]
          );
        }
      }
    }
    
    if (backendTeam.rows.length > 0 && tl002.rows.length > 0) {
      const activities = [
        {
          title: 'API Authentication System',
          description: 'Implement JWT-based authentication with refresh tokens',
          status: 'completed',
          priority: 'high',
          teamId: backendTeam.rows[0].id,
          createdBy: tl002.rows[0].id,
          targetDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Database Migration Scripts',
          description: 'Create migration scripts for user management tables',
          status: 'in-progress',
          priority: 'high',
          teamId: backendTeam.rows[0].id,
          createdBy: tl002.rows[0].id,
          targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      ];
      
      for (const activity of activities) {
        const activityResult = await client.query(
          `INSERT INTO activities (id, title, description, status, priority, team_id, created_by, target_date) 
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) 
           RETURNING id`,
          [activity.title, activity.description, activity.status, activity.priority, 
           activity.teamId, activity.createdBy, activity.targetDate]
        );
        
        // Assign team members to activities
        const teamMembers = await client.query(
          "SELECT user_id FROM team_members WHERE team_id = $1 LIMIT 2",
          [activity.teamId]
        );
        
        for (const member of teamMembers.rows) {
          await client.query(
            `INSERT INTO activity_assignments (activity_id, user_id, assigned_at) 
             VALUES ($1, $2, NOW())`,
            [activityResult.rows[0].id, member.user_id]
          );
        }
      }
    }
    
    console.log('💬 Adding activity remarks...');
    
    // Add some activity remarks
    const activities = await client.query("SELECT id, title FROM activities LIMIT 3");
    for (const activity of activities.rows) {
      const assignedUsers = await client.query(
        "SELECT user_id FROM activity_assignments WHERE activity_id = $1 LIMIT 1",
        [activity.id]
      );
      
      if (assignedUsers.rows.length > 0) {
        await client.query(
          `INSERT INTO activity_remarks (id, activity_id, user_id, text) 
           VALUES (gen_random_uuid(), $1, $2, $3)`,
          [activity.id, assignedUsers.rows[0].user_id, 
           `Progress update on ${activity.title}: Initial implementation completed.`]
        );
      }
    }
    
    console.log('🔔 Creating notifications...');
    
    // Add some notifications
    const allUsers = await client.query("SELECT id FROM users WHERE emp_id LIKE 'EMP%' LIMIT 5");
    for (const user of allUsers.rows) {
      await client.query(
        `INSERT INTO notifications (id, user_id, title, message, type, is_read) 
         VALUES (gen_random_uuid(), $1, 'Welcome!', 'Welcome to the Task Management System', 'system', false)`,
        [user.id]
      );
    }
    
    await client.query('COMMIT');
    
    // Get summary data
    const userCount = await client.query("SELECT COUNT(*) FROM users WHERE emp_id LIKE 'EMP%' OR emp_id LIKE 'TL%' OR emp_id LIKE 'MGR%'");
    const domainCount = await client.query("SELECT COUNT(*) FROM domains WHERE name != 'Administration'");
    const teamCount = await client.query("SELECT COUNT(*) FROM teams");
    const activityCount = await client.query("SELECT COUNT(*) FROM activities");
    const assignmentCount = await client.query("SELECT COUNT(*) FROM activity_assignments");
    
    console.log('\n========================================');
    console.log('✅ DUMMY DATA INSERTION COMPLETED');
    console.log('========================================');
    console.log(`👥 Users created: ${userCount.rows[0].count}`);
    console.log(`🏢 Domains created: ${domainCount.rows[0].count}`);
    console.log(`👨‍💼 Teams created: ${teamCount.rows[0].count}`);
    console.log(`📋 Activities created: ${activityCount.rows[0].count}`);
    console.log(`🔗 Activity assignments: ${assignmentCount.rows[0].count}`);
    console.log('========================================');
    console.log('🎉 You can now test the application with realistic data!');
    console.log('🔐 Login credentials: Use any emp_id with password "password123"');
    console.log('📝 Example users: EMP001, TL001, MGR001');
    console.log('========================================\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inserting dummy data:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 Starting dummy data insertion...\n');
    await insertDummyData();
    console.log('✅ Dummy data insertion completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to insert dummy data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { insertDummyData };
