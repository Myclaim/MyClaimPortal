const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const Partner = require('./models/partner/Partner');
  
  const ketan = await Partner.findOne({ name: { $regex: /ketan/i } });
  const parth = await Partner.findOne({ name: { $regex: /parh/i } });
  
  if (ketan && parth) {
    ketan.parent_id = parth._id;
    await ketan.save();
    console.log('Fixed Ketan to have parent_id of Parth.');
  } else {
    console.log('Could not find Ketan or Parth');
  }
  
  process.exit(0);
}).catch(console.error);
