-- Dummy Data for Task Management Application
-- This file contains sample data for testing and development purposes

-- Insert dummy users (in addition to any existing users)
INSERT INTO users (id, emp_id, name, password, role, created_at, updated_at) VALUES
-- Regular Users
('550e8400-e29b-41d4-a716-446655440001', 'EMP001', 'John Smith', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'EMP002', 'Sarah Johnson', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'EMP003', 'Michael Brown', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'EMP004', 'Emily Davis', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'EMP005', 'David Wilson', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'EMP006', 'Lisa Anderson', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'EMP007', 'Robert Taylor', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'EMP008', 'Jennifer Garcia', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'EMP009', 'Christopher Martinez', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'EMP010', 'Amanda Rodriguez', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'EMP011', 'James Williams', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'EMP012', 'Michelle Thompson', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'EMP013', 'Daniel Lee', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'EMP014', 'Jessica White', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'EMP015', 'Kevin Clark', '$2b$10$K9rqXW8Y2H.gKLzQnN5uOOyZr8Zv.4X3fJqN8wP2sT6mL9kH7vS1e', 'user', NOW(), NOW())
ON CONFLICT (emp_id) DO NOTHING;

-- Insert additional domains if they don't exist
INSERT INTO domains (id, name, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Software Development', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Marketing & Sales', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Human Resources', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Operations', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'Quality Assurance', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert dummy teams
INSERT INTO teams (id, name, description, domain_id, created_by, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Frontend Development Team', 'Responsible for user interface development and user experience', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'Backend Development Team', 'Handles server-side logic, databases, and API development', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'Marketing Campaign Team', 'Plans and executes marketing campaigns and strategies', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', 'QA Testing Team', 'Ensures product quality through comprehensive testing', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440005', 'HR Operations Team', 'Handles recruitment, training, and employee relations', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert team members
INSERT INTO team_members (id, team_id, user_id, joined_at) VALUES
-- Frontend Development Team Members
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW()),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', NOW()),
-- Backend Development Team Members
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', NOW()),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', NOW()),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', NOW()),
-- Marketing Campaign Team Members
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', NOW()),
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', NOW()),
-- QA Testing Team Members
('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', NOW()),
('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', NOW()),
('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440011', NOW()),
-- HR Operations Team Members
('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440012', NOW()),
('880e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440013', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert dummy activities
INSERT INTO activities (id, title, description, priority, status, team_id, created_by, target_date, created_at, updated_at) VALUES
-- Frontend Development Team Activities
('990e8400-e29b-41d4-a716-446655440001', 'Design User Dashboard Interface', 'Create wireframes and mockups for the main user dashboard with responsive design considerations', 'high', 'in-progress', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW() + INTERVAL '14 days', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440002', 'Implement Authentication UI', 'Develop login and registration forms with proper validation and error handling', 'urgent', 'completed', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW() + INTERVAL '7 days', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440003', 'Mobile Responsive Navigation', 'Ensure navigation menu works perfectly on mobile devices and tablets', 'medium', 'pending', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW() + INTERVAL '21 days', NOW(), NOW()),

-- Backend Development Team Activities
('990e8400-e29b-41d4-a716-446655440004', 'Database Schema Optimization', 'Review and optimize database indexes for better query performance', 'high', 'in-progress', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', NOW() + INTERVAL '10 days', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440005', 'REST API Documentation', 'Create comprehensive API documentation using Swagger/OpenAPI specification', 'medium', 'pending', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', NOW() + INTERVAL '15 days', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440006', 'Implement JWT Authentication', 'Set up secure JWT-based authentication system with refresh tokens', 'urgent', 'completed', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', NOW() + INTERVAL '5 days', NOW(), NOW()),

-- Marketing Campaign Team Activities
('990e8400-e29b-41d4-a716-446655440007', 'Q4 Product Launch Campaign', 'Plan and execute comprehensive marketing campaign for new product launch', 'urgent', 'in-progress', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', NOW() + INTERVAL '30 days', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440008', 'Social Media Content Calendar', 'Create content calendar for next quarter with engaging posts and campaigns', 'medium', 'pending', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', NOW() + INTERVAL '20 days', NOW(), NOW()),

-- QA Testing Team Activities
('990e8400-e29b-41d4-a716-446655440009', 'Automated Test Suite Setup', 'Set up automated testing framework with CI/CD integration', 'high', 'in-progress', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', NOW() + INTERVAL '12 days', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440010', 'Performance Testing', 'Conduct load testing and performance optimization for the application', 'high', 'pending', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', NOW() + INTERVAL '18 days', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440011', 'Security Vulnerability Assessment', 'Perform comprehensive security testing and vulnerability assessment', 'urgent', 'on-hold', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440011', NOW() + INTERVAL '8 days', NOW(), NOW()),

-- HR Operations Team Activities
('990e8400-e29b-41d4-a716-446655440012', 'Employee Onboarding Process Review', 'Review and improve the new employee onboarding experience', 'medium', 'in-progress', '770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440012', NOW() + INTERVAL '25 days', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440013', 'Performance Review System Update', 'Update and digitize the annual performance review process', 'low', 'pending', '770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440013', NOW() + INTERVAL '35 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert activity assignments
INSERT INTO activity_assignments (id, activity_id, user_id, assigned_at) VALUES
-- Frontend Team Activity Assignments
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', NOW()),
('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', NOW()),
('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', NOW()),

-- Backend Team Activity Assignments
('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', NOW()),
('aa0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', NOW()),
('aa0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', NOW()),
('aa0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', NOW()),

-- Marketing Team Activity Assignments
('aa0e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', NOW()),
('aa0e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008', NOW()),
('aa0e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', NOW()),

-- QA Team Activity Assignments
('aa0e8400-e29b-41d4-a716-446655440012', '990e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', NOW()),
('aa0e8400-e29b-41d4-a716-446655440013', '990e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', NOW()),
('aa0e8400-e29b-41d4-a716-446655440014', '990e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', NOW()),
('aa0e8400-e29b-41d4-a716-446655440015', '990e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', NOW()),

-- HR Team Activity Assignments
('aa0e8400-e29b-41d4-a716-446655440016', '990e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', NOW()),
('aa0e8400-e29b-41d4-a716-446655440017', '990e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert some activity remarks for completed and in-progress activities
INSERT INTO activity_remarks (id, activity_id, user_id, text, created_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Login form validation completed. Working on registration form now.', NOW() - INTERVAL '2 days'),
('bb0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Great work! Registration form looks good. Ready for review.', NOW() - INTERVAL '1 day'),
('bb0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Initial wireframes completed. Starting on high-fidelity mockups.', NOW() - INTERVAL '3 days'),
('bb0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Database analysis complete. Identified 5 tables that need indexing.', NOW() - INTERVAL '1 day'),
('bb0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'JWT implementation finished. All endpoints are now secured.', NOW() - INTERVAL '2 days'),
('bb0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Campaign strategy finalized. Starting creative asset development.', NOW() - INTERVAL '5 days'),
('bb0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 'Testing framework setup is 70% complete. Adding more test cases.', NOW() - INTERVAL '1 day'),
('bb0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', 'Conducted interviews with new hires. Identified areas for improvement.', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- Insert some notifications for various activities
INSERT INTO notifications (id, user_id, title, message, type, read, related_team_id, related_activity_id, created_at) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'New Activity Assigned', 'You have been assigned to "Design User Dashboard Interface"', 'assignment', false, '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 hour'),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Activity Status Updated', 'Database Schema Optimization status changed to In Progress', 'status_change', false, '770e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '2 hours'),
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', 'Team Update', 'Marketing Campaign Team has a new activity', 'team_update', true, '770e8400-e29b-41d4-a716-446655440003', NULL, NOW() - INTERVAL '6 hours'),
('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', 'Activity Deadline Approaching', 'Automated Test Suite Setup deadline is in 5 days', 'deadline', false, '770e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440009', NOW() - INTERVAL '30 minutes'),
('cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Activity Completed', 'Authentication UI implementation has been completed', 'completion', true, '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Update team statistics (this is optional, as it can be calculated on-the-fly)
-- You can add views or triggers to automatically calculate these stats

-- Print completion message
DO $$
BEGIN
  RAISE NOTICE 'Dummy data insertion completed successfully!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- 15 dummy users (EMP001-EMP015)';
  RAISE NOTICE '- 5 business domains';
  RAISE NOTICE '- 5 teams with members';
  RAISE NOTICE '- 13 activities with various statuses';
  RAISE NOTICE '- Activity assignments and remarks';
  RAISE NOTICE '- Sample notifications';
  RAISE NOTICE '';
  RAISE NOTICE 'Default password for all dummy users: "password123"';
  RAISE NOTICE 'You can login with any empId (EMP001-EMP015) and password "password123"';
END $$;
