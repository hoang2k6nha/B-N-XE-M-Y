const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/products — Lấy danh sách sản phẩm (có filter + sort + phân trang)
exports.getProducts = async (req, res) => {
    try {
        const query = {};
        
        // Lọc theo từ khóa tìm kiếm
        if (req.query.search) {
            query.$or = [
                { name:  { $regex: req.query.search, $options: 'i' } },
                { brand: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Lọc theo Category ID
        if (req.query.category) {
            query.category_id = req.query.category;
        }
        
        // Lọc theo khoảng giá (dùng chung key price_range như PHP)
        if (req.query.price_range) {
            if (req.query.price_range === 'under_60')   query.price = { $lt: 60000000 };
            if (req.query.price_range === '60_150')     query.price = { $gte: 60000000, $lte: 150000000 };
            if (req.query.price_range === 'over_150')   query.price = { $gt: 150000000 };
        }

        // Sắp xếp
        let sortObj = { createdAt: -1 }; // Mặc định: Mới nhất
        if (req.query.sort === 'oldest')     sortObj = { createdAt: 1 };
        if (req.query.sort === 'price_asc')  sortObj = { price: 1 };
        if (req.query.sort === 'price_desc') sortObj = { price: -1 };
        if (req.query.sort === 'name_asc')   sortObj = { name: 1 };

        // Phân trang
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip  = (page - 1) * limit;
        const total = await Product.countDocuments(query);

        const products = await Product.find(query)
            .populate('category_id', 'name')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);
            
        res.json({ 
            success: true, 
            data: products,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/products/:id — Lấy chi tiết 1 sản phẩm
exports.getProductById = async (req, res) => {
    try {
        // Validate ObjectId trước khi query
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }
        const product = await Product.findById(req.params.id).populate('category_id', 'name');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/products — Admin thêm sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /api/products/:id — Admin cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/products/:id — Admin xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/products/:id/colors — Admin thêm màu sắc vào sản phẩm
exports.addColor = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

        product.colors.push(req.body);
        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/products/:id/colors/:colorId — Admin xóa màu sắc
exports.deleteColor = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

        product.colors = product.colors.filter(c => c._id.toString() !== req.params.colorId);
        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
