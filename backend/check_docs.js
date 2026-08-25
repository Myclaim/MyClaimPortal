const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const Document = require('./models/Document');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const docs = await Document.find({}).sort({ createdAt: -1 }).limit(5);
  console.log('Latest 5 documents:');
  docs.forEach(d => {
    console.log(`- Name: ${d.name}, folder_id: ${d.folder_id}, uploaded_by: ${d.uploaded_by}, linked_to: ${d.linked_to}, client_id: ${d.client_id}`);
  });

  console.log('Done');
  process.exit(0);
}

run();
