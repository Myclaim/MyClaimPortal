const express = require('express');
const router = express.Router();
const { getCatalog, createCatalogItem } = require('../controllers/catalogController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCatalog).post(protect, admin, createCatalogItem);

module.exports = router;
