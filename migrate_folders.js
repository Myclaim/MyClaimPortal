const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'backend/.env' });

const Folder = require('./backend/models/Folder');
const Document = require('./backend/models/Document');

const standardFolders = [
  { name: 'Legal Documents', folder_color: '#ef4444' },
  { name: 'Client Documents', folder_color: '#3b82f6' },
  { name: 'Admin Uploads', folder_color: '#10b981' }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Get all unique client IDs who have folders
  const allFolders = await Folder.find({ parent_folder_id: null });
  const clientIds = [...new Set(allFolders.map(f => f.client_id.toString()))];

  for (const clientId of clientIds) {
    console.log('Processing client:', clientId);
    
    // Get root folders for client
    const rootFolders = await Folder.find({ client_id: clientId, parent_folder_id: null });
    
    // Delete non-standard root folders
    for (const folder of rootFolders) {
      if (!standardFolders.find(s => s.name === folder.name)) {
        console.log('Deleting non-standard folder:', folder.name);
        
        // Find docs inside
        const docs = await Document.find({ folder_id: folder._id });
        // Instead of deleting docs, we move them to 'Client Documents' or root
        if (docs.length > 0) {
           console.log(`Moving ${docs.length} docs from ${folder.name}`);
           // We will move them to root for now
           await Document.updateMany({ folder_id: folder._id }, { $set: { folder_id: null } });
        }
        
        await Folder.deleteOne({ _id: folder._id });
      }
    }
    
    // Create missing standard folders
    for (const std of standardFolders) {
      const exists = await Folder.findOne({ client_id: clientId, parent_folder_id: null, name: std.name });
      if (!exists) {
        console.log('Creating standard folder:', std.name);
        await Folder.create({
          name: std.name,
          client_id: clientId,
          parent_folder_id: null,
          folder_color: std.folder_color
        });
      }
    }
  }

  console.log('Done');
  process.exit(0);
}

run();
