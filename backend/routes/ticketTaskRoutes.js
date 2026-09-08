const express = require('express');
const router = express.Router();
const {
  getTicketTasks,
  createTicketTask,
  updateTicketTask,
  deleteTicketTask
} = require('../controllers/ticketTaskController');
const { protect } = require('../middleware/authMiddleware');

const uploadDocs = require('../middleware/docsUploadMiddleware');

router.route('/')
  .get(protect, getTicketTasks)
  .post(protect, createTicketTask);

router.post('/upload', protect, uploadDocs.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const fullPath = req.file.path;
  const uploadsIndex = fullPath.indexOf('uploads');
  const fileUrl = '/' + fullPath.substring(uploadsIndex).replace(/\\/g, '/');
  res.json({ name: req.file.originalname, url: fileUrl });
});

router.route('/:id')
  .put(protect, updateTicketTask)
  .delete(protect, deleteTicketTask);

module.exports = router;
