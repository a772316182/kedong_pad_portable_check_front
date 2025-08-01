import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ExecuteCheck from '../views/ExecuteCheck.vue'
import ManageCheck from '../views/ManageCheck.vue'
import ManageStrategy from '../views/ManageStrategy.vue'
import MainView from '../views/MainView.vue'
import MustCheck from '../views/MustCheck.vue'
import CheckReports from '../views/CheckReports.vue'
import ReportView from '../views/ReportView.vue'
import StationView from '../views/StationView.vue'
import ManageAsset from '../views/ManageAsset.vue'
import CheckInProgress from '../views/CheckInProgress.vue'
import TaskCheck from '../views/TaskCheck.vue'
import MultiAsset from '../views/MultiAsset.vue'
import Checking from '../views/Checking.vue'
import CheckResult from '../views/CheckResult.vue'
import LoginCheckInProgress from '../views/LoginCheckInProgress.vue'
import HistoryLog from '../views/HistoryLog.vue'
import TechCheck from '../views/Techcheck.vue'
import TechCheckInProgress from '../views/TechCheckInProgress.vue'
import SiteCheck from '../views/SiteCheck.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LoginView
  },
  {
    path: '/executecheck',
    name: 'executecheck',
    component: ExecuteCheck
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
    path: '/logincheckinprogress',
    name: 'logincheckinprogress',
    component: LoginCheckInProgress
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
  },
  {
    path: '/stationview',
    name: 'stationview',
    component: StationView
  },
  {
    path: '/manageasset',
    name: 'manageasset',
    component: ManageAsset
  }
  ,
  {
    path: '/inprogress',
    name: 'inprogress',
    component: CheckInProgress
  },
  {
    path: '/taskcheck',
    name: 'taskcheck',
    component: TaskCheck
  },
  {
    path:'/multiasset',
    name:'multiasset',
    component:MultiAsset
  },
  {
    path:'/checking',
    name:'checking',
    component:Checking
  },
  {
    path:'/checkresult',
    name:'checkresult',
    component:CheckResult
  },
  {
    path:'/historylog',
    name:'historylog',
    component:HistoryLog
  },
  {
    path:'/techcheck',
    name:'techcheck',
    component:TechCheck
  },
  {
    path: '/techcheckinprogress',
    name: 'techcheckinprogress',
    component: TechCheckInProgress
  },
  {
    path: '/sitecheck',
    name: 'sitecheck',
    component: SiteCheck
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
