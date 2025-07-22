const { query, transaction } = require('../config/database');

class Activity {
  static async findAll() {
    const result = await query(
      `SELECT a.*, t.name as team_name, u.name as created_by_name,
       ARRAY_AGG(DISTINCT au.name) as assigned_users
       FROM activities a
       LEFT JOIN teams t ON a.team_id = t.id
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN activity_assignments aa ON a.id = aa.activity_id
       LEFT JOIN users au ON aa.user_id = au.id
       GROUP BY a.id, t.name, u.name
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      `SELECT a.*, t.name as team_name, u.name as created_by_name
       FROM activities a
       LEFT JOIN teams t ON a.team_id = t.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByTeamId(teamId) {
    const result = await query(
      `SELECT a.*, t.name as team_name, u.name as created_by_name,
       ARRAY_AGG(DISTINCT au.name) FILTER (WHERE au.name IS NOT NULL) as assigned_users,
       ARRAY_AGG(DISTINCT au.id) FILTER (WHERE au.id IS NOT NULL) as assigned_user_ids,
       COUNT(DISTINCT ar.id) as remarks_count,
       COUNT(DISTINCT at.id) as attachments_count
       FROM activities a
       LEFT JOIN teams t ON a.team_id = t.id
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN activity_assignments aa ON a.id = aa.activity_id
       LEFT JOIN users au ON aa.user_id = au.id
       LEFT JOIN activity_remarks ar ON a.id = ar.activity_id
       LEFT JOIN activity_attachments at ON a.id = at.activity_id
       WHERE a.team_id = $1
       GROUP BY a.id, t.name, u.name
       ORDER BY a.created_at DESC`,
      [teamId]
    );
    
    // Transform the result to include empty arrays and counts as numbers
    return result.rows.map(row => ({
      ...row,
      assigned_user_ids: row.assigned_user_ids || [],
      assigned_users: row.assigned_users || [],
      remarks: Array(parseInt(row.remarks_count) || 0).fill({}), // Create empty array with count
      attachments: Array(parseInt(row.attachments_count) || 0).fill({}), // Create empty array with count
      remarks_count: parseInt(row.remarks_count) || 0,
      attachments_count: parseInt(row.attachments_count) || 0
    }));
  }

  static async create(activityData) {
    const { title, description, teamId, createdBy, targetDate, priority = 'medium' } = activityData;
    const result = await query(
      `INSERT INTO activities (title, description, team_id, created_by, target_date, priority) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, teamId, createdBy, targetDate, priority]
    );
    return result.rows[0];
  }

  static async update(id, activityData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(activityData).forEach(key => {
      if (activityData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(activityData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE activities SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getAssignedUsers(activityId) {
    const result = await query(
      `SELECT u.id, u.emp_id, u.name, u.email, aa.assigned_at
       FROM users u
       INNER JOIN activity_assignments aa ON u.id = aa.user_id
       WHERE aa.activity_id = $1
       ORDER BY aa.assigned_at ASC`,
      [activityId]
    );
    return result.rows;
  }

  static async assignUser(activityId, userId) {
    try {
      const result = await query(
        'INSERT INTO activity_assignments (activity_id, user_id) VALUES ($1, $2) RETURNING *',
        [activityId, userId]
      );
      return result.rows[0];
    } catch (err) {
      if (err.code === '23505') { // Unique constraint violation
        throw new Error('User is already assigned to this activity');
      }
      throw err;
    }
  }

  static async unassignUser(activityId, userId) {
    const result = await query(
      'DELETE FROM activity_assignments WHERE activity_id = $1 AND user_id = $2 RETURNING *',
      [activityId, userId]
    );
    return result.rows[0];
  }

  static async getRemarks(activityId) {
    const result = await query(
      `SELECT ar.*, u.name as user_name, u.emp_id
       FROM activity_remarks ar
       INNER JOIN users u ON ar.user_id = u.id
       WHERE ar.activity_id = $1
       ORDER BY ar.created_at ASC`,
      [activityId]
    );
    return result.rows;
  }

  static async addRemark(activityId, userId, remark) {
    const result = await query(
      `INSERT INTO activity_remarks (activity_id, user_id, remark) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [activityId, userId, remark]
    );
    return result.rows[0];
  }

  static async getAttachments(activityId) {
    const result = await query(
      `SELECT aa.*, u.name as uploaded_by_name
       FROM activity_attachments aa
       LEFT JOIN users u ON aa.uploaded_by = u.id
       WHERE aa.activity_id = $1
       ORDER BY aa.uploaded_at DESC`,
      [activityId]
    );
    return result.rows;
  }

  static async addAttachment(attachmentData) {
    const { activityId, filename, originalName, filePath, fileSize, mimeType, uploadedBy } = attachmentData;
    const result = await query(
      `INSERT INTO activity_attachments (activity_id, filename, original_name, file_path, file_size, mime_type, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [activityId, filename, originalName, filePath, fileSize, mimeType, uploadedBy]
    );
    return result.rows[0];
  }

  static async deleteAttachment(id) {
    const result = await query('DELETE FROM activity_attachments WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async updateStatus(id, status, userId) {
    return await transaction(async (client) => {
      // Update activity status
      const activityResult = await client.query(
        'UPDATE activities SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
      
      // Add remark about status change
      await client.query(
        'INSERT INTO activity_remarks (activity_id, user_id, remark) VALUES ($1, $2, $3)',
        [id, userId, `Status changed to: ${status}`]
      );
      
      return activityResult.rows[0];
    });
  }
}

module.exports = Activity;
