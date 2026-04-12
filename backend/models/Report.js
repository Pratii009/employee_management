const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  kpis: {
    hq: {
      fileDisposalRate: Number,
      turnaroundTime: Number,
      digitalAdoption: Number
    },
    field: {
      surveyAccuracy: Number,
      physicalProgress: Number,
      expenditureVsTarget: Number
    }
  },
  notes: String,
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);