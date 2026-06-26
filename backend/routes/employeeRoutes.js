const express = require('express');
const router = express.Router();
const {
  getEmployeeWorkload,
  getEmployeeTasks,
  getEmployeePerformance
} = require('../controllers/crm/aiDataController');

router.get('/workload', getEmployeeWorkload);
router.get('/tasks', getEmployeeTasks);
router.get('/performance', getEmployeePerformance);

module.exports = router;
