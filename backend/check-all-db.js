const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in DB:", collections.map(c => c.name));
    
    for (const name of ['claims', 'documents', 'employees', 'partners', 'users']) {
      const coll = db.collection(name);
      const count = await coll.countDocuments();
      console.log(`Collection '${name}': count = ${count}`);
      if (count > 0) {
        const doc = await coll.findOne();
        console.log(`Sample doc from '${name}':`, JSON.stringify(doc, null, 2));
      }
      console.log("-" * 40);
    }
    process.exit(0);
  });
