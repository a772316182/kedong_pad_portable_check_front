<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn unelevated color="primary" icon="arrow_back_ios" label="返回" />
        <q-toolbar-title class="absolute-center">
          阿龙学长占位符（（（（（（（（（（（（（（
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="bg-dark-page">
        <!-- 步骤指示器 (样式更新) -->
        <div class="stepper-bar-container">
          <div class="stepper-bar-new">
            <div class="step active">
              <span>事务选择/启动检查</span>
              <div class="arrow"></div>
            </div>
          </div>
        </div>

        <!-- 功能入口 (样式更新为纵向排列) -->
        <div class="flex flex-center" style="height: calc(100vh - 150px);">
          <div class="q-gutter-y-md" style="width: 400px; max-width: 90vw;">
            <q-card flat bordered class="entry-card">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="computer" size="80px" />
                <div class="text-h5 q-mt-md">站点管理</div>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="entry-card">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="folder" size="80px" />
                <div class="text-h5 q-mt-md">任务管理</div>
              </q-card-section>
            </q-card>
            <q-card flat bordered class="entry-card">
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

<script setup>
// 在实际项目中，点击按钮会触发路由跳转
// 例如:
// import { useRouter } from 'vue-router';
// const router = useRouter();
// const goToSiteManagement = () => router.push('/site-management');
// const goToTaskManagement = () => router.push('/task-management');
// const goToStartCheck = () => router.push('/start-check');
</script>

<style lang="sass" scoped>
.bg-dark-header
  background: #272727

.bg-dark-page
  background: #363636

.q-toolbar__title
  font-weight: bold

.stepper-bar-container
  padding: 16px 32px
  background: #272727

.stepper-bar-new
  display: flex
  width: 100%
  .step
    flex: 1
    display: flex
    align-items: center
    justify-content: center
    padding: 12px 0
    font-weight: 500
    background-color: #4a4a4a
    color: #a0a0a0
    position: relative
    clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)
    &:not(:last-child)
      margin-right: 2px
    &.active
      background-color: $primary
      color: white

.entry-card
  background-color: #424864
  color: #a0a0a0
  cursor: pointer
  border-color: #424864
  transition: all 0.3s
  &:hover
    background-color: #535a7e
</style>
