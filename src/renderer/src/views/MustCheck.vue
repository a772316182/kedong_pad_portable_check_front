<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 控制筛选抽屉的显示/隐藏
const filterDrawerOpen = ref(false);

// 当前选中的核查项ID (用于高亮和内容显示)
const activeCheckItemId = ref(1);

// 左侧核查项列表数据模型
// 注意：每个项目的 'details' 包含了右侧显示的所有信息
const checkItems = ref([
  {
    id: 1,
    label: '身份鉴别',
    selected: true,
    details: {
      title: '用户口令复杂度策略(自动核查)',
      requirement: '核查要求：口令长度不小于8位，由字母、数字和特殊字符组成，不得与用户名相同，避免口令被暴力破解。',
      basis: [
        '1、《信息安全技术网络安全等级保护基本要求》8.1.4.1 第三级安全要求: 安全计算环境: 身份鉴别: 应对登录的用户进行身份标识和鉴别，身份标识具有唯一性，身份鉴别信息具有复杂度要求并定期更换。',
        '2、《国家电网有限公司 网络安全评价规范》Q/GDW 11807-2024 4.4.1.1 配置管理口令长度不应低于 8 位，数字、字母和特殊字符的混合，且定期更换；操作系统账户口令应具有一定的复杂度，口令长度不小于8位，口令是字母、数字和特殊字符组成；口令不得与账户名相同；连续登录失败次数5次后，账户锁定10分钟；口令90天定期更换。',
        '3、《发电厂电力监控系统网络安全检查大纲 (2023年版)》5.2.2 生产控制大区应...',
        '4、《电力监控系统网络安全检查大纲 (2023年版)》6.2.2 生产控制大区应对所有设备的操作...',
      ],
    },
  },
  { id: 2, label: '访问控制', selected: false, details: { title: '访问控制策略', requirement: '...', basis: ['...'] } },
  { id: 3, label: '入侵防范', selected: false, details: { title: '入侵防范策略', requirement: '...', basis: ['...'] } },
  { id: 4, label: '网络配置', selected: true, details: { title: '网络配置策略', requirement: '...', basis: ['...'] } },
  { id: 5, label: '安全管理', selected: false, details: { title: '安全管理策略', requirement: '...', basis: ['...'] } },
  { id: 6, label: '日志审计', selected: false, details: { title: '日志审计策略', requirement: '...', basis: ['...'] } },
  { id: 7, label: '违规行为', selected: false, details: { title: '违规行为策略', requirement: '...', basis: ['...'] } },
  { id: 8, label: '恶意代码检查', selected: true, details: { title: '恶意代码检查策略', requirement: '...', basis: ['...'] } },
]);

// 计算属性：动态计算核查项总数
const totalCheckItems = computed(() => checkItems.value.length);

// 计算属性：根据 activeCheckItemId 找到当前激活的核查项的完整信息
const activeCheckItem = computed(() => {
  return checkItems.value.find(item => item.id === activeCheckItemId.value);
});

// 筛选弹窗内的数据模型
const filterMethod = ref('全部');
const filterSearchText = ref('');
const filterComplianceBasis = ref(null);

// 方法：返回上一页
const goBack = () => {
  router.go(-1); // 或者 router.push('/dashboard')
};

// 方法：点击左侧列表项时，更新激活的ID
const selectItem = (itemId) => {
  activeCheckItemId.value = itemId;
};

