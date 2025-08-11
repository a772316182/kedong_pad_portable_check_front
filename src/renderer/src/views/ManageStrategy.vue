<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
// 【关键】依赖于外部的共享数据文件
import { policies } from '../data/policyStore' // 请确保这个路径是正确的

const $q = useQuasar();
const router = useRouter()

// 【关键修正】修改 `columns` 定义，使“检查项数”动态计算
const columns = [
  { name: 'name', label: '策略名称', align: 'left', field: 'name', sortable: true },
  { name: 'preset_strategy', label: '预制策略', align: 'center', field: 'preset_strategy' },
  { name: 'enabled', label: '启用状态', align: 'center' },
  {
    name: 'items',
    label: '检查项数',
    align: 'center',
    // 使用函数动态计算每个策略的实际核查项数量
    field: row => (row.details && row.details.checkItems) ? row.details.checkItems.length : 0,
    sortable: true,
    // 提供一个自定义的排序函数以确保排序功能正常
    sort: (a, b) => a - b
  },
  { name: 'object', label: '适用对象', align: 'left', field: 'object' },
  { name: 'updated', label: '最后更新时间', align: 'left', field: 'updated', sortable: true },
  { name: 'actions', label: '操作', align: 'center' },
]

// 弹窗相关的数据和方法保持不变
const policy = ref({ name: '', target: '', basis: '', });
const isAddDialogVisible = ref(false)
const isAlertDialogVisible = ref(false)
const newPolicy = reactive({ name: '', object: '', items: null })

const navigateTo = (path, mode, policyName) => {
  let finalPath = path;
  let query = {};

  if (policyName) {
    query.name = policyName;
  }
  if (mode === 'edit') {
    query.mode = 'edit';
  }

  router.push({ path: finalPath, query });
}

const handleCardClick = () => { isAlertDialogVisible.value = true }

const handleAddNewPolicy = () => {
  if (!newPolicy.name || !newPolicy.object || newPolicy.items === null) {
    $q.notify({ color: 'negative', message: '请填写所有字段！', icon: 'warning', });
    return
  }
  policies.push({
    ...newPolicy,
    updated: new Date().toISOString().split('T')[0],
    owned: true,
    preset_strategy: false,
    enabled: true,
    // 为新策略初始化 details 和一个空的 checkItems 数组
    details: { checkItems: [] }
  })
  newPolicy.name = ''; newPolicy.object = ''; newPolicy.items = null;
  isAddDialogVisible.value = false
}

const selectObject = () => {
  $q.notify('触发“选择适用对象”操作');
  policy.value.target = '所有主机';
};

const submitForm = () => {
  if (!policy.value.name || !policy.value.target) {
    $q.notify({ color: 'negative', message: '策略名称和适用对象为必填项', icon: 'warning', });
    return;
  }
  console.log('提交的策略:', policy.value);
  $q.notify({ color: 'positive', message: '策略新增成功', icon: 'check_circle', });
};

