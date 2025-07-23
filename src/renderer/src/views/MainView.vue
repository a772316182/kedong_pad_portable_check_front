<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 1. 初始化路由
const router = useRouter()

// 2. 准备动态数据 (为将来扩展做准备)
const currentTime = ref('2023-08-20 15:46:55') // 实际项目中可以替换为动态时间
const currentUser = ref('业务操作员')

// 3. 统一的导航函数
//    为四个主要操作（退出、执行核查、核查管理、策略管理）准备了跳转逻辑
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

// 4. 定义主功能模块
const modules = ref([
  {
    title: '执行核查',
    // 注意：请将这里的图片地址替换为您自己的图片资源
    image: 'https://images.unsplash.com/photo-1581092921462-237503126529?q=80&w=1974&auto=format&fit=crop',
    route: '/execute-check'
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
  }
])
</script>

<template>
  <!-- 根布局，使用自定义的深色背景 -->
  <q-layout view="lHh Lpr lFf" class="main-background">
    <!-- 顶栏 -->
    <q-header class="main-background text-white" height-hint="98">
      <q-toolbar class="q-py-md q-px-lg">
        <!-- 左侧区域 -->
        <div class="row items-center">
          <q-btn
            unelevated
            padding="10px 20px"
            class="exit-button"
            icon="o_logout"
            label="退出"
            @click="navigateTo('/')"
          />
          <div class="q-ml-lg">
            <div class="text-h6">欢迎使用便携式技术监督检查工具</div>
            <div class="text-subtitle1 text-grey-5">当前登录身份：{{ currentUser }}</div>
          </div>
        </div>

        <!-- 弹簧，将左右内容推开 -->
        <q-space />

        <!-- 右侧区域 -->
        <div class="row items-center q-gutter-x-lg">
          <div class="row items-center q-gutter-x-sm cursor-pointer">
            <q-icon name="o_cloud_upload" size="2em" />
            <span class="text-h6">数据上传</span>
          </div>
          <div class="row items-center q-gutter-x-sm cursor-pointer">
            <q-icon name="o_notifications" size="2em" />
            <span class="text-h6">消息</span>
          </div>
          <div class="row items-center q-gutter-x-sm">
            <!-- 注意：请将这里的 logo 图片地址替换为您自己的 -->
            <q-img src="https://i.imgur.com/your-logo-placeholder.png" width="40px" height="40px" />
            <div>
              <div class="text-h6">盾源科技</div>
              <div class="text-caption">DUNYUAN TECHNOLOGY</div>
            </div>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 顶栏之上的状态栏 (时间、电量) -->
    <q-header class="main-background text-grey-5" style="top: 0; position: fixed;">
      <div class="row justify-between q-px-sm q-py-xs text-caption">
        <span>{{ currentTime }}</span>
        <span>当前电量: 15% <q-icon name="o_battery_2_bar" /></span>
      </div>
    </q-header>

    <!-- 页面主体内容 -->
    <q-page-container>
      <q-page padding class="page-content">
        <!-- 功能模块卡片 -->
        <div class="row q-col-gutter-xl justify-center">
          <div
            v-for="mod in modules"
            :key="mod.title"
            class="col-12 col-md-4"
            style="max-width: 400px;"
          >
            <!-- 为每个卡片添加点击事件 -->
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
  </q-layout>
</template>

<style scoped>
/* 定义与原型一致的颜色和样式 */

/* 主背景色 */
.main-background {
  background-color: #313942;
  border-bottom: 1px solid #4a5562;
}

/* 页面内容区域，有一个额外的上边距以避开顶栏 */
.page-content {
  padding-top: 120px; /* 调整此值以确保内容不被顶栏遮挡 */
}

/* 退出按钮样式 */
.exit-button {
  background-color: #00796b; /* 从原型图中提取的青色 */
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
}

/* 功能卡片样式 */
.action-card {
  background-color: #313942; /* 与主背景色一致 */
  border-radius: 12px;
  overflow: hidden; /* 确保圆角生效 */
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid #4a5562;
}

/* 卡片悬停效果 */
.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

/* 卡片底部的文字区域样式 */
.action-card .q-card__section {
  background-color: #e0e0e0; /* 浅灰色背景 */
  color: #313942; /* 深色文字 */
  padding: 20px;
}
</style>
