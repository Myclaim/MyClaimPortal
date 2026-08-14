const mongoose = require('mongoose');

const preIPOSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Pre-IPO Equity' },
    subCategory: { type: String }, // e.g., Food Tech, Fintech
    price: { type: Number, required: true },
    totalEquity: { type: Number, required: true },
    availableEquity: { type: Number, required: true },
    stages: { type: Number, default: 4 },
    status: { type: Boolean, default: true },
    mappedStore: { type: String, default: 'All Stores' },
    description: { type: String },
    tracking: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PreIPO', preIPOSchema);
