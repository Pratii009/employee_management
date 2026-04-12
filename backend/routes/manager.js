// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const User = require('../models/User'); // Your User model
// const Task = require('../models/Task'); // Create Task model if not exists

// // GET current user profile
// router.get('/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // GET manager's team members
// router.get('/team', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'manager') {
//       return res.status(403).json({ msg: 'Manager access required' });
//     }
//     const members = await User.find({ role: { $ne: 'manager' } }).select('-password');
//     res.json(members);
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // ADD new team member
// router.post('/team', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'manager') {
//       return res.status(403).json({ msg: 'Manager access required' });
//     }
    
//     const { name, email, phone, role, department } = req.body;
    
//     // Check if email exists
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ msg: 'User already exists' });
//     }
    
//     // Create new user
//     user = new User({
//       name,
//       email,
//       phone: phone || '',
//       role: role || 'employee',
//       department: department || ''
//     });
    
//     await user.save();
//     res.status(201).json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // DELETE team member
// router.delete('/team/:id', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'manager') {
//       return res.status(403).json({ msg: 'Manager access required' });
//     }
    
//     const user = await User.findById(req.params.id);
//     if (!user || user.role === 'manager') {
//       return res.status(400).json({ msg: 'Member not found' });
//     }
    
//     await user.remove();
//     res.json({ msg: 'Member removed' });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // GET manager's tasks
// router.get('/tasks', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'manager') {
//       return res.status(403).json({ msg: 'Manager access required' });
//     }
    
//     // Mock tasks data (replace with your Task model)
//     const mockTasks = [
//       { _id: '1', title: 'Complete project report', assignedTo: { name: 'John Doe' }, status: 'completed', dueDate: '2026-04-10' },
//       { _id: '2', title: 'Review code', assignedTo: { name: 'Jane Smith' }, status: 'pending', dueDate: '2026-04-15' },
//       { _id: '3', title: 'Client meeting', assignedTo: { name: 'John Doe' }, status: 'in-progress', dueDate: '2026-04-12' }
//     ];
    
//     res.json(mockTasks);
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // GET manager stats
// router.get('/stats', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'manager') {
//       return res.status(403).json({ msg: 'Manager access required' });
//     }
    
//     const membersCount = await User.countDocuments({ role: { $ne: 'manager' } });
    
//     res.json({
//       totalMembers: membersCount,
//       totalTasks: 25,
//       completed: 18
//     });
//   } catch (err) {
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');

// FIXED: Manager dashboard - populate everything
router.get('/dashboard', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager only' });
  
  try {
    // Manager's projects
    const projects = await Project.find({ managerId: req.user.id })
      .populate('departmentId', 'name description');
    
    // Manager's team members
    const teamMembers = await TeamMember.find({ managerId: req.user.id });
    
    // Stats
    const stats = {
      projects: projects.length,
      teamMembers: teamMembers.length,
      avgProgress: teamMembers.length ? Math.round(teamMembers.reduce((sum, m) => sum + (m.progress || 0), 0) / teamMembers.length) : 0
    };
    
    res.json({
      projects,
      teamMembers,
      stats,
      manager: {
        ...req.user.toObject(),
        department: req.user.departmentId ? await User.populate(req.user, 'departmentId') : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profile with full details
router.get('/profile', auth, async (req, res) => {
  try {
    const manager = await User.findById(req.user.id)
      .populate('departmentId', 'name')
      .populate('assignedProjects', 'name status');
    res.json(manager);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add team member - FIXED
router.post('/teammembers', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager only' });
  
  try {
    const teamMember = new TeamMember({
      ...req.body,
      managerId: req.user.id
    });
    await teamMember.save();
    res.json(teamMember);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ FIXED: Update member KPI + Suggestion
router.put('/teammembers/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ error: 'Manager only' });
  
  try {
    const updates = {
      progress: req.body.progress,
      kpis: req.body.kpis || {},
      suggestion: req.body.suggestion
    };
    
    const member = await TeamMember.findOneAndUpdate(
      { _id: req.params.id, managerId: req.user.id },
      { $set: updates },
      { new: true }
    ).populate('projects');
    
    if (!member) return res.status(404).json({ error: 'Member not found' });
    
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;