const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
mongoose.connect('mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const t = await Ticket.create({
    client: new mongoose.Types.ObjectId(),
    service: "Test Service",
    status: "active"
  });
  console.log("Created:", t.progress);
  process.exit(0);
});
