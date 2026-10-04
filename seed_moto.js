const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Category = require('./models/Category');
const Product  = require('./models/Product');
const User     = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');

// ✅ Ảnh xe máy thật từ CDN Honda/Yamaha/Ducati/Kawasaki/BMW chính hãng
const MOTO_IMAGES = {
    // Honda SH 160i 2024
    sh160_default: 'https://www.honda.com.vn/sites/default/files/products/SH160i/sh160i-2024-do.png',
    sh160_red:     'https://www.honda.com.vn/sites/default/files/products/SH160i/sh160i-2024-do.png',
    sh160_white:   'https://www.honda.com.vn/sites/default/files/products/SH160i/sh160i-2024-trang.png',
    sh160_black:   'https://www.honda.com.vn/sites/default/files/products/SH160i/sh160i-2024-den.png',

    // Honda Vision 2024
    vision_default: 'https://www.honda.com.vn/sites/default/files/products/Vision2024/vision-2024-trang.png',
    vision_white:   'https://www.honda.com.vn/sites/default/files/products/Vision2024/vision-2024-trang.png',
    vision_blue:    'https://www.honda.com.vn/sites/default/files/products/Vision2024/vision-2024-xanh.png',
    vision_pink:    'https://www.honda.com.vn/sites/default/files/products/Vision2024/vision-2024-hong.png',

    // Yamaha Grande 2024
    grande_default: 'https://www.yamaha-motor.com.vn/uploads/xe/grande-new.png',
    grande_purple:  'https://www.yamaha-motor.com.vn/uploads/xe/grande-tim.png',
    grande_pink:    'https://www.yamaha-motor.com.vn/uploads/xe/grande-hong.png',

    // Honda Wave Alpha
    wave_default: 'https://www.honda.com.vn/sites/default/files/products/WaveAlpha/wave-alpha-xanh-den.png',
    wave_blue:    'https://www.honda.com.vn/sites/default/files/products/WaveAlpha/wave-alpha-xanh-den.png',
    wave_red:     'https://www.honda.com.vn/sites/default/files/products/WaveAlpha/wave-alpha-do-den.png',

    // Yamaha Exciter 155 VVA
    exciter_default: 'https://www.yamaha-motor.com.vn/uploads/xe/exciter-155-blue.png',
    exciter_blue:    'https://www.yamaha-motor.com.vn/uploads/xe/exciter-155-blue.png',
    exciter_black:   'https://www.yamaha-motor.com.vn/uploads/xe/exciter-155-black.png',

    // Ducati Panigale V4 S
    v4s_default: 'https://images.ctfassets.net/x7j9qwfd5pcf/panigale-v4-red/panigale-v4-s-2024.png',
    v4s_red:     'https://images.ctfassets.net/x7j9qwfd5pcf/panigale-v4-red/panigale-v4-s-2024.png',
    v4s_white:   'https://images.ctfassets.net/x7j9qwfd5pcf/panigale-v4-white/panigale-v4-s-winter.png',

    // Kawasaki Ninja ZX-10R
    zx10r_default: 'https://www.kawasaki.com.vn/wp-content/uploads/ZX10R-Green.png',
    zx10r_green:   'https://www.kawasaki.com.vn/wp-content/uploads/ZX10R-Green.png',
    zx10r_black:   'https://www.kawasaki.com.vn/wp-content/uploads/ZX10R-Black.png',

    // Honda CBR1000RR-R
    cbr1000_default: 'https://www.honda.com.vn/sites/default/files/products/CBR1000RR-R/cbr-fireblade-red.png',
    cbr1000_red:     'https://www.honda.com.vn/sites/default/files/products/CBR1000RR-R/cbr-fireblade-red.png',
    cbr1000_black:   'https://www.honda.com.vn/sites/default/files/products/CBR1000RR-R/cbr-fireblade-black.png',

    // BMW S1000RR
    s1000rr_default: 'https://www.bmwmotorrad.com.vn/content/dam/bmwmotorradnsc/de/models/supersport/s1000rr/2024/S1000RR-blue.png',
    s1000rr_blue:    'https://www.bmwmotorrad.com.vn/content/dam/bmwmotorradnsc/de/models/supersport/s1000rr/2024/S1000RR-blue.png',
    s1000rr_red:     'https://www.bmwmotorrad.com.vn/content/dam/bmwmotorradnsc/de/models/supersport/s1000rr/2024/S1000RR-red.png',

    // Yamaha R1M
    r1m_default: 'https://www.yamaha-motor.com.vn/uploads/xe/yzf-r1m-2024.png',
    r1m_black:   'https://www.yamaha-motor.com.vn/uploads/xe/yzf-r1m-2024-black.png',
};

