require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI).then(async () => {
  const col = mongoose.connection.db.collection('admins');
  const docs = await col.find({ client_id_ref: { $exists: false } }).project({ _id: 1, role: 1 }).toArray();
  console.log('Admins without ID:', docs.length);
  for (const d of docs) {
    const epoch = parseInt(d._id.toString().substring(0, 8), 16);
    // Try incrementing until unique
    for (let i = 1; i <= 10; i++) {
      const newId = `ADM-${epoch + i}`;
      try {
        await col.updateOne({ _id: d._id }, { $set: { client_id_ref: newId } });
        console.log('Fixed:', d._id.toString(), '->', newId);
        break;
      } catch (e) {
        console.log('Conflict at', newId, ', trying next...');
      }
    }
  }
  await mongoose.disconnect();
  console.log('Done');
}).catch(e => { console.error(e); process.exit(1); });
