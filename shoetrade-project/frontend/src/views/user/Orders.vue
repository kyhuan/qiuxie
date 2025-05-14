<template>
  <div class="user-orders">
    <el-card>
      <div slot="header">
        <h2>我的订单</h2>
      </div>
      
      <div v-loading="loading">
        <!-- 没有订单 -->
        <div v-if="orders.length === 0 && !loading" class="empty-orders">
          <i class="el-icon-tickets" style="font-size: 64px;"></i>
          <p>暂无订单记录</p>
          <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
        </div>
        
        <!-- 订单列表 -->
        <div v-else>
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="全部订单" name="all"></el-tab-pane>
            <el-tab-pane label="待支付" name="pending"></el-tab-pane>
            <el-tab-pane label="已完成" name="completed"></el-tab-pane>
          </el-tabs>
          
          <div class="order-list">
            <el-card v-for="order in filteredOrders" :key="order._id" class="order-card">
              <div class="order-header">
                <div>
                  <span class="order-id">订单号: {{ order._id }}</span>
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="order-status" :class="{'status-paid': order.status === '已完成'}">
                  {{ order.status }}
                </div>
              </div>
              
              <div class="order-products">
                <div v-for="product in order.products" :key="product.productId._id" class="product-item">
                  <img :src="getProductImage(product.productId)" class="product-image">
                  <div class="product-info">
                    <div class="product-name">{{ product.productId.name }}</div>
                    <div class="product-meta">
                      <span>{{ product.productId.brand }}</span>
                      <span>尺码: {{ product.productId.size }}</span>
                    </div>
                  </div>
                  <div class="product-price-qty">
                    <div class="product-price">¥{{ product.productId.price }}</div>
                    <div class="product-qty">x{{ product.quantity }}</div>
                  </div>
                </div>
              </div>
              
              <div class="order-footer">
                <div class="order-total">
                  共 {{ getTotalQuantity(order) }} 件商品，总计: <span class="total-price">¥{{ order.totalPrice }}</span>
                </div>
                
                <div class="order-actions">
                  <el-button type="primary" size="small" @click="$router.push(`/orders/${order._id}`)">
                    查看详情
                  </el-button>
                  
                  <el-button 
                    type="danger" 
                    size="small" 
                    v-if="order.status === '待支付'"
                    @click="payOrder(order)">
                    立即支付
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container" v-if="totalPages > 0">
            <el-pagination
              background
              @current-change="handlePageChange"
              :current-page.sync="currentPage"
              :page-size="pageSize"
              layout="prev, pager, next, jumper"
              :total="total">
            </el-pagination>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 支付对话框 -->
    <el-dialog
      title="支付订单"
      :visible.sync="payDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false">
      <div class="pay-dialog-content" v-if="currentOrder">
        <p>请确认支付订单</p>
        <div class="pay-amount">
          <span>支付金额: </span>
          <span class="total-price">¥{{ currentOrder.totalPrice }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPay" :loading="paying">确认支付</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'UserOrders',
  data() {
    return {
      orders: [],
      loading: false,
      activeTab: 'all',
      currentPage: 1,
      pageSize: 5,
      total: 0,
      totalPages: 0,
      payDialogVisible: false,
      paying: false,
      currentOrder: null
    }
  },
  computed: {
    filteredOrders() {
      if (this.activeTab === 'all') {
        return this.orders
      } else if (this.activeTab === 'pending') {
        return this.orders.filter(order => order.status === '待支付')
      } else if (this.activeTab === 'completed') {
        return this.orders.filter(order => order.status === '已完成')
      }
      return this.orders
    }
  },
  created() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      if (!this.$store.getters.isLoggedIn) {
        this.$router.push('/login')
        return
      }
      
      this.loading = true
      
      try {
        const userId = this.$store.getters.currentUser._id
        const response = await axios.get(`/api/orders/user/${userId}`)
        
        this.orders = response.data
        this.total = response.data.length
        this.totalPages = Math.ceil(this.total / this.pageSize)
      } catch (error) {
        console.error('获取订单列表失败:', error)
        this.$message.error('获取订单列表失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    handleTabClick() {
      this.currentPage = 1
    },
    
    handlePageChange(page) {
      this.currentPage = page
    },
    
    getProductImage(product) {
      if (product.images && product.images.length > 0) {
        return `/uploads/${product.images[0]}`
      } else {
        return 'https://via.placeholder.com/100x100?text=No+Image'
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    
    getTotalQuantity(order) {
      return order.products.reduce((total, item) => total + item.quantity, 0)
    },
    
    payOrder(order) {
      this.currentOrder = order
      this.payDialogVisible = true
    },
    
    async confirmPay() {
      this.paying = true
      
      try {
        // 更新订单状态为"已支付"
        await this.$store.dispatch('payOrder', this.currentOrder._id)
        
        this.$message.success('支付成功')
        this.payDialogVisible = false
        
        // 刷新订单数据
        this.fetchOrders()
      } catch (error) {
        this.$message.error('支付失败: ' + error.message)
      } finally {
        this.paying = false
      }
    }
  }
}
</script>

<style scoped>
.user-orders {
  padding: 20px 0;
}

.empty-orders {
  text-align: center;
  padding: 50px 0;
  color: #909399;
}

.order-list {
  margin-top: 20px;
}

.order-card {
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.order-id {
  font-weight: bold;
  margin-right: 15px;
}

.order-date {
  color: #909399;
  font-size: 14px;
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

.order-products {
  padding: 15px 0;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.product-meta {
  color: #909399;
  font-size: 12px;
}

.product-meta span {
  margin-right: 10px;
}

.product-price-qty {
  text-align: right;
  margin-left: 15px;
}

.product-price {
  font-weight: bold;
  color: #606266;
}

.product-qty {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.order-total {
  font-size: 14px;
}

.total-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.pagination-container {
  text-align: center;
  margin-top: 30px;
}

.pay-dialog-content {
  text-align: center;
}

.pay-amount {
  margin: 20px 0;
  font-size: 18px;
}
</style> 