const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const TeamMember = require('../models/TeamMember');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager access required' });
  
  try {
    const tasks = await Task.find({ assignedBy: req.user._id })
      .populate('assignedTo', 'name role')
      .populate('assignedBy', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager access required' });
  
  try {
    const task = new Task({
      ...req.body,
      assignedBy: req.user._id
    });
    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name role')
      .populate('assignedBy', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;