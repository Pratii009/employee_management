const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');
const Report = require('../models/Report');

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
      stats,
      manager
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
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

router.put('/teammembers/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Manager only' });
  }

  try {
    const { fileDisposalRate, physicalProgress, suggestion } = req.body;

    const member = await TeamMember.findOneAndUpdate(
      { _id: req.params.id, managerId: req.user.id },
      {
        progress: physicalProgress,
        suggestion,
        kpi: {
          fileDisposalRate,
          physicalProgress
        }
      },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(member);
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