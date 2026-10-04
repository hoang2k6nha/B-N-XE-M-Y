const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Tách lấy token từ Bearer token
            token = req.headers.authorization.split(' ')[1];

            // Lấy secret từ biến môi trường hoặc dùng mặc định giống authController
            const JWT_SECRET = process.env.JWT_SECRET || 'MOTOZONE_BIMAT_2026';

            // Giải mã token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Tìm user bằng ID trong token, loại bỏ password khỏi kết quả
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ success: false, message: 'Token không hợp lệ, từ chối truy cập' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Không có token, từ chối truy cập' });
    }
};

// Middleware kiểm tra quyền Admin
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Từ chối truy cập. Yêu cầu quyền Admin.' });
    }
};
