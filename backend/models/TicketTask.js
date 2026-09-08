const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const ticketTaskSchema = mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: false },
    
    // Main Heading / Board Column
    boardColumn: {
      type: String,
      enum: ['Active', 'Pending', 'Completed'],
      default: 'Active'
    },

    status: {
      type: String,
      enum: ['Active', 'Completed', 'Pending'],
      default: 'Active'
    },

    type: {
      type: String,
      enum: ['Claim', 'Service', 'Store', 'Operational', 'Important', 'Design', 'High priority'],
      default: 'Service'
    },

    dateInitiated: { type: Date, default: Date.now },
    dueDate: { type: Date },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    dateCompleted: { type: Date },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    mainHeading: { type: String, default: '' },
    description: { type: String, default: '' },
    repeatTask: { type: String, default: 'Never' },
    subtasks: [subtaskSchema],
    
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    
    tags: [{ type: String }],

    estimatedTimeHours: { type: Number, default: 0 },
    spentTimeHours: { type: Number, default: 0 },
    
    timeBlocks: [
      {
        date: { type: Date, default: Date.now },
        hours: { type: Number, required: true },
        note: { type: String }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TicketTask', ticketTaskSchema);
