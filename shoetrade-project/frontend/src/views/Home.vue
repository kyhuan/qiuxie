<template>
  <div class="home">
    <!-- 轮播图 -->
    <el-carousel height="400px" class="banner">
      <el-carousel-item v-for="(banner, index) in banners" :key="index">
        <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
          <div class="banner-content">
            <h2>{{ banner.title }}</h2>
            <p>{{ banner.description }}</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    
    <!-- 热门品牌 -->
    <div class="section">
      <h2 class="section-title">热门品牌</h2>
      <div class="brand-list">
        <div v-for="brand in brands" :key="brand.id" class="brand-item">
          <el-card>
            <div slot="header">
              <span>{{ brand.name }}</span>
            </div>
            <div class="brand-logo" :style="{ backgroundImage: `url(${brand.logo})` }"></div>
          </el-card>
        </div>
      </div>
    </div>
    
    <!-- 推荐商品 -->
    <div class="section">
      <h2 class="section-title">推荐商品</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in featuredProducts" :key="product._id">
          <product-card :product="product" />
        </el-col>
      </el-row>
      
      <div class="text-center mt-20">
        <el-button type="primary" @click="$router.push('/products')">查看更多</el-button>
      </div>
    </div>
    
    <!-- 平台特点 -->
    <div class="section features">
      <h2 class="section-title">平台特点</h2>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(feature, index) in features" :key="index">
          <div class="feature-item">
            <i :class="feature.icon"></i>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import ProductCard from '@/components/products/ProductCard.vue'
import axios from 'axios'

export default {
  name: 'Home',
  components: {
    ProductCard
  },
  data() {
    return {
      // 假数据 - 实际项目中应该从API获取
      banners: [
        {
          title: '限时特惠',
          description: '精选球鞋低至5折起',
          image: 'https://via.placeholder.com/1200x400?text=Banner+1'
        },
        {
          title: '新品上市',
          description: '2023最新款球鞋已上架',
          image: 'https://via.placeholder.com/1200x400?text=Banner+2'
        },
        {
          title: '明星同款',
          description: 'NBA球星同款球鞋专区',
          image: 'https://via.placeholder.com/1200x400?text=Banner+3'
        }
      ],
      brands: [
        { id: 1, name: 'Nike', logo: 'https://via.placeholder.com/100x100?text=Nike' },
        { id: 2, name: 'Adidas', logo: 'https://via.placeholder.com/100x100?text=Adidas' },
        { id: 3, name: 'Jordan', logo: 'https://via.placeholder.com/100x100?text=Jordan' },
        { id: 4, name: 'Under Armour', logo: 'https://via.placeholder.com/100x100?text=UA' }
      ],
      featuredProducts: [],
      features: [
        {
          icon: 'el-icon-medal',
          title: '正品保证',
          description: '所有商品经过平台专业鉴定，确保真实可靠'
        },
        {
          icon: 'el-icon-money',
          title: '价格透明',
          description: '历史价格走势一目了然，避免虚高定价'
        },
        {
          icon: 'el-icon-shopping-bag-1',
          title: '便捷交易',
          description: '一键下单，轻松支付，让交易更简单'
        }
      ]
    }
  },
  created() {
    this.fetchFeaturedProducts()
  },
  methods: {
    async fetchFeaturedProducts() {
      try {
        const response = await axios.get('/api/products', {
          params: {
            limit: 8
          }
        })
        this.featuredProducts = response.data.products
      } catch (error) {
        console.error('获取推荐商品失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.banner {
  margin-bottom: 30px;
}

.banner-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 20px;
  border-radius: 5px;
  max-width: 450px;
}

.banner-content h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 60px;
  height: 3px;
  background: #409eff;
  transform: translateX(-50%);
}

.brand-list {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.brand-item {
  width: 150px;
  margin: 10px;
}

.brand-logo {
  height: 100px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.features {
  background: #f0f2f5;
  padding: 40px 0;
  border-radius: 5px;
}

.feature-item {
  text-align: center;
  padding: 20px;
}

.feature-item i {
  font-size: 40px;
  color: #409eff;
  margin-bottom: 15px;
}

.feature-item h3 {
  margin-bottom: 10px;
  font-size: 18px;
}
</style> 