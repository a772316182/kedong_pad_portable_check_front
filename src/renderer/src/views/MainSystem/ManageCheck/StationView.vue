<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 控制站点信息卡的显示/隐藏
const isSiteCardVisible = ref(true);

// 站点卡片的数据模型
const siteData = ref({
  id: 1,
  name: '省调1',
  company: '所属公司A',
  lastCheck: '2025-06-20',
  personInCharge: '张三',
  contact: '13800138000',
});

// --- 按钮点击事件处理函数 ---
// (目前只在控制台打印信息，您可以根据实际需求填充逻辑)

// 返回上一页
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

// 顶栏操作

const importData = () => console.log('触发：导入');
const exportData = () => console.log('触发：导出');
const filterData = () => console.log('触发：筛选');
const addData = () => console.log('触发：添加');

// 卡片内操作
const viewDetails = (id) => console.log(`触发：查看站点 ${id}`);
const pinCard = () => console.log('触发：钉住卡片');

// 关闭卡片
const closeCard = () => {
  isSiteCardVisible.value = false;
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 顶部的状态栏 (时间 & 返回按钮) -->
    <div class="status-bar row items-center justify-between q-px-md">
      <span>2025-06-20 15:48:51</span>
      <div class="text-h4 text-white text-weight-bolder">站点管理</div>
      <span class="text-white">当前电量: 15% <q-icon name="o6" /></span>
      </div>
    <q-page padding>
      <!-- 主内容区域 -->
      <div class="main-content-area">
        <!-- 标题和操作按钮栏 -->
        <div class="row items-center no-wrap q-mb-xl">
          <div class="row items-center q-gutter-x-lg q-ml-xl">
            <q-btn unelevated label="返回" @click="navigateTo('/managecheck')" class="back-button" />
            <q-btn flat dense no-caps class="action-btn" icon="o1" label="切换" @click="navigateTo('/multiasset')" />
            <q-btn flat dense no-caps class="action-btn" icon="o2" label="导入" @click="importData" />
            <q-btn flat dense no-caps class="action-btn" icon="o3" label="导出" @click="exportData" />
          </div>
          <q-space />
          <div class="row items-center q-gutter-x-lg">
            <q-btn flat dense no-caps class="action-btn" icon="o4" label="筛选" @click="filterData" />
            <q-btn flat dense no-caps class="action-btn" icon="o5" label="添加" @click="addData" />
        </div>
      </div>

        <!-- 浮动信息卡片 -->
        <q-card v-if="isSiteCardVisible" class="floating-card" flat>
          <!-- 卡片头部：标题和操作按钮 -->
          <q-card-section class="row items-center q-py-sm q-px-md">
            <div class="text-h6 text-weight-bold">{{ siteData.name }}</div>
            <q-space />
            <q-btn flat round dense icon="o7" color="grey-7" @click="pinCard" />
            <q-btn flat round dense icon="o8" color="grey-7" @click="closeCard" />
          </q-card-section>

          <q-separator />

          <!-- 卡片身体：详细信息 -->
          <q-card-section class="q-gutter-y-sm text-body1">
            <div><span class="text-grey-7">所属公司：</span>{{ siteData.company }}</div>
            <div><span class="text-grey-7">最近核查：</span>{{ siteData.lastCheck }}</div>
            <div><span class="text-grey-7">负责人：</span>{{ siteData.personInCharge }}</div>
            <div><span class="text-grey-7">联系方式：</span>{{ siteData.contact }}</div>
          </q-card-section>

          <!-- 卡片底部：操作按钮 -->
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="查看" color="grey-8" @click="navigateTo('/manageasset')" />
            <q-btn flat label="编辑" class="edit-button" @click="viewDetails(siteData.id)" />
          </q-card-actions>
        </q-card>
      </div>
    </q-page>
  </q-layout>
</template>

<style scoped>
/* 整体页面背景色 */
.page-background {
  /* 从原型图提取的精确背景色 */
  background-color: #292a2d;
  overflow: hidden; /* 防止意外滚动 */
}

/* 顶部状态栏，使用绝对定位固定在左上角 */
.status-bar {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  color: white;
  z-index: 10;
}

/* 返回按钮样式 */
.back-button {
  background-color: #4c6afc; /* 从原型图提取的青色 */
  color: white;
  font-weight: bold;
  border-radius: 6px;
  padding: 4px 16px;
}

/* 主内容区域，增加上边距以避开状态栏 */
.main-content-area {
  padding-top: 60px;
}

/* 顶部操作按钮的统一样式 */
.action-btn {
  color: white;
  font-size: 1.5rem;
}
.action-btn .q-icon {
  font-size: 1.5em; /* 增大图标尺寸 */
}

/* 核心：浮动信息卡片的样式 */
.floating-card {
  position: absolute;
  top: 150px; /* 根据原型图估计的位置 */
  left: 50px;  /* 根据原型图估计的位置 */
  width: 380px; /* 根据原型图估计的宽度 */
  background-color: #f7f8fa; /* 接近白色的浅灰色 */
  border-radius: 8px;
  /* 一个与原型图匹配的明显阴影 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

/* 卡片内文本样式 */
.floating-card .text-body1 {
  color: #333;
}
.floating-card .text-body1 .text-grey-7 {
  display: inline-block;
  width: 80px; /* 固定标签宽度，实现对齐 */
}

/* 卡片底部的“编辑”按钮特殊样式 */
.edit-button {
  color: #1976D2; /* Quasar的primary蓝色 */
  font-weight: bold;
}
</style>
