<template>
  <div class="checkout-container">
    <el-card>
      <div slot="header">
        <h2>确认订单</h2>
      </div>
      
      <div v-loading="loading">
        <!-- 商品列表 -->
        <div class="order-items">
          <h3>商品信息</h3>
          <el-table :data="cart" border style="width: 100%">
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
        
        <!-- 收货信息 (简化版) -->
        <div class="delivery-info">
          <h3>收货信息</h3>
          <el-form :model="deliveryForm" label-width="100px">
            <el-form-item label="收货人">
              <el-input v-model="deliveryForm.name" placeholder="请输入收货人姓名"></el-input>
            </el-form-item>
            
            <el-form-item label="联系电话">
              <el-input v-model="deliveryForm.phone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
            
            <el-form-item label="收货地址">
              <el-input v-model="deliveryForm.address" type="textarea" placeholder="请输入详细地址"></el-input>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 支付信息 (简化版) -->
        <div class="payment-info">
          <h3>支付方式</h3>
          <el-radio-group v-model="paymentMethod">
            <el-radio label="online">在线支付</el-radio>
          </el-radio-group>
        </div>
        
        <!-- 订单总计 -->
        <div class="order-summary">
          <div class="summary-row">
            <span>商品总额: </span>
            <span>¥{{ totalPrice }}</span>
          </div>
          <div class="summary-row">
            <span>运费: </span>
            <span>¥0</span>
          </div>
          <div class="summary-row total">
            <span>应付金额: </span>
            <span class="total-price">¥{{ totalPrice }}</span>
          </div>
          
          <div class="actions">
            <el-button @click="$router.push('/cart')">返回购物车</el-button>
            <el-button type="primary" @click="submitOrder" :loading="submitting">提交订单</el-button>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 支付成功对话框 -->
    <el-dialog
      title="支付订单"
      :visible.sync="payDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false">
      <div class="pay-dialog-content">
        <p>订单已创建，请确认支付</p>
        <div class="pay-amount">
          <span>支付金额: </span>
          <span class="total-price">¥{{ totalPrice }}</span>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelPay">取消支付</el-button>
        <el-button type="primary" @click="confirmPay" :loading="paying">确认支付</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'Checkout',
  data() {
    return {
      loading: false,
      submitting: false,
      paying: false,
      payDialogVisible: false,
      createdOrder: null,
      deliveryForm: {
        name: '',
        phone: '',
        address: ''
      },
      paymentMethod: 'online'
    }
  },
  computed: {
    cart() {
      return this.$store.state.cart
    },
    totalPrice() {
      return this.cart.reduce((total, item) => {
        return total + (item.productId.price * item.quantity)
      }, 0)
    }
  },
  created() {
    // 加载购物车数据
    this.loading = true
    this.$store.dispatch('fetchCart').then(() => {
      this.loading = false
      
      // 如果购物车为空，则跳转回购物车页面
      if (this.cart.length === 0) {
        this.$message.warning('购物车为空，无法结算')
        this.$router.push('/cart')
      }
    }).catch(error => {
      this.loading = false
      this.$message.error('获取购物车失败: ' + error.message)
    })
  },
  methods: {
    getProductImage(product) {
      if (product.images && product.images.length > 0) {
        return `/uploads/${product.images[0]}`
      } else {
        return 'https://via.placeholder.com/100x100?text=No+Image'
      }
    },
    
    async submitOrder() {
      // 简单表单验证
      if (!this.deliveryForm.name.trim()) {
        this.$message.warning('请输入收货人姓名')
        return
      }
      
      if (!this.deliveryForm.phone.trim()) {
        this.$message.warning('请输入联系电话')
        return
      }
      
      if (!this.deliveryForm.address.trim()) {
        this.$message.warning('请输入收货地址')
        return
      }
      
      this.submitting = true
      
      try {
        // 创建订单
        const response = await this.$store.dispatch('createOrder')
        this.createdOrder = response
        
        // 显示支付对话框
        this.payDialogVisible = true
      } catch (error) {
        this.$message.error('创建订单失败: ' + error.message)
      } finally {
        this.submitting = false
      }
    },
    
    cancelPay() {
      this.$confirm('确定要取消支付吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '返回',
        type: 'warning'
      }).then(() => {
        this.payDialogVisible = false
        this.$router.push('/user/orders')
      }).catch(() => {
        // 取消操作，继续留在支付页面
      })
    },
    
    async confirmPay() {
      this.paying = true
      
      try {
        // 模拟支付过程
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 更新订单状态为"已支付"
        await this.$store.dispatch('payOrder', this.createdOrder._id)
        
        this.$message.success('支付成功')
        this.payDialogVisible = false
        
        // 跳转到订单详情页
        this.$router.push(`/orders/${this.createdOrder._id}`)
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
.checkout-container {
  padding: 20px 0;
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

.product-price {
  color: #606266;
}

.product-subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.order-items,
.delivery-info,
.payment-info {
  margin-bottom: 20px;
}

.order-summary {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-row.total {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #dcdfe6;
  font-weight: bold;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
}

.actions {
  margin-top: 20px;
  text-align: right;
}

.pay-dialog-content {
  text-align: center;
}

.pay-amount {
  margin: 20px 0;
  font-size: 18px;
}
</style> 