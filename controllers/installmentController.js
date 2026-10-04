const Installment = require('../models/Installment');
const User = require('../models/User');
const Product = require('../models/Product');

// 1. Phân tích Tín dụng & Đăng ký Trả góp
exports.applyForLoan = async (req, res) => {
    try {
        const { product_id, prepayment, duration_months, finance_company } = req.body;
        const user = await User.findById(req.user._id);
        const product = await Product.findById(product_id);

        if (!product) return res.status(404).json({ success: false, message: 'Xe không tồn tại' });

        // A. Xét duyệt Lịch sử Tín dụng
        if (user.has_bad_debt) {
            return res.status(403).json({
                success: false,
                message: 'Hồ sơ bị TỪ CHỐI do phát hiện Nợ Xấu (Bad Debt) trên hệ thống CIC.',
                credit_score: user.credit_score
            });
        }

        if (user.credit_score < 500) {
            return res.status(403).json({
                success: false,
                message: 'Hồ sơ bị TỪ CHỐI do Điểm Tín Dụng quá thấp (< 500).',
                credit_score: user.credit_score
            });
        }

        // B. Xét duyệt Khoản Vay Hiện Tại
        const activeLoans = await Installment.countDocuments({ user_id: user._id, status: 'active' });
        if (activeLoans >= 1) {
            return res.status(403).json({
                success: false,
                message: 'Bạn đang có Hợp đồng trả góp CHƯA TẤT TOÁN. Không thể vay thêm lúc này.'
            });
        }

        // C. Tính toán hợp đồng
        const loanAmount = product.price - prepayment;
        if (loanAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Số tiền trả trước không hợp lệ' });
        }

        let interestRate = 1.5;
        const provider = finance_company || 'MotoZone Finance';
        
        // Cấu hình lãi suất theo từng đối tác
        if (provider === 'FE Credit') interestRate = 2.5;
        else if (provider === 'Home Credit') interestRate = 1.8;
        else if (provider === 'HD Saison') interestRate = 1.6;
        else if (provider === 'MotoZone Finance') {
            if (user.tier === 'Silver') interestRate = 1.2;
            else if (user.tier === 'Gold') interestRate = 0.9;
            else if (user.tier === 'Diamond') interestRate = 0; // Trả góp 0% cho VIP
            else {
                return res.status(403).json({
                    success: false,
                    message: 'Chương trình MotoZone Finance chỉ áp dụng cho Khách Hàng VIP (Silver trở lên).'
                });
            }
        }

        // D. Công thức tính lãi suất phẳng hàng tháng: (Gốc / Số tháng) + (Gốc * Lãi suất)
        const principalPerMonth = loanAmount / duration_months;
        const interestPerMonth = loanAmount * (interestRate / 100);
        const monthlyPayment = principalPerMonth + interestPerMonth;

        // Lưu hợp đồng
        const installment = await Installment.create({
            user_id: user._id,
            product_id,
            vehicle_price: product.price,
            prepayment,
            loan_amount: loanAmount,
            interest_rate: interestRate,
            duration_months,
            monthly_payment: monthlyPayment,
            finance_company: provider,
            status: 'pending' // Chuyển về pending để Admin duyệt
        });

        res.status(201).json({
            success: true,
            message: 'Hồ sơ vay của bạn đã ĐƯỢC GỬI CHỜ DUYỆT.',
            data: {
                installment,
                user_tier: user.tier,
                applied_interest_rate: interestRate + '%'
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Coi lại các Hợp đồng Vay (Lịch sử của tôi)
exports.getMyLoans = async (req, res) => {
    try {
        const loans = await Installment.find({ user_id: req.user._id })
            .populate('product_id', 'name brand image_url price')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, data: loans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Admin: Xem tất cả hồ sơ vay
exports.getAllLoans = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip  = (page - 1) * limit;
        const total = await Installment.countDocuments();

        const loans = await Installment.find()
            .populate('user_id', 'name email tier credit_score has_bad_debt')
            .populate('product_id', 'name brand price')
            .sort({ createdAt: -1 })
            .skip(skip).limit(limit);

        res.json({ success: true, data: loans, pagination: { page, limit, total } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. (Mô phỏng Admin) Báo cáo Nợ Xấu cho khách hàng
exports.markBadDebt = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });

        user.has_bad_debt = true;
        user.credit_score -= 200; // Phạt điểm tín dụng
        await user.save();

        // Cập nhật tất cả hợp đồng thành nợ xấu
        await Installment.updateMany(
            { user_id: user._id, status: 'active' },
            { status: 'defaulted' }
        );

        res.json({ success: true, message: `Đã đánh dấu Nợ Xấu cho khách hàng ${user.name}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
