const mongoose = require('mongoose');

async function testCreatePartner() {
  try {
    // Connect to database directly to verify
    await mongoose.connect('mongodb://127.0.0.1:27017/my_claim_db', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const User = require('../backend/models/User');

    // Create a mock Super Partner first if needed, or just insert a partner directly
    const newPartner = new User({
      name: 'Test Partner',
      email: 'testpartner' + Date.now() + '@example.com',
      password: 'password123',
      role: 'partner',
      permissions: ['Create Leads', 'View Reports']
    });

    await newPartner.save();
    console.log('Successfully created partner in DB with permissions:', newPartner.permissions);

    const fetchedPartner = await User.findById(newPartner._id);
    console.log('Verified from DB:', fetchedPartner.name, 'Permissions:', fetchedPartner.permissions);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testCreatePartner();
