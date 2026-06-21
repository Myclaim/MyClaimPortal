const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  updateDocumentStatus,
} = require('../controllers/documentController');
const {
  getDocumentsPending,
  getDocumentsRejected,
  getDocumentsMissing
} = require('../controllers/crm/aiDataController');
const { protect, admin } = require('../middleware/authMiddleware');
const uploadDocs = require('../middleware/docsUploadMiddleware');

router.get('/pending', getDocumentsPending);
router.get('/rejected', getDocumentsRejected);
router.get('/missing', getDocumentsMissing);

router.post('/upload', protect, uploadDocs.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);
router.patch('/:id/verify', protect, admin, updateDocumentStatus);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
