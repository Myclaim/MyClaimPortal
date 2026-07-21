const mongoose = require('mongoose');

const documentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    linked_to: {
      type: String,
      enum: ['ticket', 'client', 'global'],
      required: true,
    },
    ticket_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    doc_category: {
      type: String,
      enum: ['primary', 'secondary', 'internal', 'company', 'legal'],
      default: 'secondary',
    },
    folder: {
      type: String,
      default: 'General',
    },
    folder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    uploaded_by: {

      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    verification_status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verification_notes: {
      type: String,
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
