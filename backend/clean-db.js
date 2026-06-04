const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/myclaim', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Find tickets where the client has name 'Client User'
    const users = await db.collection('users').find({ name: 'Client User' }).toArray();
    console.log(`Found ${users.length} anonymous 'Client User' accounts.`);
    
    // Delete them
    if (users.length > 0) {
      const userIds = users.map(u => u._id);
      await db.collection('users').deleteMany({ _id: { $in: userIds } });
      
      // Also delete associated tickets
      const ticketsDeleted = await db.collection('tickets').deleteMany({ client: { $in: userIds } });
      console.log(`Deleted ${ticketsDeleted.deletedCount} associated anonymous tickets.`);
    }

    console.log("Cleanup complete.");
    process.exit(0);
  });
