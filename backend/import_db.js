const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myclaim';
const DUMP_DIR = path.join(__dirname, 'database_dump');

const importDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected successfully.');

    if (!fs.existsSync(DUMP_DIR)) {
      console.error(`Error: Dump directory not found at ${DUMP_DIR}`);
      console.log('Please ensure the "database_dump" folder exists in the backend directory.');
      process.exit(1);
    }

    const files = fs.readdirSync(DUMP_DIR).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('No JSON files found in database_dump.');
      process.exit(0);
    }

    // Hex string detection (24 chars)
    const isObjectId = (val) => /^[0-9a-fA-F]{24}$/.test(val);
    // ISO Date detection
    const isDate = (val) => typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val);

    const processDoc = (doc) => {
      for (let key in doc) {
        if (typeof doc[key] === 'string') {
          if (isObjectId(doc[key])) {
            doc[key] = new mongoose.Types.ObjectId(doc[key]);
          } else if (isDate(doc[key])) {
            doc[key] = new Date(doc[key]);
          }
        } else if (typeof doc[key] === 'object' && doc[key] !== null) {
          processDoc(doc[key]);
        }
      }
      return doc;
    };

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(DUMP_DIR, file);
      
      console.log(`Reading ${file}...`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (data.length === 0) {
        console.log(`Skipping empty collection: ${collectionName}`);
        continue;
      }

      console.log(`Importing ${data.length} documents into collection: ${collectionName}...`);
      
      const collection = mongoose.connection.db.collection(collectionName);
      
      // Clear existing records to avoid duplicates/conflicts
      await collection.deleteMany({});
      
      const processedData = data.map(doc => processDoc(doc));
      
      await collection.insertMany(processedData);
      console.log(`✅ Successfully imported ${collectionName}`);
    }

    console.log('\n✨ Database import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed!');
    console.error('Error details:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\nPOSSIBLE CAUSE: MongoDB is not running. Please start your MongoDB service.');
    } else if (error.message.includes('module not found')) {
      console.error('\nPOSSIBLE CAUSE: Missing dependencies. Did you run "npm install"?');
    }
    process.exit(1);
  }
};

importDB();
