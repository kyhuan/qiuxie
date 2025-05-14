<template>
  <div class="header">
    <el-menu
      :default-active="activeIndex"
      class="menu"
      mode="horizontal"
      router
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <div class="logo">
        <router-link to="/">二手球鞋交易平台</router-link>
      </div>
      
      <el-menu-item index="/">首页</el-menu-item>
      <el-menu-item index="/products">商品列表</el-menu-item>
      
      <div class="flex-spacer"></div>
      
      <el-menu-item v-if="!isLoggedIn" index="/login">登录</el-menu-item>
      <el-menu-item v-if="!isLoggedIn" index="/register">注册</el-menu-item>
      
      <el-submenu v-if="isLoggedIn" index="user">
        <template slot="title">{{ currentUser.username }}</template>
        <el-menu-item index="/user/profile">个人中心</el-menu-item>
        <el-menu-item index="/user/orders">我的订单</el-menu-item>
        <el-menu-item index="/user/selling">我的出售</el-menu-item>
        <el-menu-item @click="logout">退出登录</el-menu-item>
      </el-submenu>
      
      <el-menu-item v-if="isLoggedIn" index="/cart">
        <i class="el-icon-shopping-cart-2"></i> 购物车
        <el-badge v-if="cartCount > 0" :value="cartCount" class="cart-badge"></el-badge>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'HeaderNav',
  data() {
    return {
      activeIndex: '/'
    }
  },
  computed: {
    ...mapGetters(['isLoggedIn', 'currentUser', 'cartCount'])
  },
  methods: {
    ...mapActions(['logoutUser']),
    logout() {
      this.logoutUser()
      this.$router.push('/login')
      this.$message.success('退出登录成功')
    }
  },
  created() {
    this.activeIndex = this.$route.path
  }
}
</script>

<style scoped>
.header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu {
  display: flex;
  align-items: center;
  height: 60px;
}

.logo {
  width: 200px;
  text-align: center;
  padding: 0 20px;
}

.logo a {
  color: #fff;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
}

.flex-spacer {
  flex: 1;
}

.cart-badge {
  margin-top: -5px;
}
</style> 