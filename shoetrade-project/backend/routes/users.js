const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 创建新用户
    const newUser = new User({
      username,
      password, // 注意：这里是明文密码，实际项目应该加密
      email
    });
    
    const savedUser = await newUser.save();
    
    // 不返回密码
    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email
    };
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    
    // 验证密码（明文比较）
    if (password !== user.password) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    
    // 登录成功返回用户信息（不包含密码）
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取用户购物车
router.get('/:id/cart', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('cart.productId')
      .select('cart');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加商品到购物车
router.post('/:id/cart', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查购物车是否已有该商品
    const existingItemIndex = user.cart.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // 更新数量
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // 添加新商品
      user.cart.push({ productId, quantity });
    }
    
    await user.save();
    
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 从购物车删除商品
router.delete('/:userId/cart/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    user.cart = user.cart.filter(
      item => item.productId.toString() !== productId
    );
    
    await user.save();
    
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 清空购物车
router.delete('/:id/cart', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    user.cart = [];
    await user.save();
    
    res.status(200).json({ message: '购物车已清空' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 