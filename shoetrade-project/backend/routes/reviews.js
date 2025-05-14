const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');

// 添加商品评价
router.post('/', async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;
    
    // 验证用户是否购买过该商品
    const order = await Order.findOne({
      buyerId: userId,
      'products.productId': productId,
      status: '已完成'
    });
    
    if (!order) {
      return res.status(400).json({ message: '只有购买过的商品才能评价' });
    }
    
    // 检查是否已评价过
    const existingReview = await Review.findOne({
      productId,
      userId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: '您已经评价过该商品' });
    }
    
    // 创建新评价
    const newReview = new Review({
      productId,
      userId,
      rating,
      comment
    });
    
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取商品的所有评价
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username');
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取用户的所有评价
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('productId', 'name brand images');
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 