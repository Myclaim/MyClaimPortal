const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tag: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'account_balance_rounded',
    },
    colorHex: {
      type: String,
      default: '0xFF10B981',
    },
    bgLightHex: {
      type: String,
      default: '0xFFEDFDF5',
    },
    bgDarkHex: {
      type: String,
      default: '0xFF0D2118',
    },
    stats: {
      type: String,
      default: '',
    },
    estimatedTime: {
      type: String,
      default: '30 - 45 Days',
    },
    steps: [{ type: String }],
    documentsRequired: [{ type: String }],
    serviceMapping: {
      type: String,
      default: '',
    },
    actionLabel: {
      type: String,
      default: 'Apply Now',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
