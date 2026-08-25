const express = require('express');
const router = express.Router();
const { getServices, createService, updateService, deleteService, seedServices } = require('../controllers/departmentServiceController');

// All endpoints could be protected by auth middleware in production, but for now we follow the existing pattern
router.get('/', getServices);
router.post('/', createService);
router.post('/seed', seedServices);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
