const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },  // ✅ Keep your field name
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Planning', 'Active', 'Completed'], default: 'Planning' },
  budget: Number,
  startDate: Date,
  endDate: Date,
  // ✅ ADD these for dashboard:
  expectedDuration: { type: Number, default: 0 },  // days
  progress: { type: Number, default: 0, min: 0, max: 100 },  // %
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // Multiple managers
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);