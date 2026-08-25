const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isin: {
    type: String,
    index: true,
    unique: true, // We'll use ISIN as the unique identifier where possible
    sparse: true // Allow nulls if ISIN is missing from one of the exchanges
  },
  nseSymbol: {
    type: String,
    index: true
  },
  bseScripCode: {
    type: String,
    index: true
  },
  bseScripId: {
    type: String
  },
  exchanges: [{
    type: String,
    enum: ['NSE', 'BSE']
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
