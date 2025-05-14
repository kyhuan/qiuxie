<template>
  <div class="product-detail" v-loading="loading">
    <el-card v-if="product">
      <div class="product-container">
        <!-- 商品图片区 -->
        <div class="product-images">
          <el-carousel height="400px" indicator-position="outside">
            <el-carousel-item v-for="(image, index) in productImages" :key="index">
              <img :src="image" class="carousel-image" alt="商品图片">
            </el-carousel-item>
          </el-carousel>
          
          <div class="verification-badge" :class="{ verified: product.verified, unverified: !product.verified }">
            <i :class="product.verified ? 'el-icon-check' : 'el-icon-warning-outline'"></i>
            {{ product.verified ? '平台已验证' : '待验证' }}
          </div>
        </div>
        
        <!-- 商品信息区 -->
        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-price">¥{{ product.price }}</p>
          
          <div class="product-meta">
            <p><strong>品牌:</strong> {{ product.brand }}</p>
            <p><strong>尺码:</strong> {{ product.size }}</p>
            <p><strong>上架时间:</strong> {{ formatDate(product.createdAt) }}</p>
            <p><strong>卖家:</strong> {{ product.sellerId.username }}</p>
          </div>
          
          <div class="product-description" v-if="product.description">
            <h3>商品描述</h3>
            <p>{{ product.description }}</p>
          </div>
          
          <!-- 价格走势图 (静态) -->
          <div class="price-trend">
            <h3>价格走势</h3>
            <img src="https://via.placeholder.com/500x200?text=Price+Trend+Chart" alt="价格走势图">
          </div>
          
          <!-- 购买操作 -->
          <div class="purchase-actions">
            <el-input-number v-model="quantity" :min="1" :max="10" label="数量"></el-input-number>
            <el-button type="primary" @click="addToCart" :disabled="!$store.getters.isLoggedIn">加入购物车</el-button>
            <el-button type="danger" @click="buyNow" :disabled="!$store.getters.isLoggedIn">立即购买</el-button>
          </div>
          
          <div class="login-tip" v-if="!$store.getters.isLoggedIn">
            <el-alert
              title="请先登录后再进行操作"
              type="warning"
              :closable="false"
              show-icon>
            </el-alert>
          </div>
        </div>
      </div>
      
      <!-- 商品评价区 -->
      <div class="product-reviews">
        <h2>商品评价</h2>
        
        <div v-if="reviews.length === 0" class="no-reviews">
          <p>暂无评价</p>
        </div>
        
        <div v-else>
          <el-card v-for="review in reviews" :key="review._id" class="review-card">
            <div class="review-header">
              <span class="reviewer">{{ review.userId.username }}</span>
              <div class="rating">
                <i v-for="i in 5" :key="i" 
                  :class="i <= review.rating ? 'el-icon-star-on' : 'el-icon-star-off'"
                  :style="i <= review.rating ? {color: '#f7ba2a'} : {color: '#C0C4CC'}">
                </i>
              </div>
              <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            </div>
            <div class="review-content">
              {{ review.comment }}
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
    
    <div v-else-if="!loading" class="not-found">
      <el-result
        icon="error"
        title="商品不存在"
        sub-title="您查看的商品可能已被删除或下架">
        <template slot="extra">
          <el-button type="primary" @click="$router.push('/products')">查看其他商品</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapActions } from 'vuex'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      reviews: [],
      loading: true,
      quantity: 1
    }
  },
  computed: {
    productImages() {
      if (!this.product) return []
      
      if (this.product.images && this.product.images.length > 0) {
        return this.product.images.map(image => `/uploads/${image}`)
      } else {
        return ['https://via.placeholder.com/400x400?text=No+Image']
      }
    }
  },
  created() {
    this.fetchProduct()
    this.fetchReviews()
  },
  methods: {
    ...mapActions(['addToCart']),
    
    async fetchProduct() {
      this.loading = true
      try {
        const response = await axios.get(`/api/products/${this.$route.params.id}`)
        this.product = response.data
      } catch (error) {
        console.error('获取商品详情失败:', error)
        this.$message.error('获取商品详情失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    async fetchReviews() {
      try {
        const response = await axios.get(`/api/reviews/product/${this.$route.params.id}`)
        this.reviews = response.data
      } catch (error) {
        console.error('获取商品评价失败:', error)
      }
    },
    
    async handleAddToCart() {
      if (!this.$store.getters.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push(`/login?redirect=${this.$route.path}`)
        return
      }
      
      try {
        await this.$store.dispatch('addToCart', {
          productId: this.product._id,
          quantity: this.quantity
        })
        this.$message.success('已添加到购物车')
      } catch (error) {
        this.$message.error('添加失败: ' + error.message)
      }
    },
    
    buyNow() {
      if (!this.$store.getters.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push(`/login?redirect=${this.$route.path}`)
        return
      }
      
      this.handleAddToCart().then(() => {
        this.$router.push('/cart')
      })
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.product-detail {
  padding: 20px 0;
}

.product-container {
  display: flex;
  flex-wrap: wrap;
}

.product-images {
  flex: 1;
  min-width: 300px;
  position: relative;
  margin-right: 20px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.verification-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10;
}

.verification-badge.verified {
  background-color: rgba(25, 190, 107, 0.9);
}

.verification-badge.unverified {
  background-color: rgba(245, 108, 108, 0.9);
}

.product-info {
  flex: 1;
  min-width: 300px;
}

.product-name {
  font-size: 24px;
  margin-bottom: 10px;
}

.product-price {
  font-size: 28px;
  color: #f56c6c;
  font-weight: bold;
  margin-bottom: 20px;
}

.product-meta {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.product-meta p {
  margin: 5px 0;
}

.product-description {
  margin-bottom: 20px;
}

.price-trend {
  margin-bottom: 20px;
}

.price-trend img {
  max-width: 100%;
}

.purchase-actions {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.purchase-actions .el-button {
  margin-left: 15px;
}

.login-tip {
  margin-bottom: 20px;
}

.product-reviews {
  margin-top: 30px;
}

.product-reviews h2 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.no-reviews {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.review-card {
  margin-bottom: 15px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.reviewer {
  font-weight: bold;
}

.review-date {
  color: #909399;
  font-size: 12px;
}

.not-found {
  padding: 50px 0;
}

@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
  }
  
  .product-images {
    margin-right: 0;
    margin-bottom: 20px;
  }
}
</style> 