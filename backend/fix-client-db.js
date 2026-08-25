const mongoose = require('mongoose');
const Client = require('./models/client/Client');

mongoose.connect('mongodb://127.0.0.1:27017/myclaim', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    // find the client and update parent_id to the partner's ID
    const partnerId = '69e7424e6e9a685d4214b07f';
    const result = await Client.updateOne({ name: 'Client User' }, { $set: { parent_id: partnerId } });
    console.log("Updated client:", result);
    process.exit(0);
  });
