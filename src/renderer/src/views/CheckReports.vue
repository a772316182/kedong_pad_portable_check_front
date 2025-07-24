<script setup>
import { ref, reactive } from 'vue';
import router from '../router'

// 定义组件可以触发的事件
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

// --- 响应式数据 ---
const reports = reactive([
  {
    name: '安全巡检报告',
    date: '2025-06-20 15:47:30',
    size: "2.5 MB",
    version: "v1.0"
  },
  {
    name: "季度安全审计报告",
    date: "2025-05-15 11:20:00",
    size: "4.1 MB",
    version: "v1.2"
  },
]);

// 控制提示弹窗的显示状态
const isUsbAlertDialogVisible = ref(false);

// --- 方法 ---
const handleDownloadClick = () => {
  isUsbAlertDialogVisible.value = true;
};

const handleViewClick = () => {
  // 触发导航事件，跳转到新的报告查看页面
  navigateTo('/reportview');
};
</script>

<template>
  <!-- 使用 QLayout 作为页面根布局，并应用深色背景 -->
  <q-layout view="lHh Lpr lFf" class="bg-dark-page">
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn label="返回" color="primary" @click="navigateTo('/mainview')" />
        <q-toolbar-title>
          报告管理
        </q-toolbar-title>
        <q-space />
        <div class="text-caption text-grey-5">
          当前电量: 15%
          <q-icon name="battery_full" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 报告卡片网格 -->
        <div class="row q-col-gutter-md">
          <div v-for="report in reports" :key="report.name" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card class="bg-white text-black full-height" flat bordered>
              <q-card-section>
                <div class="text-h6 text-teal-9">{{ report.name }}</div>
                <div class="text-subtitle2 text-grey-7 q-mt-sm">生成时间: {{ report.date }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none text-grey-8">
                <div>文件大小: {{ report.size }}</div>
                <div>版本号: {{ report.version }}</div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
                <q-btn flat color="primary" size="sm" @click="handleViewClick">查看</q-btn>
                <q-btn flat color="blue-6" size="sm" @click="handleDownloadClick">下载</q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- U盘未插入提示对话框 -->
    <q-dialog v-model="isUsbAlertDialogVisible">
      <q-card class="bg-white text-grey-9">
        <q-card-section>
          <div class="text-h6">提示</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          请先插入U盘
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="确定" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<style scoped>
/* 自定义深色主题 */
.bg-dark-page {
  background-color: #2e3c41; /* 图片中的深青灰色背景 */
}
.bg-dark-header {
  background-color: #2e3c41; /* 头部与背景同色 */
}

.full-height {
  height: 100%;
}

/* 卡片样式调整以匹配图片 */
.q-card {
  border-radius: 8px;
}
</style>
