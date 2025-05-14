<template>
  <div class="order-detail" v-loading="loading">
    <el-card v-if="order">
      <div slot="header">
        <div class="order-header">
          <h2>订单详情</h2>
          <div class="order-status" :class="{'status-paid': order.status === '已完成'}">
            {{ order.status }}
          </div>
        </div>
      </div>
      
      <!-- 订单信息 -->
      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span>{{ order._id }}</span>
        </div>
        <div class="info-item">
          <span class="label">下单时间：</span>
          <span>{{ formatDate(order.createdAt) }}</span>
        </div>
      </div>
      
      <!-- 商品列表 -->
      <div class="order-items">
        <h3>商品信息</h3>
        <el-table :data="order.products" border style="width: 100%">
          <el-table-column label="商品">
            <template slot-scope="scope">
              <div class="product-info">
                <img :src="getProductImage(scope.row.productId)" class="product-image">
                <div class="product-details">
                  <div class="product-name">{{ scope.row.productId.name }}</div>
                  <div class="product-meta">
                    <span>{{ scope.row.productId.brand }}</span>
                    <span>尺码: {{ scope.row.productId.size }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="单价" width="120" align="center">
            <template slot-scope="scope">
              <span class="product-price">¥{{ scope.row.productId.price }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="数量" width="100" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.quantity }}</span>
            </template>
          </el-table-column>
          
          <el-table-column label="小计" width="120" align="center">
            <template slot-scope="scope">
              <span class="product-subtotal">¥{{ scope.row.productId.price * scope.row.quantity }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 订单总计 -->
      <div class="order-summary">
        <div class="summary-row">
          <span>商品总额:</span>
          <span>¥{{ order.totalPrice }}</span>
        </div>
        <div class="summary-row">
          <span>运费:</span>
          <span>¥0</span>
        </div>
        <div class="summary-row total">
          <span>订单总额:</span>
          <span class="total-price">¥{{ order.totalPrice }}</span>
        </div>
      </div>
      
      <!-- 订单操作 -->
      <div class="order-actions" v-if="order.status === '待支付'">
        <el-button type="primary" @click="showPayDialog">立即支付</el-button>
        <el-button @click="cancelOrder">取消订单</el-button>
      </div>
      
      <!-- 评价入口 -->
      <div class="review-section" v-if="order.status === '已完成'">
        <h3>评价商品</h3>
        <div v-for="product in order.products" :key="product.productId._id" class="review-item">
          <div class="product-brief">
            <img :src="getProductImage(product.productId)" class="product-image-small">
            <span class="product-name-brief">{{ product.productId.name }}</span>
          </div>
          
          <el-button 
            type="primary" 
            size="small" 
            @click="goToReview(product.productId._id)"
            v-if="!hasReviewed(product.productId._id)">
            评价
          </el-button>
          <el-tag type="success" v-else>已评价</el-tag>
        </div>
      </div>
    </el-card>
    
    <div v-else-if="!loading" class="not-found">
      <el-result
        icon="error"
        title="订单不存在"
        sub-title="您查看的订单可能已被删除">
        <template slot="extra">
          <el-button type="primary" @click="$router.push('/user/orders')">查看所有订单</el-button>
        </template>
      </el-result>
    </div>
    
    <!-- 支付对话框 -->
    <el-dialog
      title="支付订单"
      :visible.sync="payDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false">
      <div class="pay-dialog-content">
        <p>请确认支付订单</p>
        <div class="pay-amount">
          <span>支付金额: </span>
          <span class="total-price">¥{{ order?.totalPrice || 0 }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPay" :loading="paying">确认支付</el-button>
      </span>
    </el-dialog>
    
    <!-- 评价对话框 -->
    <el-dialog
      title="评价商品"
      :visible.sync="reviewDialogVisible"
      width="500px">
      <div v-if="currentProduct">
        <div class="review-product-info">
          <img :src="getProductImage(currentProduct)" class="review-product-image">
          <div>
            <h4>{{ currentProduct.name }}</h4>
            <p>{{ currentProduct.brand }} | 尺码: {{ currentProduct.size }}</p>
          </div>
        </div>
        
        <el-form :model="reviewForm" label-width="80px" class="review-form">
          <el-form-item label="评分">
            <el-rate v-model="reviewForm.rating" show-text></el-rate>
          </el-form-item>
          
          <el-form-item label="评价">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入您对商品的评价"
              v-model="reviewForm.comment">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="submittingReview">提交评价</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'OrderDetail',
  data() {
    return {
      order: null,
      loading: true,
      payDialogVisible: false,
      paying: false,
      reviewDialogVisible: false,
      currentProduct: null,
      reviewForm: {
        rating: 5,
        comment: ''
      },
      submittingReview: false,
      myReviews: [] // 用户对该订单中商品的评价记录
    }
  },
  created() {
    this.fetchOrder()
  },
  methods: {
    async fetchOrder() {
      this.loading = true
      try {
        const response = await axios.get(`/api/orders/${this.$route.params.id}`)
        this.order = response.data
        
        // 获取用户已评价记录
        if (this.order && this.order.status === '已完成') {
          this.fetchMyReviews()
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        this.$message.error('获取订单详情失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    async fetchMyReviews() {
      try {
        const response = await axios.get(`/api/reviews/user/${this.$store.getters.currentUser._id}`)
        this.myReviews = response.data
      } catch (error) {
        console.error('获取评价记录失败:', error)
      }
    },
    
    hasReviewed(productId) {
      return this.myReviews.some(review => review.productId._id === productId)
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
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    showPayDialog() {
      this.payDialogVisible = true
    },
    
    async confirmPay() {
      this.paying = true
      
      try {
        // 更新订单状态为"已支付"
        await this.$store.dispatch('payOrder', this.order._id)
        
        this.$message.success('支付成功')
        this.payDialogVisible = false
        
        // 刷新订单数据
        this.fetchOrder()
      } catch (error) {
        this.$message.error('支付失败: ' + error.message)
      } finally {
        this.paying = false
      }
    },
    
    cancelOrder() {
      this.$confirm('确定要取消订单吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 此处简化，实际项目可能需要请求后端取消订单
        this.$message.info('订单取消功能尚未实现')
      }).catch(() => {
        // 取消操作，不做任何事
      })
    },
    
    goToReview(productId) {
      // 获取要评价的商品信息
      const productItem = this.order.products.find(item => item.productId._id === productId)
      if (productItem) {
        this.currentProduct = productItem.productId
        this.reviewForm = {
          rating: 5,
          comment: ''
        }
        this.reviewDialogVisible = true
      }
    },
    
    async submitReview() {
      if (!this.reviewForm.comment.trim()) {
        this.$message.warning('请输入评价内容')
        return
      }
      
      this.submittingReview = true
      
      try {
        await axios.post('/api/reviews', {
          productId: this.currentProduct._id,
          userId: this.$store.getters.currentUser._id,
          rating: this.reviewForm.rating,
          comment: this.reviewForm.comment
        })
        
        this.$message.success('评价成功')
        this.reviewDialogVisible = false
        
        // 更新评价记录
        this.fetchMyReviews()
      } catch (error) {
        this.$message.error('提交评价失败: ' + error.response?.data?.message || error.message)
      } finally {
        this.submittingReview = false
      }
    }
  }
}
</script>

<style scoped>
.order-detail {
  padding: 20px 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-status {
  padding: 5px 10px;
  background-color: #f56c6c;
  color: white;
  border-radius: 4px;
}

.order-status.status-paid {
  background-color: #67c23a;
}

.order-info {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: bold;
  margin-right: 10px;
}

h3 {
  font-size: 18px;
  margin: 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
}

.product-details {
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

.order-summary {
  margin-top: 20px;
  text-align: right;
}

.summary-row {
  margin-bottom: 10px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: bold;
}

.total-price {
  color: #f56c6c;
}

.order-actions {
  margin-top: 20px;
  text-align: right;
}

.not-found {
  padding: 50px 0;
}

.review-section {
  margin-top: 30px;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.product-brief {
  display: flex;
  align-items: center;
}

.product-image-small {
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 4px;
}

.review-product-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.review-product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
}

.pay-dialog-content {
  text-align: center;
}

.pay-amount {
  margin: 20px 0;
  font-size: 18px;
}
</style> 