<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn
          unelevated
          color="primary"
          icon="arrow_back_ios"
          label="返回"
          @click="navigateTo('/modeselect')"
        />
        <q-toolbar-title class="absolute-center">
          执行检查入口
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="bg-dark-page q-pa-md">
        <!-- 步骤指示器 (更新为三段式渐变箭头) -->
        <div class="stepper-container">
          <div class="stepper-bar">
            <div class="step">
              <span>站点选择</span>
            </div>
            <div class="step">
              <span>任务选择</span>
            </div>
            <div class="step">
              <span>任务定性</span>
            </div>
          </div>
        </div>

        <!-- 功能入口 (保持横向排列) -->
        <div class="flex flex-center" style="height: calc(100vh - 200px);">
          <!-- 使用 row 和 q-gutter-lg 来实现横向布局和间距 -->
          <div class="row q-gutter-lg justify-center">

            <!-- 卡片1: 站点管理 -->
            <q-card flat class="entry-card" @click="navigateTo('/stationview')">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="computer" size="80px" />
                <div class="text-h5 q-mt-md">站点管理</div>
              </q-card-section>
            </q-card>

            <!-- 卡片2: 任务管理 -->
            <q-card flat class="entry-card" @click="navigateTo('/taskcheck')">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="folder" size="80px" />
                <div class="text-h5 q-mt-md">任务管理</div>
              </q-card-section>
            </q-card>

            <!-- 卡片3: 开始检查 -->
            <q-card flat class="entry-card" @click="navigateTo('/executecheck')">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="play_circle_outline" size="80px" />
                <div class="text-h5 q-mt-md">开始检查</div>
              </q-card-section>
            </q-card>

          </div>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
.bg-dark-header
  background: #272727

.bg-dark-page
  background: #363636

.q-toolbar__title
  font-weight: bold

// --- 步骤指示器样式 ---
.stepper-container
  padding: 16px 0
  background: #272727
  margin: -16px -16px 0 -16px

.stepper-bar
  display: flex
  justify-content: center
  width: 100%
  max-width: 900px
  margin: 0 auto

  .step
    flex: 1
    display: flex
    align-items: center
    justify-content: center
    padding: 12px 0
    font-weight: 500
    color: white // 文字统一为白色
    position: relative
    clip-path: polygon(calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%, 0% 0%)

    &:not(:first-child)
      margin-left: -20px

    &:first-child
      clip-path: polygon(calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 0 0)

    &:last-child
      clip-path: polygon(100% 0, 100% 100%, 0% 100%, 20px 50%, 0% 0%)

    // 颜色由浅到深，层级由高到低，确保箭头正确叠加
    &:nth-child(1)
      background-color: #6EB1FF // 浅蓝
      z-index: 3

    &:nth-child(2)
      background-color: #3B82F6 // 中蓝
      z-index: 2

    &:nth-child(3)
      background-color: #1D4ED8 // 深蓝
      z-index: 1

// --- 入口卡片样式 (保持不变) ---
.entry-card
  width: 280px
  border-radius: 8px
  background-color: #4a5578
  color: white
  cursor: pointer
  border: 1px solid transparent
  transition: all 0.3s ease

  &:hover
    background-color: #5e6a94
    transform: translateY(-8px)
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2)
</style>
