const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['employee', 'team', 'staff'], 
    default: 'employee' 
  },
  phone: { type: String },
  department: { type: String },
  /** Job title / responsibilities from the "Roles" form field */
  designation: { type: String },
  /** Comma-separated skills from the employee form */
  skills: { type: String },
  specialization: { type: String },
  is_active: { type: Boolean, default: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
