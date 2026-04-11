const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); // Your User model
const Task = require('../models/Task'); // Create Task model if not exists

// GET current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET manager's team members
router.get('/team', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Manager access required' });
    }
    const members = await User.find({ role: { $ne: 'manager' } }).select('-password');
    res.json(members);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ADD new team member
router.post('/team', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Manager access required' });
    }
    
    const { name, email, phone, role, department } = req.body;
    
    // Check if email exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      phone: phone || '',
      role: role || 'employee',
      department: department || ''
    });
    
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE team member
router.delete('/team/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Manager access required' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'manager') {
      return res.status(400).json({ msg: 'Member not found' });
    }
    
    await user.remove();
    res.json({ msg: 'Member removed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET manager's tasks
router.get('/tasks', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Manager access required' });
    }
    
    // Mock tasks data (replace with your Task model)
    const mockTasks = [
      { _id: '1', title: 'Complete project report', assignedTo: { name: 'John Doe' }, status: 'completed', dueDate: '2026-04-10' },
      { _id: '2', title: 'Review code', assignedTo: { name: 'Jane Smith' }, status: 'pending', dueDate: '2026-04-15' },
      { _id: '3', title: 'Client meeting', assignedTo: { name: 'John Doe' }, status: 'in-progress', dueDate: '2026-04-12' }
    ];
    
    res.json(mockTasks);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET manager stats
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Manager access required' });
    }
    
    const membersCount = await User.countDocuments({ role: { $ne: 'manager' } });
    
    res.json({
      totalMembers: membersCount,
      totalTasks: 25,
      completed: 18
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;