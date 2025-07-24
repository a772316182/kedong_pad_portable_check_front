<script setup>
// 定义组件可以触发的事件
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}
</script>

<template>
  <!-- 使用 QLayout 作为页面根布局，并应用深色背景 -->
  <q-layout view="lHh Lpr lFf" class="bg-dark-page">
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn label="返回" color="primary" @click="navigateTo('/mainview')" />
        <q-toolbar-title>
          核查管理
        </q-toolbar-title>
        <q-space />
        <div class="text-caption text-grey-5">
          当前电量: 15%
          <q-icon name="battery_full" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex flex-center">
        <div class="q-pa-md" style="width: 100%; max-width: 600px;">
          <q-list separator>
            <q-item clickable v-ripple class="q-py-lg" @click='navigateTo("/stationview")'>
              <q-item-section avatar>
                <q-icon color="blue-4" name="desktop_windows" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6">核查对象管理</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple class="q-py-lg" @click='navigateTo("/inprogress")'>
              <q-item-section avatar>
                <q-icon color="blue-4" name="folder_open" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6">核查任务管理</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple class="q-py-lg" @click='navigateTo("/checkreports")'>
              <q-item-section avatar>
                <q-icon color="blue-4" name="assignment" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-h6">核查结果管理</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
/* 自定义深色主题 */
.bg-dark-page {
  background-color: #242424; /* 一个较深的灰色作为页面背景 */
}
.bg-dark-header {
  background-color: #1f1f1f; /* 一个更深的灰色作为头部背景 */
}

/* 使用 Quasar 的 List 组件来模拟图片中的长按钮效果 */
.q-item {
  background-color: #ffffff;
  color: #000000;
  border-radius: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.q-list--separator > .q-item:not(:first-child) {
  border-top: none;
}
</style>
