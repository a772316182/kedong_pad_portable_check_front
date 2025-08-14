<script setup>
import { ref, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';

const emit = defineEmits(['navigate']);
const $q = useQuasar();

import { useRouter } from 'vue-router'

// 1. 初始化路由
const router = useRouter()
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
// 使用 router.push 进行页面跳转
  router.push(path)
}

// --- 响应式数据 ---

// 当前激活的主分类和子分类
const activeMainCategory = ref('security');
const activeSubCategory = ref('method');

// 控制监督管理视图的预览模式
const supervisionPreviewMode = ref(false);

// 控制弹窗
const dialogs = reactive({
  basis: false,
  stats: false,
  supervisionDetail: false,
});

// --- 模拟数据 ---
// 为不同分类提供模拟数据
const categories = {
  info: { name: '运行管理', subCategories: [{ id: 'station_info', label: '站点信息' }, { id: 'asset_info', label: '资产信息' }], items: [{ id: 1, text: '运行管理相关检查项...', status: null }] },
  security: { name: '安全管理', subCategories: [{ id: 'method', label: '检查方法' }, { id: 'scope', label: '检查范围' }], items: [{ id: 1, text: '检查是否组建网络安全运行值班队伍...', status: 'confirmed' }] },
  personnel: { name: '人员管理', subCategories: [{ id: 'personnel_list', label: '人员配置' }], items: [{ id: 1, text: '人员管理检查项...', status: null }] },
  infra: { name: '基础设施安全', subCategories: [{ id: 'infra_sub', label: '机房安全' }], items: [{ id: 1, text: '基础设施检查项...', status: null }] },
  system: { name: '体系结构安全', subCategories: [{ id: 'system_sub', label: '系统访问' }], items: [{ id: 1, text: '体系结构检查项...', status: null }] },
  core: { name: '系统本体安全', subCategories: [{ id: 'core_sub', label: '核心防护' }], items: [{ id: 1, text: '系统本体检查项...', status: null }] },
  monitoring: { name: '监测应急', subCategories: [{ id: 'emergency', label: '应急响应' }], items: [{ id: 1, text: '监测应急相关检查项...', status: null }] },
  supervision: {
    name: '监督管理',
    subCategories: [{ id: 'supervision_sub', label: '检查方法' }, { id: 'supervision_scope', label: '检查范围' }],
    tableData: [
      { id: 1, name: '网络安全', category: '网络', basis: '（一）...', result: '通过', details: '...' },
      { id: 2, name: '主机安全', category: '主机', basis: '（二）...', result: '未通过', details: '...' }
    ],
    tableColumns: [
      { name: 'name', label: '检查项', field: 'name', align: 'left' },
      { name: 'category', label: '分类', field: 'category', align: 'left' },
      { name: 'basis', label: '检查依据', field: 'basis', align: 'left' },
      { name: 'result', label: '核查结果', field: 'result', align: 'left' },
      { name: 'actions', label: '操作', field: 'actions', align: 'center' }
    ]
  }
};

