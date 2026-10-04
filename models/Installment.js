const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
    user_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vehicle_price:   { type: Number, required: true }, // Giá gốc của xe
    prepayment:      { type: Number, required: true }, // Trả trước
    loan_amount:     { type: Number, required: true }, // Số tiền vay (giá xe - trả trước)
    interest_rate:   { type: Number, required: true }, // Lãi suất hàng tháng (%)
    duration_months: { type: Number, required: true }, // Số tháng vay (6, 12, 24...)
    monthly_payment: { type: Number, required: true }, // Tiền đóng hàng tháng
    finance_company: { type: String, default: 'MotoZone Finance' }, // Bên cho vay
    status:          { type: String, enum: ['pending', 'active', 'completed', 'defaulted', 'rejected'], default: 'pending' }, // Trạng thái
    rejected_reason: { type: String } // Lý do từ chối nếu status = rejected
}, {
    collection: 'installments',
    timestamps: true
});

module.exports = mongoose.model('Installment', installmentSchema);
