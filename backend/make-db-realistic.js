const mongoose = require('mongoose');

const FIRST_NAMES = ['Rahul', 'Priya', 'Amit', 'Neha', 'Vikram', 'Sneha', 'Raj', 'Pooja', 'Ravi', 'Anjali', 'Karan', 'Kavita', 'Sanjay', 'Sunita', 'Deepak'];
const LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Gupta', 'Mehta', 'Jain', 'Reddy', 'Nair', 'Deshmukh', 'Yadav', 'Joshi', 'Chauhan', 'Thakur'];

const getRandomName = () => {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
};

const getRandomPhone = () => {
  const prefix = ['98', '99', '97', '88', '77'][Math.floor(Math.random() * 5)];
  const rest = Math.floor(10000000 + Math.random() * 90000000);
  return `+91 ${prefix}${rest}`;
};

mongoose.connect('mongodb://127.0.0.1:27017/myclaim', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const db = mongoose.connection.db;
    
    // 1. Update Clients with realistic data
    const clients = await db.collection('clients').find({}).toArray();
    let clientUpdates = 0;
    
    for (const client of clients) {
      if (client.name === 'Client User' || !client.phone || client.phone.includes('XXXX') || client.phone === '') {
        const newName = client.name === 'Client User' ? getRandomName() : client.name;
        const newPhone = getRandomPhone();
        await db.collection('clients').updateOne(
          { _id: client._id },
          { $set: { name: newName, phone: newPhone } }
        );
        clientUpdates++;
      }
    }
    
    // 2. Update Users (Partners/Employees/Admins) with realistic data if they have dummy data
    const users = await db.collection('users').find({}).toArray();
    let userUpdates = 0;
    
    for (const user of users) {
      let updates = {};
      if (user.name === 'Partner User' || user.name === 'Super Partner' || user.name === 'Employee User' || user.name === 'System Admin') {
        updates.name = getRandomName();
      }
      if (!user.phone || user.phone.includes('XXXX') || user.phone === '') {
        updates.phone = getRandomPhone();
      }
      
      if (Object.keys(updates).length > 0) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: updates }
        );
        userUpdates++;
      }
    }
    
    console.log(`Updated ${clientUpdates} ambiguous clients with realistic 'live demo' data.`);
    console.log(`Updated ${userUpdates} ambiguous users with realistic 'live demo' data.`);

    console.log("Database transparency update complete.");
    process.exit(0);
  });
