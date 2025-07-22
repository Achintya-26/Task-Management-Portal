const { query } = require('../config/database');

class Notification {
  static async findAll() {
    const result = await query(
      `SELECT n.*, u.name as user_name, u.emp_id
       FROM notifications n
       INNER JOIN users u ON n.user_id = u.id
       ORDER BY n.created_at DESC`
    );
    return result.rows;
  }

  static async findByUserId(userId, limit = 50) {
    const result = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async findUnreadByUserId(userId) {
    const result = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 AND is_read = false 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async create(notificationData) {
    const { userId, title, message, type = 'info', relatedActivityId, relatedTeamId } = notificationData;
    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, related_activity_id, related_team_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, title, message, type, relatedActivityId, relatedTeamId]
    );
    return result.rows[0];
  }

  static async markAsRead(id) {
    const result = await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async markAllAsRead(userId) {
    const result = await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false RETURNING COUNT(*)',
      [userId]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  static async deleteOldNotifications(daysOld = 30) {
    const result = await query(
      `DELETE FROM notifications 
       WHERE created_at < NOW() - INTERVAL '${daysOld} days' 
       RETURNING COUNT(*)`,
      []
    );
    return result.rows[0];
  }

  // Helper method to create notifications for team members
  static async createForTeamMembers(teamId, notificationData, excludeUserId = null) {
    const teamMembersResult = await query(
      'SELECT user_id FROM team_members WHERE team_id = $1',
      [teamId]
    );

    const notifications = [];
    for (const member of teamMembersResult.rows) {
      if (excludeUserId && member.user_id === excludeUserId) {
        continue; // Skip the user who triggered the notification
      }
      
      const notification = await this.create({
        ...notificationData,
        userId: member.user_id,
        relatedTeamId: teamId
      });
      notifications.push(notification);
    }
    
    return notifications;
  }

  // Helper method to create notifications for activity assignees
  static async createForActivityAssignees(activityId, notificationData, excludeUserId = null) {
    const assigneesResult = await query(
      'SELECT user_id FROM activity_assignments WHERE activity_id = $1',
      [activityId]
    );

    const notifications = [];
    for (const assignee of assigneesResult.rows) {
      if (excludeUserId && assignee.user_id === excludeUserId) {
        continue; // Skip the user who triggered the notification
      }
      
      const notification = await this.create({
        ...notificationData,
        userId: assignee.user_id,
        relatedActivityId: activityId
      });
      notifications.push(notification);
    }
    
    return notifications;
  }
}

module.exports = Notification;
