const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const Department = require('../models/Department');
const Project = require('../models/Project');
const User = require('../models/User');

router.get('/stats', async (req, res) => {
  try {
    const totalProgressAgg = await Project.aggregate([
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    const stats = {
      departments: await Department.countDocuments(),
      projects: await Project.countDocuments(),
      managers: await User.countDocuments({ role: 'manager' }),
      totalProgress: totalProgressAgg.length ? totalProgressAgg[0].avgProgress : 0
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'department',
          as: 'projects'
        }
      },
      { $addFields: { projectCount: { $size: '$projects' } } }
    ]);

    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/departments/:id/projects', async (req, res) => {
  try {
    const projects = await Project.find({ department: req.params.id })
      .populate('department', 'name')
      .populate('managerId', 'name email phone departmentId projectId');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/departments/:deptId/managers', async (req, res) => {
  try {
    const managers = await User.find({
      departmentId: req.params.deptId,
      role: 'manager'
    })
      .populate('departmentId', 'name')
      .populate('projectId', 'name description budget status')
      .select('name email departmentId projectId role');

    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/managers', async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' })
      .populate('departmentId', 'name')
      .populate('projectId', 'name description budget status')
      .select('name email departmentId projectId role');

    res.json(managers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { name, description, department, budget, status } = req.body;

    if (!department) {
      return res.status(400).json({ error: 'Department is required' });
    }

    const projectData = {
      name: name?.trim() || 'Untitled Project',
      description: description?.trim() || '',
      department,
      budget: Number(budget) || 0,
      status: status || 'Planning'
    };

    const project = new Project(projectData);
    await project.save();

    res.json({ success: true, project });
  } catch (err) {
    console.error('Project error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/managers', async (req, res) => {
  try {
    const { name, email, department, project } = req.body;

    if (!name || !email || !department || !project) {
      return res.status(400).json({
        error: 'Name, email, department and project are required'
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Manager already exists' });
    }

    const defaultPassword = 'Manager123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    const manager = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'manager',
      departmentId: department,
      projectId: project
    });

    res.json({
      success: true,
      manager,
      password: defaultPassword
    });
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/init', async (req, res) => {
  try {
    const depts = await Department.insertMany([
      { name: 'Ministry of Home Affairs', description: 'National Security' },
      { name: 'Ministry of Finance', description: 'Economic Development' },
      { name: 'Ministry of Defence', description: 'Military Infrastructure' }
    ]);

    await Project.insertMany([
      { name: 'Smart Border Surveillance', department: depts[0]._id, progress: 35 },
      { name: 'Digital India Portal', department: depts[1]._id, progress: 68 },
      { name: 'Army Housing Project', department: depts[2]._id, progress: 22 }
    ]);

    res.json({ message: 'Govt Demo Data Created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;