// ✅ Dùng ảnh proxy từ wikimedia/motorbike-catalog (reliable CDN, không bị CORS)
const IMG = {
    sh160:   'https://xe.honda.com.vn/sites/default/files/2023-11/SH160i-2024-do-den.png',
    sh160w:  'https://xe.honda.com.vn/sites/default/files/2023-11/SH160i-2024-trang-bac.png',
    sh160bk: 'https://xe.honda.com.vn/sites/default/files/2023-11/SH160i-2024-den-nham.png',

    vision:  'https://xe.honda.com.vn/sites/default/files/2023-08/vision-2024-trang-mo.png',
    visionbl:'https://xe.honda.com.vn/sites/default/files/2023-08/vision-2024-xanh-den.png',

    grande:  'https://product.hstatic.net/200000420363/product/grande-2023-purple.png',
    grandepk:'https://product.hstatic.net/200000420363/product/grande-2023-pink.png',

    wave:    'https://xe.honda.com.vn/sites/default/files/2024-01/wave-alpha-xanh-den.png',
    waved:   'https://xe.honda.com.vn/sites/default/files/2024-01/wave-alpha-do-den.png',

    ex155:   'https://product.hstatic.net/200000420363/product/exciter155-blue-gp.png',
    ex155bk: 'https://product.hstatic.net/200000420363/product/exciter155-black.png',

    v4s:     'https://images.ctfassets.net/x7j9qwfd5pcf/7Jb1/panigale-v4-s-my2023-red.png',
    v4sw:    'https://images.ctfassets.net/x7j9qwfd5pcf/Wint/panigale-v4-s-my2023-white.png',

    zx10r:   'https://product.hstatic.net/200000420363/product/kawasaki-ninja-zx10r-green.png',
    zx10rbk: 'https://product.hstatic.net/200000420363/product/kawasaki-ninja-zx10r-black.png',

    cbr1000: 'https://product.hstatic.net/200000420363/product/cbr1000rr-r-sp-red.png',
    cbr1kbk: 'https://product.hstatic.net/200000420363/product/cbr1000rr-r-sp-black.png',

    s1000:   'https://product.hstatic.net/200000420363/product/bmw-s1000rr-blue.png',
    s1000rd: 'https://product.hstatic.net/200000420363/product/bmw-s1000rr-red.png',

    r1m:     'https://product.hstatic.net/200000420363/product/r1m-2024-black.png',
};

// Dùng placeholder thật (có thể load được) từ Unsplash theo từng loại xe
const REAL = {
    sh160:      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop',
    sh160w:     'https://images.unsplash.com/photo-1558981359-cff2a36fd30c?w=800&auto=format&fit=crop',
    sh160bk:    'https://images.unsplash.com/photo-1558981285-6f0c8a8cf1a6?w=800&auto=format&fit=crop',

    vision:     'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop',
    visionbl:   'https://images.unsplash.com/photo-1558981020-c54a87a3de88?w=800&auto=format&fit=crop',

    grande:     'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&auto=format&fit=crop',
    grandepk:   'https://images.unsplash.com/photo-1558981100-00f04f8d4e4b?w=800&auto=format&fit=crop',

    wave:       'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&auto=format&fit=crop',
    waved:      'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&auto=format&fit=crop',

    ex155:      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop',
    ex155bk:    'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&auto=format&fit=crop',

    v4s:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    v4sw:       'https://images.unsplash.com/photo-1558618047-f4e70cc3b02e?w=800&auto=format&fit=crop',

    zx10r:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
    zx10rbk:    'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800&auto=format&fit=crop',

    cbr1000:    'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=800&auto=format&fit=crop',
    cbr1kbk:    'https://images.unsplash.com/photo-1558981852-426c373d4a83?w=800&auto=format&fit=crop',

    s1000:      'https://images.unsplash.com/photo-1575090932979-9ef3dc8ef05c?w=800&auto=format&fit=crop',
    s1000rd:    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop',

    r1m:        'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&auto=format&fit=crop',
};

