const Order = require('../models/Order');
const User  = require('../models/User');

// POST /api/orders — Tạo đơn hàng mới (có VAT và Giảm giá theo hạng)
exports.addOrderItems = async (req, res) => {
    try {
        const { orderItems, promoCode } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Không có sản phẩm trong đơn hàng' });
        }

        // Lấy thông tin user
        const user = await User.findById(req.user._id);

        // Tính tổng tiền gốc
        const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        // Xét ưu đãi (Discount)
        let discount = 0;
        if (user.tier === 'Silver') discount = subtotal * 0.02;     // Giảm 2%
        if (user.tier === 'Gold') discount = subtotal * 0.05;       // Giảm 5%
        if (user.tier === 'Diamond') discount = subtotal * 0.10;    // Giảm 10%

        if (user.tier === 'New' && promoCode === 'NEW_MOTO') {
            discount = 1000000; // Khách mới giảm 1 triệu nếu có mã
        }

        const afterDiscount = subtotal - discount;
        const totalPrice = afterDiscount * 1.1; // Cộng 10% VAT sau giảm giá

        const order = await Order.create({
            user_id:     user._id,
            items:       orderItems,
            total_price: totalPrice,
            status:      'pending'
        });

        // Cập nhật tổng chi tiêu và Hạng thành viên
        user.total_purchases += totalPrice;
        if (user.total_purchases >= 500000000) user.tier = 'Diamond';      // Tiêu > 500tr
        else if (user.total_purchases >= 200000000) user.tier = 'Gold';    // Tiêu > 200tr
        else if (user.total_purchases >= 50000000) user.tier = 'Silver';   // Tiêu > 50tr
        
        await user.save();

        res.status(201).json({ 
            success: true, 
            message: 'Tạo đơn hàng thành công',
            data: { 
                order, 
                discount_applied: discount,
                new_tier: user.tier 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/orders — Admin xem tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip  = (page - 1) * limit;
        const total = await Order.countDocuments();

        const orders = await Order.find()
            .populate('user_id', 'name email tier')
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit);

        res.json({ success: true, data: orders, pagination: { page, limit, total } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/orders/myorders — Lịch sử đơn hàng của khách
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user._id })
            .populate('items.product_id', 'name price brand image_url engine')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/orders/:id — Xem chi tiết 1 đơn hàng
exports.getOrderById = async (req, res) => {
    try {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'ID đơn hàng không hợp lệ' });
        }
        const order = await Order.findById(req.params.id)
            .populate('user_id', 'name email phone')
            .populate('items.product_id', 'name brand image_url price');
        if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        // Chỉ admin hoặc chính chủ mới xem được
        if (req.user.role !== 'admin' && order.user_id._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Không có quyền xem' });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/orders/:id/contract — Xem hợp đồng mua bán (yêu cầu KYC đầy đủ)
exports.getContract = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user_id: req.user._id })
            .populate('items.product_id', 'name brand engine price');
        
        if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

        const user = await User.findById(req.user._id).select('-password');

        // Kiểm tra KYC như PHP
        if (!user.cccd || !user.phone || !user.address) {
            return res.status(403).json({ 
                success: false, 
                message: 'Vui lòng cập nhật đầy đủ CCCD, Số điện thoại và Địa chỉ trong Hồ sơ cá nhân trước khi xem Hợp đồng!' 
            });
        }

        res.json({ success: true, data: { order, user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/orders/:id/status — Admin cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
