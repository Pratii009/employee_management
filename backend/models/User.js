

// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, trim: true, lowercase: true },
//     password: { type: String, required: true },
//     role: {
//       type: String,
//       enum: ['admin', 'manager', 'hq', 'supervisor', 'employee', 'field_engineer'],
//       default: 'employee'
//     },
//     departmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Department',
//       default: null
//     },
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Project',
//       default: null
//     },
//     assignedProjects: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Project'
//       }
//     ],
//     unit: {
//       type: String,
//       default: 'Headquarters'
//     },
//     phone: {
//       type: String,
//       default: ''
//     }
//   },
//   { timestamps: true }
// );

// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'manager', 'hq', 'supervisor', 'employee', 'field_engineer'],
      default: 'employee'
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      }
    ],
    unit: {
      type: String,
      default: 'Headquarters'
    },
    phone: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);