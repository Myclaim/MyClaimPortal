const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  exchange: {
    type: String,
    enum: ['NSE', 'BSE', 'ALL'],
    required: true
  },
  status: {
    type: String,
    enum: ['STARTED', 'SUCCESS', 'PARTIAL', 'FAILED'],
    required: true
  },
  recordsProcessed: {
    type: Number,
    default: 0
  },
  recordsInserted: {
    type: Number,
    default: 0
  },
  recordsUpdated: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SyncLog', syncLogSchema);