const currentCategoryData = computed(() => {
  return categories[activeMainCategory.value] || categories.security;
});

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-page text-white">
    <q-header class="bg-dark-header q-pa-sm">
      <q-toolbar>
        <div class="flex items-center q-gutter-x-sm">
          <q-btn color="primary" unelevated label="上一步" @click="navigateTo('/techcheckinprogress')" />
          <div class="text-caption text-grey-5">2025-06-20 16:54:20</div>
        </div>
        <q-space />
        <q-toolbar-title class="text-center text-h5 text-weight-bold">正在核查</q-toolbar-title>
        <q-space />
        <q-btn flat dense icon="filter_list" label="筛选" class="text-grey-4 q-mr-sm" />
        <q-btn flat dense icon="bar_chart" label="查看统计图" class="text-grey-4" @click="dialogs.stats = true"/>
      </q-toolbar>

      <q-toolbar class="q-px-md q-gutter-x-sm">
        <q-btn-toggle
          v-model="activeMainCategory"
          @update:model-value="activeSubCategory = currentCategoryData.subCategories[0].id; supervisionPreviewMode = false"
          unelevated
          toggle-color="primary"
          text-color="black"
          class="bg-grey-10"
          :options="[
            {label: '运行管理', value: 'info'},
            {label: '监督管理', value: 'supervision'},
            {label: '人员管理', value: 'personnel'},
            {label: '基础设施安全', value: 'infra'},
            {label: '体系结构安全', value: 'system'},
            {label: '系统本体安全', value: 'core'},
            {label: '监测应急', value: 'monitoring'}

          ]"
        />
        <q-space />
        <q-btn color="primary" unelevated label="切换连接" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="row q-col-gutter-md" style="height: 65vh;">
          <!-- 左侧子分类列表 -->
          <div class="col-3">
            <q-list bordered separator class="bg-dark-content rounded-borders full-height">
              <q-item-label header class="text-weight-bold text-white">{{ currentCategoryData.name }}</q-item-label>
              <q-item v-for="sub in currentCategoryData.subCategories" :key="sub.id" clickable v-ripple :active="activeSubCategory === sub.id" @click="activeSubCategory = sub.id" active-class="bg-primary text-white">
                <q-item-section>{{ sub.label }}</q-item-section>
              </q-item>
              <q-space />
              <q-separator dark />
              <q-item><q-btn class="full-width" color="primary" unelevated label="报告导出" /></q-item>
            </q-list>
          </div>

          <!-- 右侧内容区 -->
          <div class="col-9">
            <!-- 默认检查项视图 -->
            <q-list v-if="activeMainCategory !== 'supervision'" bordered class="bg-dark-content rounded-borders full-height">
              <q-item-label header class="row items-center">
                <div class="text-weight-bold text-white">检查方法</div>
                <q-space />
                <q-btn color="primary" dense unelevated label="核查依据" @click="dialogs.basis = true"/>
              </q-item-label>
              <q-scroll-area class="fit" style="height: calc(100% - 50px);">
                <q-item v-for="item in currentCategoryData.items" :key="item.id" class="q-py-md column">
                  <q-item-section><q-item-label class="text-grey-4">{{ item.text }}</q-item-label></q-item-section>
                  <q-item-section side top class="full-width q-mt-sm">
                    <div class="row items-center justify-end full-width q-gutter-x-md">
                      <q-option-group v-model="item.status" :options="[{ label: '已通过', value: 'confirmed' }, { label: '未通过', value: 'unconfirmed' }]" color="primary" inline dense />
                      <q-btn color="primary" unelevated label="取证上传" />
                    </div>
                  </q-item-section>
                </q-item>
              </q-scroll-area>
            </q-list>

            <!-- 监督管理视图 -->
            <q-card v-else flat class="bg-dark-content full-height">
              <q-card-section class="row items-center q-py-sm">
                <q-btn color="292a2d" unelevated label="报告导出" />
                <q-space />
                <q-btn color="white" text-color="black" unelevated label="切换预览" @click="supervisionPreviewMode = !supervisionPreviewMode" />
              </q-card-section>
              <q-separator dark />
              <q-table v-if="!supervisionPreviewMode"
                       :rows="currentCategoryData.tableData"
                       :columns="currentCategoryData.tableColumns"
                       row-key="id" flat dense dark wrap-cells
                       class="bg-dark-content"
              >
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props" class="q-gutter-x-sm">
                    <q-btn dense color="primary" label="核查依据" @click="dialogs.basis = true" />
                    <q-btn dense color="primary" label="详情展开">
                      <q-menu anchor="top right" self="top left">
                        <q-list dense style="min-width: 100px">
                          <q-item clickable v-close-popup><q-item-section>编辑</q-item-section></q-item>
                          <q-item clickable v-close-popup><q-item-section>删除</q-item-section></q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>
              <q-card-section v-else class="text-center text-grey-5">
                <q-icon name="preview" size="xl" class="q-mb-sm" /><div>预览模式内容</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 弹窗 -->
    <q-dialog v-model="dialogs.basis">
      <q-card class="bg-dark-content text-white" style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none"><div class="text-h6">查看核查依据</div><q-space /><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section><p>这里是依据的详细内容...</p></q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="dialogs.stats" full-width full-height>
      <q-card class="bg-dark-page text-white">
        <q-toolbar class="bg-dark-header">
          <q-toolbar-title>查看统计图</q-toolbar-title>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6"><q-card flat class="bg-dark-content"><q-card-section class="text-center"><div class="text-h6">通过率</div><div class="q-pa-lg bg-grey-9 rounded-borders q-mt-md">模拟饼图</div></q-card-section></q-card></div>
            <div class="col-12 col-md-6"><q-card flat class="bg-dark-content"><q-card-section class="text-center"><div class="text-h6">风险分类统计</div><div class="q-pa-lg bg-grey-9 rounded-borders q-mt-md">模拟柱状图</div></q-card-section></q-card></div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
.bg-dark-page { background-color: #292a2d; }
.bg-dark-header { background-color: #3f4045; }
.bg-dark-content { background-color: #36373a; }
:deep(.q-toolbar) { padding: 8px 12px; }
:deep(.q-btn-toggle) { border-radius: 4px; }
:deep(.q-btn-toggle .q-btn) { font-weight: 600; background-color: #fff; color: #333; }
:deep(.q-btn-toggle .q-btn--active) { color: white !important; }
.full-height { height: 100%; }
</style>
