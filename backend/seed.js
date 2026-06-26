const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Admin = require('./models/admin/Admin');
const Partner = require('./models/partner/Partner');
const Client = require('./models/client/Client');
const Claim = require('./models/Claim');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Admin.deleteMany();
    await Partner.deleteMany();
    await Client.deleteMany();
    await User.deleteMany();
    await Claim.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    // Seed Admins
    await Admin.insertMany([
      { name: 'Super Admin', email: 'superadmin@myclaim.com', password, role: 'super_admin' },
      { name: 'Admin User', email: 'admin@myclaim.com', password, role: 'admin' },
    ]);

    // Seed Partners
    await Partner.insertMany([
      { name: 'Super Partner User', email: 'superpartner@myclaim.com', password, role: 'super_partner' },
      { name: 'Partner User', email: 'partner@myclaim.com', password, role: 'partner' },
    ]);

    // Seed Clients
    await Client.insertMany([
      { name: 'Client User', email: 'client@myclaim.com', password, role: 'client' },
    ]);

    // Seed Others
    await User.insertMany([
      { name: 'Team Member', email: 'team@myclaim.com', password, role: 'team' },
    ]);

    const claims = [
      {
        clientName: 'Acme Corp',
        status: 'pending',
      },
      {
        clientName: 'Global Tech',
        status: 'in-progress',
      },
      {
         clientName: 'Local Store',
         status: 'completed',
      }
    ];

    await Claim.insertMany(claims);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
