/**
 * Backfill script: assigns proper epoch-time based client_id_ref to ALL existing users
 * that have either no client_id_ref or a legacy short-form ID.
 * Run: node backend/scripts/backfillIds.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('No MONGO_URI found in .env');
  process.exit(1);
}

const getPrefix = (role) => {
  if (role === 'partner') return 'PRT';
  if (role === 'super_partner') return 'SPR';
  if (role === 'admin' || role === 'super_admin') return 'ADM';
  if (role === 'employee') return 'EMP';
  return 'CLT';
};

// Generate epoch-time based ID from MongoDB ObjectId timestamp
const generateIdFromObjectId = (objectId, role) => {
  const epochSeconds = parseInt(objectId.toString().substring(0, 8), 16);
  return `${getPrefix(role)}-${epochSeconds}`;
};

const isLegacyId = (id) => {
  if (!id) return true;
  // Legacy IDs are short hex strings like "CLT-E2A4", "CLT-001", epoch-millis too long (13 digits), or base36
  // New format: PREFIX-10digitnumber (e.g. CLT-1755339600)
  // We keep IDs that already match: PREFIX-XXXXXXXXXX (10 digit epoch seconds)
  const match = /^(CLT|PRT|SPR|ADM|EMP|SAD|LD)-(\d{10})$/.test(id);
  return !match;
};

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected!');

  const db = mongoose.connection.db;
  const collections = ['users', 'admins', 'partners', 'employees', 'clients'];

  let total = 0;
  let updated = 0;

  for (const colName of collections) {
    try {
      const col = db.collection(colName);
      const docs = await col.find({}).project({ _id: 1, role: 1, client_id_ref: 1 }).toArray();
      console.log(`\n[${colName}] Found ${docs.length} documents`);

      for (const doc of docs) {
        total++;
        if (isLegacyId(doc.client_id_ref)) {
          const role = doc.role || (colName === 'admins' ? 'admin' : colName === 'partners' ? 'partner' : colName === 'employees' ? 'employee' : 'client');
          const newId = generateIdFromObjectId(doc._id, role);
          await col.updateOne({ _id: doc._id }, { $set: { client_id_ref: newId } });
          console.log(`  Updated: ${doc._id} | old="${doc.client_id_ref}" → new="${newId}"`);
          updated++;
        }
      }
    } catch (e) {
      console.log(`  Skipping collection "${colName}": ${e.message}`);
    }
  }

  console.log(`\n✅ Done! Checked ${total} documents, updated ${updated}.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Backfill error:', err);
  process.exit(1);
});
