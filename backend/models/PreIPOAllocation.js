const mongoose = require('mongoose');

const preIPOAllocationSchema = new mongoose.Schema(
  {
    preIpo: { type: mongoose.Schema.Types.ObjectId, ref: 'PreIPO', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceAtAllocation: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    status: { type: String, enum: ['Allocated', 'Pending', 'Cancelled'], default: 'Allocated' },
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PreIPOAllocation', preIPOAllocationSchema);
