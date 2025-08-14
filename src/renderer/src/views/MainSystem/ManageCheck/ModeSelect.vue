<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 顶部主工具栏 (样式更新) -->
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar style="min-height: 80px;">
        <q-btn
          unelevated
          color="primary"
          icon="arrow_back_ios"
          label="返回"
          @click="navigateTo('/mainView')"
          size="lg"
        />
        <q-toolbar-title class="absolute-center text-h4">
          执行检查入口
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="bg-dark-page q-pa-md">

        <!-- 功能入口 (保持横向排列) -->
        <div class="flex flex-center" style="height: calc(100vh - 200px);">
          <!-- 使用 row 和 q-gutter-lg 来实现横向布局和间距 -->
          <div class="row q-gutter-xl justify-center">

            <!-- 卡片1: 站点管理 -->
            <q-card flat class="entry-card" @click="navigateTo('/stationandtask')">
              <q-card-section class="text-center q-pa-xl">
                <q-icon name="assignment" size="100px" />
                <div class="text-h4 q-mt-lg">站点/任务管理</div>
              </q-card-section>
            </q-card>


            <!-- 卡片2: 开始检查 -->
            <q-card flat class="entry-card" @click="navigateTo('/executecheck')">
              <q-card-section class="text-center q-pa-xl">
                <q-icon name="play_circle_outline" size="100px" />
                <div class="text-h4 q-mt-lg">核查配置</div>
              </q-card-section>
            </q-card>

          </div>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 在实际项目中，取消下一行的注释以启用路由
  router.push(path)
}
</script>

<style lang="sass" scoped>
.bg-dark-header
  background: #272727

.bg-dark-page
  background: #363636

.q-toolbar__title
  font-weight: bold

// --- 入口卡片样式 (保持不变) ---
.entry-card
  width: 420px
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
