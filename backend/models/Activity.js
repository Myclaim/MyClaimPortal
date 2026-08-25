const mongoose = require('mongoose');

const activitySchema = mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.post('save', function(doc) {
  if (global.io) {
    global.io.emit('activity_created', doc);
  }
});

module.exports = mongoose.model('Activity', activitySchema);
