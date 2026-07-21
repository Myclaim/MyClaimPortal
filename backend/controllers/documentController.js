const Document = require('../models/Document');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const Admin = require('../models/admin/Admin');
const Partner = require('../models/partner/Partner');
const Client = require('../models/client/Client');
const Employee = require('../models/employee/Employee');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { linked_to, ticket_id, client_id, name, doc_category, folder, folder_id } = req.body;

    if (!linked_to || !['ticket', 'client', 'global'].includes(linked_to)) {
      return res.status(400).json({ message: 'Invalid linked_to value' });
    }

    let targetClientId = client_id;
    if (req.user.role === 'client') {
      targetClientId = req.user._id;
    }

    // Calculate file_url based on where multer actually saved it
    const fullPath = req.file.path;
    const uploadsIndex = fullPath.indexOf('uploads');
    const fileUrl = '/' + fullPath.substring(uploadsIndex).replace(/\\/g, '/');

    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    const document = await Document.create({
      name: name || req.file.originalname,
      file_url: fileUrl,
      file_type: path.extname(req.file.originalname).substring(1),
      file_size: req.file.size,
      linked_to,
      doc_category: doc_category || 'secondary',
      folder: folder || 'General',
      folder_id: folder_id || null,
      ticket_id: linked_to === 'ticket' ? ticket_id : undefined,
      client_id: linked_to === 'client' ? targetClientId : undefined,
      uploaded_by: req.user._id,
      verification_status: isAdmin ? 'verified' : 'pending',
      verified_by: isAdmin ? req.user._id : undefined,
      verifiedAt: isAdmin ? Date.now() : undefined,
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
    const { ticket_id, client_id, doc_category } = req.query;
    let query = {};

    if (ticket_id) query.ticket_id = ticket_id;
    if (client_id) query.client_id = client_id;
    if (doc_category) query.doc_category = doc_category;

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
      .populate('client_id', 'name email')
      .populate('ticket_id')
      .sort({ createdAt: -1 })
      .lean();

    // Manually populate uploaded_by because users are split across multiple collections
    for (let doc of documents) {
      if (doc.uploaded_by) {
        let uploader = await User.findById(doc.uploaded_by).select('name role').lean();
        if (!uploader) uploader = await Client.findById(doc.uploaded_by).select('name role').lean();
        if (!uploader) uploader = await Admin.findById(doc.uploaded_by).select('name role').lean();
        if (!uploader) uploader = await Partner.findById(doc.uploaded_by).select('name role').lean();
        if (!uploader) uploader = await Employee.findById(doc.uploaded_by).select('name role').lean();
        doc.uploaded_by = uploader || null;
      }
    }

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
    let document = await Document.findById(req.params.id)
      .populate('client_id', 'name email')
      .lean();

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.uploaded_by) {
      let uploader = await User.findById(document.uploaded_by).select('name role').lean();
      if (!uploader) uploader = await Client.findById(document.uploaded_by).select('name role').lean();
      if (!uploader) uploader = await Admin.findById(document.uploaded_by).select('name role').lean();
      if (!uploader) uploader = await Partner.findById(document.uploaded_by).select('name role').lean();
      if (!uploader) uploader = await Employee.findById(document.uploaded_by).select('name role').lean();
      document.uploaded_by = uploader || null;
    }

    // RBAC
    if (req.user.role === 'client' && document.client_id && document.client_id._id.toString() !== req.user._id.toString()) {
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

// @desc    Move document to a different folder
// @route   PUT /api/documents/:id/move
// @access  Private
const moveDocument = async (req, res) => {
  try {
    const { folder, folder_id } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    document.folder = folder || 'General';
    if (folder_id !== undefined) document.folder_id = folder_id;
    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Copy document to a different folder
// @route   POST /api/documents/:id/copy
// @access  Private
const copyDocument = async (req, res) => {
  try {
    const { folder, folder_id } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    // Duplicate the document record
    const newDoc = new Document({
      name: document.name + ' (Copy)',
      file_url: document.file_url,
      file_type: document.file_type,
      file_size: document.file_size,
      linked_to: document.linked_to,
      ticket_id: document.ticket_id,
      client_id: document.client_id,
      doc_category: document.doc_category,
      folder: folder || 'General',
      folder_id: folder_id || null,
      uploaded_by: req.user._id,
      verification_status: 'pending' // reset verification for copied doc
    });

    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get company documents for a specific client (admin-uploaded, linked to client)
// @route   GET /api/documents/company?client_id=xxx
// @access  Private
const getCompanyDocuments = async (req, res) => {
  try {
    const { client_id } = req.query;
    let query = { doc_category: 'company' };

    // Client can only see their own company docs
    if (req.user.role === 'client') {
      query.client_id = req.user._id;
    } else if (client_id) {
      query.client_id = client_id;
    }

    const documents = await Document.find(query)
      .populate('client_id', 'name email')
      .populate('uploaded_by', 'name role')
      .sort({ createdAt: -1 })
      .lean();

    // Manually populate uploaded_by across collections
    for (let doc of documents) {
      if (doc.uploaded_by && typeof doc.uploaded_by === 'object' && !doc.uploaded_by.name) {
        let uploader = await User.findById(doc.uploaded_by).select('name role').lean();
        if (!uploader) uploader = await Admin.findById(doc.uploaded_by).select('name role').lean();
        if (!uploader) uploader = await Partner.findById(doc.uploaded_by).select('name role').lean();
        doc.uploaded_by = uploader || null;
      }
    }

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get legal documents (global, admin-uploaded)
// @route   GET /api/documents/legal
// @access  Private
const getLegalDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ doc_category: 'legal' })
      .sort({ createdAt: -1 })
      .lean();

    // Populate uploaded_by
    for (let doc of documents) {
      if (doc.uploaded_by) {
        let uploader = await User.findById(doc.uploaded_by).select('name role').lean();
        if (!uploader) uploader = await Admin.findById(doc.uploaded_by).select('name role').lean();
        if (!uploader) uploader = await Partner.findById(doc.uploaded_by).select('name role').lean();
        doc.uploaded_by = uploader || null;
      }
    }

    res.json(documents);
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
  moveDocument,
  copyDocument,
  getCompanyDocuments,
  getLegalDocuments,
};
