const mongoose = require('mongoose');

const iepfReportRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    folioOrDpId: {
      type: String,
      default: '',
      trim: true,
    },
    companyName: {
      type: String,
      default: '',
      trim: true,
    },
    oldAddressProofName: {
      type: String,
      default: '',
    },
    shareDocsNames: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'report_generated', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IepfReportRequest', iepfReportRequestSchema);
