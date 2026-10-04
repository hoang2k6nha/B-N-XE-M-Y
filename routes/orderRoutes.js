const express = require('express');
const router  = express.Router();
const { addOrderItems, getMyOrders, getAllOrders, getOrderById, getContract, updateOrderStatus } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/',                   protect, admin, getAllOrders);      // Admin: xem tất cả đơn hàng
router.post('/',                  protect, addOrderItems);           // Tạo đơn hàng mới
router.get('/myorders',           protect, getMyOrders);             // Lịch sử của tôi
router.get('/:id',                protect, getOrderById);            // Xem chi tiết 1 đơn
router.get('/:id/contract',       protect, getContract);             // Xem hợp đồng
router.put('/:id/status',         protect, admin, updateOrderStatus); // Admin cập nhật trạng thái

module.exports = router;
