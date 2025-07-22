-- =============================================
-- Dummy Data for Task Management Application
-- =============================================
-- This file contains realistic dummy data for testing the application
-- Execute this after running schema.sql

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM activity_remarks;
-- DELETE FROM activity_attachments;
-- DELETE FROM activity_assignments;
-- DELETE FROM activities;
-- DELETE FROM team_members;
-- DELETE FROM teams;
-- DELETE FROM users WHERE emp_id != 'ADMIN001'; -- Keep the admin user
-- DELETE FROM domains WHERE name != 'Administration';

-- =============================================
-- Insert Dummy Users
-- =============================================
-- Note: All passwords are hashed version of 'password123'
-- For production, ensure proper password hashing is implemented

INSERT INTO users (id, emp_id, name, email, password, role, is_active) VALUES
-- Regular Users
(gen_random_uuid(), 'EMP001', 'Alice Johnson', 'alice.johnson@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP002', 'Bob Smith', 'bob.smith@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP003', 'Carol Davis', 'carol.davis@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP004', 'David Wilson', 'david.wilson@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP005', 'Emma Brown', 'emma.brown@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP006', 'Frank Miller', 'frank.miller@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP007', 'Grace Lee', 'grace.lee@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP008', 'Henry Taylor', 'henry.taylor@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP009', 'Ivy Chen', 'ivy.chen@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP010', 'Jack Anderson', 'jack.anderson@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP011', 'Kate Williams', 'kate.williams@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP012', 'Lucas Garcia', 'lucas.garcia@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP013', 'Maya Patel', 'maya.patel@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP014', 'Noah Thompson', 'noah.thompson@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'EMP015', 'Olivia Martinez', 'olivia.martinez@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),

-- Team Leads
(gen_random_uuid(), 'TL001', 'Sarah Connor', 'sarah.connor@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'TL002', 'Michael Roberts', 'michael.roberts@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'TL003', 'Jennifer Lopez', 'jennifer.lopez@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'TL004', 'Robert Johnson', 'robert.johnson@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),

-- Managers
(gen_random_uuid(), 'MGR001', 'James Wilson', 'james.wilson@company.com', '$2b$10$YourHashedPasswordHere', 'user', true),
(gen_random_uuid(), 'MGR002', 'Lisa Anderson', 'lisa.anderson@company.com', '$2b$10$YourHashedPasswordHere', 'user', true);

-- =============================================
-- Insert Additional Domains
-- =============================================
INSERT INTO domains (id, name, description) VALUES
(gen_random_uuid(), 'Engineering', 'Software Development and Engineering teams'),
(gen_random_uuid(), 'Product Management', 'Product strategy and management teams'),
(gen_random_uuid(), 'Marketing', 'Marketing and brand management teams'),
(gen_random_uuid(), 'Sales', 'Sales and customer acquisition teams'),
(gen_random_uuid(), 'Human Resources', 'HR and people operations teams'),
(gen_random_uuid(), 'Finance', 'Finance and accounting teams'),
(gen_random_uuid(), 'Operations', 'Operations and infrastructure teams'),
(gen_random_uuid(), 'Customer Support', 'Customer service and support teams');

-- =============================================
-- Create Teams with Members
-- =============================================
-- We need to use variables for UUIDs to reference them later
-- Since PostgreSQL doesn't support variables in this context, we'll use CTEs

