const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

router.post('/assign', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Manager only' });
    }

    const {
      title,
      description,
      weekStart,
      weekEnd,
      memberId
    } = req.body;

    if (!title || !weekStart || !weekEnd || !memberId) {
      return res.status(400).json({ error: 'Title, week dates, and member are required' });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const task = new Task({
      title,
      description: description || '',
      weekStart,
      weekEnd,
      memberId,
      managerId: req.user.id,
      status: 'pending',
      progress: 0
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/member', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ memberId: req.user.id })
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/manager', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Manager only' });
    }

    const tasks = await Task.find({ managerId: req.user.id })
      .populate('memberId', 'name email role')
      .sort({ createdAt: -1 });

    const summary = tasks.reduce(
      (acc, task) => {
        if (task.status === 'completed') acc.completed += 1;
        if (task.status === 'pending') acc.pending += 1;
        if (task.status === 'in-progress') acc.inProgress += 1;
        acc.totalProgress += task.progress || 0;
        return acc;
      },
      { completed: 0, pending: 0, inProgress: 0, totalProgress: 0 }
    );

    res.json({
      tasks,
      summary: {
        ...summary,
        averageProgress: tasks.length ? Math.round(summary.totalProgress / tasks.length) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, progress, evidence } = req.body;

    const task = await Task.findOne({ _id: req.params.id, memberId: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status || task.status;
    if (typeof progress === 'number') task.progress = progress;
    if (evidence !== undefined) task.evidence = evidence;

    if (task.status === 'completed') {
      task.progress = 100;
      task.completedAt = new Date();
    } else if (task.status === 'pending') {
      task.completedAt = null;
      if (typeof progress !== 'number') task.progress = 0;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;