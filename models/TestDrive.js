const mongoose = require('mongoose');

// Schema TestDrive (tương đương bảng test_drives trong PHP/MySQL)
const testDriveSchema = new mongoose.Schema({
    user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    preferred_date: { type: Date, required: true },
    status:         { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes:          { type: String }
}, {
    collection: 'test_drives',
    timestamps: true
});

module.exports = mongoose.model('TestDrive', testDriveSchema);
