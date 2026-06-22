const Folder = require('../models/Folder');
const Document = require('../models/Document');

// @desc    Create a new folder
// @route   POST /api/folders
// @access  Private
const createFolder = async (req, res) => {
  try {
    const { name, client_id, parent_folder_id, tag, tag_color } = req.body;
    if (!name || !client_id) {
      return res.status(400).json({ message: 'Folder name and client ID are required' });
    }

    let logo_url = null;
    if (req.file) {
      const fullPath = req.file.path;
      const uploadsIndex = fullPath.indexOf('uploads');
      logo_url = '/' + fullPath.substring(uploadsIndex).replace(/\\/g, '/');
    }

    const folder = new Folder({
      name,
      client_id,
      parent_folder_id: parent_folder_id || null,
      tag: tag || null,
      tag_color: tag_color || '#3b82f6',
      folder_color: req.body.folder_color || '#3b82f6',
      logo_url,
      created_by: req.user._id
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A folder with this name already exists here.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get folders for a specific client and parent folder
// @route   GET /api/folders?client_id=123&parent_folder_id=456
// @access  Private
const getFolders = async (req, res) => {
  try {
    const { client_id, parent_folder_id } = req.query;
    if (!client_id) {
      return res.status(400).json({ message: 'Client ID is required' });
    }

    const query = { client_id };
    
    if (parent_folder_id === 'all') {
      // Don't filter by parent_folder_id, return all folders for the client
    } else if (parent_folder_id === 'root' || !parent_folder_id) {
      query.parent_folder_id = null;
    } else {
      query.parent_folder_id = parent_folder_id;
    }

    const folders = await Folder.find(query).sort({ createdAt: -1 });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rename a folder
// @route   PUT /api/folders/:id
// @access  Private
const renameFolder = async (req, res) => {
  try {
    const { name, tag, tag_color } = req.body;
    if (!name) return res.status(400).json({ message: 'New name is required' });

    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    folder.name = name;
    if (tag !== undefined) folder.tag = tag;
    if (tag_color !== undefined) folder.tag_color = tag_color;
    if (req.body.folder_color !== undefined) folder.folder_color = req.body.folder_color;

    if (req.file) {
      const fullPath = req.file.path;
      const uploadsIndex = fullPath.indexOf('uploads');
      folder.logo_url = '/' + fullPath.substring(uploadsIndex).replace(/\\/g, '/');
    }

    await folder.save();
    res.json(folder);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A folder with this name already exists here.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Recursive function to delete a folder and all its contents
const deleteFolderRecursive = async (folderId) => {
  // Find all subfolders
  const subfolders = await Folder.find({ parent_folder_id: folderId });
  for (const sub of subfolders) {
    await deleteFolderRecursive(sub._id);
  }
  
  // Delete all documents in this folder
  await Document.deleteMany({ folder_id: folderId });
  
  // Delete the folder itself
  await Folder.findByIdAndDelete(folderId);
};

// @desc    Delete a folder
// @route   DELETE /api/folders/:id
// @access  Private
const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    await deleteFolderRecursive(folder._id);
    
    res.json({ message: 'Folder and all contents deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder
};
