const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');

async function test() {
  const uri = process.env.MONGO_URI;
  const conn = await mongoose.createConnection(uri).asPromise();
  const admin = conn.db.admin();
  const dbs = await admin.listDatabases();
  
  for (const dbInfo of dbs.databases) {
    const dbName = dbInfo.name;
    const dbConn = await mongoose.createConnection(uri.replace('/myclaim', '/' + dbName)).asPromise();
    const cols = await dbConn.db.listCollections().toArray();
    console.log(`DB: ${dbName}, Collections: ${cols.map(c => c.name).join(', ')}`);
    await dbConn.close();
  }
  await conn.close();
  process.exit(0);
}

test();
