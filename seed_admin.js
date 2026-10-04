const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce');
    
    // Check if admin exists
    let admin = await User.findOne({ email: 'admin@motozone.vn' });
    if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        // Cần bypass schema pre-save hook nếu gán password đã hash?
        // Không, vì hook sẽ hash lại. Nên cứ để password bình thường
        admin = new User({
            name: 'MotoZone Admin',
            email: 'admin@motozone.vn',
            password: '123', // Hook tự hash
            role: 'admin',
            tier: 'Diamond'
        });
        await admin.save();
        console.log('✅ Đã tạo tài khoản Admin: admin@motozone.vn / pass: 123');
    } else {
        // Upgrade existing user to admin
        admin.role = 'admin';
        await admin.save();
        console.log('✅ Tài khoản admin@motozone.vn đã có sẵn và được cấp quyền Admin');
    }
    
    // Nâng cấp cả tài khoản test cũ lên admin để test tiện hơn
    let oldUser = await User.findOne({ email: 'admin@gmail.com' });
    if(oldUser) {
        oldUser.role = 'admin';
        await oldUser.save();
        console.log('✅ Đã nâng cấp admin@gmail.com lên quyền Admin');
    }
    
    process.exit();
}

createAdmin();
