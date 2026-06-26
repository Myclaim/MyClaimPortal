const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const Client = require('./models/client/Client');
const bcrypt = require('bcryptjs');

async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/myclaim', { useNewUrlParser: true, useUnifiedTopology: true });
  
  const lead = await Lead.findOne({ status: 'converted', convertedClientId: { $exists: false } });
  if (lead) {
      console.log('Found lead:', lead._id, lead.email);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Client@123', salt);
      const generatedEmail = lead.email || `client_${lead._id.toString().substring(0,8)}@example.com`;

      try {
          const newClient = await Client.create({
            name: lead.name || 'Test',
            email: generatedEmail,
            phone: lead.phone || '123',
            password: hashedPassword,
            role: 'client',
            parent_id: lead.sourceUserId,
          });
          
          lead.convertedClientId = newClient._id;
          await lead.save();
          console.log('Successfully created client:', newClient._id);
      } catch (err) {
          console.error("Failed to create:", err);
      }
  } else {
      console.log('No such lead.');
  }
  process.exit(0);
}
test();
