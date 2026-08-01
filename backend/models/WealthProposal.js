const mongoose = require('mongoose');

const wealthProposalSchema = new mongoose.Schema({
  proposalId: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  product: { type: String, required: true },
  scheme: { type: String, required: true },
  investmentType: { type: String, enum: ['SIP', 'Lumpsum'], default: 'SIP' },
  amount: { type: String, required: true },
  tenure: { type: String, default: '5 Years' },
  status: { type: String, enum: ['Draft', 'Shared', 'Viewed', 'Accepted', 'Rejected'], default: 'Shared' },
  advisorName: { type: String, default: 'Partner Advisor' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('WealthProposal', wealthProposalSchema);
