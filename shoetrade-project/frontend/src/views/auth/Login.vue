<template>
  <div class="login-container">
    <el-card class="login-card">
      <div slot="header" class="title">
        <h2>用户登录</h2>
      </div>
      
      <el-form ref="loginForm" :model="loginForm" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%;">登录</el-button>
        </el-form-item>
        
        <div class="form-footer">
          <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    ...mapActions(['loginUser']),
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) {
          return
        }
        
        this.loading = true
        
        try {
          await this.loginUser(this.loginForm)
          
          // 登录成功提示
          this.$message.success('登录成功')
          
          // 如果有重定向，则跳转到重定向页面，否则跳转到首页
          const redirectPath = this.$route.query.redirect || '/'
          this.$router.push(redirectPath)
        } catch (error) {
          this.$message.error(error.response?.data?.message || '登录失败，请检查用户名和密码')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 250px);
  padding: 20px;
}

.login-card {
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