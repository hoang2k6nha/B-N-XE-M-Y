const Order = require('../models/Order');

// Webhook nhận dữ liệu từ SePay khi có biến động số dư
exports.handleWebhook = async (req, res) => {
    try {
        /*
          Payload mẫu từ SePay:
          {
            "id": 12345,
            "gateway": "Vietcombank",
            "transactionDate": "2026-09-29 10:45:00",
            "accountNumber": "0123456789",
            "code": "MOTOZONEabc123", // Nội dung chuyển khoản chứa mã đơn
            "content": "Nguyen Van A thanh toan MOTOZONEabc123",
            "transferType": "in",
            "transferAmount": 50000000
          }
        */
        const data = req.body;
        
        // 1. Kiểm tra đây là giao dịch tiền vào
        if (data.transferType === 'in') {
            const content = (data.content || data.code || '').toUpperCase();
            
            // 2. Trích xuất mã đơn hàng từ nội dung (Giả sử cú pháp: MOTOZONE + ID đơn hàng 8 số cuối)
            // Trong thực tế, mình lấy order._id, cắt lấy 8 ký tự cuối làm mã giao dịch
            // VD: OrderID: 666ae0dc854e4ddcb70c1234 -> Mã SePay: MOTOZONE1234
            
            // Tìm tất cả đơn hàng đang pending
            const pendingOrders = await Order.find({ payment_status: 'pending' });
            let matchedOrder = null;
            
            for (let order of pendingOrders) {
                const shortId = order._id.toString().slice(-8).toUpperCase();
                const expectedCode = `MOTOZONE${shortId}`;
                
                if (content.includes(expectedCode)) {
                    // Kiểm tra xem số tiền có đủ không (Thực tế nên >=, ở đây demo có thể du di)
                    if (data.transferAmount >= (order.total_price || 0)) {
                        matchedOrder = order;
                        break;
                    }
                }
            }
            
            // 3. Nếu tìm thấy đơn hàng hợp lệ
            if (matchedOrder) {
                matchedOrder.payment_status = 'paid';
                matchedOrder.status = 'confirmed'; // Xác nhận luôn
                await matchedOrder.save();
                
                // 4. Bắn Socket cho Admin và User biết
                const io = req.app.get('io');
                
                // Bắn cho tất cả (hoặc chỉ gửi vào room Admin)
                io.emit('notification', {
                    title: 'SePay: Nhận Tiền Thành Công',
                    message: `Đơn hàng ${matchedOrder._id.toString().substring(0,8)} vừa được thanh toán ${data.transferAmount.toLocaleString()} VNĐ!`,
                    type: 'success'
                });
                
                // Nếu muốn báo riêng cho Admin (giả sử có logic phân biệt socket admin)
                // Hiện tại cứ bắn io.emit là nhanh nhất
                
                return res.json({ success: true, message: 'Webhook xử lý thành công' });
            }
        }
        
        res.json({ success: true, message: 'Bỏ qua giao dịch không khớp' });
    } catch (error) {
        console.error('SePay Webhook Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// API mô phỏng Webhook (Dành cho Demo)
exports.simulateWebhook = async (req, res) => {
    try {
        const { orderId, amount } = req.body;
        const shortId = orderId.slice(-8).toUpperCase();
        
        // Cấu trúc giả lập y hệt SePay gửi
        const mockPayload = {
            id: Math.floor(Math.random() * 100000),
            gateway: "MBBank",
            transactionDate: new Date().toISOString(),
            accountNumber: "999999999",
            code: `MOTOZONE${shortId}`,
            content: `KH TEST THANH TOAN MOTOZONE${shortId}`,
            transferType: "in",
            transferAmount: parseInt(amount)
        };
        
        // Tái sử dụng logic xử lý
        req.body = mockPayload;
        await exports.handleWebhook(req, res);
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
