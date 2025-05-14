const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// 导入路由
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const reviewsRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/reviews', reviewsRoutes);

// 测试路由
app.get('/', (req, res) => {
  res.send('二手球鞋交易平台API运行正常');
});

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/shoetrade', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
.then(() => {
  console.log('数据库连接成功');
  
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在: http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('数据库连接失败:', err.message);
}); 