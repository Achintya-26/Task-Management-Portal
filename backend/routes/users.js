const express = require('express');
const { users } = require('../data/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all users (for admin to add team members)
router.get('/', authenticateToken, (req, res) => {
  try {
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search users by empId or name
router.get('/search/:query', authenticateToken, (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const filteredUsers = users
      .filter(user => 
        user.empId.toLowerCase().includes(query) || 
        user.name.toLowerCase().includes(query)
      )
      .map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    
    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
