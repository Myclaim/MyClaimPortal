const mongoose = require('mongoose');
const Client = require('./models/client/Client');
const Partner = require('./models/partner/Partner');

mongoose.connect('mongodb://127.0.0.1:27017/myclaim', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const clients = await Client.find({});
    console.log("Total Clients:", clients.length);
    clients.forEach(c => {
      console.log(`Client: ${c.name}, Role: ${c.role}, Parent ID: ${c.parent_id}`);
    });
    
    const partners = await Partner.find({});
    console.log("Total Partners:", partners.length);
    partners.forEach(p => {
      console.log(`Partner: ${p.name}, Role: ${p.role}, ID: ${p._id}`);
    });
    process.exit(0);
  });
