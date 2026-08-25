const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema(
  {
    ticketNo: { type: String, unique: true, sparse: true, index: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    hubType: { type: String, enum: ['Service Hub', 'Claim Hub', 'Store Hub', 'Support Hub'], default: 'Service Hub' },
    subject: { type: String, default: '' },
    companyName: { type: String, default: '' },
    service: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['active', 'in_process', 'completed', 'closed'],
      default: 'active',
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    shares: { type: Number, default: 0 },
    folio: { type: String, default: 'N/A' },
    isin: { type: String, default: 'N/A' },
    estValue: { type: String, default: 'N/A' },
    stages: [
      {
        name: { type: String },
        status: { type: String, enum: ['completed', 'in-progress', 'pending'], default: 'pending' },
        date: { type: String },
        subProgress: { type: Number, enum: [0, 25, 50, 75, 100], default: 0 }
      }
    ],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    creatorRole: { type: String },
    notes: { type: String, default: '' },
    dueDate: { type: Date },
    mappedStore: { type: String, default: 'All Stores' },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    isEscalated: { type: Boolean, default: false },
    escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
