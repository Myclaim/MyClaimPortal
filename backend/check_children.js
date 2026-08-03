const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const Partner = require('./models/partner/Partner');
  
  const parth = await Partner.findOne({ name: { $regex: /parh/i } });
  
  if (parth) {
    const children = await Partner.find({ parent_id: parth._id });
    console.log('Super Partner:', { id: parth._id, name: parth.name });
    console.log('Children:', children.map(c => ({ id: c._id, name: c.name, parent_id: c.parent_id })));
  } else {
    console.log('Parh not found in DB');
  }
  
  process.exit(0);
}).catch(console.error);