// 方法：重置筛选条件
const resetFilters = () => {
  filterMethod.value = '全部';
  filterSearchText.value = '';
  filterComplianceBasis.value = null;
}
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 顶部主标题栏 -->
    <q-header class="header-main text-white" elevated>
      <q-toolbar>
        <q-btn flat dense round label="返回" icon="arrow_back_ios" @click="goBack" class="back-button" />
        <q-toolbar-title class="text-center text-weight-bolder">必选项检查</q-toolbar-title>
        <q-btn flat dense @click="filterDrawerOpen = true">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L16 11.414V16l-4 2v-6.586L3.293 6.707A1 1 0 013 6V4z"></path></svg>
          <span class="q-ml-xs text-subtitle1">筛选</span>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- 顶部副信息栏 -->
    <q-header class="header-sub" elevated :offset="[0, 50]">
      <q-toolbar class="text-white">
        <div class="row items-center q-gutter-x-xl">
          <span>适用对象：主机设备-Linux</span>
          <span>更新时间：2025-04-18 19:34:25</span>
          <span>核查项总数：{{ totalCheckItems }}</span>
        </div>
        <q-space />
        <q-btn outline rounded color="light-blue-4" label="适用范围设置" />
      </q-toolbar>
    </q-header>

    <!-- 主体内容 -->
    <q-page-container>
      <q-page class="main-content row">
        <!-- 左侧核查项列表 -->
        <div class="col-3 left-panel">
          <div class="text-h6 text-grey-8 q-pa-md">核查项</div>
          <q-list separator>
            <q-item
              v-for="item in checkItems"
              :key="item.id"
              clickable
              v-ripple
              :active="activeCheckItemId === item.id"
              @click="selectItem(item.id)"
              class="check-item"
              active-class="active-check-item"
            >
              <q-item-section avatar>
                <q-checkbox v-model="item.selected" dense />
              </q-item-section>
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 右侧详情展示 -->
        <div class="col-9 right-panel q-pa-lg">
          <div v-if="activeCheckItem">
            <q-card flat class="detail-card">
              <q-card-section>
                <div class="text-h6 text-weight-bold q-mb-md">{{ activeCheckItem.details.title }}</div>
                <div class="text-subtitle1 q-mb-lg">{{ activeCheckItem.details.requirement }}</div>

                <div class="text-subtitle1 text-weight-medium q-mb-sm">核查依据：</div>
                <div v-for="(basis, index) in activeCheckItem.details.basis" :key="index" class="text-body2 text-grey-8 basis-item">
                  {{ basis }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 筛选抽屉弹窗 -->
    <q-drawer v-model="filterDrawerOpen" side="right" bordered class="filter-drawer">
      <div class="q-pa-lg column full-height">
        <div class="text-h5 q-mb-lg">筛选</div>

        <div class="text-subtitle1 q-mb-sm">核查方式</div>
        <q-btn-toggle
          v-model="filterMethod"
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="[
            {label: '全部', value: '全部'},
            {label: '人工核查', value: '人工核查'},
            {label: '自动', value: '自动'}
          ]"
        />

        <div class="text-subtitle1 q-mt-lg q-mb-sm">模糊搜索</div>
        <q-input outlined dense v-model="filterSearchText" placeholder="请输入核查点名称" />

        <div class="text-subtitle1 q-mt-lg q-mb-sm">合规依据</div>
        <q-select outlined dense v-model="filterComplianceBasis" :options="['依据A', '依据B']" label="请选择" />

        <q-space />

        <div class="row q-gutter-md">
          <q-btn label="重置" color="grey-6" @click="resetFilters" class="col" unelevated />
          <q-btn label="筛选" color="teal" @click="filterDrawerOpen = false" class="col" unelevated />
        </div>
      </div>
    </q-drawer>

  </q-layout>
</template>

<style scoped>
/* 主页面背景 */
.page-background {
  background-color: #313942;
}

/* 主标题栏样式 */
.header-main {
  background-color: #313942 !important;
  border-bottom: 1px solid #4a5562;
}
.back-button {
  font-weight: bold;
}
/* 副信息栏样式 */
.header-sub {
  background-color: #313942 !important;
  top: 50px !important; /* Quasar 默认 Header 是 50px 高 */
  font-size: 0.9rem;
}

/* 主内容区，给顶部留出两个Header的高度 */
.main-content {
  padding-top: 100px;
}

/* 左侧面板 */
.left-panel {
  background-color: #eef1f3; /* 浅灰色背景 */
  /* 模拟原型图中的细微网格/噪点背景 */
  background-image: radial-gradient(#d7d7d7 0.5px, transparent 0.5px);
  background-size: 5px 5px;
  border-right: 1px solid #dcdcdc;
  height: calc(100vh - 100px); /* 撑满视口高度 */
  overflow-y: auto; /* 内容过多时滚动 */
}

.check-item {
  font-weight: 500;
  color: #333;
}
/* 激活(选中)的列表项样式 */
.active-check-item {
  background-color: #ffffff !important;
  color: #0d47a1 !important; /* Quasar primary color */
  border-left: 4px solid #2196f3;
}

/* 右侧详情面板 */
.right-panel {
  background-color: #ffffff;
  height: calc(100vh - 100px);
  overflow-y: auto;
}
.detail-card {
  background-color: transparent;
}
.basis-item {
  line-height: 1.8;
  margin-bottom: 8px;
}

/* 筛选抽屉样式 */
.filter-drawer {
  background-color: #f5f5f5;
}
</style>