const deletePolicy = (policyToDelete) => {
  $q.dialog({
    title: '确认删除',
    message: `您确定要删除策略 "${policyToDelete.name}" 吗？此操作不可撤销。`,
    persistent: true,
    ok: { label: '删除', color: 'negative' },
    cancel: { label: '取消', flat: true },
    dark: true,
    class: 'bg-grey-9'
  }).onOk(() => {
    const index = policies.findIndex(p => p.name === policyToDelete.name);
    if (index > -1) {
      policies.splice(index, 1);
      $q.notify({ color: 'positive', message: '策略已成功删除' });
    }
  });
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-page padding>
      <!-- 主内容区域 -->
      <div class="main-content-area">
        <!-- 顶部操作栏，采用新风格 -->
        <div class="row items-center no-wrap q-mb-md">
          <q-btn unelevated label="返回" @click="navigateTo('/mainview')" class="action-button" icon="arrow_back" />
          <div class="text-h4 text-weight-bolder q-ml-lg" style="color: #4c6afc;">策略管理</div>
          <q-space />
          <div class="row items-center q-gutter-x-md">
            <q-btn unelevated label="人工策略管理" class="action-button" icon="engineering" />
            <q-btn unelevated label="新增" @click="isAddDialogVisible = true" class="action-button" icon="add" />
          </div>
        </div>

        <!-- 列表式表格 -->
        <q-table
          class="policy-table"
          flat
          dark
          :rows="policies"
          :columns="columns"
          row-key="name"
          hide-bottom
          :rows-per-page-options="[0]"
        >
          <!-- 自定义“预制策略”列的显示 -->
          <template v-slot:body-cell-preset_strategy="props">
            <q-td :props="props" class="text-center">
              <q-chip v-if="props.row.preset_strategy" dense color="blue-grey-8" text-color="white" label="是" />
              <span v-else class="text-grey-5">否</span>
            </q-td>
          </template>

          <!-- 自定义“启用状态”列的显示 -->
          <template v-slot:body-cell-enabled="props">
            <q-td :props="props" class="text-center">
              <q-toggle v-model="props.row.enabled" color="primary" :disable="props.row.preset_strategy" />
            </q-td>
          </template>

          <!-- 自定义“操作”列的显示 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm text-center">
              <q-btn flat dense round @click="navigateTo('/mustcheck', null, props.row.name)" icon="visibility" color="light-blue-3">
                <q-tooltip>查看</q-tooltip>
              </q-btn>
              <template v-if="!props.row.preset_strategy && props.row.owned">
                <q-btn flat dense round @click="navigateTo('/mustcheck', 'edit', props.row.name)" icon="edit" color="light-blue-3">
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <q-btn flat dense round @click="deletePolicy(props.row)" icon="close" color="negative">
                  <q-tooltip class="bg-red">删除</q-tooltip>
                </q-btn>
              </template>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- 刷新按钮 -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="refresh" color="primary" />
      </q-page-sticky>

    </q-page>

    <!-- 弹窗部分 (完整) -->
    <q-dialog v-model="isAddDialogVisible">
      <q-card class="bg-white text-black dialog-add" style="width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">新增策略</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="handleAddNewPolicy">
            <q-input v-model="newPolicy.name" outlined label="策略名称" />
            <q-input v-model="newPolicy.object" outlined label="适用对象" />
            <q-input v-model.number="newPolicy.items" outlined type="number" label="检查项数 (初始占位)" />
            <div class="row justify-end q-mt-lg">
              <q-btn v-close-popup label="取消" type="reset" color="grey-6" flat class="q-mr-sm" />
              <q-btn label="确认新增" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isAlertDialogVisible">
      <q-card class="column full-height dialog-alert" flat style="width: 550px; max-width: 90vw;">
        <q-card-section class="q-py-md">
          <div class="text-h6">新增策略</div>
        </q-card-section>
        <q-card-section class="q-pt-none col">
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label>策略名称 <span class="text-red">*</span></q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input v-model="policy.name" placeholder="请输入" borderless dense input-style="text-align: right;" />
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="selectObject">
              <q-item-section>
                <q-item-label>策略引用 <span class="text-red">*</span></q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center text-grey">
                  <span>{{ policy.target || '请选择' }}</span>
                  <q-icon name="chevron_right" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-space />
        <q-card-section class="q-pa-md">
          <q-btn v-close-popup color="primary" label="确定" unelevated class="full-width" size="lg" @click="submitForm" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<!-- 全局样式 (无 scoped) -->
<style>
:root {
  --font-scale-factor: 1.5;
}
.dialog-add .text-h6 {
  font-size: calc(1.25rem * var(--font-scale-factor));
}
.dialog-add .q-field__label,
.dialog-add .q-field__native {
  font-size: calc(1rem * var(--font-scale-factor));
}
.dialog-add .q-btn .q-btn__content {
  font-size: calc(0.9rem * var(--font-scale-factor));
}
.dialog-alert .text-h6 {
  font-size: calc(1.25rem * var(--font-scale-factor));
}
.dialog-alert .q-item__label {
  font-size: calc(1rem * var(--font-scale-factor));
}
.dialog-alert .q-item__section:not([class*="--side"]) {
  min-width: 180px;
  flex-shrink: 0;
}
.dialog-alert .q-input .q-field__native {
  font-size: calc(1rem * var(--font-scale-factor)) !important;
}
.dialog-alert .q-card__section .q-btn .q-btn__content {
  font-size: calc(1.1rem * var(--font-scale-factor));
}
.q-tooltip {
  font-size: calc(12px * var(--font-scale-factor));
}
</style>

<!-- 局部样式 (有 scoped) -->
<style scoped>
.page-background {
  background-color: #292a2d;
}

.main-content-area {
  padding-top: 20px;
}

.action-button {
  background-color: #4c6afc;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  font-size: calc(14px * var(--font-scale-factor));
  padding: calc(4px * var(--font-scale-factor)) calc(12px * var(--font-scale-factor));
}
.action-button .q-icon {
  font-size: calc(1.2em * var(--font-scale-factor));
  margin-right: 4px;
}
.page-background :deep(.text-h4) {
  font-size: calc(2.125rem * var(--font-scale-factor));
}

/* --- 表格样式 --- */
.policy-table {
  background-color: #333438;
  border-radius: 8px;
}
.policy-table :deep(thead tr th) {
  color: white;
  font-weight: bold;
  background-color: #3c415c;
  font-size: calc(16px * var(--font-scale-factor));
  border-bottom: none;
}
.policy-table :deep(tbody td) {
  color: #e0e0e0;
  font-size: calc(14px * var(--font-scale-factor));
  border-color: #424242;
}
.policy-table :deep(tbody tr:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
.policy-table :deep(.q-chip) {
  font-size: calc(13px * var(--font-scale-factor));
  font-weight: 500;
  height: auto;
  padding: calc(4px * var(--font-scale-factor)) calc(10px * var(--font-scale-factor));
}

/* --- 悬浮按钮 --- */
.page-background :deep(.q-page-sticky .q-btn) {
  font-size: calc(1.5rem * var(--font-scale-factor));
}
</style>
