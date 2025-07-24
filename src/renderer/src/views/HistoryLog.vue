<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 控制两个开关的状态
const showIncomplete = ref(true);
const showPassed = ref(true);

// --- 按钮点击事件处理函数 ---
// (目前只在控制台打印信息)

// 返回上一页
const goBack = () => {
  console.log('返回上一页');
  router.go(-1);
};

// 点击对比按钮
const compareRecords = () => {
  console.log('触发：对比');
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 顶部主标题栏 -->
    <q-header class="header-main text-white" flat bordered>
      <q-toolbar>
        <q-btn
          unelevated
          label="返回"
          @click="goBack"
          class="back-button"
        />
        <q-toolbar-title class="text-center text-weight-bolder text-h5">
          历史记录
        </q-toolbar-title>
        <div class="text-right" style="min-width: 100px;">
          <span>当前电量: 21% <q-icon name="o_battery_1_bar"/></span>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 页面主体内容 -->
    <q-page padding class="main-content-area column">
      <!-- 顶部信息面板 -->
      <q-card class="info-card q-pa-md q-mb-lg" flat>
        <div class="info-grid">
          <span>当前站点：省调1</span>
          <span>当前设备：10.105.71.240</span>
          <span>IP地址：10.105.71.240</span>
          <span>操作系统：</span>
          <span>MAC地址：f4:6b:8c:c9:86:a7</span>
          <span>设备登记时间：2025-06-20 15:18:37</span>
        </div>
        <q-btn
          label="对比"
          unelevated
          class="compare-button"
          @click="compareRecords"
        />
      </q-card>

      <!-- 开关控制区域 -->
      <div class="row q-gutter-x-lg q-mb-md">
        <q-toggle
          v-model="showIncomplete"
          label="未完成记录"
          color="green"
          checked-icon="check"
          unchecked-icon="clear"
          size="lg"
          class="text-white"
        />
        <q-toggle
          v-model="showPassed"
          label="核查通过记录"
          color="green"
          checked-icon="check"
          unchecked-icon="clear"
          size="lg"
          class="text-white"
        />
      </div>

      <!-- 空白状态占位符 -->
      <q-space />
      <div class="column flex-center text-center no-data-container">
        <q-icon name="o_inventory_2" class="no-data-icon" />
        <span class="text-h6 q-mt-md">暂无数据</span>
      </div>
      <q-space />

    </q-page>
  </q-layout>
</template>

<style scoped>
/* 整体页面背景 */
.page-background {
  /* 从原型图提取的精确背景色 */
  background-color: #2c3e4a;
}

/* 顶部栏样式 */
.header-main {
  background-color: transparent !important; /* 使其与页面背景色一致 */
}

/* 主内容区，增加上边距以避开顶栏 */
.main-content-area {
  padding-top: 70px; /* 调整此值以确保内容不被顶栏遮挡 */
}

/* 返回按钮 */
.back-button {
  background-color: #00796b;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  padding: 4px 16px;
}

/* 信息面板 */
.info-card {
  background-color: #68a0a9; /* 从原型图提取的浅青色 */
  color: white;
  border-radius: 8px;
  position: relative; /* 为对比按钮的定位提供锚点 */
}

/* 信息面板内的网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 两列布局 */
  gap: 8px 32px; /* 行间距8px, 列间距32px */
  font-size: 1.1rem;
}

/* 对比按钮 */
.compare-button {
  background-color: #00796b;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  position: absolute;
  bottom: 16px; /* 定位到卡片右下角 */
  right: 16px;
}

/* 开关样式 */
.q-toggle {
  font-size: 1.1rem;
}

/* “暂无数据”占位符容器 */
.no-data-container {
  color: #68a0a9; /* 使用与信息面板相同的颜色 */
  opacity: 0.8;
}
.no-data-icon {
  font-size: 8rem; /* 大图标 */
}
</style>
