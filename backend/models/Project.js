

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Planning', 'Active', 'Completed'], default: 'Planning' },
  budget: Number,
  startDate: Date,
  endDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);