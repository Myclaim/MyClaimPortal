const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const Folder = require('./models/Folder');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const f = await Folder.findById('6a409cecc42160ed534d1943');
  console.log('Folder name:', f ? f.name : 'Not found');

  process.exit(0);
}

run();
