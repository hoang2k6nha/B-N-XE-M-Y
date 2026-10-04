const express = require('express');
const router  = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addColor, deleteColor } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Công khai
router.get('/',    getProducts);
router.get('/:id', getProductById);

// Chỉ Admin
router.post('/',                          protect, admin, createProduct);
router.put('/:id',                        protect, admin, updateProduct);
router.delete('/:id',                     protect, admin, deleteProduct);
router.post('/:id/colors',               protect, admin, addColor);
router.delete('/:id/colors/:colorId',    protect, admin, deleteColor);

module.exports = router;
