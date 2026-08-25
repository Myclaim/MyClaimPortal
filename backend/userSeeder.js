const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const users = [
  { name: 'Rohan Sharma', email: 'rohan.super@myclaim.com', role: 'super_admin' },
  { name: 'Simran Kaur', email: 'simran.super@myclaim.com', role: 'super_admin' },
  { name: 'Amit Verma', email: 'amit.admin@myclaim.com', role: 'admin' },
  { name: 'Sneha Gupta', email: 'sneha.admin@myclaim.com', role: 'admin' },
  { name: 'Vikram Singh', email: 'vikram.emp@myclaim.com', role: 'employee' },
  { name: 'Anjali Rae', email: 'anjali.emp@myclaim.com', role: 'employee' },
  { name: 'Deepak Malhotra', email: 'deepak.sp@myclaim.com', role: 'super_partner' },
  { name: 'Priya Juneja', email: 'priya.sp@myclaim.com', role: 'super_partner' },
  { name: 'Karan Mehra', email: 'karan.p@myclaim.com', role: 'partner' },
  { name: 'Megha Sethi', email: 'megha.p@myclaim.com', role: 'partner' },
];

const clients = [
  { name: 'Arjun Das', email: 'arjun.client@gmail.com', role: 'client' },
  { name: 'Bhavna Roy', email: 'bhavna.client@gmail.com', role: 'client' },
];

const seedData = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    // Add password to all dummy users
    const usersWithPassword = users.map(u => ({
      ...u,
      password,
      username: u.name.toLowerCase().replace(' ', '.'),
      is_active: true
    }));

    // Insert main users
    const createdUsers = await User.insertMany(usersWithPassword);
    console.log('Main users seeded!');

    // Find a partner to assign clients to
    const partner = createdUsers.find(u => u.role === 'partner');
    
    // Add clients assigned to the partner
    const clientsWithData = clients.map((c, i) => ({
      ...c,
      password,
      username: c.name.toLowerCase().replace(' ', '.'),
      parent_id: partner._id,
      client_id_ref: `MCL-C-${1000 + i}`,
      is_active: true
    }));

    await User.insertMany(clientsWithData);
    console.log('Clients seeded and linked to partner!');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
