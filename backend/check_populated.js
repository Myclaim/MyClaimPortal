const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const Document = require('./models/Document');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const docs = await Document.find({}).sort({ createdAt: -1 }).limit(1).populate('uploaded_by');
  const d = docs[0];
  console.log('Populated uploaded_by:', d.uploaded_by);

  process.exit(0);
}

run();
