import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ExecuteCheck from '../views/ExecuteCheck.vue'
import ManageCheck from '../views/ManageCheck.vue'
import ManageStrategy from '../views/ManageStrategy.vue'
import MainView from '../views/MainView.vue'
import MustCheck from '../views/MustCheck.vue'
import CheckReports from '../views/CheckReports.vue'
import ReportView from '../views/ReportView.vue'

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
    path: '/reportview',
    name: 'reportview',
    component: ReportView
  },
  {
    path: '/checkreports',
    name: 'checkreports',
    component: CheckReports
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
  ,
  {
    path: '/mustcheck',
    name: 'mustcheck',
    component: MustCheck
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