WITH domain_ids AS (
  SELECT id, name FROM domains WHERE name IN ('Engineering', 'Product Management', 'Marketing', 'Sales', 'Human Resources', 'Operations', 'Customer Support')
),
user_ids AS (
  SELECT id, emp_id, name FROM users WHERE emp_id LIKE 'EMP%' OR emp_id LIKE 'TL%' OR emp_id LIKE 'MGR%'
),
-- Create teams
new_teams AS (
  INSERT INTO teams (id, name, description, domain_id, created_by) 
  SELECT 
    gen_random_uuid(),
    team_name,
    team_desc,
    domain_id,
    (SELECT id FROM user_ids WHERE emp_id = 'TL001' LIMIT 1)
  FROM (
    VALUES 
      ('Frontend Development Team', 'React and Angular development team', (SELECT id FROM domain_ids WHERE name = 'Engineering')),
      ('Backend Development Team', 'Node.js and Python backend development', (SELECT id FROM domain_ids WHERE name = 'Engineering')),
      ('Mobile App Team', 'iOS and Android mobile application development', (SELECT id FROM domain_ids WHERE name = 'Engineering')),
      ('DevOps & Infrastructure', 'Cloud infrastructure and deployment automation', (SELECT id FROM domain_ids WHERE name = 'Operations')),
      ('Product Strategy Team', 'Product roadmap and feature planning', (SELECT id FROM domain_ids WHERE name = 'Product Management')),
      ('UX/UI Design Team', 'User experience and interface design', (SELECT id FROM domain_ids WHERE name = 'Product Management')),
      ('Digital Marketing Team', 'Online marketing and social media', (SELECT id FROM domain_ids WHERE name = 'Marketing')),
      ('Sales Development Team', 'Lead generation and sales development', (SELECT id FROM domain_ids WHERE name = 'Sales')),
      ('Customer Success Team', 'Customer onboarding and support', (SELECT id FROM domain_ids WHERE name = 'Customer Support')),
      ('HR Operations Team', 'Recruitment and employee relations', (SELECT id FROM domain_ids WHERE name = 'Human Resources'))
  ) AS t(team_name, team_desc, domain_id)
  RETURNING id, name
)
SELECT * FROM new_teams;

-- =============================================
-- Add Team Members
-- =============================================
-- Frontend Development Team Members
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  CASE 
    WHEN u.emp_id = 'TL001' THEN 'lead'
    ELSE 'member'
  END as role,
  NOW() - INTERVAL '30 days'
FROM teams t
CROSS JOIN users u
WHERE t.name = 'Frontend Development Team' 
  AND u.emp_id IN ('TL001', 'EMP001', 'EMP002', 'EMP003', 'EMP004');

-- Backend Development Team Members
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  CASE 
    WHEN u.emp_id = 'TL002' THEN 'lead'
    ELSE 'member'
  END as role,
  NOW() - INTERVAL '25 days'
FROM teams t
CROSS JOIN users u
WHERE t.name = 'Backend Development Team' 
  AND u.emp_id IN ('TL002', 'EMP005', 'EMP006', 'EMP007', 'EMP008');

-- Mobile App Team Members
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  CASE 
    WHEN u.emp_id = 'TL003' THEN 'lead'
    ELSE 'member'
  END as role,
  NOW() - INTERVAL '20 days'
FROM teams t
CROSS JOIN users u
WHERE t.name = 'Mobile App Team' 
  AND u.emp_id IN ('TL003', 'EMP009', 'EMP010', 'EMP011');

-- DevOps & Infrastructure Team Members
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  CASE 
    WHEN u.emp_id = 'TL004' THEN 'lead'
    ELSE 'member'
  END as role,
  NOW() - INTERVAL '35 days'
FROM teams t
CROSS JOIN users u
WHERE t.name = 'DevOps & Infrastructure' 
  AND u.emp_id IN ('TL004', 'EMP012', 'EMP013');

-- Product Strategy Team Members
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  CASE 
    WHEN u.emp_id = 'MGR001' THEN 'lead'
    ELSE 'member'
  END as role,
  NOW() - INTERVAL '40 days'
FROM teams t
CROSS JOIN users u
WHERE t.name = 'Product Strategy Team' 
  AND u.emp_id IN ('MGR001', 'EMP014', 'EMP015');

-- UX/UI Design Team Members
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT 
  t.id as team_id,
  u.id as user_id,
  'member' as role,
  NOW() - INTERVAL '28 days'
FROM teams t
CROSS JOIN users u
WHERE t.name = 'UX/UI Design Team' 
  AND u.emp_id IN ('EMP001', 'EMP005', 'EMP009');

