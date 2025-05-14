<template>
  <div class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>关于我们</h3>
        <p>二手球鞋交易平台是一个专注于球鞋交易的在线平台，为球鞋爱好者提供安全、便捷的二手球鞋交易服务。</p>
      </div>
      
      <div class="footer-section">
        <h3>联系方式</h3>
        <p>邮箱: contact@shoetrade.com</p>
        <p>电话: 123-456-7890</p>
      </div>
      
      <div class="footer-section">
        <h3>快速链接</h3>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/products">商品列表</router-link></li>
          <li><router-link to="/login">登录</router-link></li>
          <li><router-link to="/register">注册</router-link></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} 二手球鞋交易平台 版权所有</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FooterBar'
}
</script>

<style scoped>
.footer {
  background: #333;
  color: #fff;
  padding: 20px 0;
  margin-top: 30px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-section {
  flex: 1;
  padding: 0 15px;
}

.footer-section h3 {
  margin-bottom: 15px;
  font-size: 18px;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section a {
  color: #ddd;
  text-decoration: none;
}

.footer-section a:hover {
  color: #fff;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #444;
  margin-top: 20px;
}
</style> 