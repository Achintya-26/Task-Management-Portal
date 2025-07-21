const express = require('express');
const { notifications } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications for current user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userNotifications = notifications
      .filter(notification => notification.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(userNotifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, (req, res) => {
  try {
    const notification = notifications.find(n => 
      n.id === req.params.notificationId && n.userId === req.user.id
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, (req, res) => {
  try {
    const userNotifications = notifications.filter(n => n.userId === req.user.id);
    userNotifications.forEach(notification => {
      notification.read = true;
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, (req, res) => {
  try {
    const unreadCount = notifications.filter(n => 
      n.userId === req.user.id && !n.read
    ).length;

    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
