const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce');
        const cats = await Category.find();
        console.log("Categories in DB:");
        console.log(cats);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkCategories();
