const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
<<<<<<< HEAD
  // role: { 
  //   type: String, 
  //   enum: ['admin', 'hq_staff', 'field_engineer', 'manager','employee'],
  //   default: 'hq_staff'
  // },
  // Add to your existing User schema:
role: { 
  type: String,
   enum: ['admin', 'manager', 'hq', 'supervisor', 'employee'], default: 'employee' },
department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
=======
  role: { 
    type: String, 
    enum: ['admin', 'hq_staff', 'field_engineer', 'manager'],
    default: 'hq_staff'
  },
>>>>>>> 7a1e57a (added)
  unit: { type: String, default: 'Headquarters' }
}, { timestamps: true });

// FIXED: Simple password hashing (no middleware)
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

<<<<<<< HEAD


=======
