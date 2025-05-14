<template>
  <div class="product-card">
    <el-card :body-style="{ padding: '0px' }" shadow="hover">
      <div class="product-image" @click="goToDetail">
        <img :src="productImage" class="image">
        <div v-if="product.verified" class="verified-badge">
          <i class="el-icon-check"></i> 平台已验证
        </div>
        <div v-else class="verified-badge unverified">
          <i class="el-icon-warning-outline"></i> 待验证
        </div>
      </div>
      
      <div class="product-info">
        <div class="product-name" @click="goToDetail">{{ product.name }}</div>
        <div class="product-meta">
          <span class="brand">{{ product.brand }}</span>
          <span class="size">尺码: {{ product.size }}</span>
        </div>
        <div class="product-price">¥{{ product.price }}</div>
        
        <div class="product-actions">
          <el-button type="primary" size="mini" @click="addToCart">加入购物车</el-button>
          <el-button type="text" size="mini" @click="goToDetail">查看详情</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  computed: {
    productImage() {
      // 如果商品有图片，则显示第一张，否则显示默认图片
      if (this.product.images && this.product.images.length > 0) {
        return `/uploads/${this.product.images[0]}`
      } else {
        return 'https://via.placeholder.com/300x300?text=No+Image'
      }
    }
  },
  methods: {
    ...mapActions(['addToCart']),
    goToDetail() {
      this.$router.push(`/products/${this.product._id}`)
    },
    async handleAddToCart() {
      if (!this.$store.getters.isLoggedIn) {
        this.$message.warning('请先登录')
        this.$router.push('/login')
        return
      }
      
      try {
        await this.$store.dispatch('addToCart', {
          productId: this.product._id,
          quantity: 1
        })
        this.$message.success('已添加到购物车')
      } catch (error) {
        this.$message.error('添加失败: ' + error.message)
      }
    }
  }
}
</script>

<style scoped>
.product-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(25, 190, 107, 0.9);
  color: white;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.verified-badge.unverified {
  background: rgba(245, 108, 108, 0.9);
}

.product-info {
  padding: 14px;
}

.product-name {
  font-weight: bold;
  margin-bottom: 8px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
}

.product-name:hover {
  color: #409eff;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 12px;
  margin-bottom: 10px;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
}

.product-actions {
  display: flex;
  justify-content: space-between;
}
</style> 