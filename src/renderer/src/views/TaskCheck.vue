<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router'

// 定义组件可以触发的事件
const router = useRouter()

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

// --- 响应式数据 ---
const tasks = reactive([
  {
    id: "250620_250621_1533",
    status: "已完成",
    statusColor: "green-6",
    details: "这是一个已完成任务的描述信息，包含任务的关键摘要。",
  },
  {
    id: "250622_250623_1000",
    status: "进行中",
    statusColor: "orange-6",
    details: "这是一个正在进行任务的描述信息，可以查看实时进度。",
  },
]);

const handleViewDetails = () => {
  // 导航到“正在核查”页面
  emit('navigate', 'InProgressCheck');
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-page">
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="emit('navigate', 'CheckManagement')" />
        <q-toolbar-title>
          任务管理
        </q-toolbar-title>
        <q-space />
        <q-btn flat dense label="筛选" icon="filter_list" class="q-mr-sm" />
        <q-btn color="light-blue-6" label="添加" icon="add" />
        <div class="text-caption text-grey-5 q-ml-md">
          当前电量: 15%
          <q-icon name="battery_full" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 任务卡片网格 -->
        <div class="row q-col-gutter-md">
          <div v-for="task in tasks" :key="task.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card class="bg-white text-black full-height" flat bordered>
              <q-card-section>
                <div class="row items-start no-wrap">
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bold">{{ task.id }}</div>
                    <div class="text-caption text-grey-7">{{ task.details }}</div>
                  </div>
                  <div class="col-auto">
                    <q-chip :color="task.statusColor" text-color="white" dense>{{ task.status }}</q-chip>
                  </div>
                </div>
              </q-card-section>

              <q-separator />

              <q-card-actions align="right">
                <q-btn flat color="red-6" size="sm">删除</q-btn>
                <q-btn flat color="primary" size="sm" @click="navigateTo('/inprogress')">检查详情</q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
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
.q-card {
  border-radius: 8px;
}
</style>
