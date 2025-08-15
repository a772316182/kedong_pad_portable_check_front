<template>
  <q-layout view="lHh Lpr lFf" class="bg-page text-grey-4">
    <q-page-container>
      <q-page class="q-pa-md">

        <!-- 顶部状态栏 -->
        <q-header elevated class="bg-header text-blue-grey-3">
          <q-toolbar>
            <span>2025-06-20 15:54:06</span>
            <q-toolbar-title class="text-center text-white text-h6">
              正在核查
            </q-toolbar-title>
            <div class="row items-center no-wrap">
              <span>当前电量: 13%</span>
              <div class="battery-icon q-ml-sm">
                <div class="battery-level low"></div>
              </div>
            </div>
          </q-toolbar>
        </q-header>

        <!-- 主分类导航 Tabs -->
        <q-card flat class="main-tabs-container q-mb-md">
          <q-tabs
            v-model="activeMainCategoryKey"
            dense
            align="left"
            class="text-grey-5"
            active-color="primary"
            indicator-color="primary"
            no-caps
          >
            <q-tab
              v-for="category in mainNavigationData"
              :key="category.key"
              :name="category.key"
              :label="category.label"
              :icon="category.icon"
              class="main-tab-item"
            />
          </q-tabs>
        </q-card>

        <!-- 主内容区域 -->
        <div class="row q-col-gutter-md main-content-height">
          <!-- 左侧面板 -->
          <div class="col-3">
            <q-card flat class="full-height bg-panel column no-wrap">
              <q-card-section>
                <q-btn label="上一步" color="primary" class="full-width" unelevated @click="navigateTo('/checking')"/>
              </q-card-section>

              <q-separator class="separator-color" />

              <!-- 子菜单列表 -->
              <q-card-section class="col">
                <q-scroll-area class="full-height">
                  <div v-if="currentSubMenus && currentSubMenus.length > 0">
                    <div class="summary-text q-mb-md">
                      核查点:<span class="summary-count-highlight q-mx-xs">{{ currentMainCategory.summary.points }}</span>
                      核查方法:<span class="q-mx-xs">{{ currentMainCategory.summary.methods }}</span>
                    </div>
                    <div v-for="(section, index) in currentSubMenus" :key="index" class="q-mb-md">
                      <div class="sub-menu-section-title">{{ section.sectionTitle }}</div>
                      <div
                        v-for="item in section.items"
                        :key="item.key"
                        class="sub-menu-item q-pa-sm q-my-sm cursor-pointer"
                        :class="{ 'active': activeSubMenuKey === item.key }"
                        @click="activeSubMenuKey = item.key"
                      >
                        <span v-if="item.prefix" class="item-prefix" :class="`text-${item.prefix.color}`">
                          ({{ item.prefix.text }})
                        </span>
                        {{ item.label }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="flex flex-center full-height text-grey-6">
                    无子菜单项
                  </div>
                </q-scroll-area>
              </q-card-section>
            </q-card>
          </div>

          <!-- 右侧面板 -->
          <div class="col-9">
            <q-card flat class="full-height bg-panel column no-wrap">
              <q-card-section class="row justify-between items-center">
                <div class="text-h6 text-white">{{ activeSubMenuItem?.label || '请选择核查项' }}</div>
                <q-tabs v-model="currentTab" dense class="text-grey-5" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
                  <q-tab name="method" label="核查方法" />
                  <q-tab name="basis" label="核查依据" />
                </q-tabs>
              </q-card-section>

              <q-separator class="separator-color" />

              <q-card-section class="col">
                <q-scroll-area class="full-height">
                  <div v-if="currentChecklistItems.length > 0">
                    <div v-for="item in currentChecklistItems" :key="item.id" class="q-mb-md">
                      <q-card flat class="bg-item-card q-pa-sm">
                        <div class="row items-center no-wrap">
                          <div class="col q-pr-md text-body2">{{ item.description }}</div>
                          <div class="row items-center no-wrap q-gutter-x-lg">
                            <q-option-group v-model="item.status" :options="statusOptions" color="primary" inline dense />
                            <q-btn label="取证上传" color="primary" unelevated dense padding="sm lg"/>
                          </div>
                        </div>
                      </q-card>
                    </div>
                  </div>
                  <div v-else class="flex flex-center full-height text-grey-6 text-h6">暂无核查内容</div>
                </q-scroll-area>
              </q-card-section>

              <div class="absolute-bottom-left q-ma-md">
                <q-btn label="报告导出" class="bg-lighter-panel text-grey-4" unelevated/>
              </div>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'; // 引入 watch
import { useRouter } from 'vue-router';

const router = useRouter();
const navigateTo = (path) => {
  router.push(path);
};

// --- 数据模型 (保持不变) ---
const mainNavigationData = ref([
  {
    key: 'runtime',
    label: '运行管理',
    icon: 'settings_suggest',
    summary: { points: 58, methods: 134 },
    subMenus: [
      { sectionTitle: '检查点', items: [ { key: 'monitoring', label: '监测值班' }, { key: 'mechanism', label: '应建立7×24小时网络安全运行值班机制', prefix: { text: '校大', color: 'orange-5' } } ] },
      { sectionTitle: '风险处置', items: [ { key: 'risk_disposal', label: '应按相关规定处置及报告网络安全告警和网络安全事件', prefix: { text: '技术', color: 'orange-5' } } ] }
    ],
    checklists: {
      monitoring: [{ id: 1, description: '检查是否组建网络安全运行值班队伍...', status: 'passed' },{ id: 2, description: '检查网络安全运行日志记录情况', status: 'passed' },{ id: 3, description: '检查是否对网络安全告警和设施运行情况实时监视分析', status: 'failed' },{ id: 4, description: '检查是否建立交接班制度', status: 'passed' },],
      mechanism: [{ id: 5, description: '核查7x24小时值班机制的书面文件是否存在', status: 'not_checked' },{ id: 6, description: '抽查值班排班表与实际情况是否一致', status: 'not_checked' },],
      risk_disposal: [{ id: 7, description: '检查风险处置流程是否已定义并文档化', status: 'passed' },],
    }
  },
  {
    key: 'supervision',
    label: '监督管理',
    icon: 'manage_search',
    summary: { points: 12, methods: 25 },
    subMenus: [{ sectionTitle: '审计与审查', items: [{ key: 'internal_audit', label: '内部审计' }, { key: 'external_review', label: '外部审查' },] }],
    checklists: { internal_audit: [{ id: 101, description: '检查是否定期开展内部安全审计工作', status: 'passed' },{ id: 102, description: '检查内部审计报告是否完整并已归档', status: 'failed' },], external_review: [], }
  },
  { key: 'personnel', label: '人员管理', icon: 'groups', summary: { points: 0, methods: 0 }, subMenus: [], checklists: {} },
  { key: 'infrastructure', label: '基础设施安全', icon: 'foundation', summary: { points: 0, methods: 0 }, subMenus: [], checklists: {} },
  { key: 'architecture', label: '体系结构安全', icon: 'account_tree', summary: { points: 0, methods: 0 }, subMenus: [], checklists: {} },
  { key: 'system_ontology', label: '系统本体安全', icon: 'memory', summary: { points: 0, methods: 0 }, subMenus: [], checklists: {} },
  { key: 'emergency', label: '监测应急', icon: 'emergency', summary: { points: 0, methods: 0 }, subMenus: [], checklists: {} },
]);

// --- 状态与计算属性 ---
const activeMainCategoryKey = ref('runtime');
const activeSubMenuKey = ref('mechanism');

// --- 逻辑调整：使用 watch 替代 click handler ---
watch(activeMainCategoryKey, (newCategoryKey) => {
  const newCategory = mainNavigationData.value.find(c => c.key === newCategoryKey);
  // 当主分类切换时，自动选中其第一个子菜单项
  activeSubMenuKey.value = newCategory?.subMenus[0]?.items[0]?.key || null;
});

const currentMainCategory = computed(() => mainNavigationData.value.find(cat => cat.key === activeMainCategoryKey.value));
const currentSubMenus = computed(() => currentMainCategory.value?.subMenus || []);
const activeSubMenuItem = computed(() => {
  if (!currentSubMenus.value) return null;
  for (const section of currentSubMenus.value) {
    const found = section.items.find(item => item.key === activeSubMenuKey.value);
    if (found) return found;
  }
  return null;
});
const currentChecklistItems = computed(() => {
  if (!currentMainCategory.value || !activeSubMenuKey.value) return [];
  return currentMainCategory.value.checklists[activeSubMenuKey.value] || [];
});

const currentTab = ref('basis');
const statusOptions = [{ label: '已通过', value: 'passed' },{ label: '未通过', value: 'failed' },{ label: '未核查', value: 'not_checked' }];
</script>

<style lang="scss" scoped>
// 颜色变量
$secondary: #292a2d;
$lighter-secondary: #3a3b3f;
$primary: #4c6afc;
$negative: #C10015;

// 主题背景
.bg-page, .bg-header { background-color: $secondary; }
.bg-panel { background-color: $lighter-secondary; }
.bg-item-card { background-color: $secondary; }
.bg-lighter-panel { background-color: lighten($lighter-secondary, 5%); }

// --- 新增：主导航 Tabs 样式 ---
.main-tabs-container {
  background-color: $lighter-secondary;
  border-radius: 8px;
}
.main-tab-item {
  font-size: 1rem;
  padding: 10px 16px;
}

// --- 调整：主内容区高度计算 ---
.main-content-height {
  // 额外减去新 Tabs 容器的高度 (估算值，可微调)
  height: calc(100vh - 50px - 32px - 68px);
}
.separator-color { background-color: darken($lighter-secondary, 8%); }


// --- 左侧子菜单样式 (无变化) ---
.summary-text { color: #9e9e9e; font-size: 0.9rem; }
.summary-count-highlight { color: #f44336; font-weight: bold; }
.sub-menu-section-title { color: #bdbdbd; font-size: 1rem; font-weight: 500; margin-bottom: 0.5rem; }
.sub-menu-item {
  border-radius: 8px;
  transition: background-color 0.3s ease;
  color: #e0e0e0;
  background-color: transparent;
  line-height: 1.4;
  &.active { background-color: $primary; color: white; font-weight: 500; }
  &:not(.active):hover { background-color: rgba(255, 255, 255, 0.1); }
}
.item-prefix { font-weight: bold; margin-right: 4px; }


// 电池图标样式
.battery-icon { width: 24px; height: 12px; border: 1px solid #90a4ae; border-radius: 2px; position: relative; display: flex; align-items: center; padding: 1px; }
.battery-icon::after { content: ''; position: absolute; right: -4px; top: 2px; width: 2px; height: 6px; background-color: #90a4ae; border-radius: 0 1px 1px 0; }
.battery-level.low { width: 13%; background-color: $negative; }
</style>
