<template>
  <div class="register-container">
    <el-card class="register-card">
      <div slot="header" class="title">
        <h2>用户注册</h2>
      </div>
      
      <el-form ref="registerForm" :model="registerForm" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleRegister" :loading="loading" style="width: 100%;">注册</el-button>
        </el-form-item>
        
        <div class="form-footer">
          <p>已有账号？<router-link to="/login">立即登录</router-link></p>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Register',
  data() {
    // 自定义验证方法：确认密码
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    
    return {
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在3到20个字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    ...mapActions(['registerUser']),
    handleRegister() {
      this.$refs.registerForm.validate(async valid => {
        if (!valid) {
          return
        }
        
        this.loading = true
        
        try {
          // 去除确认密码字段
          const { confirmPassword, ...userData } = this.registerForm
          
          await this.registerUser(userData)
          
          // 注册成功提示
          this.$message.success('注册成功，已自动登录')
          
          // 跳转到首页
          this.$router.push('/')
        } catch (error) {
          this.$message.error(error.response?.data?.message || '注册失败，请稍后重试')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 250px);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 500px;
}

.title {
  text-align: center;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.form-footer a {
  color: #409eff;
  text-decoration: none;
}
</style> 