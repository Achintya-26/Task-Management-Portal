const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all teams
router.get('/', authenticateToken, async (req, res) => {
  try {
    let userTeams;
    
    // If user is not admin, only show teams they are part of
    if (req.user.role !== 'admin') {
      userTeams = await User.getUserTeams(req.user.userId);
    } else {
      userTeams = await Team.findAll();
    }
    
    res.json(userTeams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new team (admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, description, domainId, initialMembers } = req.body;

    if (!name || !domainId) {
      return res.status(400).json({ message: 'Team name and domain are required' });
    }

    console.log('Creating team with user:', req.user); // Debug log

    // Create new team using the database model
    const newTeam = await Team.create({
      name,
      description: description || '',
      domainId,
      createdBy: req.user.userId
    });

    // Add initial members if provided
    if (initialMembers && initialMembers.length > 0) {
      for (const userId of initialMembers) {
        try {
          await Team.addMember(newTeam.id, userId);
          
          // Create notification for user
          await Notification.create({
            userId: userId,
            title: 'Added to Team',
            message: `You have been added to team "${name}"`,
            type: 'info',
            relatedTeamId: newTeam.id
          });
        } catch (error) {
          console.error(`Error adding member ${userId} to team:`, error);
          // Continue with other members even if one fails
        }
      }
    }

    // Create notification for team creation
    await Notification.create({
      userId: req.user.userId,
      title: 'New Team Created',
      message: `Team "${name}" has been created${initialMembers && initialMembers.length > 0 ? ` with ${initialMembers.length} members` : ''}`,
      type: 'success',
      relatedTeamId: newTeam.id
    });

    // Get the complete team with members for response
    const completeTeam = await Team.findById(newTeam.id);

    res.status(201).json({
      message: 'Team created successfully',
      team: completeTeam
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add member to team (admin only)
router.post('/:teamId/members', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userIds } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Add users to team
    for (const userId of userIds) {
      try {
        await Team.addMember(teamId, userId);
        
        // Create notification for user
        await Notification.create({
          userId: userId,
          title: 'Added to Team',
          message: `You have been added to team "${team.name}"`,
          type: 'info',
          relatedTeamId: teamId
        });
      } catch (error) {
        if (error.message.includes('already a member')) {
          continue; // Skip if user is already a member
        }
        throw error;
      }
    }

    // Get updated team with members
    const updatedTeam = await Team.findById(teamId);
    const members = await Team.getMembers(teamId);
    updatedTeam.members = members;

    // Emit socket event
    if (req.io) {
      req.io.to(`team-${teamId}`).emit('team_updated', updatedTeam);
    }

    res.json({
      message: 'Members added successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove member from team (admin only)
router.delete('/:teamId/members/:userId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const removedMember = await Team.removeMember(teamId, userId);
    if (!removedMember) {
      return res.status(404).json({ message: 'User is not a member of this team' });
    }

    // Create notification for removed user
    await Notification.create({
      userId: userId,
      title: 'Removed from Team',
      message: `You have been removed from team "${team.name}"`,
      type: 'warning',
      relatedTeamId: teamId
    });

    // Get updated team with members
    const updatedTeam = await Team.findById(teamId);
    const members = await Team.getMembers(teamId);
    updatedTeam.members = members;

    // Emit socket event
    if (req.io) {
      req.io.to(`team-${teamId}`).emit('team_updated', updatedTeam);
    }

    res.json({
      message: 'Member removed successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get team details
router.get('/:teamId', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user has access to this team
    if (req.user.role !== 'admin') {
      const userTeams = await User.getUserTeams(req.user.userId);
      const hasAccess = userTeams.some(t => t.id === req.params.teamId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this team' });
      }
    }

    // Get team members and activities
    const members = await Team.getMembers(req.params.teamId);
    const activities = await Team.getActivities(req.params.teamId);
    
    team.members = members;
    team.activities = activities;

    res.json(team);
  } catch (error) {
    console.error('Get team details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
