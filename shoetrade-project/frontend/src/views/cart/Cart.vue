<template>
  <div class="cart-container">
    <el-card>
      <div slot="header">
        <h2>我的购物车</h2>
      </div>
      
      <div v-loading="loading">
        <!-- 购物车为空 -->
        <div v-if="cart.length === 0" class="empty-cart">
          <i class="el-icon-shopping-cart-full" style="font-size: 64px;"></i>
          <p>购物车为空</p>
          <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
        </div>
        
        <!-- 购物车有商品 -->
        <div v-else>
          <el-table
            :data="cart"
            style="width: 100%"
            @selection-change="handleSelectionChange">
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            
            <el-table-column label="商品信息">
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
            
            <el-table-column
              label="单价"
              width="120">
              <template slot-scope="scope">
                <span class="product-price">¥{{ scope.row.productId.price }}</span>
              </template>
            </el-table-column>
            
            <el-table-column
              label="数量"
              width="150">
              <template slot-scope="scope">
                <el-input-number
                  v-model="scope.row.quantity"
                  :min="1"
                  :max="10"
                  size="small"
                  @change="handleQuantityChange(scope.row)">
                </el-input-number>
              </template>
            </el-table-column>
            
            <el-table-column
              label="小计"
              width="120">
              <template slot-scope="scope">
                <span class="product-subtotal">¥{{ scope.row.productId.price * scope.row.quantity }}</span>
              </template>
            </el-table-column>
            
            <el-table-column
              label="操作"
              width="100">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  size="mini"
                  @click="handleRemove(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="cart-footer">
            <div class="cart-actions">
              <el-button @click="handleSelectAll(!isAllSelected)">
                {{ isAllSelected ? '取消全选' : '全选' }}
              </el-button>
              <el-button type="danger" @click="handleBatchRemove" :disabled="selectedItems.length === 0">
                删除选中
              </el-button>
              <el-button @click="clearCart">清空购物车</el-button>
            </div>
            
            <div class="cart-summary">
              <div class="summary-row">
                <span>已选商品 {{ totalSelectedQuantity }} 件</span>
                <span>合计: <span class="total-price">¥{{ totalSelectedPrice }}</span></span>
              </div>
              <el-button type="primary" size="large" @click="checkout" :disabled="selectedItems.length === 0">
                结算
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Cart',
  data() {
    return {
      loading: false,
      selectedItems: []
    }
  },
  computed: {
    ...mapGetters(['cartCount']),
    cart() {
      return this.$store.state.cart
    },
    isAllSelected() {
      return this.selectedItems.length === this.cart.length
    },
    totalSelectedQuantity() {
      return this.selectedItems.reduce((total, item) => total + item.quantity, 0)
    },
    totalSelectedPrice() {
      return this.selectedItems.reduce((total, item) => {
        return total + (item.productId.price * item.quantity)
      }, 0)
    }
  },
  created() {
    this.fetchCart()
  },
  methods: {
    ...mapActions(['fetchCart', 'removeFromCart', 'clearCart']),
    
    getProductImage(product) {
      if (product.images && product.images.length > 0) {
        return `/uploads/${product.images[0]}`
      } else {
        return 'https://via.placeholder.com/100x100?text=No+Image'
      }
    },
    
    handleQuantityChange(item) {
      // 在实际项目中，这里可以发送请求更新后端数据
      // 简化版本中，直接修改前端数据
      console.log('数量修改为: ', item.quantity)
    },
    
    async handleRemove(item) {
      try {
        this.loading = true
        await this.$store.dispatch('removeFromCart', item.productId._id)
        this.$message.success('商品已移除')
      } catch (error) {
        this.$message.error('移除商品失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },
    
    handleSelectAll(isSelected) {
      this.$refs.table.clearSelection()
      if (isSelected) {
        this.cart.forEach(row => {
          this.$refs.table.toggleRowSelection(row, true)
        })
      }
    },
    
    handleBatchRemove() {
      this.$confirm('确定要删除选中的商品吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.loading = true
        
        try {
          const promises = this.selectedItems.map(item => 
            this.$store.dispatch('removeFromCart', item.productId._id)
          )
          
          await Promise.all(promises)
          this.$message.success('选中商品已移除')
        } catch (error) {
          this.$message.error('移除商品失败: ' + error.message)
        } finally {
          this.loading = false
        }
      }).catch(() => {
        // 取消删除，不做操作
      })
    },
    
    checkout() {
      // 如果没有选中任何商品，则默认选中所有
      if (this.selectedItems.length === 0) {
        this.handleSelectAll(true)
      }
      
      this.$router.push('/checkout')
    }
  }
}
</script>

<style scoped>
.cart-container {
  padding: 20px 0;
}

.empty-cart {
  text-align: center;
  padding: 50px 0;
  color: #909399;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
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

.product-price {
  color: #606266;
}

.product-subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.cart-footer {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-summary {
  text-align: right;
}

.summary-row {
  margin-bottom: 10px;
}

.total-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin-left: 5px;
}
</style> 