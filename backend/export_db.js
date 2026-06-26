const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myclaim';
const DUMP_DIR = path.join(__dirname, 'database_dump');

const exportDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected successfully.');

    // Create dump directory if it doesn't exist
    if (!fs.existsSync(DUMP_DIR)) {
      fs.mkdirSync(DUMP_DIR);
      console.log(`Created directory: ${DUMP_DIR}`);
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      const name = collection.name;
      console.log(`Exporting collection: ${name}...`);
      
      const data = await mongoose.connection.db.collection(name).find({}).toArray();
      const filePath = path.join(DUMP_DIR, `${name}.json`);
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Saved ${data.length} documents to ${name}.json`);
    }

    console.log('Database export completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
};

exportDB();
