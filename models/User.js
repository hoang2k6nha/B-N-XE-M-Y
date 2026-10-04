const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true },
    role:         { type: String, enum: ['customer', 'admin'], default: 'customer' },
    // Thông tin liên hệ
    phone:        { type: String },
    address:      { type: String },
    // KYC - Hồ sơ định danh
    cccd:         { type: String },          // Số Căn cước Công dân
    dob:          { type: Date },            // Ngày sinh
    gender:       { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
    city:         { type: String },          // Tỉnh/TP đăng ký biển số
    license_type: { type: String, enum: ['Chưa có', 'A1', 'A2', 'Khác'], default: 'Chưa có' },
    
    // Tín dụng & Ưu đãi (Nâng cấp)
    credit_score: { type: Number, default: 600 },    // Điểm tín dụng CIC (0-850)
    has_bad_debt: { type: Boolean, default: false }, // Có nợ xấu hay không
    total_purchases: { type: Number, default: 0 },   // Tổng tiền đã mua hàng
    tier:         { type: String, enum: ['New', 'Silver', 'Gold', 'Diamond'], default: 'New' } // Hạng thành viên
}, { 
    collection: 'users',
    timestamps: true
});

// Middleware mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Hàm kiểm tra mật khẩu
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
