const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to DB");
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections list:", collections.map(c => c.name));
    
    // Check if department-services has any items
    const count = await db.collection('departmentservices').countDocuments();
    console.log("Total Services Count in 'departmentservices':", count);
    
    const count2 = await db.collection('department_services').countDocuments();
    console.log("Total Services Count in 'department_services':", count2);
    
    const docs = await db.collection('departmentservices').find().limit(3).toArray();
    console.log("Sample docs:", docs);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
