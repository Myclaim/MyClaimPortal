const mongoose = require('mongoose');

const partnerSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['partner', 'super_partner'], default: 'partner' },
  companyName: { type: String },
  representative: { type: String },
  profession: { type: String },
  city: { type: String },
  entity: { type: String },
  category: { type: String },
  phone: { type: String },
  parent_id: { type: mongoose.Schema.Types.ObjectId, index: true },
  client_id_ref: { type: String, unique: true, sparse: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);
