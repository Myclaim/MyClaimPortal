const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const User = require('./models/User');
  const Admin = require('./models/admin/Admin');
  const Partner = require('./models/partner/Partner');
  
  const parthUsers = await Promise.all([
    User.find({ name: { $regex: /parth/i } }),
    Admin.find({ name: { $regex: /parth/i } }),
    Partner.find({ name: { $regex: /parth/i } }),
  ]);
  
  console.log('Parth in User:', parthUsers[0].map(u => ({ id: u._id, name: u.name, role: u.role })));
  console.log('Parth in Admin:', parthUsers[1].map(u => ({ id: u._id, name: u.name, role: u.role })));
  console.log('Parth in Partner:', parthUsers[2].map(u => ({ id: u._id, name: u.name, role: u.role })));
  
  process.exit(0);
}).catch(console.error);
