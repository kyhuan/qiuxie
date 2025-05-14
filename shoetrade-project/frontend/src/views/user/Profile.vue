<template>
  <div class="user-profile">
    <el-card>
      <div slot="header">
        <h2>个人中心</h2>
      </div>
      
      <div v-if="user" class="profile-container">
        <div class="user-info">
          <h3>基本信息</h3>
          <div class="info-item">
            <span class="label">用户名:</span>
            <span>{{ user.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">邮箱:</span>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">注册时间:</span>
            <span>{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>
        
        <el-divider></el-divider>
        
        <div class="stats-section">
          <h3>我的数据</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-value">{{ orderStats.total }}</div>
                <div class="stat-label">订单总数</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-value">{{ orderStats.completed }}</div>
                <div class="stat-label">已完成订单</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="stat-card">
                <div class="stat-value">{{ sellingStats.total }}</div>
                <div class="stat-label">出售商品数</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <el-divider></el-divider>
        
        <div class="actions-section">
          <h3>常用操作</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover" class="action-card" @click.native="$router.push('/user/orders')">
                <i class="el-icon-tickets"></i>
                <div class="action-label">我的订单</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="action-card" @click.native="$router.push('/cart')">
                <i class="el-icon-shopping-cart-2"></i>
                <div class="action-label">购物车</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover" class="action-card" @click.native="$router.push('/user/publish')">
                <i class="el-icon-upload"></i>
                <div class="action-label">发布商品</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <el-divider></el-divider>
        
        <div class="recent-section">
          <div class="recent-orders">
            <div class="section-header">
              <h3>最近订单</h3>
              <el-button type="text" @click="$router.push('/user/orders')">查看更多</el-button>
            </div>
            
            <div v-if="recentOrders.length === 0" class="empty-placeholder">
              暂无订单记录
            </div>
            
            <el-card v-else v-for="order in recentOrders" :key="order._id" class="recent-order-card">
              <div class="order-brief">
                <div class="order-info">
                  <div class="order-id">订单号: {{ order._id }}</div>
                  <div class="order-date">{{ formatDate(order.createdAt) }}</div>
                </div>
                
                <div class="order-status" :class="{'status-paid': order.status === '已完成'}">
                  {{ order.status }}
                </div>
              </div>
              
              <div class="order-total">
                总计: <span class="price">¥{{ order.totalPrice }}</span>
              </div>
              
              <div class="order-action">
                <el-button type="primary" size="small" @click="$router.push(`/orders/${order._id}`)">
                  查看详情
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
      
      <div v-else-if="loading" class="loading-placeholder">
        <i class="el-icon-loading"></i>
        <p>加载中...</p>
      </div>
      
      <div v-else class="error-placeholder">
        <i class="el-icon-warning-outline"></i>
        <p>无法加载用户信息，请稍后重试</p>
        <el-button type="primary" @click="fetchUserInfo">重试</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'UserProfile',
  data() {
    return {
      user: null,
      loading: true,
      recentOrders: [],
      orderStats: {
        total: 0,
        completed: 0,
        pending: 0
      },
      sellingStats: {
        total: 0,
        verified: 0
      }
    }
  },
  created() {
    if (!this.$store.getters.isLoggedIn) {
      this.$message.warning('请先登录')
      this.$router.push('/login?redirect=' + this.$route.path)
      return
    }
    
    this.fetchUserInfo()
    this.fetchRecentOrders()
    this.fetchOrderStats()
    this.fetchSellingStats()
  },
  methods: {
    async fetchUserInfo() {
      this.loading = true
      
      try {
        const userId = this.$store.getters.currentUser._id
        const response = await axios.get(`/api/users/${userId}`)
        this.user = response.data
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$message.error('获取用户信息失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    async fetchRecentOrders() {
      try {
        const userId = this.$store.getters.currentUser._id
        const response = await axios.get(`/api/orders/user/${userId}`)
        
        // 只取最近3条订单
        this.recentOrders = response.data.slice(0, 3)
      } catch (error) {
        console.error('获取最近订单失败:', error)
      }
    },
    
    async fetchOrderStats() {
      try {
        const userId = this.$store.getters.currentUser._id
        const response = await axios.get(`/api/orders/user/${userId}`)
        
        const orders = response.data
        this.orderStats = {
          total: orders.length,
          completed: orders.filter(order => order.status === '已完成').length,
          pending: orders.filter(order => order.status === '待支付').length
        }
      } catch (error) {
        console.error('获取订单统计失败:', error)
      }
    },
    
    async fetchSellingStats() {
      try {
        const userId = this.$store.getters.currentUser._id
        const response = await axios.get(`/api/products/seller/${userId}`)
        
        const products = response.data
        this.sellingStats = {
          total: products.length,
          verified: products.filter(product => product.verified).length
        }
      } catch (error) {
        console.error('获取出售商品统计失败:', error)
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.user-profile {
  padding: 20px 0;
}

.profile-container {
  padding: 10px;
}

h3 {
  font-size: 18px;
  margin-bottom: 20px;
}

.user-info {
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 10px;
  font-size: 16px;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  display: inline-block;
  width: 80px;
}

.stats-section,
.actions-section {
  margin: 20px 0;
}

.stat-card,
.action-card {
  text-align: center;
  padding: 20px;
  cursor: default;
}

.action-card {
  cursor: pointer;
}

.action-card:hover {
  background-color: #f5f7fa;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label,
.action-label {
  font-size: 14px;
  color: #606266;
}

.action-card i {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 10px;
}

.recent-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin-bottom: 0;
}

.recent-order-card {
  margin-bottom: 15px;
}

.order-brief {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-id {
  font-weight: bold;
}

.order-date {
  color: #909399;
  font-size: 14px;
  margin-top: 5px;
}

.order-status {
  padding: 5px 10px;
  background-color: #f56c6c;
  color: white;
  border-radius: 4px;
  font-size: 14px;
}

.order-status.status-paid {
  background-color: #67c23a;
}

.order-total {
  margin-bottom: 10px;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.order-action {
  text-align: right;
}

.empty-placeholder,
.loading-placeholder,
.error-placeholder {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}

.loading-placeholder i,
.error-placeholder i {
  font-size: 40px;
  margin-bottom: 10px;
}
</style> 