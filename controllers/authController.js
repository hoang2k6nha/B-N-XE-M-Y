const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'MOTOZONE_BIMAT_2026';

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register — Đăng ký tài khoản
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
        }

        const user = await User.create({ name, email, password, phone, address });
        
        res.status(201).json({
            success: true,
            data: {
                _id: user._id, name: user.name,
                email: user.email, role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/auth/login — Đăng nhập
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                data: {
                    _id: user._id, name: user.name,
                    email: user.email, role: user.role,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Bạn đã nhập sai tài khoản hoặc mật khẩu' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/auth/profile — Lấy thông tin hồ sơ cá nhân
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/auth/profile — Cập nhật hồ sơ KYC
exports.updateProfile = async (req, res) => {
    try {
        const { phone, address, cccd, dob, gender, city, license_type } = req.body;

        if (!phone || !address || !cccd) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ: Số điện thoại, Địa chỉ và Số CCCD' 
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { phone, address, cccd, dob, gender, city, license_type },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ success: true, message: 'Cập nhật hồ sơ thành công!', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/auth/forgot-password — Quên mật khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await User.findOne({ phone });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Số điện thoại chưa được đăng ký.' });
        }
        
        // Reset về mật khẩu mặc định
        user.password = '123456';
        await user.save();
        
        res.json({ success: true, message: 'Mật khẩu đã được reset về mặc định: 123456. Vui lòng đăng nhập và đổi lại mật khẩu.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/auth/change-password — Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        
        if (user && (await user.matchPassword(oldPassword))) {
            user.password = newPassword;
            await user.save(); // pre-save hook sẽ tự động mã hóa mật khẩu mới
            res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
        } else {
            res.status(400).json({ success: false, message: 'Mật khẩu cũ không chính xác.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
