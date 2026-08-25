const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const Partner = require('./models/partner/Partner');
  
  const ketan = await Partner.findOne({ name: { $regex: /ketan/i } });
  const parth = await Partner.findOne({ name: { $regex: /parth/i } });
  
  console.log('Ketan:', ketan ? { id: ketan._id, name: ketan.name, parent_id: ketan.parent_id, referredById: ketan.referredById } : 'Not found');
  console.log('Parth:', parth ? { id: parth._id, name: parth.name, parent_id: parth.parent_id, referredById: parth.referredById } : 'Not found');
  
  process.exit(0);
}).catch(console.error);
