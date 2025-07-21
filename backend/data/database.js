// In-memory database simulation
const users = [
  {
    id: 'admin-1',
    empId: 'ADMIN001',
    name: 'Admin User',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

const teams = [];
const activities = [];
const domains = [
  { id: 'domain-1', name: 'Support', createdAt: new Date().toISOString() },
  { id: 'domain-2', name: 'CR', createdAt: new Date().toISOString() },
  { id: 'domain-3', name: 'Implementation', createdAt: new Date().toISOString() },
  { id: 'domain-4', name: 'QA', createdAt: new Date().toISOString() }
];
const notifications = [];

module.exports = {
  users,
  teams,
  activities,
  domains,
  notifications
};
