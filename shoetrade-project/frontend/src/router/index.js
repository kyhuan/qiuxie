import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue')
  },
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('../views/products/ProductList.vue')
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('../views/products/ProductDetail.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/cart/Cart.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('../views/checkout/Checkout.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('../views/user/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/orders',
    name: 'UserOrders',
    component: () => import('../views/user/Orders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/selling',
    name: 'UserSelling',
    component: () => import('../views/user/Selling.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/publish',
    name: 'PublishProduct',
    component: () => import('../views/user/PublishProduct.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('../views/orders/OrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  // 捕获所有未匹配的路由，重定向到首页
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 全局前置守卫，检查登录状态
router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录
    if (!store.getters.isLoggedIn) {
      // 未登录则重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 