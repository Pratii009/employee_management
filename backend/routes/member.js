const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const Task = require('../models/Task');
const WorkEvidence = require('../models/WorkEvidence');

const allowedMemberRoles = ['employee', 'hq', 'supervisor', 'field_engineer'];

router.get('/dashboard', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const member = await User.findById(req.user.id)
      .populate('departmentId', 'name description')
      .populate('projectId', 'name description budget status');

    const tasks = await Task.find({ memberId: req.user.id })
      .populate('managerId', 'name email')
      .populate('memberId', 'name email')
      .sort({ createdAt: -1 });

    const evidences = await WorkEvidence.find({ uploadedBy: req.user.id })
      .populate('taskId', 'title status progress')
      .sort({ createdAt: -1 });

    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const avgProgress = totalTasks
      ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalTasks)
      : 0;

    res.json({
      member,
      tasks,
      evidences,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        avgProgress
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const member = await User.findById(req.user.id)
      .populate('departmentId', 'name description')
      .populate('projectId', 'name description budget status');

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tasks', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const tasks = await Task.find({ memberId: req.user.id })
      .populate('managerId', 'name email')
      .populate('memberId', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tasks/member', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const tasks = await Task.find({ memberId: req.user.id })
      .populate('managerId', 'name email')
      .populate('memberId', 'name email')
      .populate('projectId', 'name description status budget')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tasks/:id/progress', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const { progress, status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, memberId: req.user.id },
      {
        progress: Number(progress),
        status: status || (Number(progress) >= 100 ? 'completed' : 'in-progress'),
        completedAt: Number(progress) >= 100 ? new Date() : null
      },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/tasks/:id/status', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const { status, progress, evidence } = req.body;

    const updateData = {
      status: status || 'pending',
      progress: Number(progress || 0),
      evidence: evidence || ''
    };

    if (updateData.status === 'completed' || updateData.progress >= 100) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
      updateData.progress = 100;
    } else if (updateData.status === 'in-progress') {
      updateData.status = 'in-progress';
    } else {
      updateData.status = 'pending';
      updateData.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, memberId: req.user.id },
      updateData,
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evidence', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const { taskId, title, notes, fileUrl, fileName, fileType } = req.body;

    const task = await Task.findOne({ _id: taskId, memberId: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const evidence = new WorkEvidence({
      taskId,
      uploadedBy: req.user.id,
      title,
      notes,
      fileUrl,
      fileName,
      fileType
    });

    await evidence.save();

    res.json({ success: true, evidence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/evidence', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const evidence = await WorkEvidence.find({ uploadedBy: req.user.id })
      .populate('taskId', 'title status progress')
      .sort({ createdAt: -1 });

    res.json(evidence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/notifications', auth, async (req, res) => {
  try {
    if (!allowedMemberRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Member only' });
    }

    const tasks = await Task.find({ memberId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5);

    const notifications = tasks.map((task) => ({
      _id: task._id,
      type: task.status === 'completed' ? 'success' : 'info',
      message: `Task "${task.title}" is currently ${task.status}.`,
      createdAt: task.updatedAt
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;