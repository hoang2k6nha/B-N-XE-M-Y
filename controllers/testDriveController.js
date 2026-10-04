const TestDrive = require('../models/TestDrive');

// POST /api/test-drives — Đăng ký lịch lái thử
exports.bookTestDrive = async (req, res) => {
    try {
        const { product_id, preferred_date } = req.body;
        const user = req.user;

        // Kiểm tra số điện thoại (để nhân viên có thể gọi xác nhận)
        if (!user.phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng cập nhật Số điện thoại trong Hồ sơ cá nhân trước khi đăng ký lái thử!' 
            });
        }

        // Ngày lái thử phải sau ngày hôm nay
        if (new Date(preferred_date) <= new Date()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ngày lái thử phải là ngày trong tương lai!' 
            });
        }

        const testDrive = await TestDrive.create({
            user_id:        user._id,
            product_id,
            preferred_date,
            status:         'pending'
        });

        res.status(201).json({ 
            success: true, 
            message: 'Đăng ký lái thử thành công! Nhân viên sẽ liên hệ với bạn sớm nhất.',
            data: testDrive
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/test-drives/my — Xem lịch lái thử của khách hàng
exports.getMyTestDrives = async (req, res) => {
    try {
        const testDrives = await TestDrive.find({ user_id: req.user._id })
            .populate('product_id', 'name brand image_url')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: testDrives });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/test-drives — Admin xem tất cả lịch đặt
exports.getAllTestDrives = async (req, res) => {
    try {
        const testDrives = await TestDrive.find({})
            .populate('user_id', 'name email phone')
            .populate('product_id', 'name brand')
            .sort({ preferred_date: 1 });
        res.json({ success: true, data: testDrives });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/test-drives/:id — Admin cập nhật trạng thái lịch lái thử
exports.updateTestDriveStatus = async (req, res) => {
    try {
        const testDrive = await TestDrive.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!testDrive) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch lái thử' });
        res.json({ success: true, data: testDrive });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
