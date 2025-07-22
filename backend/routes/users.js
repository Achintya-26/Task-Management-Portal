const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all users (for admin to add team members)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users by empId or name
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const query = req.params.query;
    const filteredUsers = await User.searchUsers(query);
    
    res.json(filteredUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
