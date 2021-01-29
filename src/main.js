import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'


import './plugins/element.js'
import './assets/CSS/global.css'

import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor, /* { default global options } */)

Vue.prototype.$http =axios  //配置请求根路径
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
axios.interceptors.request.use(config =>{

  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})

Vue.config.productionTip = false
Vue.filter('dataFormat',function(originVal){
  const dt = new Date(originVal*1000)
  const y = dt.getFullYear()
  const m =( dt.getMonth() + 1 + '' ).padStart(2,'0')
  const d = (dt.getDate() + '').padStart(2,'0')
  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
