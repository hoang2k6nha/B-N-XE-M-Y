const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Installment = require('../models/Installment');

exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        
        // Doanh thu
        const orders = await Order.find({ payment_status: 'paid' });
        const revenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalOrders,
                totalProducts,
                revenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user_id', 'name email phone').sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true }).populate('user_id', '_id name');
        
        // Gửi thông báo thời gian thực qua Socket.IO
        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');
        const userId = order.user_id._id.toString();
        
        if (userSockets.has(userId)) {
            const socketId = userSockets.get(userId);
            io.to(socketId).emit('notification', {
                title: 'Cập nhật đơn hàng',
                message: `Đơn hàng ${orderId.substring(0,8)} của bạn đã chuyển sang trạng thái: ${status.toUpperCase()}!`,
                type: 'success'
            });
        }

        res.json({ success: true, message: 'Đã cập nhật trạng thái đơn hàng', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstallments = async (req, res) => {
    try {
        const installments = await Installment.find()
            .populate('user_id', 'name cccd phone')
            .populate('product_id', 'name price')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: installments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInstallmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const installment = await Installment.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ success: true, message: 'Đã duyệt/cập nhật hồ sơ', data: installment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        const product = await Product.findByIdAndUpdate(id, { stock }, { new: true });
        res.json({ success: true, message: 'Đã cập nhật kho', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if(!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

        await Product.findByIdAndDelete(id);
        res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= USER MANAGEMENT =================
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        
        const userExists = await User.findOne({ email });
        if(userExists) return res.status(400).json({ success: false, message: 'Email này đã tồn tại trong hệ thống' });
        
        const user = await User.create({ 
            name, 
            email, 
            phone, 
            password: password || '123456', 
            role: role || 'user' 
        });
        
        res.status(201).json({ success: true, message: 'Tạo tài khoản thành công', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        if(user.role === 'admin') return res.status(400).json({ success: false, message: 'Không thể xoá tài khoản quản trị viên' });
        
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xoá tài khoản khách hàng.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
        
        user.password = '123456';
        await user.save();
        res.json({ success: true, message: 'Đã reset mật khẩu thành 123456' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
