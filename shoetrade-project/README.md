# 二手球鞋交易平台

一个基于Vue.js和Node.js的二手球鞋交易网站，适合毕业设计项目。

## 项目功能

- 用户注册登录（明文密码）
- 商品发布与浏览
- 商品搜索与筛选
- 购物车管理
- 模拟下单与订单管理
- 商品评价展示
- 简单"支付成功"按钮模拟支付
- 商品详情页显示"真假标记"和"价格走势图像"（静态）

## 技术栈

### 前端
- Vue 2
- Vue Router
- Vuex
- Element UI
- Axios

### 后端
- Node.js
- Express
- MongoDB
- Multer (图片上传)

## 项目结构

```
project-root/
├── frontend/                  # Vue前端项目
│   ├── public/                # 静态资源
│   ├── src/                   # 源代码
│   │   ├── components/        # 组件
│   │   ├── views/             # 页面
│   │   ├── router/            # 路由
│   │   ├── store/             # Vuex状态管理
│   │   ├── assets/            # 资源文件
│   │   ├── App.vue            # 根组件
│   │   └── main.js            # 入口文件
│   ├── package.json           # 包配置
│   └── ...
├── backend/                   # Node.js后端
│   ├── models/                # Mongoose模型
│   ├── routes/                # 路由
│   ├── controllers/           # 控制器
│   ├── uploads/               # 上传文件存储目录
│   ├── server.js              # 服务器入口文件
│   ├── package.json           # 包配置
│   └── ...
└── ...
```


## 安装与运行

### 前端

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式运行
npm run serve

# 生产构建
npm run build
```

### 后端

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 运行服务器
npm start

# 开发模式运行（热重载）
npm run dev
```

## 数据库设置

1. 确保已安装MongoDB并运行
2. 默认连接到`mongodb://localhost:27017/shoetrade`
3. 数据库会自动创建所需集合

## 接口说明

本项目提供以下RESTful API：

- 用户API：`/api/users/...`
- 商品API：`/api/products/...`
- 订单API：`/api/orders/...`
- 评价API：`/api/reviews/...`

详细API文档见[API文档](#)。

## 注意事项

- 本项目为教学/演示目的，未实现真实支付功能
- 用户密码采用明文存储，不适合生产环境
- 未实现完整的用户权限管理

## 截图

[待补充]

## 开发者

- 您的名字

## 许可

MIT 