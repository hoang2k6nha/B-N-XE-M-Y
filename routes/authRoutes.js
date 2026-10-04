const express = require('express');
const router  = express.Router();
const { registerUser, loginUser, getProfile, updateProfile, forgotPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);   // Đăng ký
router.post('/login',    loginUser);      // Đăng nhập
router.post('/forgot-password', forgotPassword); // Quên mật khẩu
router.post('/change-password', protect, changePassword); // Đổi mật khẩu
router.get('/profile',   protect, getProfile);    // Lấy hồ sơ cá nhân
router.put('/profile',   protect, updateProfile); // Cập nhật hồ sơ KYC

module.exports = router;
