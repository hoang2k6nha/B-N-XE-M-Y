const express = require('express');
const router  = express.Router();
const { applyForLoan, getMyLoans, getAllLoans, markBadDebt } = require('../controllers/installmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/',               protect, admin, getAllLoans);         // Admin: xem tất cả hồ sơ
router.post('/apply',         protect, applyForLoan);              // Khách hàng nộp hồ sơ vay
router.get('/my-loans',       protect, getMyLoans);                // Khách hàng xem hợp đồng vay
router.put('/bad-debt/:userId', protect, admin, markBadDebt);      // Admin đánh dấu nợ xấu

module.exports = router;
