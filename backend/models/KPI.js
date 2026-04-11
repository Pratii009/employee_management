const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['hq_staff', 'field_engineer'], required: true },
  metrics: [{
    name: String,
    target: Number,
    achieved: Number,
    score: Number
  }],
  totalScore: { type: Number, default: 0 }, // Weighted score out of 100
  period: { type: String, default: 'Monthly' }, // Monthly/Quarterly
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('KPI', kpiSchema);
