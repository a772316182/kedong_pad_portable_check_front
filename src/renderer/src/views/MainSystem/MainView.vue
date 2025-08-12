<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// START: 为弹窗和侧拉窗口新增/修改的状态
const uploadDialog = ref(false);
const messagesDrawer = ref(false);

const uploadConfig = ref({
  channelIp: '',
  gateway: ''
});

const testConnectivity = () => {
  console.log("正在测试连通性...");
};
// END: 为弹窗和侧拉窗口新增/修改的状态

const currentUser = ref('业务操作员')

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}

const modules = ref([
  {
    title: '执行检查',
    image: 'https://img95.699pic.com/photo/60007/2211.jpg_wh300.jpg',
    route: '/modeselect'
  },
  {
    title: '策略管理',
    image: 'https://img95.699pic.com/photo/60031/0952.jpg_wh860.jpg',
    route: '/manageStrategy'
  },
  {
    title: '报告管理',
    image: 'https://exp-picture.cdn.bcebos.com/1f9feadca039131f1aed656ee275f2c4ec990a59.jpg',
    route: '/checkreports'
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
    <q-header class="text-white" height-hint="130">
      <q-toolbar class="q-py-lg q-px-xl">
        <div class="row items-center">
          <q-btn
            unelevated
            class="exit-button"
            label="退出"
            @click="navigateTo('/')"
          />
          <div class="q-ml-xl">
            <div class="text-h6">欢迎使用便携式技术监督检查工具</div>
            <div class="text-subtitle1 text-grey-5">当前登录身份：{{ currentUser }}</div>
          </div>
        </div>
        <q-space />
        <div class="row items-center q-gutter-x-xl">
          <div class="row items-center q-gutter-x-sm cursor-pointer">
            <q-btn unelevated label="数据上传" @click="uploadDialog = true"/>
          </div>
          <div class="row items-center q-gutter-x-sm cursor-pointer">
            <q-btn unelevated label="消息" @click="messagesDrawer = true"/>
          </div>
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
            style="max-width: 500px;"
          >
            <q-card
              class="action-card"
              flat
              bordered
              @click="navigateTo(mod.route)"
            >
              <q-img :src="mod.image" :ratio="16/9" />
              <q-card-section class="text-center">
                <div class="text-h5 text-weight-bold">{{ mod.title }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <q-dialog v-model="uploadDialog">
      <q-card class="dialog-card" style="width: 700px; max-width: 90vw;">
        <q-card-section class="dialog-header">
          <div class="text-h6">数据上传准备</div>
        </q-card-section>
        <q-card-section class="dialog-content q-pt-none">
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

    <q-drawer
      v-model="messagesDrawer"
      side="right"
      bordered
      :width="550"
      class="messages-drawer"
    >
      <div class="column full-height">
        <div class="row items-center q-pa-xl messages-drawer-header">
          <div class="text-h6">消息提示</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="messagesDrawer = false" />
        </div>
        <q-separator />
        <q-scroll-area class="col">
          <div class="column items-center justify-center full-height text-center q-pa-md">
            <q-icon name="notifications" color="grey-5" size="12em" />
            <div class="text-h6 text-grey-6 q-mt-xl">暂无消息</div>
          </div>
        </q-scroll-area>
        <q-separator />
        <div class="q-pa-xl">
          <q-btn class="full-width" unelevated label="我知道了" color="primary" @click="messagesDrawer = false" />
        </div>
      </div>
    </q-drawer>
  </q-layout>
</template>

<!-- 全局样式 (无 scoped) -->
<style>
:root {
  --font-scale-factor: 1.3;
}
.dialog-card {
  border-radius: 8px;
}
.dialog-card .dialog-header {
  padding: 24px 32px 16px;
}
.dialog-card .dialog-content {
  padding: 16px 32px;
}
.dialog-card .text-h6 {
  font-size: calc(1.25rem * var(--font-scale-factor));
}
.dialog-form-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  font-size: calc(1.1rem * var(--font-scale-factor));
}
.dialog-form-label {
  width: 150px;
  text-align: right;
  font-weight: 500;
  flex-shrink: 0;
}
.dialog-card .q-field__native,
.dialog-card .q-field__label {
  font-size: calc(1.1rem * var(--font-scale-factor)) !important;
}
.dialog-actions-bar {
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  padding: 16px 32px;
}
.dialog-card .q-btn {
  padding: 8px 18px !important;
}
.dialog-card .q-btn .q-btn__content {
  font-size: calc(1.1rem * var(--font-scale-factor)) !important;
  font-weight: 500;
}
.messages-drawer {
  background-color: #fff;
}
.messages-drawer .messages-drawer-header {
  border-bottom: 1px solid #e0e0e0;
  padding: 24px !important;
}
.messages-drawer .text-h6 {
  font-size: calc(1.25rem * var(--font-scale-factor));
}
.messages-drawer .q-btn .q-btn__content {
  font-size: calc(1.1rem * var(--font-scale-factor));
  font-weight: 500;
}
</style>

<!-- 局部样式 (有 scoped) -->
<style scoped>
.main-background {
  background-color: #292a2d;
}
.main-background .q-header {
  background-color: inherit;
  border-bottom: 1px solid #4a5562;
}
.page-content {
  padding-top: 40px;
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
  padding: 24px;
}
.action-card .text-h5 {
  font-size: calc(1.6rem * var(--font-scale-factor));
}


/* --- 头部区域 --- */
.exit-button {
  background-color: #4c6afc;
  color: white;
  border-radius: 8px;
  font-size: calc(1.2rem * var(--font-scale-factor));
  padding: calc(12px * var(--font-scale-factor)) calc(24px * var(--font-scale-factor));
  font-weight: bold;
}
.main-background .text-h6 {
  font-size: calc(1.6rem * var(--font-scale-factor));
}
.main-background .text-subtitle1 {
  font-size: calc(1.1rem * var(--font-scale-factor));
}

/* 【关键修改】这是一个唯一、明确的规则，用于控制头部右侧的按钮 */
/* 它不再与任何其他规则冲突 */
.main-background :deep(.q-header .q-gutter-x-xl .q-btn) {
  padding: calc(8px * var(--font-scale-factor)) calc(16px * var(--font-scale-factor));
}
.main-background :deep(.q-header .q-gutter-x-xl .q-btn .q-btn__content) {
  font-size: calc(1.2rem * var(--font-scale-factor));
  font-weight: bold;
}
</style>
