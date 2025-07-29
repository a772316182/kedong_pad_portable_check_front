<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// START: 为弹窗和侧拉窗口新增/修改的状态
// ===============================================
// 数据上传弹窗的状态
const uploadDialog = ref(false);
// 消息侧拉窗口的状态
const messagesDrawer = ref(false);

// 数据上传弹窗的表单数据
const uploadConfig = ref({
  channelIp: '',
  gateway: ''
});

// 连通性测试的方法 (占位)
const testConnectivity = () => {
  console.log("正在测试连通性...");
};
// ===============================================
// END: 为弹窗和侧拉窗口新增/修改的状态

const currentTime = ref('2023-08-20 15:46:55')
const currentUser = ref('业务操作员')

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}

const modules = ref([
  {
    title: '执行核查',
    image: 'https://img95.699pic.com/photo/60007/2211.jpg_wh300.jpg',
    route: '/executeCheck'
  },
  {
    title: '核查管理',
    image: 'https://img95.699pic.com/photo/50028/1075.jpg_wh860.jpg',
    route: '/manageCheck'
  },
  {
    title: '策略管理',
    image: 'https://img95.699pic.com/photo/60031/0952.jpg_wh860.jpg',
    route: '/manageStrategy'
  },
  {
    title: '厂站安全检查',
    image: 'https://img95.699pic.com/photo/60040/1943.jpg_wh860.jpg',
    route: '/factorysafecheck'
  },
  {
    title: '用户管理',
    image: 'https://image.woshipm.com/wp-files/2019/12/HQxmWILTRNWkyPJs06JE.jpg',
    route: '/managecustomer'
  },
  {
    title: '系统管理',
    image: 'https://img95.699pic.com/photo/60000/1104.jpg_wh860.jpg',
    route: '/managesystem'
  }
])
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="main-background">
    <q-header class="main-background text-white" height-hint="98">
      <div class="row justify-between q-px-sm q-py-xs text-caption">
        <span>{{ currentTime }}</span>
        <span>当前电量: 15% <q-icon name="o" /></span>
      </div>
      <q-toolbar class="q-py-md q-px-lg">
        <div class="row items-center">
          <q-btn
            unelevated
            padding="10px 20px"
            class="exit-button"
            label="退出"
            @click="navigateTo('/')"
          />
          <div class="q-ml-lg">
            <div class="text-h6">欢迎使用便携式技术监督检查工具</div>
            <div class="text-subtitle1 text-grey-5">当前登录身份：{{ currentUser }}</div>
          </div>
        </div>
        <q-space />
        <div class="row items-center q-gutter-x-lg">
          <!-- START: 修改按钮点击事件以打开对应的弹窗/侧拉窗口 -->
          <div class="row items-center q-gutter-x-sm cursor-pointer">
            <q-btn unelevated label="数据上传" @click="uploadDialog = true"/>
          </div>
          <div class="row items-center q-gutter-x-sm cursor-pointer">
            <q-btn unelevated label="消息" @click="messagesDrawer = true"/>
          </div>
          <!-- END: 修改按钮点击事件 -->
          <div class="row items-center q-gutter-x-sm"></div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding class="page-content">
        <div class="row q-col-gutter-xl justify-center">
          <div
            v-for="mod in modules"
            :key="mod.title"
            class="col-12 col-md-4"
            style="max-width: 400px;"
          >
            <q-card
              class="action-card"
              flat
              bordered
              @click="navigateTo(mod.route)"
            >
              <q-img :src="mod.image" :ratio="4/3" />
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-bold">{{ mod.title }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- START: 新增/修改的弹窗与侧拉窗口 -->
    <!-- =============================================== -->

    <!-- 弹窗1: 数据上传准备 (保持不变) -->
    <q-dialog v-model="uploadDialog">
      <q-card class="dialog-card" style="width: 600px;">
        <q-card-section><div class="text-h6">数据上传准备</div></q-card-section>
        <q-card-section class="q-pt-none">
          <div class="dialog-form-row">
            <span class="dialog-form-label">网传通道 IP:</span>
            <q-input dense outlined v-model="uploadConfig.channelIp" placeholder="请输入网传通道 IP" class="col" />
          </div>
          <div class="dialog-form-row">
            <span class="dialog-form-label"><span class="text-red">*</span> 当前终端 IP:</span>
            <span>10.105.71.233</span>
          </div>
          <div class="dialog-form-row">
            <span class="dialog-form-label"><span class="text-red">*</span> 子网掩码:</span>
            <span>255.255.255.0</span>
            <q-space />
            <q-btn label="连通性测试" color="primary" unelevated dense @click="testConnectivity" />
          </div>
          <div class="dialog-form-row">
            <span class="dialog-form-label">网关:</span>
            <q-input dense outlined v-model="uploadConfig.gateway" placeholder="请输入" class="col" />
          </div>
        </q-card-section>
        <q-card-actions class="dialog-actions-bar">
          <q-btn flat label="退出" v-close-popup />
          <q-btn unelevated label="直接回传" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 侧拉窗口2: 消息提示 (从 q-dialog 修改为 q-drawer) -->
    <q-drawer
      v-model="messagesDrawer"
      side="right"
      bordered
      :width="400"
      class="messages-drawer"
    >
      <div class="column full-height">
        <!-- 侧拉窗口的头部 -->
        <div class="row items-center q-pa-md messages-drawer-header">
          <div class="text-h6">消息提示</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="messagesDrawer = false" />
        </div>
        <q-separator />

        <!-- 侧拉窗口的内容区 -->
        <q-scroll-area class="col">
          <div class="column items-center justify-center full-height text-center">
            <q-icon name="o" color="grey-5" size="7em" />
            <div class="text-h6 text-grey-6 q-mt-md">暂无消息</div>
          </div>
        </q-scroll-area>
        <q-separator />

        <!-- 侧拉窗口的脚部 -->
        <div class="q-pa-md">
          <q-btn class="full-width" unelevated label="我知道了" color="primary" @click="messagesDrawer = false" />
        </div>
      </div>
    </q-drawer>

    <!-- =============================================== -->
    <!-- END: 新增/修改的弹窗与侧拉窗口 -->
  </q-layout>
</template>

<style scoped>
/* 定义与原型一致的颜色和样式 */
.main-background {
  background-color: #313942;
  border-bottom: 1px solid #4a5562;
}
.page-content {
  padding-top: 120px;
}
.exit-button {
  background-color: #00796b;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
}
.action-card {
  background-color: #313942;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid #4a5562;
}
.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}
.action-card .q-card__section {
  background-color: #e0e0e0;
  color: #313942;
  padding: 20px;
}

/* START: 新增/修改的弹窗和侧拉窗口样式 */
/* =============================================== */
.dialog-card {
  border-radius: 8px;
}
.dialog-form-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  min-height: 40px;
}
.dialog-form-label {
  width: 120px;
  text-align: right;
  font-weight: 500;
  flex-shrink: 0;
}
.dialog-actions-bar {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

/* 消息侧拉窗口的特定样式 */
.messages-drawer {
  background-color: #fff; /* 通常侧拉窗口是白色背景 */
}
.messages-drawer-header {
  border-bottom: 1px solid #e0e0e0;
}
/* =============================================== */
/* END: 新增/修改的弹窗和侧拉窗口样式 */
</style>
