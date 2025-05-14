import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    cart: [],
    products: [],
    loading: false,
    error: null
  },
  
  getters: {
    isLoggedIn: state => !!state.user,
    currentUser: state => state.user,
    cartCount: state => {
      return state.cart.reduce((total, item) => total + item.quantity, 0)
    },
    cartTotal: state => {
      return state.cart.reduce((total, item) => {
        return total + (item.product ? item.product.price * item.quantity : 0)
      }, 0)
    }
  },
  
  mutations: {
    setUser(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    
    clearUser(state) {
      state.user = null
      localStorage.removeItem('user')
    },
    
    setCart(state, cart) {
      state.cart = cart
    },
    
    setProducts(state, products) {
      state.products = products
    },
    
    setLoading(state, status) {
      state.loading = status
    },
    
    setError(state, error) {
      state.error = error
    }
  },
  
  actions: {
    // 用户相关操作
    async registerUser({ commit }, userData) {
      try {
        commit('setLoading', true)
        const response = await axios.post('/api/users/register', userData)
        commit('setUser', response.data)
        commit('setLoading', false)
        return response
      } catch (error) {
        commit('setError', error.response?.data?.message || '注册失败')
        commit('setLoading', false)
        throw error
      }
    },
    
    async loginUser({ commit }, credentials) {
      try {
        commit('setLoading', true)
        const response = await axios.post('/api/users/login', credentials)
        commit('setUser', response.data)
        commit('setLoading', false)
        return response
      } catch (error) {
        commit('setError', error.response?.data?.message || '登录失败')
        commit('setLoading', false)
        throw error
      }
    },
    
    logoutUser({ commit }) {
      commit('clearUser')
      commit('setCart', [])
    },
    
    // 购物车相关操作
    async fetchCart({ commit, state }) {
      if (!state.user) return
      
      try {
        commit('setLoading', true)
        const response = await axios.get(`/api/users/${state.user._id}/cart`)
        commit('setCart', response.data)
        commit('setLoading', false)
      } catch (error) {
        commit('setError', error.response?.data?.message || '获取购物车失败')
        commit('setLoading', false)
      }
    },
    
    async addToCart({ commit, state, dispatch }, { productId, quantity }) {
      if (!state.user) return
      
      try {
        commit('setLoading', true)
        await axios.post(`/api/users/${state.user._id}/cart`, { productId, quantity })
        dispatch('fetchCart')
        commit('setLoading', false)
      } catch (error) {
        commit('setError', error.response?.data?.message || '添加到购物车失败')
        commit('setLoading', false)
        throw error
      }
    },
    
    async removeFromCart({ commit, state, dispatch }, productId) {
      if (!state.user) return
      
      try {
        commit('setLoading', true)
        await axios.delete(`/api/users/${state.user._id}/cart/${productId}`)
        dispatch('fetchCart')
        commit('setLoading', false)
      } catch (error) {
        commit('setError', error.response?.data?.message || '从购物车移除失败')
        commit('setLoading', false)
        throw error
      }
    },
    
    async clearCart({ commit, state }) {
      if (!state.user) return
      
      try {
        commit('setLoading', true)
        await axios.delete(`/api/users/${state.user._id}/cart`)
        commit('setCart', [])
        commit('setLoading', false)
      } catch (error) {
        commit('setError', error.response?.data?.message || '清空购物车失败')
        commit('setLoading', false)
        throw error
      }
    },
    
    // 商品相关操作
    async fetchProducts({ commit }, params = {}) {
      try {
        commit('setLoading', true)
        const response = await axios.get('/api/products', { params })
        commit('setProducts', response.data.products)
        commit('setLoading', false)
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '获取商品列表失败')
        commit('setLoading', false)
        throw error
      }
    },
    
    async createOrder({ commit, state, dispatch }) {
      if (!state.user) return
      
      try {
        commit('setLoading', true)
        const response = await axios.post('/api/orders', { buyerId: state.user._id })
        commit('setLoading', false)
        dispatch('clearCart')
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '创建订单失败')
        commit('setLoading', false)
        throw error
      }
    },
    
    async payOrder({ commit }, orderId) {
      try {
        commit('setLoading', true)
        const response = await axios.post(`/api/orders/${orderId}/pay`)
        commit('setLoading', false)
        return response.data
      } catch (error) {
        commit('setError', error.response?.data?.message || '支付订单失败')
        commit('setLoading', false)
        throw error
      }
    }
  }
}) 