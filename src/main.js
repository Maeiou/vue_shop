import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

import './plugins/element.js'
import './assets/CSS/global.css'


Vue.prototype.$http =axios  //配置请求根路径
axios.defaults.baseURL = 'http://119.23.53.78:8888/api/private/v1/'
axios.interceptors.request.use(config =>{

  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})

Vue.config.productionTip = false


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
