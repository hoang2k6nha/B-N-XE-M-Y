const express = require('express');
const router = express.Router();
const { handleWebhook, simulateWebhook } = require('../controllers/sepayController');

// SePay sẽ gọi POST vào /api/sepay/webhook
router.post('/webhook', handleWebhook);

// URL dành cho nút bấm mô phỏng khi Demo
router.post('/simulate', simulateWebhook);

module.exports = router;
