import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import ExecuteCheck from '../views/MainSystem/ExecuteCheck/ExecuteCheck.vue'
import ManageCheck from '../views/MainSystem/ManageCheck/ManageCheck.vue'
import ManageStrategy from '../views/ManageStrategy.vue'
import MainView from '../views/MainSystem/MainView.vue'
import MustCheck from '../views/MustCheck.vue'
import CheckReports from '../views/MainSystem/ManageCheck/CheckReports.vue'
import ReportView from '../views/MainSystem/ManageCheck/ReportView.vue'
import StationView from '../views/MainSystem/ManageCheck/StationView.vue'
import ManageAsset from '../views/MainSystem/ManageCheck/ManageAsset.vue'
import CheckInProgress from '../views/MainSystem/ManageCheck/CheckInProgress.vue'
import TaskCheck from '../views/MainSystem/ManageCheck/TaskCheck.vue'
import Checking from '../views/MainSystem/ExecuteCheck/Checking.vue'
import CheckResult from '../views/MainSystem/ExecuteCheck/CheckResult.vue'
import LoginCheckInProgress from '../views/MainSystem/ExecuteCheck/LoginCheckInProgress.vue'
import HistoryLog from '../views/MainSystem/ExecuteCheck/HistoryLog.vue'
import TechCheck from '../views/MainSystem/ExecuteCheck/TechCheck.vue'
import TechCheckInProgress from '../views/MainSystem/ExecuteCheck/TechCheckInProgress.vue'
import SiteCheck from '../views/MainSystem/ExecuteCheck/SiteCheck.vue'
import BaseSafeCheck from '../views/MainSystem/FactorySafeCheck/BaseSafeCheck.vue'
import NetMachineCheck from '../views/MainSystem/FactorySafeCheck/NetMachineCheck.vue'
import FactorySafeCheck from '../views/MainSystem/FactorySafeCheck/FactorySafeCheck.vue'
import FactoryView from '../views/MainSystem/ManageCheck/FactoryView.vue'
import SecurityStrategy from '../views/MainSystem/FactorySafeCheck/SecurityStrategy.vue'
import SecurityAlert from '../views/MainSystem/FactorySafeCheck/SecurityAlert.vue'
import ManageCustomer from '../views/MainSystem/ManageCustomer.vue'
import ManageSystem from '../views/MainSystem/ManageSystem.vue'
import ModeSelect from '../views/MainSystem/ManageCheck/ModeSelect.vue'
import StationAndTask from '../views/MainSystem/ManageCheck/StationAndTask.vue'

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
  },{
    path:'/basesafecheck',
    name:'/basesafecheck',
    component: BaseSafeCheck
  },{
    path:'/netmachinecheck',
    name:'netmachinecheck',
    component: NetMachineCheck
  },{
    path:'/factorysafecheck',
    name:'factorysafecheck',
    component: FactorySafeCheck
  },
  {
    path:'/factoryview',
    name:'factoryview',
    component: FactoryView
  },
  {
    path:'/securitystrategy',
    name:'securitystrategy',
    component: SecurityStrategy
  },
  {
    path:'/securityalert',
    name:'securityalert',
    component: SecurityAlert
  },{
    path:'/managecustomer',
    name:'managecustomer',
    component: ManageCustomer
  },{
    path:'/managesystem',
    name:'managesystem',
    component: ManageSystem
  },
  {
    path:'/modeselect',
    name:'modeselect',
    component: ModeSelect
  },
  {
    path:'/stationandtask',
    name:'stationandtask',
    component: StationAndTask
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
