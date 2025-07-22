const express = require('express');
const Domain = require('../models/Domain');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all domains
router.get('/', authenticateToken, async (req, res) => {
  try {
    const domains = await Domain.findAll();
    res.json(domains);
  } catch (error) {
    console.error('Get domains error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new domain (admin only)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Domain name is required' });
    }

    const newDomain = await Domain.create({ name, description });

    res.status(201).json({
      message: 'Domain created successfully',
      domain: newDomain
    });
  } catch (error) {
    console.error('Create domain error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Domain already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Update domain (admin only)
router.put('/:domainId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { domainId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Domain name is required' });
    }

    const updatedDomain = await Domain.update(domainId, { name, description });
    if (!updatedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    res.json({
      message: 'Domain updated successfully',
      domain: updatedDomain
    });
  } catch (error) {
    console.error('Update domain error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ message: 'Domain with this name already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Delete domain (admin only)
router.delete('/:domainId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { domainId } = req.params;

    const deletedDomain = await Domain.delete(domainId);
    if (!deletedDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    res.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('Delete domain error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
