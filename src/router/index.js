import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    redirect:'/welcome',
    children:[
      {
        path: '/welcome',
        name: 'Welcome',
        component: Welcome,
      },
      {
        path: '/users',
        name: 'Users',
        component: Users,
      },
      {
        path: '/rights',
        name: 'Rights',
        component: Rights,
      }, 
      {
        path: '/roles',
        name: 'Roles',
        component: Roles,
      
      }, 
      {
        path: '/categories',
        name: 'Cate',
        component: Cate,
      }
    ]
  },
 
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next)=>{

  if(to.path === '/login') return next()

  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
