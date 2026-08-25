const mongoose = require('mongoose');

const wealthPortfolioSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientName: { type: String, required: true },
  pan: { type: String, required: true },
  kyc: { type: String, enum: ['Verified', 'Pending Verification', 'Rejected'], default: 'Verified' },
  riskProfile: { type: String, enum: ['Aggressive', 'Moderate', 'Conservative'], default: 'Moderate' },
  aum: { type: Number, default: 0 }, // in Rupees
  sipAmount: { type: Number, default: 0 }, // monthly in Rupees
  goalsCount: { type: Number, default: 1 },
  phone: { type: String },
  email: { type: String },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('WealthPortfolio', wealthPortfolioSchema);