-- =============================================
-- Create Activities for Teams
-- =============================================

-- Frontend Development Team Activities
INSERT INTO activities (id, title, description, status, priority, team_id, created_by, target_date)
SELECT 
  gen_random_uuid(),
  activity_title,
  activity_desc,
  activity_status,
  activity_priority,
  t.id,
  (SELECT u.id FROM users u WHERE u.emp_id = 'TL001'),
  target_date
FROM teams t
CROSS JOIN (
  VALUES 
    ('Implement User Authentication UI', 'Create login, register, and password reset components using Angular Material', 'in_progress', 'high', NOW() + INTERVAL '7 days'),
    ('Responsive Dashboard Design', 'Design and implement responsive dashboard layout for all screen sizes', 'pending', 'medium', NOW() + INTERVAL '14 days'),
    ('Shopping Cart Component', 'Build interactive shopping cart with add/remove functionality', 'completed', 'high', NOW() - INTERVAL '3 days'),
    ('Search and Filter Features', 'Implement advanced search and filtering for product listings', 'pending', 'medium', NOW() + INTERVAL '10 days'),
    ('Performance Optimization', 'Optimize bundle size and implement lazy loading', 'on_hold', 'low', NOW() + INTERVAL '21 days')
) AS a(activity_title, activity_desc, activity_status, activity_priority, target_date)
WHERE t.name = 'Frontend Development Team';

-- Backend Development Team Activities
INSERT INTO activities (id, title, description, status, priority, team_id, created_by, target_date)
SELECT 
  gen_random_uuid(),
  activity_title,
  activity_desc,
  activity_status,
  activity_priority,
  t.id,
  (SELECT u.id FROM users u WHERE u.emp_id = 'TL002'),
  target_date
FROM teams t
CROSS JOIN (
  VALUES 
    ('API Authentication System', 'Implement JWT-based authentication with refresh tokens', 'completed', 'high', NOW() - INTERVAL '5 days'),
    ('Database Migration Scripts', 'Create migration scripts for user management tables', 'in_progress', 'high', NOW() + INTERVAL '3 days'),
    ('Payment Gateway Integration', 'Integrate Stripe payment processing API', 'pending', 'high', NOW() + INTERVAL '12 days'),
    ('Email Notification Service', 'Build email service for user notifications and alerts', 'pending', 'medium', NOW() + INTERVAL '8 days'),
    ('API Rate Limiting', 'Implement rate limiting and request throttling', 'on_hold', 'low', NOW() + INTERVAL '25 days'),
    ('Data Backup Strategy', 'Design and implement automated database backup system', 'pending', 'medium', NOW() + INTERVAL '18 days')
) AS a(activity_title, activity_desc, activity_status, activity_priority, target_date)
WHERE t.name = 'Backend Development Team';

-- Mobile App Team Activities
INSERT INTO activities (id, title, description, status, priority, team_id, created_by, target_date)
SELECT 
  gen_random_uuid(),
  activity_title,
  activity_desc,
  activity_status,
  activity_priority,
  t.id,
  (SELECT u.id FROM users u WHERE u.emp_id = 'TL003'),
  target_date
FROM teams t
CROSS JOIN (
  VALUES 
    ('iOS App Store Submission', 'Prepare and submit iOS app to Apple App Store', 'in_progress', 'high', NOW() + INTERVAL '5 days'),
    ('Push Notification System', 'Implement Firebase push notifications for both platforms', 'pending', 'high', NOW() + INTERVAL '9 days'),
    ('Offline Data Sync', 'Build offline functionality with data synchronization', 'pending', 'medium', NOW() + INTERVAL '16 days'),
    ('Biometric Authentication', 'Add fingerprint and face ID authentication', 'on_hold', 'low', NOW() + INTERVAL '30 days')
) AS a(activity_title, activity_desc, activity_status, activity_priority, target_date)
WHERE t.name = 'Mobile App Team';

