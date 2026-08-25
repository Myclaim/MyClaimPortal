const mongoose = require('mongoose');

const adminSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'super_admin', 'claim_admin', 'service_admin', 'store_admin'],
    default: 'admin' 
  },
  client_id_ref: { type: String, unique: true, sparse: true },
  phone: { type: String },
  department: { type: String },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
