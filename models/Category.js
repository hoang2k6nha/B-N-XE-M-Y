const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String }
}, { 
    collection: 'categories',
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
