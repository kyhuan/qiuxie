<template>
  <div class="product-list">
    <el-card>
      <div slot="header">
        <h2>商品列表</h2>
      </div>
      
      <!-- 搜索和筛选 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filters" class="filter-form">
          <el-form-item>
            <el-input v-model="filters.search" placeholder="搜索商品名称或品牌" clearable @keyup.enter.native="handleSearch">
              <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
            </el-input>
          </el-form-item>
          
          <el-form-item>
            <el-select v-model="filters.brand" placeholder="品牌" clearable @change="handleSearch">
              <el-option v-for="brand in brands" :key="brand" :label="brand" :value="brand"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select v-model="filters.size" placeholder="尺码" clearable @change="handleSearch">
              <el-option v-for="size in sizes" :key="size" :label="size" :value="size"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-select v-model="filters.sort" placeholder="排序" @change="handleSearch">
              <el-option label="最新上架" value="createdAt_desc"></el-option>
              <el-option label="价格从低到高" value="price_asc"></el-option>
              <el-option label="价格从高到低" value="price_desc"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">筛选</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div class="price-slider">
          <span>价格区间: </span>
          <el-slider
            v-model="filters.priceRange"
            range
            :min="0"
            :max="10000"
            :step="100"
            show-stops
            @change="handleSearch"
          ></el-slider>
          <span>{{ filters.priceRange[0] }} - {{ filters.priceRange[1] }}元</span>
        </div>
      </div>
      
      <!-- 商品展示区 -->
      <div v-loading="loading">
        <div v-if="products.length === 0 && !loading" class="empty-result">
          <i class="el-icon-search" style="font-size: 48px;"></i>
          <p>没有找到符合条件的商品</p>
        </div>
        
        <el-row :gutter="20" v-else>
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in products" :key="product._id">
            <product-card :product="product" />
          </el-col>
        </el-row>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="totalPages > 0">
          <el-pagination
            background
            @current-change="handlePageChange"
            :current-page.sync="currentPage"
            :page-size="pageSize"
            layout="prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import ProductCard from '@/components/products/ProductCard.vue'
import axios from 'axios'

export default {
  name: 'ProductList',
  components: {
    ProductCard
  },
  data() {
    return {
      products: [],
      loading: false,
      currentPage: 1,
      pageSize: 12,
      total: 0,
      totalPages: 0,
      filters: {
        search: '',
        brand: '',
        size: '',
        sort: 'createdAt_desc',
        priceRange: [0, 10000]
      },
      // 假数据，实际应从后端获取
      brands: ['Nike', 'Adidas', 'Jordan', 'Under Armour', 'New Balance', 'Converse'],
      sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
    }
  },
  created() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      this.loading = true
      
      try {
        // 构建查询参数
        const params = {
          page: this.currentPage,
          limit: this.pageSize
        }
        
        // 添加搜索参数
        if (this.filters.search) {
          params.search = this.filters.search
        }
        
        // 添加品牌筛选
        if (this.filters.brand) {
          params.brand = this.filters.brand
        }
        
        // 添加尺码筛选
        if (this.filters.size) {
          params.size = this.filters.size
        }
        
        // 添加价格范围
        if (this.filters.priceRange[0] > 0) {
          params.minPrice = this.filters.priceRange[0]
        }
        
        if (this.filters.priceRange[1] < 10000) {
          params.maxPrice = this.filters.priceRange[1]
        }
        
        // 添加排序
        if (this.filters.sort) {
          const [field, order] = this.filters.sort.split('_')
          params.sortField = field
          params.sortOrder = order
        }
        
        const response = await axios.get('/api/products', { params })
        
        this.products = response.data.products
        this.total = response.data.total
        this.totalPages = response.data.totalPages
      } catch (error) {
        console.error('获取商品列表失败:', error)
        this.$message.error('获取商品列表失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    handleSearch() {
      this.currentPage = 1
      this.fetchProducts()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.fetchProducts()
    },
    
    resetFilters() {
      this.filters = {
        search: '',
        brand: '',
        size: '',
        sort: 'createdAt_desc',
        priceRange: [0, 10000]
      }
      this.handleSearch()
    }
  }
}
</script>

<style scoped>
.product-list {
  padding: 20px 0;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.price-slider {
  margin: 20px 0;
  padding: 0 20px;
}

.empty-result {
  text-align: center;
  padding: 50px 0;
  color: #909399;
}

.pagination-container {
  text-align: center;
  margin-top: 30px;
}
</style> 