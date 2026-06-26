const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/myclaim', { useNewUrlParser: true, useUnifiedTopology: true });
  try {
      await mongoose.connection.collection('clients').dropIndex('user_1');
      console.log('Successfully dropped old user_1 index');
  } catch(e) {
      console.log('Error dropping index:', e.message);
  }
  process.exit(0);
}
test();
