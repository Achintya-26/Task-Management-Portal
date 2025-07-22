const express = require('express');
const multer = require('multer');
const path = require('path');
const Activity = require('../models/Activity');
const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');
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
router.get('/team/:teamId', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Check if team exists and user has access to it
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user has access to this team
    if (req.user.role !== 'admin') {
      const teamMembers = await Team.getMembers(teamId);
      const hasAccess = teamMembers.some(member => member.id === req.user.userId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this team' });
      }
    }

    // Get activities for the team
    const teamActivities = await Activity.findByTeamId(teamId);
    res.json(teamActivities);
  } catch (error) {
    console.error('Get team activities error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new activity (admin only)
router.post('/', authenticateToken, authorizeAdmin, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, teamId, assignedUsers, targetDate, priority = 'medium' } = req.body;

    console.log('Create activity request body:', req.body);
    console.log('Assigned users:', assignedUsers);

    if (!title || !teamId) {
      return res.status(400).json({ message: 'Activity title and team are required' });
    }

    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Create activity
    const newActivity = await Activity.create({
      title,
      description: description || '',
      teamId,
      createdBy: req.user.userId,
      targetDate: targetDate ? new Date(targetDate).toISOString() : null,
      priority
    });

    // Assign users to activity
    if (assignedUsers && Array.isArray(assignedUsers)) {
      console.log('Processing assigned users:', assignedUsers);
      for (const userId of assignedUsers) {
        console.log('Processing userId:', userId, 'Type:', typeof userId);
        
        // Validate userId before processing
        if (!userId || userId.trim() === '') {
          console.warn('Skipping null/empty userId in assignedUsers array');
          continue;
        }

        await Activity.assignUser(newActivity.id, userId);
        
        // Create notification for assigned user
        console.log('Creating notification for userId:', userId);
        await Notification.create({
          userId: userId,
          title: 'New Activity Assigned',
          message: `You have been assigned to activity "${title}"`,
          type: 'info',
          relatedActivityId: newActivity.id,
          relatedTeamId: teamId
        });
      }
    }

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await Activity.addAttachment({
          activityId: newActivity.id,
          filename: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: req.user.userId
        });
      }
    }

    // Emit socket event
    if (req.io) {
      req.io.to(`team-${teamId}`).emit('activity_created', newActivity);
    }

    res.status(201).json({
      message: 'Activity created successfully',
      activity: newActivity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update activity status
router.patch('/:activityId/status', authenticateToken, async (req, res) => {
  try {
    const { activityId } = req.params;
    const { status, remarks } = req.body;

    // Find the activity
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user has access to update this activity
    if (req.user.role !== 'admin') {
      // First check if user is a team member
      const teamMembers = await Team.getMembers(activity.team_id);
      const isTeamMember = teamMembers.some(member => member.id === req.user.userId);
      if (!isTeamMember) {
        return res.status(403).json({ message: 'Access denied to this team' });
      }
      
      // Then check if user is assigned to this specific activity
      const activityAssignments = await Activity.getAssignedUsers(activityId);
      const isAssignedToActivity = activityAssignments.some(assignment => assignment.id === req.user.userId);
      if (!isAssignedToActivity) {
        return res.status(403).json({ message: 'You can only update activities assigned to you' });
      }
    }

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'on-hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update activity status
    await Activity.update(activityId, { status });

    // Add remark if provided
    if (remarks) {
      await Activity.addRemark(activityId, req.user.userId, remarks);
    }

    // Create notifications for team members
    const teamMembers = await Team.getMembers(activity.team_id);
    for (const member of teamMembers) {
      if (member.id !== req.user.userId && member.id) {
        await Notification.create({
          userId: member.id,
          title: 'Activity Status Updated',
          message: `Activity "${activity.title}" status changed to ${status}`,
          type: 'info',
          relatedActivityId: activityId,
          relatedTeamId: activity.team_id
        });
      }
    }

    // Emit socket event
    if (req.io) {
      req.io.to(`team-${activity.team_id}`).emit('activity_updated', activityId);
    }

    // Get updated activity
    const updatedActivity = await Activity.findById(activityId);

    res.json({
      message: 'Activity status updated successfully',
      activity: updatedActivity
    });
  } catch (error) {
    console.error('Update activity status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add remark to activity
router.post('/:activityId/remarks', authenticateToken, async (req, res) => {
  try {
    const { activityId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Remark text is required' });
    }

    // Find the activity
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user has access to this activity
    if (req.user.role !== 'admin') {
      const teamMembers = await Team.getMembers(activity.team_id);
      const hasAccess = teamMembers.some(member => member.id === req.user.userId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this activity' });
      }
    }

    // Add remark
    const newRemark = await Activity.addRemark(activityId, req.user.userId, text);

    // Emit socket event
    if (req.io) {
      req.io.to(`team-${activity.team_id}`).emit('activity_updated', activityId);
    }

    res.json({
      message: 'Remark added successfully',
      remark: newRemark
    });
  } catch (error) {
    console.error('Add remark error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get activity details
router.get('/:activityId', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user has access to this activity
    if (req.user.role !== 'admin') {
      const teamMembers = await Team.getMembers(activity.team_id);
      const hasAccess = teamMembers.some(member => member.id === req.user.userId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this activity' });
      }
    }

    // Get activity remarks
    const remarks = await Activity.getRemarks(req.params.activityId);
    
    // Get activity attachments
    const attachments = await Activity.getAttachments(req.params.activityId);

    res.json({
      ...activity,
      remarks,
      attachments
    });
  } catch (error) {
    console.error('Get activity details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
