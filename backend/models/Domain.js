const { query } = require('../config/database');

class Domain {
  static async findAll() {
    const result = await query(
      'SELECT * FROM domains ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM domains WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create(domainData) {
    const { name, description } = domainData;
    const result = await query(
      'INSERT INTO domains (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return result.rows[0];
  }

  static async update(id, domainData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(domainData).forEach(key => {
      if (domainData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(domainData[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE domains SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM domains WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async getTeams(domainId) {
    const result = await query(
      `SELECT t.*, u.name as created_by_name,
       COUNT(tm.user_id) as member_count
       FROM teams t
       LEFT JOIN users u ON t.created_by = u.id
       LEFT JOIN team_members tm ON t.id = tm.team_id
       WHERE t.domain_id = $1
       GROUP BY t.id, u.name
       ORDER BY t.created_at DESC`,
      [domainId]
    );
    return result.rows;
  }
}

module.exports = Domain;
