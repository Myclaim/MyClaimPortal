const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const uploadDocs = require('../middleware/docsUploadMiddleware');
const { getTickets, getTicketById, createTicket, updateTicketStatus, updateEmployeeTicketStatus, assignTicket, addTicketComment, bulkUpdateTickets, escalateTicket, addTicketAttachment, updateTicketStages } = require('../controllers/ticketController');

router.route('/').get(protect, getTickets).post(protect, createTicket);
router.route('/:id').get(protect, getTicketById);
router.route('/bulk').patch(protect, admin, bulkUpdateTickets);
router.route('/:id/status').patch(protect, admin, updateTicketStatus);
router.route('/:id/employee-status').patch(protect, updateEmployeeTicketStatus);
router.route('/:id/assign').patch(protect, admin, assignTicket);
router.route('/:id/comments').post(protect, addTicketComment);
router.route('/:id/escalate').patch(protect, admin, escalateTicket);
router.route('/:id/attachments').post(protect, uploadDocs.array('files', 5), addTicketAttachment);
router.route('/:id/stages').patch(protect, admin, updateTicketStages);

module.exports = router;
