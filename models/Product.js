const mongoose = require('mongoose');

// Schema màu sắc (tương đương bảng product_colors trong PHP/MySQL)
const colorSchema = new mongoose.Schema({
    color_name: { type: String, required: true },
    color_hex:  { type: String, default: '#cccccc' },
    image_url:  { type: String }
}, { _id: true });

// Schema sản phẩm đầy đủ - ngang bằng PHP Laravel
const productSchema = new mongoose.Schema({
    name:             { type: String, required: true, trim: true },
    description:      { type: String },
    price:            { type: Number, required: true, min: 0 },
    stock:            { type: Number, default: 0 },
    brand:            { type: String },
    engine:           { type: String },      // VD: "157cc", "998cc L4"
    weight:           { type: String },      // VD: "133 kg"
    fuel_consumption: { type: String },      // VD: "2.24 L/100km"
    warranty:         { type: String },      // VD: "3 năm hoặc 30.000 km"
    image_url:        { type: String },
    colors:           [colorSchema],         // Mảng màu sắc (embedded document)
    category_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
}, { 
    collection: 'products',
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
