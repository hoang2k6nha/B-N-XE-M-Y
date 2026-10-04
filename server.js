require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const http     = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Gắn io vào app để dùng trong các controllers
app.set('io', io);

// Map lưu userId -> socketId
const userSockets = new Map();

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        if(userId) {
            userSockets.set(userId, socket.id);
            console.log(`[Socket] User ${userId} connected`);
        }
    });
    
    socket.on('disconnect', () => {
        for (let [userId, sockId] of userSockets.entries()) {
            if (sockId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
    });
});
app.set('userSockets', userSockets);

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Import Routes
const productRoutes   = require('./routes/productRoutes');
const categoryRoutes  = require('./routes/categoryRoutes');
const authRoutes        = require('./routes/authRoutes');
const orderRoutes       = require('./routes/orderRoutes');
const testDriveRoutes   = require('./routes/testDriveRoutes');
const installmentRoutes = require('./routes/installmentRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const sepayRoutes       = require('./routes/sepayRoutes'); // Thêm SePay

// Định tuyến API
app.use('/api/products',    productRoutes);
app.use('/api/categories',  categoryRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/test-drives', testDriveRoutes);
app.use('/api/installments',installmentRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/sepay',       sepayRoutes); // Thêm SePay

// Trang chủ test Server
app.get('/', (req, res) => {
    res.json({ 
        message: '🏍️ MotoZone API đang chạy!',
        version: '2.0.0',
        endpoints: {
            products:   '/api/products',
            auth:       '/api/auth',
            orders:     '/api/orders',
            testDrives: '/api/test-drives',
            categories: '/api/categories'
        }
    });
});

// Xử lý lỗi 404 - Phân tách API và Web
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(404).json({ success: false, message: 'Route Not Found (Lỗi 404 - Không tìm thấy đường dẫn)' });
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 MotoZone Node.js API đang chạy tại http://localhost:${PORT}`);
});
