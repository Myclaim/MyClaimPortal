require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const collections = ['users', 'admins', 'partners', 'employees', 'clients'];
  
  for (const colName of collections) {
    try {
      const col = db.collection(colName);
      const missing = await col.countDocuments({ client_id_ref: { $exists: false } });
      const total = await col.countDocuments({});
      console.log(`[${colName}] Total: ${total}, Missing client_id_ref: ${missing}`);
    } catch (e) {
      console.log(`[${colName}] Error: ${e.message}`);
    }
  }
  
  await mongoose.disconnect();
}).catch(e => { console.error(e); process.exit(1); });
