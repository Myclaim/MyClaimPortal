const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true // Index for fast lookup by client
  },
  parent_folder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null, // null means it is a root folder
    index: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tag: {
    type: String,
    default: null,
  },
  tag_color: {
    type: String,
    default: '#3b82f6', // Default blue
  },
  logo_url: {
    type: String,
    default: null,
  },
  folder_color: {
    type: String,
    default: '#3b82f6'
  }
}, {
  timestamps: true,
});

// Ensure a folder doesn't have the same name as another folder in the exact same parent directory for the same client
folderSchema.index({ client_id: 1, parent_folder_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Folder', folderSchema);
