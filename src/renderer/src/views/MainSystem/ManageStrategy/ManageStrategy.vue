<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar();
const router = useRouter()

// --- 响应式数据 (未修改) ---
const policies = reactive([
  {
    name: '主机设备-Linux',
    updated: '2025-07-03',
    items: 8,
    object: '主机设备-Linux',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '主机设备-Windows',
    updated: '2025-07-03',
    items: 8,
    object: '主机设备-Windows',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '网络设备',
    updated: '2025-07-03',
    items: 16,
    object: '网络设备',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '网络安全',
    updated: '2025-07-03',
    items: 15,
    object: '网络安全',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '网络安全告警检查',
    updated: '2025-07-03',
    items: 8,
    object: '网络安全告警点对点检查',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '弱密码核查',
    updated: '2025-04-18',
    items: 2,
    object: '主机设备-Linux',
    preset_strategy: false,
    owned: true,
    enabled: true
  },
  {
    name: '主机设备-Linux-自定义',
    updated: '2025-04-18',
    items: 23,
    object: '主机设备-Linux',
    preset_strategy: false,
    owned: true,
    enabled: true
  }
])

// --- 新增: 为 q-table 定义列 ---
const columns = [
  { name: 'name', label: '策略名称', align: 'left', field: 'name', sortable: true },
  { name: 'preset_strategy', label: '预制策略', align: 'center', field: 'preset_strategy' },
  { name: 'enabled', label: '启用状态', align: 'center' },
  { name: 'items', label: '检查项数', align: 'center', field: 'items', sortable: true },
  { name: 'object', label: '适用对象', align: 'left', field: 'object' },
  { name: 'updated', label: '最后更新时间', align: 'left', field: 'updated', sortable: true },
  { name: 'actions', label: '操作', align: 'center' },
]

// 策略数据模型 (未修改)
const policy = ref({
  name: '',
  target: '',
  basis: '',
});

// 控制器 (未修改)
const isAddDialogVisible = ref(false)
const isAlertDialogVisible = ref(false)
const newPolicy = reactive({
  name: '',
  object: '',
  items: null
})

// --- 方法 (navigateTo 未修改) ---
const navigateTo = (path, mode) => {
  let finalPath = path;
  if (mode === 'edit') {
    finalPath += '?mode=edit';
  }
  console.log(`正在跳转到: ${finalPath}`);
  router.push(finalPath);
}

const handleCardClick = () => {
  isAlertDialogVisible.value = true
}

const handleAddNewPolicy = () => {
  if (!newPolicy.name || !newPolicy.object || !newPolicy.items) {
    $q.notify({
      color: 'negative',
      message: '请填写所有字段！',
      icon: 'warning',
    });
    return
  }
  policies.push({ ...newPolicy, updated: new Date().toISOString().split('T')[0], owned: true, preset_strategy: false, enabled: true })
  newPolicy.name = ''
  newPolicy.object = ''
  newPolicy.items = null
  isAddDialogVisible.value = false
}


const selectObject = () => {
  $q.notify('触发“选择适用对象”操作');
  policy.value.target = '所有主机';
};

const submitForm = () => {
  if (!policy.value.name || !policy.value.target) {
    $q.notify({
      color: 'negative',
      message: '策略名称和适用对象为必填项',
      icon: 'warning',
    });
    return;
  }
  console.log('提交的策略:', policy.value);
  $q.notify({
    color: 'positive',
    message: '策略新增成功',
    icon: 'check_circle',
  });
};

// --- 新增: 删除策略的函数 ---
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
      $q.notify({
        color: 'positive',
        message: '策略已成功删除'
      });
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
            <q-btn unelevated label="导入" class="action-button" icon="file_upload" />
            <q-btn unelevated label="导出" class="action-button" icon="file_download" />
            <q-btn unelevated label="新增" @click="handleCardClick()" class="action-button" icon="add" />
          </div>
        </div>

        <!-- 列表式表格，取代原有的卡片网格 -->
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
              <q-chip v-if="props.row.preset_strategy" dense size="sm" color="blue-grey-8" text-color="white" label="是" />
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
              <q-btn flat dense round @click="navigateTo('/mustcheck')" icon="visibility" color="light-blue-3">
                <q-tooltip>查看</q-tooltip>
              </q-btn>
              <!-- 编辑和删除按钮仅对非预制且拥有的策略显示 -->
              <template v-if="!props.row.preset_strategy && props.row.owned">
                <q-btn flat dense round @click="navigateTo('/mustcheck', 'edit')" icon="edit" color="light-blue-3">
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <!-- **** FIXED: Replaced invalid comment with a function call **** -->
                <q-btn flat dense round @click="deletePolicy(props.row)" icon="close" color="negative">
                  <q-tooltip class="bg-red">删除</q-tooltip>
                </q-btn>
              </template>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- 刷新按钮 (示例，保持与图片一致) -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="refresh" color="primary" />
      </q-page-sticky>

    </q-page>

    <!-- 弹窗部分 (未修改) -->
    <q-dialog v-model="isAddDialogVisible">
      <q-card class="bg-white text-black" style="width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">新增策略</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="handleAddNewPolicy">
            <q-input v-model="newPolicy.name" outlined label="策略名称" />
            <q-input v-model="newPolicy.object" outlined label="适用对象" />
            <q-input v-model.number="newPolicy.items" outlined type="number" label="检查项数" />
            <div class="row justify-end q-mt-lg">
              <q-btn v-close-popup label="取消" type="reset" color="grey-6" flat class="q-mr-sm" />
              <q-btn label="确认新增" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isAlertDialogVisible">
      <q-card class="column full-height" flat style="width: 400px; max-width: 90vw;">
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

<style scoped>
/* --- 全局和顶部栏样式 --- */
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
  padding: 4px 12px;
}
.action-button .q-icon {
  font-size: 1.2em;
  margin-right: 4px;
}

/* --- 表格样式 --- */
.policy-table {
  background-color: #333438; /* 比页面背景稍亮的表格背景 */
  border-radius: 8px;
}

/* 使用 :deep() 来穿透组件样式封装 */
:deep(.policy-table thead tr th) {
  color: white;
  font-weight: bold;
  /* 调整为图片中的淡紫色/蓝色表头 */
  background-color: #3c415c;
  font-size: 16px;
  border-bottom: none;
}

:deep(.policy-table tbody td) {
  color: #e0e0e0; /* 浅灰色字体，增加可读性 */
  font-size: 14px;
  border-color: #424242; /* 行分割线颜色 */
}

:deep(.policy-table tbody tr:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* --- 弹窗样式 (保持原有风格) --- */
.q-item__label {
  font-size: 16px;
}
</style>
