<template>
  <div class="publish-product">
    <el-card>
      <div slot="header">
        <h2>发布商品</h2>
      </div>
      
      <el-form :model="productForm" :rules="rules" ref="productForm" label-width="100px">
        <!-- 基本信息 -->
        <h3>基本信息</h3>
        
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        
        <el-form-item label="品牌" prop="brand">
          <el-select v-model="productForm.brand" placeholder="请选择品牌">
            <el-option v-for="brand in brands" :key="brand" :label="brand" :value="brand"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="尺码" prop="size">
          <el-select v-model="productForm.size" placeholder="请选择尺码">
            <el-option v-for="size in sizes" :key="size" :label="size" :value="size"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="productForm.price" :min="1" :precision="0" :step="10"></el-input-number>
        </el-form-item>
        
        <el-form-item label="商品描述" prop="description">
          <el-input type="textarea" v-model="productForm.description" rows="4" placeholder="请输入商品描述"></el-input>
        </el-form-item>
        
        <!-- 图片上传 -->
        <h3>商品图片</h3>
        
        <el-form-item label="上传图片" prop="images">
          <el-upload
            action="/api/products/upload"
            list-type="picture-card"
            :headers="uploadHeaders"
            :on-preview="handlePicturePreview"
            :on-remove="handleRemove"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            multiple>
            <i class="el-icon-plus"></i>
          </el-upload>
          
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
        </el-form-item>
        
        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">发布商品</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PublishProduct',
  data() {
    return {
      productForm: {
        name: '',
        brand: '',
        size: '',
        price: 100,
        description: '',
        images: []
      },
      rules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        brand: [
          { required: true, message: '请选择品牌', trigger: 'change' }
        ],
        size: [
          { required: true, message: '请选择尺码', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入价格', trigger: 'blur' },
          { type: 'number', min: 1, message: '价格必须大于0', trigger: 'blur' }
        ],
        description: [
          { required: true, message: '请输入商品描述', trigger: 'blur' },
          { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
        ],
        images: [
          { required: true, message: '请上传至少一张图片', trigger: 'change' }
        ]
      },
      dialogImageUrl: '',
      dialogVisible: false,
      submitting: false,
      // 假数据
      brands: ['Nike', 'Adidas', 'Jordan', 'Under Armour', 'New Balance', 'Converse'],
      sizes: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
    }
  },
  computed: {
    uploadHeaders() {
      // 如果需要在上传时带上用户信息
      return {
        userId: this.$store.getters.currentUser?._id
      }
    }
  },
  created() {
    // 检查是否登录
    if (!this.$store.getters.isLoggedIn) {
      this.$message.warning('请先登录')
      this.$router.push('/login?redirect=' + this.$route.path)
    }
  },
  methods: {
    handleRemove(file, fileList) {
      this.productForm.images = fileList.map(file => {
        if (file.response) {
          return file.response.imageUrls[0]
        } else {
          return file.url
        }
      })
    },
    
    handlePicturePreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    
    handleUploadSuccess(response, file, fileList) {
      this.productForm.images = fileList.map(file => {
        if (file.response) {
          return file.response.imageUrls[0]
        } else {
          return file.url
        }
      })
    },
    
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isJPG && !isPNG) {
        this.$message.error('上传图片只能是 JPG 或 PNG 格式!')
        return false
      }
      
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
        return false
      }
      
      return true
    },
    
    submitForm() {
      this.$refs.productForm.validate(async valid => {
        if (!valid) {
          return false
        }
        
        if (this.productForm.images.length === 0) {
          this.$message.error('请上传至少一张图片')
          return false
        }
        
        this.submitting = true
        
        try {
          // 添加卖家ID
          const formData = {
            ...this.productForm,
            sellerId: this.$store.getters.currentUser._id
          }
          
          // 发送请求
          const response = await axios.post('/api/products', formData)
          
          this.$message.success('商品发布成功')
          this.$router.push(`/products/${response.data._id}`)
        } catch (error) {
          console.error('发布商品失败:', error)
          this.$message.error('发布商品失败: ' + error.response?.data?.message || error.message)
        } finally {
          this.submitting = false
        }
      })
    },
    
    resetForm() {
      this.$refs.productForm.resetFields()
      this.productForm.images = []
    }
  }
}
</script>

<style scoped>
.publish-product {
  padding: 20px 0;
}

h3 {
  font-size: 18px;
  margin: 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}
</style> 