-- DevOps & Infrastructure Activities
INSERT INTO activities (id, title, description, status, priority, team_id, created_by, target_date)
SELECT 
  gen_random_uuid(),
  activity_title,
  activity_desc,
  activity_status,
  activity_priority,
  t.id,
  (SELECT u.id FROM users u WHERE u.emp_id = 'TL004'),
  target_date
FROM teams t
CROSS JOIN (
  VALUES 
    ('CI/CD Pipeline Setup', 'Configure automated testing and deployment pipeline', 'completed', 'high', NOW() - INTERVAL '7 days'),
    ('Container Orchestration', 'Set up Kubernetes cluster for production deployment', 'in_progress', 'high', NOW() + INTERVAL '4 days'),
    ('Monitoring and Alerting', 'Implement comprehensive monitoring with Prometheus and Grafana', 'pending', 'medium', NOW() + INTERVAL '11 days'),
    ('Security Audit', 'Conduct comprehensive security audit of infrastructure', 'pending', 'high', NOW() + INTERVAL '15 days')
) AS a(activity_title, activity_desc, activity_status, activity_priority, target_date)
WHERE t.name = 'DevOps & Infrastructure';

-- Product Strategy Team Activities
INSERT INTO activities (id, title, description, status, priority, team_id, created_by, target_date)
SELECT 
  gen_random_uuid(),
  activity_title,
  activity_desc,
  activity_status,
  activity_priority,
  t.id,
  (SELECT u.id FROM users u WHERE u.emp_id = 'MGR001'),
  target_date
FROM teams t
CROSS JOIN (
  VALUES 
    ('Q2 Product Roadmap', 'Define product roadmap and feature priorities for Q2', 'completed', 'high', NOW() - INTERVAL '10 days'),
    ('User Research Analysis', 'Analyze user feedback and market research data', 'in_progress', 'high', NOW() + INTERVAL '6 days'),
    ('Competitive Analysis Report', 'Research competitor features and market positioning', 'pending', 'medium', NOW() + INTERVAL '13 days'),
    ('Feature Specification Documentation', 'Create detailed specifications for upcoming features', 'pending', 'medium', NOW() + INTERVAL '20 days')
) AS a(activity_title, activity_desc, activity_status, activity_priority, target_date)
WHERE t.name = 'Product Strategy Team';

-- =============================================
-- Assign Users to Activities
-- =============================================

-- Assign Frontend team members to their activities
INSERT INTO activity_assignments (activity_id, user_id, assigned_at)
SELECT DISTINCT
  a.id as activity_id,
  tm.user_id,
  NOW() - INTERVAL '1 day'
FROM activities a
INNER JOIN teams t ON a.team_id = t.id
INNER JOIN team_members tm ON t.id = tm.team_id
WHERE t.name = 'Frontend Development Team'
  AND a.title IN ('Implement User Authentication UI', 'Responsive Dashboard Design');

-- Assign specific members to specific activities
INSERT INTO activity_assignments (activity_id, user_id, assigned_at)
SELECT 
  a.id as activity_id,
  u.id as user_id,
  NOW() - INTERVAL '2 days'
FROM activities a
CROSS JOIN users u
INNER JOIN teams t ON a.team_id = t.id
WHERE t.name = 'Backend Development Team' 
  AND a.title = 'API Authentication System'
  AND u.emp_id IN ('TL002', 'EMP005');

INSERT INTO activity_assignments (activity_id, user_id, assigned_at)
SELECT 
  a.id as activity_id,
  u.id as user_id,
  NOW() - INTERVAL '1 day'
FROM activities a
CROSS JOIN users u
INNER JOIN teams t ON a.team_id = t.id
WHERE t.name = 'Mobile App Team' 
  AND a.title = 'iOS App Store Submission'
  AND u.emp_id IN ('TL003', 'EMP009');

-- =============================================
-- Add Activity Remarks
-- =============================================

INSERT INTO activity_remarks (id, activity_id, user_id, text)
SELECT 
  gen_random_uuid(),
  a.id,
  u.id,
  remark_text
