const express = require('express');
const router  = express.Router();
const { bookTestDrive, getMyTestDrives, getAllTestDrives, updateTestDriveStatus } = require('../controllers/testDriveController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/',       protect, bookTestDrive);            // Đặt lịch lái thử
router.get('/my',      protect, getMyTestDrives);          // Xem lịch của tôi
router.get('/',        protect, admin, getAllTestDrives);   // Admin xem tất cả
router.put('/:id',     protect, admin, updateTestDriveStatus); // Admin cập nhật trạng thái

module.exports = router;
