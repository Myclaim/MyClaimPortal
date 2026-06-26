const express = require('express');
const router = express.Router();
const {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder
} = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');
const uploadDocs = require('../middleware/docsUploadMiddleware');

router.route('/')
  .post(protect, uploadDocs.single('logo'), createFolder)
  .get(protect, getFolders);

router.route('/:id')
  .put(protect, uploadDocs.single('logo'), renameFolder)
  .delete(protect, deleteFolder);

module.exports = router;
