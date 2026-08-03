const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myclaim').then(async () => {
  const Partner = require('./models/partner/Partner');
  
  // Find partners who have a referredById but NO parent_id
  const usersToUpdate = await Partner.find({ 
    referredById: { $exists: true, $ne: '' } 
  });
  
  console.log(`Found ${usersToUpdate.length} partners to check.`);
  let fixedCount = 0;
  for (const u of usersToUpdate) {
    if (!u.parent_id && mongoose.Types.ObjectId.isValid(u.referredById)) {
      u.parent_id = u.referredById;
      await u.save();
      console.log(`Updated partner ${u.email} to have parent_id ${u.parent_id}`);
      fixedCount++;
    }
  }
  
  console.log(`Done fixing partners! Fixed: ${fixedCount}`);
  process.exit(0);
}).catch(console.error);
