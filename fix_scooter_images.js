const mongoose = require('mongoose');
const dotenv = require('dotenv');

const productSchema = new mongoose.Schema({
    name: String, image_url: String, colors: Array
}, { strict: false });
const Product = mongoose.model('Product', productSchema);

const updates = [
    { name: /Honda Air Blade/, img: 'https://images.unsplash.com/photo-1558981420-c532902e58b4?w=800&q=80' },
    { name: /Honda SH 160i/, img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80' },
    { name: /Honda Vision/, img: 'https://images.unsplash.com/photo-1591637333184-19aa84bcee96?w=800&q=80' },
    { name: /Yamaha Grande/, img: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80' }
];

async function run() {
    await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
    for (let u of updates) {
        await Product.updateMany({ name: u.name }, { $set: { image_url: u.img } });
    }
    console.log('Fixed scooter images');
    process.exit();
}

run();
