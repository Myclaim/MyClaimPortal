const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const Partner = require('./models/partner/Partner');
  
  const ketan = await Partner.findOne({ name: { $regex: /ketan/i } });
  console.log('Ketan role:', ketan ? ketan.role : 'not found');
  
  process.exit(0);
}).catch(console.error);
