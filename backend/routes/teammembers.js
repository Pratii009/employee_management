const express = require('express');
const auth = require('../middleware/auth');
const TeamMember = require('../models/TeamMember');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager access required' });
  
  try {
    const team = await TeamMember.find({ managerId: req.user._id }).populate('managerId', 'name');
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager access required' });
  
  try {
    const teamMember = new TeamMember({
      ...req.body,
      managerId: req.user._id,
      assignedBy: req.user._id
    });
    await teamMember.save();
    const populated = await TeamMember.findById(teamMember._id).populate('managerId', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;