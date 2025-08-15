<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-page padding>
      <!-- 主内容区域 -->
      <div class="main-content-area">
        <!-- 顶部操作栏 -->
        <div class="row items-center no-wrap q-mb-md">
          <q-btn unelevated label="返回" @click="goBack" class="action-button" icon="arrow_back" />
          <div class="text-h4 text-weight-bolder q-ml-lg" style="color: #4c6afc;">人工策略管理</div>
          <q-space />
          <div class="row items-center q-gutter-x-md">
            <!-- 【已移除】“新增检查项”按钮 -->
            <!-- 【保留】导入按钮 -->
            <q-btn unelevated label="导入" @click="isImportDialogVisible = true" class="action-button" icon="file_upload" />
          </div>
        </div>

        <!-- 列表式表格 -->
        <q-table
          class="policy-table"
          flat
          dark
          :rows="checkItems"
          :columns="columns"
          row-key="id"
          hide-bottom
          :rows-per-page-options="[0]"
        >
          <!-- 自定义“操作”列的显示 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm text-center">
              <!-- 【已移除】编辑按钮 -->
              <q-btn flat dense round @click="deleteItem(props.row)" icon="close" color="negative">
                <q-tooltip class="bg-red">删除</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>

      <!-- 刷新按钮 -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="refresh" color="primary" />
      </q-page-sticky>

    </q-page>

    <!-- 【已移除】新增/编辑检查项弹窗 -->

    <!-- 【保留】导入文件弹窗 -->
    <q-dialog v-model="isImportDialogVisible">
      <q-card class="bg-white text-black dialog-add" style="width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">导入检查项</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <p class="text-grey-8">请选择包含检查项的 Excel 或 CSV 文件进行导入。</p>
          <q-file
            v-model="selectedFile"
            outlined
            label="点击选择文件"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="取消" color="grey-6" v-close-popup />
          <q-btn unelevated label="开始导入" color="primary" @click="handleFileUpload" :disable="!selectedFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar();
const router = useRouter()

// 定义表格列
const columns = [
  { name: 'level1Category', label: '检查点1级分类', align: 'left', field: 'level1Category', sortable: true },
  { name: 'level2Category', label: '检查点2级分类', align: 'left', field: 'level2Category', sortable: true },
  { name: 'checkPoint', label: '检查点', align: 'left', field: 'checkPoint', style: 'white-space: normal; min-width: 200px;' },
  { name: 'checkMethod', label: '检查方法', align: 'left', field: 'checkMethod', style: 'white-space: normal; min-width: 250px;' },
  { name: 'checkBasis', label: '检查依据', align: 'left', field: 'checkBasis', style: 'white-space: normal; min-width: 250px;' },
  { name: 'riskLevel', label: '隐患级别', align: 'center', field: 'riskLevel', sortable: true },
  { name: 'actions', label: '操作', align: 'center' },
]

// 定义表格数据
const checkItems = ref([
  {
    id: 1,
    level1Category: '基础设施安全(例)',
    level2Category: '机房',
    checkPoint: '机房应具有防火、防水、防雷接地等物理安全防护措施。',
    checkMethod: '检查是否设置了灭火设备，是否设置了火灾自动报警系统，是否有人负责维护该系统的运行；检查是否定期进行防火检查，防火检查内容应包括防火巡查、消防设施器材运维等情况。',
    checkBasis: '《信息安全技术—网络安全等级保护基本要求》(GB/T 22239-2019) a) 机房应设置火灾自动消防系统，能够自动检测火情、自动报警，并自动灭火(二级及以上)。',
    riskLevel: '一般'
  },
  {
    id: 2,
    level1Category: '网络安全',
    level2Category: '边界防护',
    checkPoint: '应在网络边界部署访问控制设备，启用访问控制功能。',
    checkMethod: '检查防火墙等边界设备是否正确配置访问控制策略，限制非授权访问。',
    checkBasis: '《信息安全技术—网络安全等级保护基本要求》(GB/T 22239-2019) 8.1.2.1',
    riskLevel: '较高'
  }
]);

// 【已移除】新增/编辑相关的状态和函数

// 删除检查项
const deleteItem = (itemToDelete) => {
  $q.dialog({
    title: '确认删除',
    message: `您确定要删除此检查项吗？`,
    cancel: true,
    persistent: true,
    ok: { label: '删除', color: 'negative', unelevated: true },
    cancel: { label: '取消', flat: true }
  }).onOk(() => {
    const index = checkItems.value.findIndex(p => p.id === itemToDelete.id);
    if (index > -1) {
      checkItems.value.splice(index, 1);
      $q.notify({ color: 'positive', message: '删除成功', icon: 'check_circle' });
    }
  });
};

// --- 导入功能 ---
const isImportDialogVisible = ref(false);
const selectedFile = ref(null);

const handleFileUpload = () => {
  if (!selectedFile.value) {
    $q.notify({ color: 'negative', message: '请先选择一个文件', icon: 'warning' });
    return;
  }

  $q.loading.show({ message: '正在导入文件...' });

  // 模拟上传和处理过程
  setTimeout(() => {
    $q.loading.hide();
    isImportDialogVisible.value = false;
    selectedFile.value = null; // 清空选择
    $q.notify({
      color: 'positive',
      message: '文件导入成功！(模拟)',
      icon: 'check_circle'
    });
  }, 2000);
};


// --- 导航 ---
const goBack = () => {
  router.push('/managestrategy');
};

</script>

<!-- 样式保持不变 -->
<style>
:root { --font-scale-factor: 1.2; }
.dialog-add .text-h6 { font-size: calc(1.25rem * var(--font-scale-factor)); }
.dialog-add .q-field__label,
.dialog-add .q-field__native { font-size: calc(1rem * var(--font-scale-factor)); }
.dialog-add .q-btn .q-btn__content { font-size: calc(0.9rem * var(--font-scale-factor)); }
.q-tooltip { font-size: calc(12px * var(--font-scale-factor)); }
</style>

<style scoped>
.page-background { background-color: #292a2d; }
.main-content-area { padding-top: 20px; }
.action-button { background-color: #4c6afc; color: white; font-weight: bold; border-radius: 6px; font-size: calc(14px * var(--font-scale-factor)); padding: calc(4px * var(--font-scale-factor)) calc(12px * var(--font-scale-factor)); }
.action-button .q-icon { font-size: calc(1.2em * var(--font-scale-factor)); margin-right: 4px; }
.page-background :deep(.text-h4) { font-size: calc(2.125rem * var(--font-scale-factor)); }
.policy-table { background-color: #333438; border-radius: 8px; }
.policy-table :deep(thead tr th) { color: white; font-weight: bold; background-color: #3c415c; font-size: calc(16px * var(--font-scale-factor)); border-bottom: none; }
.policy-table :deep(tbody td) { color: #e0e0e0; font-size: calc(14px * var(--font-scale-factor)); border-color: #424242; vertical-align: middle; }
.policy-table :deep(tbody tr:hover) { background-color: rgba(255, 255, 255, 0.05) !important; }
.page-background :deep(.q-page-sticky .q-btn) { font-size: calc(1.5rem * var(--font-scale-factor)); }
</style>
