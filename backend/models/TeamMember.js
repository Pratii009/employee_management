// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const teamMemberSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['hq_staff', 'field_engineer', 'supervisor'], required: true },
//   age: { type: Number, required: true },
//   phone: String,
//   assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
// }, { timestamps: true });

// teamMemberSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// module.exports = mongoose.model('TeamMember', teamMemberSchema);

const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: {
    type: String,
    enum: ['hq', 'supervisor', 'employee', 'field_engineer', 'technician'],
    required: true
  },
  progress: { type: Number, min: 0, max: 100 },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  suggestion: String,
  kpis: {
    hq: { fileDisposalRate: Number, turnaroundTime: Number },
    field: { surveyAccuracy: Number, physicalProgress: Number }
  }
});



module.exports = mongoose.model('TeamMember', teamMemberSchema);