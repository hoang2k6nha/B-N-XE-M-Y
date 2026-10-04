const express = require('express');
const router = express.Router();
const { getStats, getOrders, updateOrderStatus, getInstallments, updateInstallmentStatus, updateStock, createProduct, updateProduct, deleteProduct } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin); // Áp dụng bảo vệ cho tất cả route admin

router.get('/stats', getStats);
router.get('/orders', getOrders);
router.put('/orders/:orderId/status', updateOrderStatus);
router.get('/installments', getInstallments);
router.put('/installments/:id/status', updateInstallmentStatus);
router.put('/products/:id/stock', updateStock);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// User Management Routes
const { getUsers, deleteUser, resetUserPassword, createUser } = require('../controllers/adminController');
router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', resetUserPassword);

module.exports = router;
