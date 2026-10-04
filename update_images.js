const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function updateImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/motozone');
        console.log('Connected to DB');

        // Cập nhật Xe Tay Ga
        await Product.updateMany(
            { category: 'tay-ga' },
            { $set: { image: '/img/scooter.jpg' } }
        );

        // Cập nhật Xe Côn Tay
        await Product.updateMany(
            { category: 'con-tay' },
            { $set: { image: '/img/exciter.jpg' } }
        );

        // Cập nhật Xe Phân Khối Lớn
        await Product.updateMany(
            { category: 'pkl' },
            { $set: { image: '/img/ducati.jpg' } }
        );

        console.log('Cập nhật hình ảnh thành công!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateImages();
