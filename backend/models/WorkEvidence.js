const mongoose = require('mongoose');

const workEvidenceSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'MemberTask', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileType: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkEvidence', workEvidenceSchema);