const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  updateDocumentStatus,
  moveDocument,
  copyDocument
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
router.route('/:id')
  .get(protect, getDocumentById)
  .delete(protect, deleteDocument);

router.put('/:id/move', protect, moveDocument);
router.post('/:id/copy', protect, copyDocument);

router.patch('/:id/verify', protect, admin, updateDocumentStatus);

module.exports = router;
