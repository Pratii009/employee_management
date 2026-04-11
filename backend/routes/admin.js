const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Department = require('../models/Department');
const Project = require('../models/Project');
const User = require('../models/User');

// ✅ FIXED: Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      departments: await Department.countDocuments(),
      projects: await Project.countDocuments(),
      managers: await User.countDocuments({ role: 'manager' })
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED: All departments list
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find().populate({
      path: 'projects',
      select: 'name status',
      model: 'Project'
    });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED: Projects by department ID
router.get('/departments/:deptId/projects', async (req, res) => {
  try {
    const projects = await Project.find({ departmentId: req.params.deptId })
      .populate('managerId', 'name email')
      .populate('departmentId', 'name');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED: Get manager for department
router.get('/departments/:deptId/manager', async (req, res) => {
  try {
    const manager = await User.findOne({ 
      departmentId: req.params.deptId, 
      role: 'manager' 
    }).populate('departmentId', 'name');
    res.json(manager || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED: SINGLE Add manager (simple version for dashboard)
router.post('/managers', async (req, res) => {
  try {
    const { name, email, departmentId } = req.body;
    
    // Hash password (default for simplicity)
    const hashedPassword = await bcrypt.hash('manager123', 12);
    
    const manager = new User({ 
      name, 
      email, 
      password: hashedPassword,  // Default password
      role: 'manager', 
      departmentId  // ✅ Consistent field name
    });
    
    await manager.save();
    res.json({ success: true, manager });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ✅ FIXED: Add new project
router.post('/projects', async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      departmentId: req.body.departmentId  // ✅ Ensure correct field
    });
    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ✅ OPTIONAL: Your existing /init (commented out - use seed.js instead)
// router.post('/init', async (req, res) => { ... });

module.exports = router;