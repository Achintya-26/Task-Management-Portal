const express = require('express');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const { activities, teams, users, notifications } = require('../data/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get activities for a team
router.get('/team/:teamId', authenticateToken, (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Check if user has access to this team
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (req.user.role !== 'admin' && !team.members.some(m => m.userId === req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this team' });
    }

    const teamActivities = activities.filter(activity => activity.teamId === teamId);
    res.json(teamActivities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new activity (admin only)
router.post('/', authenticateToken, authorizeAdmin, upload.array('attachments', 5), (req, res) => {
  try {
    const { title, description, teamId, assignedMembers, targetDate } = req.body;

    if (!title || !teamId) {
      return res.status(400).json({ message: 'Activity title and team are required' });
    }

    // Verify team exists
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Process assigned members
    let assignedMemberIds = [];
    if (assignedMembers) {
      assignedMemberIds = Array.isArray(assignedMembers) ? assignedMembers : [assignedMembers];
    }

    // Process file attachments
    const attachments = req.files ? req.files.map(file => ({
      id: uuidv4(),
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      uploadedAt: new Date().toISOString()
    })) : [];

    const newActivity = {
      id: uuidv4(),
      title,
      description: description || '',
      teamId,
      assignedMembers: assignedMemberIds,
      status: 'pending',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      targetDate: targetDate ? new Date(targetDate).toISOString() : null,
      attachments,
      remarks: [],
      updatedAt: new Date().toISOString()
    };

    activities.push(newActivity);

    // Create notifications for assigned members
    assignedMemberIds.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (user) {
        const notification = {
          id: uuidv4(),
          type: 'activity_assigned',
          title: 'New Activity Assigned',
          message: `You have been assigned to activity "${title}"`,
          userId: user.id,
          teamId: teamId,
          activityId: newActivity.id,
          read: false,
          createdAt: new Date().toISOString()
        };
        notifications.push(notification);
      }
    });

    // Emit socket event
    req.io.to(`team-${teamId}`).emit('activity_created', newActivity);

    res.status(201).json({
      message: 'Activity created successfully',
      activity: newActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update activity status
router.patch('/:activityId/status', authenticateToken, (req, res) => {
  try {
    const { activityId } = req.params;
    const { status, remarks } = req.body;

    const activity = activities.find(a => a.id === activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user is assigned to this activity or is admin
    if (req.user.role !== 'admin' && !activity.assignedMembers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this activity' });
    }

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'on_hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    activity.status = status;
    activity.updatedAt = new Date().toISOString();

    // Add remark if provided
    if (remarks) {
      activity.remarks.push({
        id: uuidv4(),
        text: remarks,
        userId: req.user.id,
        userName: req.user.empId,
        createdAt: new Date().toISOString()
      });
    }

    // Create notification for team members and admin
    const team = teams.find(t => t.id === activity.teamId);
    if (team) {
      // Notify admin
      const admin = users.find(u => u.role === 'admin');
      if (admin) {
        const notification = {
          id: uuidv4(),
          type: 'activity_status_updated',
          title: 'Activity Status Updated',
          message: `Activity "${activity.title}" status changed to ${status}`,
          userId: admin.id,
          teamId: activity.teamId,
          activityId: activity.id,
          read: false,
          createdAt: new Date().toISOString()
        };
        notifications.push(notification);
      }

      // Notify other assigned members
      activity.assignedMembers.forEach(userId => {
        if (userId !== req.user.id) {
          const notification = {
            id: uuidv4(),
            type: 'activity_status_updated',
            title: 'Activity Status Updated',
            message: `Activity "${activity.title}" status changed to ${status}`,
            userId: userId,
            teamId: activity.teamId,
            activityId: activity.id,
            read: false,
            createdAt: new Date().toISOString()
          };
          notifications.push(notification);
        }
      });
    }

    // Emit socket event
    req.io.to(`team-${activity.teamId}`).emit('activity_updated', activity);

    res.json({
      message: 'Activity status updated successfully',
      activity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add remark to activity
router.post('/:activityId/remarks', authenticateToken, (req, res) => {
  try {
    const { activityId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Remark text is required' });
    }

    const activity = activities.find(a => a.id === activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user has access to this activity
    const team = teams.find(t => t.id === activity.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (req.user.role !== 'admin' && !team.members.some(m => m.userId === req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this activity' });
    }

    const newRemark = {
      id: uuidv4(),
      text,
      userId: req.user.id,
      userName: req.user.empId,
      createdAt: new Date().toISOString()
    };

    activity.remarks.push(newRemark);
    activity.updatedAt = new Date().toISOString();

    // Emit socket event
    req.io.to(`team-${activity.teamId}`).emit('activity_updated', activity);

    res.json({
      message: 'Remark added successfully',
      remark: newRemark,
      activity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get activity details
router.get('/:activityId', authenticateToken, (req, res) => {
  try {
    const activity = activities.find(a => a.id === req.params.activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user has access to this activity
    const team = teams.find(t => t.id === activity.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (req.user.role !== 'admin' && !team.members.some(m => m.userId === req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this activity' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
