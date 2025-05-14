const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 获取所有商品（支持筛选）
router.get('/', async (req, res) => {
  try {
    const { brand, minSize, maxSize, minPrice, maxPrice, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    let query = {};
    
    if (brand) {
      query.brand = brand;
    }
    
    if (minSize && maxSize) {
      query.size = { $gte: minSize, $lte: maxSize };
    } else if (minSize) {
      query.size = { $gte: minSize };
    } else if (maxSize) {
      query.size = { $lte: maxSize };
    }
    
    if (minPrice && maxPrice) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice) {
      query.price = { $gte: minPrice };
    } else if (maxPrice) {
      query.price = { $lte: maxPrice };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个商品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'username');
    
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 发布新商品（包含图片上传）
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { name, brand, price, size, description, sellerId, verified } = req.body;
    
    // 获取上传的图片路径
    const images = req.files ? req.files.map(file => file.filename) : [];
    
    const newProduct = new Product({
      name,
      brand,
      price,
      size,
      description,
      images,
      sellerId,
      verified: verified || false
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取卖家的所有商品
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 上传商品图片
router.post('/upload', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '没有上传文件' });
    }
    
    const imageUrls = req.files.map(file => file.filename);
    res.status(200).json({ imageUrls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 