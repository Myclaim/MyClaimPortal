const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
mongoose.connect('mongodb://127.0.0.1:27017/myclaim').then(async () => {
  await Ticket.updateMany({ progress: 100, status: { $ne: 'completed' }, status: { $ne: 'closed' } }, { progress: 0 });
  process.exit(0);
});
