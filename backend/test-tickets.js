const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const Client = require('./models/client/Client');

mongoose.connect('mongodb://127.0.0.1:27017/myclaim', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const tickets = await Ticket.find().populate({ path: 'client', select: 'name email phone', model: 'Client' }).limit(5).lean();
    console.log(JSON.stringify(tickets.map(t => t.client), null, 2));
    process.exit(0);
  });
