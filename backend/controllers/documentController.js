const Document = require('../models/Document');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { linked_to, ticket_id, client_id, name, doc_category } = req.body;

    if (!linked_to || !['ticket', 'client'].includes(linked_to)) {

      return res.status(400).json({ message: 'Invalid linked_to value' });
    }

    // Calculate file_url based on where multer actually saved it
    const fullPath = req.file.path;
    const uploadsIndex = fullPath.indexOf('uploads');
    const fileUrl = '/' + fullPath.substring(uploadsIndex).replace(/\\/g, '/');

    const document = await Document.create({
      name: name || req.file.originalname,
      file_url: fileUrl,
      file_type: path.extname(req.file.originalname).substring(1),
      file_size: req.file.size,
      linked_to,
      doc_category: doc_category || 'others',
      ticket_id: linked_to === 'ticket' ? ticket_id : undefined,

      client_id: linked_to === 'client' ? client_id : undefined,
      uploaded_by: req.user._id,
    });


    if (linked_to === 'ticket' && ticket_id) {
      await Activity.create({
        action: `Document uploaded to ticket: ${document.name}`,
        user: req.user._id,
      });
    }

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all documents (filtered)
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const { ticket_id, client_id } = req.query;
    let query = {};

    if (ticket_id) query.ticket_id = ticket_id;
    if (client_id) query.client_id = client_id;

    // RBAC
    if (req.user.role === 'client') {
      query.client_id = req.user._id;
    } else if (['partner', 'super_partner'].includes(req.user.role)) {
      // Find all clients under this partner
      const clients = await User.find({ parent_id: req.user._id });
      const clientIds = clients.map(c => c._id);
      clientIds.push(req.user._id); // include own docs if any
      query.client_id = { $in: clientIds };
    }
    // Admin/Super Admin see all (query remains as is or filtered by client_id/ticket_id if provided)

    const documents = await Document.find(query)
      .populate('uploaded_by', 'name role')
      .populate('client_id', 'name email')
      .populate('ticket_id')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploaded_by', 'name role')
      .populate('client_id', 'name email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // RBAC
    if (req.user.role === 'client' && document.client_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    // Partner check could be more complex here, but usually list filtering is enough.

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // RBAC: Only uploader or admin can delete
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && document.uploaded_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to delete' });
    }

    // Delete file from storage
    const filePath = path.join(__dirname, '..', document.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();
    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update document verification status
// @route   PATCH /api/documents/:id/verify
// @access  Private (Admin only)
const updateDocumentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only allow admin/super_admin
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    document.verification_status = status;
    document.verification_notes = notes || document.verification_notes;
    document.verified_by = req.user._id;
    document.verifiedAt = Date.now();
    await document.save();

    // Log Activity
    await Activity.create({
      action: `Document ${document.name} marked as ${status}`,
      user: req.user._id,
    });

    // Notify uploader if approved/rejected
    if (status === 'verified' || status === 'rejected') {
      await Notification.create({
        user: document.uploaded_by,
        type: status === 'verified' ? 'doc_approved' : 'doc_rejected',
        title: status === 'verified' ? 'Document Approved' : 'Document Rejected',
        message: `Your document "${document.name}" has been ${status === 'verified' ? 'approved' : 'rejected'}.`,
        link: '?tab=docs'
      });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  updateDocumentStatus,
};
