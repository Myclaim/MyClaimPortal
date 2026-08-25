const mongoose = require('mongoose');
const Partner = require('../models/partner/Partner');
const dbConfig = require('../config/db');

async function main() {
  try {
    await dbConfig();
    console.log('Connected to DB');

    const partners = await Partner.find({}).lean();
    console.log(`Found ${partners.length} partners`);

    let updated = 0;
    for (const p of partners) {
      const cityFromAddress = (p.address && p.address.city) || p.city || '';
      if (cityFromAddress && (!p.city || p.city !== cityFromAddress)) {
        await Partner.updateOne({ _id: p._id }, { $set: { city: cityFromAddress } });
        updated++;
        console.log(`Updated partner ${p._id} -> city: ${cityFromAddress}`);
      }
    }

    console.log(`Migration complete. Updated ${updated} partners.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

main();
