import { createRouter, createWebHashHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import LoginView from '../views/LoginView.vue'
import ExecuteCheck from '../views/ExecuteCheck.vue'
import ManageCheck from '../views/ManageCheck.vue'
import ManageStrategy from '../views/ManageStrategy.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LoginView
  },
  {
    path: '/mainview',
    name: 'mainview',
    component: MainView
  },
  {
    path: '/executeCheck',
    name: 'executeCheck',
    component: ExecuteCheck
  },
  {
    path: '/manageCheck',
    name: 'manageCheck',
    component: ManageCheck
  },
  {
    path: '/manageStrategy',
    name: 'manageStrategy',
    component: ManageStrategy
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
