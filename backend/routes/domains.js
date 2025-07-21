const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { domains } = require('../data/database');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all domains
router.get('/', authenticateToken, (req, res) => {
  try {
    res.json(domains);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new domain (admin only)
router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Domain name is required' });
    }

    // Check if domain already exists
    const existingDomain = domains.find(domain => domain.name.toLowerCase() === name.toLowerCase());
    if (existingDomain) {
      return res.status(400).json({ message: 'Domain already exists' });
    }

    const newDomain = {
      id: uuidv4(),
      name,
      createdAt: new Date().toISOString()
    };

    domains.push(newDomain);

    res.status(201).json({
      message: 'Domain created successfully',
      domain: newDomain
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update domain (admin only)
router.put('/:domainId', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    const { domainId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Domain name is required' });
    }

    const domain = domains.find(d => d.id === domainId);
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    // Check if another domain with the same name exists
    const existingDomain = domains.find(d => d.id !== domainId && d.name.toLowerCase() === name.toLowerCase());
    if (existingDomain) {
      return res.status(400).json({ message: 'Domain with this name already exists' });
    }

    domain.name = name;
    domain.updatedAt = new Date().toISOString();

    res.json({
      message: 'Domain updated successfully',
      domain
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete domain (admin only)
router.delete('/:domainId', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    const { domainId } = req.params;

    const domainIndex = domains.findIndex(d => d.id === domainId);
    if (domainIndex === -1) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    domains.splice(domainIndex, 1);

    res.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
