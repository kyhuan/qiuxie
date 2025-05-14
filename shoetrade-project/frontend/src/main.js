import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

Vue.use(ElementUI)

Vue.config.productionTip = false

// 配置axios
axios.defaults.baseURL = 'http://localhost:5000'
Vue.prototype.$http = axios

// 设置请求拦截器
axios.interceptors.request.use(config => {
  // 从localStorage获取token并添加到请求头
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user._id) {
    config.headers.userId = user._id
  }
  return config
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app') 