const { query, transaction } = require('../config/database');

class User {
  static async findAll() {
    const result = await query(
      'SELECT id, emp_id, name, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      'SELECT id, emp_id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByEmpId(empId) {
    const result = await query(
      'SELECT * FROM users WHERE emp_id = $1',
      [empId]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { empId, name, email, password, role = 'user' } = userData;
    const result = await query(
      `INSERT INTO users (emp_id, name, email, password, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, emp_id, name, email, role, is_active, created_at, updated_at`,
      [empId, name, email, password, role]
    );
    return result.rows[0];
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(userData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} 
       RETURNING id, emp_id, name, email, role, is_active, created_at, updated_at`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getUserTeams(userId) {
    const result = await query(
      `SELECT t.*, d.name as domain_name 
       FROM teams t 
       LEFT JOIN domains d ON t.domain_id = d.id
       INNER JOIN team_members tm ON t.id = tm.team_id 
       WHERE tm.user_id = $1 
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getUserActivities(userId) {
    const result = await query(
      `SELECT a.*, t.name as team_name, u.name as created_by_name
       FROM activities a
       INNER JOIN activity_assignments aa ON a.id = aa.activity_id
       INNER JOIN teams t ON a.team_id = t.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE aa.user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async searchUsers(searchQuery) {
    const result = await query(
      `SELECT id, emp_id, name, email, role, is_active, created_at, updated_at 
       FROM users 
       WHERE (LOWER(emp_id) LIKE LOWER($1) OR LOWER(name) LIKE LOWER($1)) 
       AND is_active = true
       ORDER BY name`,
      [`%${searchQuery}%`]
    );
    return result.rows;
  }
}

module.exports = User;
