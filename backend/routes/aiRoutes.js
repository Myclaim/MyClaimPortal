const express = require('express');
const router = express.Router();
const { processAIChat } = require('../controllers/aiController');

router.post('/chat', processAIChat);

module.exports = router;
