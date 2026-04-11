const express = require('express');
const KPI = require('../models/KPI');
const router = express.Router();

// Get user KPIs
router.get('/my-kpis', async (req, res) => {
  try {
    const kpis = await KPI.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update KPI (employee logs progress)
router.post('/update-kpi', async (req, res) => {
  try {
    const { metrics, category } = req.body;
    
    // Calculate weighted score (example weights)
    const totalScore = metrics.reduce((sum, metric) => {
      const weight = metric.name.includes('timeliness') ? 0.4 : 0.3;
      return sum + (metric.score * weight);
    }, 0) * 100;

    const kpi = new KPI({
      userId: req.userId,
      category,
      metrics,
      totalScore: Math.round(totalScore)
    });

    await kpi.save();
    res.json({ message: 'KPI updated', score: totalScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
