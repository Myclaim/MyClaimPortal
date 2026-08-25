const mongoose = require('mongoose');

const proposalSchema = mongoose.Schema({
  clientName: { type: String, required: true },
  serviceRequest: { type: String, required: true },
  category: { type: String },
  priority: { type: String },
  sendToUserType: { type: String },
  assignUserName: { type: String },
  superPartner: { type: String },
  partner: { type: String },
  admin: { type: String },
  status: { type: String, default: 'Draft' }, // Draft, Active, Under Review, Converted
  attachmentPath: { type: String },
  notes: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);
module.exports = Proposal;
