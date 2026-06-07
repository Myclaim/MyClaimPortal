const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
mongoose.connect('mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const t = await Ticket.find({});
  console.log(t.map(x => ({ id: x._id, status: x.status, progress: x.progress })));
  process.exit(0);
});
