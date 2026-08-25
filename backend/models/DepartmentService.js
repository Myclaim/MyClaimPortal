const mongoose = require('mongoose');

const departmentServiceSchema = mongoose.Schema({
  type: { type: String, enum: ['claim', 'service', 'store'], required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  category: { type: String },
  subCategory: { type: String },
  price: { type: Number, default: 0 },
  stages: { type: Number, default: 1 },
  status: { type: Boolean, default: true },
  mappedStore: { type: String },
  description: { type: String },
  tracking: { type: [String], default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('DepartmentService', departmentServiceSchema);
