const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { teams, users, notifications } = require('../data/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all teams
router.get('/', authenticateToken, (req, res) => {
  try {
    let userTeams = teams;
    
    // If user is not admin, only show teams they are part of
    if (req.user.role !== 'admin') {
      userTeams = teams.filter(team => 
        team.members.some(member => member.userId === req.user.id)
      );
    }
    
    res.json(userTeams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new team (admin only)
router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    const { name, description, domainId } = req.body;

    if (!name || !domainId) {
      return res.status(400).json({ message: 'Team name and domain are required' });
    }

    const newTeam = {
      id: uuidv4(),
      name,
      description: description || '',
      domainId,
      members: [],
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    teams.push(newTeam);

    // Create notification for team creation
    const notification = {
      id: uuidv4(),
      type: 'team_created',
      title: 'New Team Created',
      message: `Team "${name}" has been created`,
      userId: req.user.id,
      teamId: newTeam.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(notification);

    res.status(201).json({
      message: 'Team created successfully',
      team: newTeam
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add member to team (admin only)
router.post('/:teamId/members', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    const { teamId } = req.params;
    const { userIds } = req.body;

    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Add users to team
    userIds.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (user && !team.members.some(m => m.userId === userId)) {
        team.members.push({
          userId: user.id,
          empId: user.empId,
          name: user.name,
          addedAt: new Date().toISOString()
        });

        // Create notification for user
        const notification = {
          id: uuidv4(),
          type: 'team_member_added',
          title: 'Added to Team',
          message: `You have been added to team "${team.name}"`,
          userId: user.id,
          teamId: team.id,
          read: false,
          createdAt: new Date().toISOString()
        };
        notifications.push(notification);
      }
    });

    team.updatedAt = new Date().toISOString();

    // Emit socket event
    req.io.to(`team-${teamId}`).emit('team_updated', team);

    res.json({
      message: 'Members added successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove member from team (admin only)
router.delete('/:teamId/members/:userId', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.members = team.members.filter(m => m.userId !== userId);
    team.updatedAt = new Date().toISOString();

    // Create notification for removed user
    const user = users.find(u => u.id === userId);
    if (user) {
      const notification = {
        id: uuidv4(),
        type: 'team_member_removed',
        title: 'Removed from Team',
        message: `You have been removed from team "${team.name}"`,
        userId: user.id,
        teamId: team.id,
        read: false,
        createdAt: new Date().toISOString()
      };
      notifications.push(notification);
    }

    // Emit socket event
    req.io.to(`team-${teamId}`).emit('team_updated', team);

    res.json({
      message: 'Member removed successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team details
router.get('/:teamId', authenticateToken, (req, res) => {
  try {
    const team = teams.find(t => t.id === req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user has access to this team
    if (req.user.role !== 'admin' && !team.members.some(m => m.userId === req.user.id)) {
      return res.status(403).json({ message: 'Access denied to this team' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
