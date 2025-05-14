const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// 创建订单（从购物车）
router.post('/', async (req, res) => {
  try {
    const { buyerId } = req.body;
    
    // 获取用户购物车
    const user = await User.findById(buyerId).populate('cart.productId');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    if (user.cart.length === 0) {
      return res.status(400).json({ message: '购物车为空，无法创建订单' });
    }
    
    // 计算订单总价
    let totalPrice = 0;
    const orderProducts = user.cart.map(item => {
      const product = item.productId;
      totalPrice += product.price * item.quantity;
      
      return {
        productId: product._id,
        quantity: item.quantity
      };
    });
    
    // 创建新订单
    const newOrder = new Order({
      buyerId,
      products: orderProducts,
      totalPrice,
      status: '待支付'
    });
    
    const savedOrder = await newOrder.save();
    
    // 清空购物车
    user.cart = [];
    await user.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取用户所有订单
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('products.productId');
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取订单详情
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.productId')
      .populate('buyerId', 'username email');
    
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 支付订单（模拟）
router.post('/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    if (order.status === '已完成') {
      return res.status(400).json({ message: '订单已支付' });
    }
    
    // 更新订单状态为已完成
    order.status = '已完成';
    await order.save();
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 