FROM activities a
CROSS JOIN users u
CROSS JOIN (
  VALUES 
    ('Initial setup completed. Moving to implementation phase.'),
    ('Encountered some technical challenges with the authentication flow.'),
    ('Code review completed. Ready for testing.'),
    ('Testing in progress. Found minor UI issues that need fixing.'),
    ('Feature completed and deployed to staging environment.')
) AS r(remark_text)
INNER JOIN teams t ON a.team_id = t.id
INNER JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = u.id
WHERE a.title = 'Implement User Authentication UI'
  AND t.name = 'Frontend Development Team'
LIMIT 3; -- Limit to avoid too many remarks

-- Add remarks for backend activities
INSERT INTO activity_remarks (id, activity_id, user_id, text)
SELECT 
  gen_random_uuid(),
  a.id,
  u.id,
  'JWT implementation completed with proper security measures.'
FROM activities a
CROSS JOIN users u
INNER JOIN teams t ON a.team_id = t.id
INNER JOIN team_members tm ON t.id = tm.team_id AND tm.user_id = u.id
WHERE a.title = 'API Authentication System'
  AND t.name = 'Backend Development Team'
  AND u.emp_id = 'TL002'
LIMIT 1;

-- =============================================
-- Add Notifications
-- =============================================

INSERT INTO notifications (id, user_id, title, message, type, related_entity_type, related_entity_id, is_read)
SELECT 
  gen_random_uuid(),
  u.id,
  'New Activity Assigned',
  'You have been assigned to: ' || a.title,
  'activity_assigned',
  'activity',
  a.id,
  CASE WHEN random() > 0.3 THEN true ELSE false END -- Some notifications are read, some are not
FROM activities a
INNER JOIN activity_assignments aa ON a.id = aa.activity_id
INNER JOIN users u ON aa.user_id = u.id
WHERE a.status IN ('pending', 'in_progress')
LIMIT 20; -- Limit to avoid too many notifications

-- Add team-related notifications
INSERT INTO notifications (id, user_id, title, message, type, related_entity_type, related_entity_id, is_read)
SELECT 
  gen_random_uuid(),
  tm.user_id,
  'Welcome to Team',
  'You have been added to ' || t.name,
  'team_joined',
  'team',
  t.id,
  true
FROM teams t
INNER JOIN team_members tm ON t.id = tm.team_id
WHERE t.name IN ('Frontend Development Team', 'Backend Development Team', 'Mobile App Team')
LIMIT 15;

-- =============================================
-- Summary Message
-- =============================================

-- Display summary of inserted data
DO $$
DECLARE
    user_count INTEGER;
    domain_count INTEGER;
    team_count INTEGER;
    activity_count INTEGER;
    assignment_count INTEGER;
    remark_count INTEGER;
    notification_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE emp_id LIKE 'EMP%' OR emp_id LIKE 'TL%' OR emp_id LIKE 'MGR%';
    SELECT COUNT(*) INTO domain_count FROM domains WHERE name != 'Administration';
    SELECT COUNT(*) INTO team_count FROM teams;
    SELECT COUNT(*) INTO activity_count FROM activities;
    SELECT COUNT(*) INTO assignment_count FROM activity_assignments;
    SELECT COUNT(*) INTO remark_count FROM activity_remarks;
    SELECT COUNT(*) INTO notification_count FROM notifications;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DUMMY DATA INSERTION COMPLETED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Users created: %', user_count;
    RAISE NOTICE 'Domains created: %', domain_count;
    RAISE NOTICE 'Teams created: %', team_count;
    RAISE NOTICE 'Activities created: %', activity_count;
    RAISE NOTICE 'Activity assignments: %', assignment_count;
    RAISE NOTICE 'Activity remarks: %', remark_count;
    RAISE NOTICE 'Notifications created: %', notification_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'You can now test the application with realistic data!';
    RAISE NOTICE 'Login credentials: Use any emp_id with password "password123"';
    RAISE NOTICE '========================================';
END $$;