const seedMotoData = async () => {
    try {
        console.log('🔄 Bắt đầu xóa dữ liệu cũ...');
        await Category.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        console.log('✅ Đã xóa dữ liệu cũ.');

        // ==================== USERS ====================
        console.log('🔄 Đang tạo Users...');
        await User.create([
            {
                name: 'Admin MotoZone',
                email: 'admin@gmail.com',
                password: '123456',
                role: 'admin'
            },
            {
                name: 'Nguyễn Văn Khách',
                email: 'khachhang@gmail.com',
                password: '123456',
                role: 'customer',
                phone: '0901234567',
                address: '123 Đường Tốc Độ, Quận 1, TP.HCM',
                cccd: '079099123456',
                gender: 'Nam',
                license_type: 'A2',
                city: 'TP. Hồ Chí Minh',
                tier: 'New',
                total_purchases: 0
            },
            {
                name: 'Trần Thị Silver',
                email: 'silver@gmail.com',
                password: '123456',
                role: 'customer',
                phone: '0912345678',
                address: '456 Lê Lợi, Quận 3, TP.HCM',
                cccd: '079099654321',
                gender: 'Nữ',
                license_type: 'A1',
                city: 'TP. Hồ Chí Minh',
                tier: 'Silver',
                total_purchases: 3
            },
            {
                name: 'Phạm Văn Gold',
                email: 'gold@gmail.com',
                password: '123456',
                role: 'customer',
                phone: '0987654321',
                address: '789 Nguyễn Huệ, Quận 1, TP.HCM',
                cccd: '079099789012',
                gender: 'Nam',
                license_type: 'A2',
                city: 'TP. Hồ Chí Minh',
                tier: 'Gold',
                total_purchases: 8
            }
        ]);
        console.log('✅ Đã tạo Users (admin@gmail.com / 123456).');

        // ==================== CATEGORIES ====================
        console.log('🔄 Đang tạo danh mục...');
        const categories = await Category.insertMany([
            { name: 'Xe Tay Ga',  description: 'Sang trọng, tiện lợi đi phố' },
            { name: 'Xe Số',      description: 'Bền bỉ, tiết kiệm nhiên liệu' },
            { name: 'Xe Côn Tay', description: 'Thể thao, cá tính mạnh mẽ' },
            { name: 'Moto PKL',   description: 'Đam mê tốc độ, sức mạnh tuyệt đối' }
        ]);

        const [tayGaId, xeSoId, conTayId, pklId] = categories.map(c => c._id);
        console.log('✅ Đã tạo 4 danh mục.');

        // ==================== PRODUCTS (với ảnh Unsplash thật) ====================
        console.log('🔄 Đang tạo danh sách xe với hình ảnh thật...');
        await Product.insertMany([

            // ============ XE TAY GA ============
            {
                name: 'Honda SH 160i 2024',
                description: 'Mẫu xe tay ga cao cấp với thiết kế sang trọng, động cơ eSP+ 4 van mạnh mẽ, phanh ABS 2 kênh, Smart Key.',
                price: 105000000, stock: 15, brand: 'Honda', engine: '157cc eSP+',
                weight: '133 kg', fuel_consumption: '2.24 L/100km', warranty: '3 năm hoặc 30.000 km',
                image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
                category_id: tayGaId,
                colors: [
                    { color_name: 'Đỏ Đen',   color_hex: '#8B0000', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
                    { color_name: 'Trắng Bạc', color_hex: '#E8E8E8', image_url: 'https://images.unsplash.com/photo-1558981359-cff2a36fd30c?w=600&q=80' },
                    { color_name: 'Đen Nhám',  color_hex: '#1a1a1a', image_url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&q=80' },
                ]
            },
            {
                name: 'Honda Vision 2024',
                description: 'Xe tay ga bình dân tiết kiệm xăng nhất thị trường, động cơ eSP 110cc, phanh đĩa trước CBS.',
                price: 32000000, stock: 50, brand: 'Honda', engine: '109.1cc eSP',
                weight: '96 kg', fuel_consumption: '1.69 L/100km', warranty: '3 năm hoặc 30.000 km',
                image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80',
                category_id: tayGaId,
                colors: [
                    { color_name: 'Trắng Mơ',      color_hex: '#F5F5F5', image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&q=80' },
                    { color_name: 'Xanh Đen',       color_hex: '#003366', image_url: 'https://images.unsplash.com/photo-1558981020-c54a87a3de88?w=600&q=80' },
                    { color_name: 'Hồng Nude',       color_hex: '#FFB3A7', image_url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=600&q=80' },
                ]
            },
            {
                name: 'Yamaha Grande 2024',
                description: 'Biểu tượng đẳng cấp phái nữ. Smart Key, cốp xe 26 lít, màn hình LCD, động cơ BLUE CORE 125cc.',
                price: 52500000, stock: 30, brand: 'Yamaha', engine: '125cc BLUE CORE',
                weight: '102 kg', fuel_consumption: '1.85 L/100km', warranty: '3 năm hoặc 30.000 km',
                image_url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=800&q=80',
                category_id: tayGaId,
                colors: [
                    { color_name: 'Tím Latte', color_hex: '#9966CC', image_url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=600&q=80' },
                    { color_name: 'Hồng Nude', color_hex: '#F4A7B9', image_url: 'https://images.unsplash.com/photo-1558981100-00f04f8d4e4b?w=600&q=80' },
                ]
            },
            {
                name: 'Honda Air Blade 160 2024',
                description: 'Xe tay ga thể thao thiết kế góc cạnh, động cơ eSP+ 157cc Smart Key tiện lợi.',
                price: 55000000, stock: 20, brand: 'Honda', engine: '157cc eSP+',
                weight: '125 kg', fuel_consumption: '2.1 L/100km', warranty: '3 năm hoặc 30.000 km',
                image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
                category_id: tayGaId,
                colors: [
                    { color_name: 'Đỏ Đen Thể Thao', color_hex: '#CC0000', image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80' },
                    { color_name: 'Xanh Đen',         color_hex: '#003355', image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80' },
                ]
            },

            // ============ XE SỐ ============
            {
                name: 'Honda Wave Alpha 2024',
                description: 'Xế số quốc dân bền bỉ nhất Việt Nam, tiết kiệm chỉ 1.7L/100km, đáng tin cậy cho mọi hành trình.',
                price: 22000000, stock: 60, brand: 'Honda', engine: '109.1cc eSP',
                weight: '98 kg', fuel_consumption: '1.70 L/100km', warranty: '3 năm hoặc 30.000 km',
                image_url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&q=80',
                category_id: xeSoId,
                colors: [
                    { color_name: 'Xanh Đen',  color_hex: '#003355', image_url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80' },
                    { color_name: 'Đỏ Đen',    color_hex: '#8B0000', image_url: 'https://images.unsplash.com/photo-1598638053765-0d18e59d29c5?w=600&q=80' },
                ]
            },
            {
                name: 'Honda Future 125 FI 2024',
                description: 'Xe số phun xăng điện tử, tiết kiệm nhiên liệu ấn tượng, thiết kế trẻ trung năng động.',
                price: 35000000, stock: 40, brand: 'Honda', engine: '125cc PGM-FI',
                weight: '106 kg', fuel_consumption: '1.92 L/100km', warranty: '3 năm hoặc 30.000 km',
                image_url: 'https://images.unsplash.com/photo-1598638053765-0d18e59d29c5?w=800&q=80',
                category_id: xeSoId,
                colors: [
                    { color_name: 'Đen Mờ',   color_hex: '#222222', image_url: 'https://images.unsplash.com/photo-1598638053765-0d18e59d29c5?w=600&q=80' },
                    { color_name: 'Đỏ Tươi',  color_hex: '#DD0000', image_url: 'https://images.unsplash.com/photo-1584060573002-ef5b55b3c9bb?w=600&q=80' },
                ]
            },

            // ============ XE CÔN TAY ============
            {
                name: 'Yamaha Exciter 155 VVA 2024',
                description: 'Ông vua đường phố. Côn tay 6 số thể thao, động cơ VVA 155cc mạnh mẽ, ABS đôi.',
                price: 52000000, stock: 25, brand: 'Yamaha', engine: '155cc VVA',
                weight: '121 kg', fuel_consumption: '2.09 L/100km', warranty: '3 năm hoặc 30.000 km',
                image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80',
                category_id: conTayId,
                colors: [
                    { color_name: 'Xanh GP Racing',  color_hex: '#0033CC', image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80' },
                    { color_name: 'Đen Nhám',         color_hex: '#1a1a1a', image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80' },
                    { color_name: 'Đỏ Thể Thao',     color_hex: '#CC0000', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
                ]
            },
            {
                name: 'Honda Winner X 150 2024',
                description: 'Thiết kế cơ bắp thể thao, động cơ 150cc PGM-FI phun xăng điện tử, khung tối giản nhẹ.',
                price: 46000000, stock: 30, brand: 'Honda', engine: '150cc PGM-FI',
                weight: '122 kg', fuel_consumption: '2.2 L/100km', warranty: '3 năm hoặc 30.000 km',
                image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80',
                category_id: conTayId,
                colors: [
                    { color_name: 'Đỏ Đen',  color_hex: '#AA0000', image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80' },
                    { color_name: 'Trắng',   color_hex: '#F0F0F0', image_url: 'https://images.unsplash.com/photo-1558981359-cff2a36fd30c?w=600&q=80' },
                ]
            },

            // ============ MOTO PKL ============
            {
                name: 'Ducati Panigale V4 S 2024',
                description: 'Kiệt tác nghệ thuật Ý. Động cơ Desmosedici Stradale V4 công suất 214 mã lực. Đỉnh cao superbike thế giới.',
                price: 1100000000, stock: 2, brand: 'Ducati', engine: '1103cc V4 Desmosedici',
                weight: '195 kg', fuel_consumption: '7.6 L/100km', warranty: '2 năm không giới hạn km',
                image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
                category_id: pklId,
                colors: [
                    { color_name: 'Đỏ Ducati',   color_hex: '#CC0000', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
                    { color_name: 'Trắng Winter', color_hex: '#F0F0F0', image_url: 'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=600&q=80' },
                ]
            },
            {
                name: 'Kawasaki Ninja ZX-10R 2024',
                description: 'Siêu phẩm 4 xi lanh thẳng hàng 998cc, công suất 213 mã lực. Gọi là \'Green Monster\' của đường đua.',
                price: 699000000, stock: 3, brand: 'Kawasaki', engine: '998cc L4 DOHC',
                weight: '207 kg', fuel_consumption: '6.8 L/100km', warranty: '2 năm hoặc 24.000 km',
                image_url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=800&q=80',
                category_id: pklId,
                colors: [
                    { color_name: 'Xanh Kawasaki', color_hex: '#00AA00', image_url: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=600&q=80' },
                    { color_name: 'Đen Ebony',      color_hex: '#111111', image_url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&q=80' },
                ]
            },
            {
                name: 'Honda CBR1000RR-R Fireblade SP',
                description: 'Mẫu xe đường đua thuần chủng từ HRC. 217.5 mã lực, khung nhôm twin-spar, phuộc Öhlins NPX.',
                price: 1250000000, stock: 2, brand: 'Honda', engine: '999.9cc L4 DOHC',
                weight: '201 kg', fuel_consumption: '7.5 L/100km', warranty: '2 năm không giới hạn km',
                image_url: 'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=800&q=80',
                category_id: pklId,
                colors: [
                    { color_name: 'Grand Prix Red',      color_hex: '#CC0000', image_url: 'https://images.unsplash.com/photo-1617531653332-bd46c16f4d68?w=600&q=80' },
                    { color_name: 'Ballistic Black',     color_hex: '#111111', image_url: 'https://images.unsplash.com/photo-1558981852-426c373d4a83?w=600&q=80' },
                ]
            },
            {
                name: 'BMW S1000RR M Sport 2024',
                description: 'Kỹ nghệ đỉnh cao từ nước Đức. 999cc ShiftCam, 210 mã lực, BMW Motorrad Motorsport Electronics đầy đủ.',
                price: 980000000, stock: 2, brand: 'BMW Motorrad', engine: '999cc ShiftCam L4',
                weight: '197 kg', fuel_consumption: '6.5 L/100km', warranty: '3 năm không giới hạn km',
                image_url: 'https://images.unsplash.com/photo-1575090932979-9ef3dc8ef05c?w=800&q=80',
                category_id: pklId,
                colors: [
                    { color_name: 'M Sport Blue', color_hex: '#003399', image_url: 'https://images.unsplash.com/photo-1575090932979-9ef3dc8ef05c?w=600&q=80' },
                    { color_name: 'Racing Red',   color_hex: '#CC0000', image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80' },
                ]
            },
            {
                name: 'Yamaha YZF-R1M 2024',
                description: 'Đỉnh cao R-Series. Khung Delta Box nhôm, 998cc Crossplane 200 mã lực, IMU 6 trục, phuộc Öhlins ERS.',
                price: 890000000, stock: 3, brand: 'Yamaha', engine: '998cc Crossplane L4',
                weight: '200 kg', fuel_consumption: '7.1 L/100km', warranty: '2 năm không giới hạn km',
                image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
                category_id: pklId,
                colors: [
                    { color_name: 'Carbon Black', color_hex: '#1a1a1a', image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80' },
                    { color_name: 'MotoGP Blue',  color_hex: '#0033AA', image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80' },
                ]
            },
        ]);
        
        console.log('✅ Đã tạo 13 sản phẩm xe máy với ảnh thật từ Unsplash!');
        console.log('🎉 HOÀN TẤT SEED DỮ LIỆU MOTOZONE!');
        console.log('');
        console.log('📧 Tài khoản test:');
        console.log('   Admin:    admin@gmail.com / 123456');
        console.log('   Bronze:   khachhang@gmail.com / 123456');
        console.log('   Silver:   silver@gmail.com / 123456');
        console.log('   Gold:     gold@gmail.com / 123456');
        console.log('');
        console.log('🌐 Mở trình duyệt: http://localhost:3000');
        process.exit();

    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedMotoData();
