


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');
const Report = require('../models/Report');

const Task = require('../models/Task');
const WorkEvidence = require('../models/WorkEvidence');


router.post('/add-member', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Manager only' });
    }

    const {
      name,
      email,
      role,
      unit,
      departmentId,
      projectId,
      phone,
      progress,
      kpi,
      suggestion
    } = req.body;


      const allowedMemberRoles = ['hq', 'supervisor', 'employee', 'field_engineer', 'technician'];

    if (!allowedMemberRoles.includes(role || 'employee')) {
      return res.status(400).json({ error: 'Invalid member role' });
    }
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const memberExists = await TeamMember.findOne({ email });
    if (memberExists) {
      return res.status(400).json({ error: 'Team member already exists' });
    }

    const defaultPassword = 'member123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    

  const user = new User({
  name,
  email,
  password: hashedPassword,
  role: 'employee',
  unit: unit || 'Headquarters',
  departmentId: departmentId || null,
  projectId: projectId || null,
  phone: phone || '',
  assignedProjects: []
});

    await user.save();

    const member = new TeamMember({
      name,
      email,
      role: role || 'employee',
      progress: progress || 0,
      kpi: kpi || {},
      suggestion: suggestion || '',
      managerId: req.user.id
    });

    await member.save();

    res.status(201).json({
      message: 'Member created successfully',
      user,
      member
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/dashboard', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Manager only' });
  }

  try {
    const manager = await User.findById(req.user.id)
      .populate('departmentId', 'name description')
      .populate('projectId', 'name description budget status');

    const projects = manager?.projectId ? [manager.projectId] : [];
    const teamMembers = await TeamMember.find({ managerId: req.user.id });
    const members = await User.find({ role: 'employee' }).select('_id name email role');

    const stats = {
      projects: projects.length,
      teamMembers: teamMembers.length,
      avgProgress: teamMembers.length
        ? Math.round(teamMembers.reduce((sum, m) => sum + (m.progress || 0), 0) / teamMembers.length)
        : 0
    };

    res.json({
      projects,
      teamMembers,
      members,
      stats,
      manager
      
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Manager only' });
    }

    const manager = await User.findById(req.user.id)
      .populate('departmentId', 'name description')
      .populate('projectId', 'name description budget status');

    res.json(manager);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teammembers', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Manager only' });
  }

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
router.get('/teammembers/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Manager only' });
    }

    const teamMember = await TeamMember.findOne({ _id: req.params.id, managerId: req.user.id });
    if (!teamMember) return res.status(404).json({ error: 'Member not found' });

    const member = await User.findOne({ email: teamMember.email })
      .populate('departmentId', 'name description')
      .populate('projectId', 'name description budget status');

    if (!member) return res.status(404).json({ error: 'User not found' });

    const tasks = await Task.find({ memberId: member._id })
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    const evidences = await WorkEvidence.find({ uploadedBy: member._id })
      .populate('taskId', 'title status progress')
      .sort({ createdAt: -1 });

    const avgProgress = tasks.length
      ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length)
      : 0;

    res.json({
      member,
      teamMember,
      tasks,
      evidences,
      avgProgress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/reports', auth, async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;