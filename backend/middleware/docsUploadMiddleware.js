const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/documents directory exists
const docsDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { client_id, ticket_id, linked_to, userId } = req.body;
    let targetSubDir = 'general';

    if (userId) {
      targetSubDir = `clients/${userId}`;
    } else if (linked_to === 'client' && client_id) {
      targetSubDir = `clients/${client_id}`;
    } else if (linked_to === 'ticket' && ticket_id) {
      targetSubDir = `tickets/${ticket_id}`;
    } else if (req.user && req.user._id) {
      targetSubDir = `users/${req.user._id}`;
    }

    const finalPath = path.join(docsDir, targetSubDir);
    
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }
    
    cb(null, finalPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${originalName}`);
  }
});

const uploadDocs = multer({
  storage
});

module.exports = uploadDocs;
