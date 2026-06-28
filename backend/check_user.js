const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const User = require('./models/User');
const Document = require('./models/Document');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const docs = await Document.find({}).sort({ createdAt: -1 }).limit(1);
  const d = docs[0];
  console.log('Doc uploaded_by ID:', d.uploaded_by);
  
  const user = await User.findById(d.uploaded_by);
  console.log('User found:', user ? user.name : 'null');

  process.exit(0);
}

run();
