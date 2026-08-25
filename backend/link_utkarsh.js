const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const Partner = require('./models/partner/Partner');
  
  const parth = await Partner.findOne({ name: { $regex: /parh|parth/i }, role: 'super_partner' });
  const utkarsh = await Partner.findOne({ name: { $regex: /utkarsh/i } });
  
  if (!parth) {
    console.log('Super Partner Parth not found!');
  }
  
  if (!utkarsh) {
    console.log('Partner Utkarsh not found! You might need to create him first.');
  }
  
  if (parth && utkarsh) {
    utkarsh.parent_id = parth._id;
    await utkarsh.save();
    console.log(`Success! Partner '${utkarsh.name}' is now assigned under Super Partner '${parth.name}'`);
  }
  
  process.exit(0);
}).catch(console.error);
