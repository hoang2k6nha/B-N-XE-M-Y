const mongoose = require('mongoose');
const dotenv = require('dotenv');

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
    
    // Set BMW S1000RR and Ducati to 0 stock
    await Product.updateMany(
        { name: { $in: [/BMW S 1000 RR/, /Ducati Panigale/] } },
        { $set: { stock: 0 } }
    );
    
    // Set all other products to 10 stock if they don't have stock or if they do
    await Product.updateMany(
        { name: { $nin: [/BMW S 1000 RR/, /Ducati Panigale/] } },
        { $set: { stock: 10 } }
    );

    console.log('Cập nhật tồn kho (stock) thành công: BMW và Ducati hết hàng (stock = 0). Các xe khác (stock = 10)');
    process.exit();
}

run();
