const { query, transaction } = require('../config/database');

class Team {
  static async findAll() {
    const result = await query(
      `SELECT t.*, d.name as domain_name, u.name as created_by_name,
       COUNT(tm.user_id) as member_count
       FROM teams t
       LEFT JOIN domains d ON t.domain_id = d.id
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN team_members tm ON t.id = tm.team_id
       GROUP BY t.id, d.name, u.name
       ORDER BY t.created_at DESC`
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT t.*, d.name as domain_name, u.name as created_by_name
       FROM teams t
       LEFT JOIN domains d ON t.domain_id = d.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create(teamData) {
    const { name, description, domainId, createdBy } = teamData;
    const result = await query(
      `INSERT INTO teams (name, description, domain_id, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, description, domainId, createdBy]
    );
    return result.rows[0];
  }

  static async update(id, teamData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(teamData).forEach(key => {
      if (teamData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(teamData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE teams SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM teams WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getMembers(teamId) {
    const result = await query(
      `SELECT u.id, u.emp_id, u.name, u.email, u.role, tm.joined_at
       FROM users u
       INNER JOIN team_members tm ON u.id = tm.user_id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at ASC`,
      [teamId]
    );
    return result.rows;
  }

  static async addMember(teamId, userId) {
    try {
      const result = await query(
        'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) RETURNING *',
        [teamId, userId]
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        throw new Error('User is already a member of this team');
      }
      throw err;
    }
  }

  static async removeMember(teamId, userId) {
    const result = await query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING *',
      [teamId, userId]
    );
    return result.rows[0];
  }

  static async getActivities(teamId) {
    const result = await query(
      `SELECT a.*, u.name as created_by_name,
       ARRAY_AGG(DISTINCT au.name) as assigned_users
       FROM activities a
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN activity_assignments aa ON a.id = aa.activity_id
       LEFT JOIN users au ON aa.user_id = au.id
       WHERE a.team_id = $1
       GROUP BY a.id, u.name
       ORDER BY a.created_at DESC`,
      [teamId]
    );
    return result.rows;
  }

  static async addActivity(activityData) {
    const { title, description, teamId, createdBy, targetDate, assignedUsers = [] } = activityData;
    
    return await transaction(async (client) => {
      // Create activity
      const activityResult = await client.query(
        `INSERT INTO activities (title, description, team_id, created_by, target_date) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [title, description, teamId, createdBy, targetDate]
      );
      
      const activity = activityResult.rows[0];
      
      // Assign users to activity
      if (assignedUsers.length > 0) {
        for (const userId of assignedUsers) {
          await client.query(
            'INSERT INTO activity_assignments (activity_id, user_id) VALUES ($1, $2)',
            [activity.id, userId]
          );
        }
      }
      
      return activity;
    });
  }
}

module.exports = Team;
