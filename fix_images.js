const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
require('dotenv').config();

async function fixImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce');
        console.log("Connected to DB");

        const cats = await Category.find();
        
        let tayGaId = null;
        let xeSoId = null;
        let conTayId = null;
        let pklId = null;

        for(let c of cats) {
            if(c.name === 'Xe Tay Ga') tayGaId = c._id;
            if(c.name === 'Xe Số') xeSoId = c._id;
            if(c.name === 'Xe Côn Tay') conTayId = c._id;
            if(c.name === 'Moto PKL') pklId = c._id;
        }

        console.log({tayGaId, xeSoId, conTayId, pklId});

        // 1. Fix Xe Tay Ga images
        if(tayGaId) {
            const result = await Product.updateMany(
                { category_id: tayGaId },
                { $set: { image_url: '/img/scooter.jpg' } }
            );
            console.log("Tay Ga updated:", result.modifiedCount);
        }

        // 2. Fix Xe Số & Xe Côn Tay images
        if(xeSoId) {
            await Product.updateMany(
                { category_id: xeSoId },
                { $set: { image_url: '/img/exciter.jpg' } }
            );
        }
        if(conTayId) {
            await Product.updateMany(
                { category_id: conTayId },
                { $set: { image_url: '/img/exciter.jpg' } }
            );
        }

        // 3. Fix Moto PKL images
        if(pklId) {
            await Product.updateMany(
                { category_id: pklId },
                { $set: { image_url: '/img/ducati.jpg' } }
            );
        }

        console.log("Fix completed.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixImages();
