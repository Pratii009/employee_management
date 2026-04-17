const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const MemberTask = require('../models/MemberTask');
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

    const tasks = await MemberTask.find({ assignedTo: req.user.id })
      .populate('assignedBy', 'name email')
      .populate('departmentId', 'name')
      .populate('projectId', 'name description status budget')
      .sort({ createdAt: -1 });

    const evidences = await WorkEvidence.find({ uploadedBy: req.user.id })
      .populate('taskId', 'title status progress')
      .sort({ createdAt: -1 });

    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const totalTasks = tasks.length;
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
        pendingTasks: totalTasks - completedTasks,
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

    const tasks = await MemberTask.find({ assignedTo: req.user.id })
      .populate('assignedBy', 'name email')
      .populate('departmentId', 'name')
      .populate('projectId', 'name description status budget')
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

    const task = await MemberTask.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user.id },
      {
        progress: Number(progress),
        status: status || (Number(progress) >= 100 ? 'Completed' : 'In Progress')
      },
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

    const task = await MemberTask.findOne({ _id: taskId, assignedTo: req.user.id });
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

    await MemberTask.findByIdAndUpdate(taskId, {
      evidenceCount: (task.evidenceCount || 0) + 1
    });

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

    const tasks = await MemberTask.find({ assignedTo: req.user.id }).sort({ updatedAt: -1 }).limit(5);

    const notifications = tasks.map((task) => ({
      _id: task._id,
      type: task.status === 'Completed' ? 'success' : 'info',
      message: `Task "${task.title}" is currently ${task.status}.`,
      createdAt: task.updatedAt
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;