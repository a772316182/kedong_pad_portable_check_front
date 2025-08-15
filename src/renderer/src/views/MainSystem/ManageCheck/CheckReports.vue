<template>
  <!-- 【正确做法】用一个 div 将 q-layout 包裹起来，并在这个 div 上设置背景和内边距 -->
  <div class="layout-container">
    <q-layout view="lHh Lpr lFf" class="page-background">
      <!-- 顶部主工具栏 -->
      <q-header elevated class="text-white q-py-md">
        <q-toolbar>
          <!-- 【样式统一】应用 action-button 样式 -->
          <q-btn
            unelevated
            label="返回"
            class="action-button"
            icon="arrow_back_ios"
            @click="navigateTo('mainView')"
          />
          <!-- 【样式统一】修改标题颜色和样式 -->
          <div class="text-h4 text-weight-bolder q-ml-lg" style="color: #4c6afc">报告管理</div>

          <q-space />
          <!-- 添加一个 q-space 来将右侧按钮推到边缘 -->
          <div class="row items-center q-gutter-x-md">
            <!-- 【样式统一】应用 action-button 样式 -->
            <q-btn unelevated label="导入" icon="file_upload" class="action-button" />
            <q-btn unelevated label="导出" icon="file_download" class="action-button" />
          </div>
        </q-toolbar>
      </q-header>

      <!-- 页面主要内容 -->
      <q-page-container>
        <q-page class="q-pa-lg">
          <!-- 报告表格 -->
          <q-table
            :rows="reports"
            :columns="reportColumns"
            row-key="id"
            class="report-table"
            separator="horizontal"
            dark
            flat
          >
            <template #body-cell-actions="props">
              <q-td :props="props" class="q-gutter-sm">
                <!-- 【样式统一】修改操作按钮颜色以匹配目标图片 -->
                <q-btn
                  flat
                  dense
                  round
                  icon="visibility"
                  color="light-blue-3"
                  @click="navigateTo('reportview')"
                >
                  <q-tooltip>查看报告详情</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="usb"
                  color="light-blue-3"
                  @click="downloadToUSB(props.row)"
                >
                  <q-tooltip>导出到U盘</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="drive_file_rename_outline"
                  color="light-blue-3"
                  @click="openRenameDialog(props.row)"
                >
                  <q-tooltip>重命名报告</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  color="negative"
                  @click="openDeleteDialog(props.row)"
                >
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-page>
      </q-page-container>

      <!-- 重命名弹窗 -->
      <q-dialog v-model="renameDialog.isOpen" persistent>
        <q-card class="dialog-card" dark bordered style="width: 500px">
          <q-card-section class="row items-center">
            <div class="text-h6">重命名报告</div>
            <q-space />
            <q-btn v-close-popup icon="close" flat round dense />
          </q-card-section>
          <q-card-section>
            <q-input
              v-model="renameDialog.newName"
              label="新的报告名称"
              dark
              autofocus
              @keyup.enter="confirmRename"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn v-close-popup flat label="取消" />
            <q-btn flat label="确认" color="primary" @click="confirmRename" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- 删除确认弹窗 -->
      <q-dialog v-model="deleteDialog.isOpen" persistent>
        <q-card class="dialog-card" dark bordered style="width: 400px">
          <q-card-section class="row items-center">
            <div class="text-h6">确认删除</div>
            <q-space />
            <q-btn v-close-popup icon="close" flat round dense />
          </q-card-section>
          <q-card-section> 您确定要删除报告 “{{ deleteDialog.report?.name }}” 吗？ </q-card-section>
          <q-card-actions align="right">
            <q-btn v-close-popup flat label="取消" />
            <q-btn flat label="删除" color="negative" @click="confirmDelete" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-layout>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}
const reportColumns = [
  { name: 'name', required: true, label: '报告名称', align: 'left', field: 'name', sortable: true },
  { name: 'creationDate', label: '生成时间', align: 'left', field: 'creationDate', sortable: true },
  { name: 'size', label: '文件大小', align: 'left', field: 'size', sortable: true },
  { name: 'version', label: '版本号', align: 'left', field: 'version' },
  { name: 'actions', label: '操作', align: 'center', field: 'actions' }
]

const reports = ref([])

const renameDialog = ref({
  isOpen: false,
  report: null,
  newName: ''
})
const deleteDialog = ref({
  isOpen: false,
  report: null
})

const downloadToUSB = (report) => {
  $q.notify({
    message: `已将报告 “${report.name}” 发送到U盘`,
    color: 'positive',
    icon: 'usb'
  })
}

const openRenameDialog = (report) => {
  renameDialog.value.report = report
  renameDialog.value.newName = report.name
  renameDialog.value.isOpen = true
}

const confirmRename = () => {
  const { report, newName } = renameDialog.value
  if (newName && newName.trim() !== '') {
    const index = reports.value.findIndex((r) => r.id === report.id)
    if (index !== -1) {
      reports.value[index].name = newName
      $q.notify({
        color: 'positive',
        message: '报告已成功重命名'
      })
    }
  }
  renameDialog.value.isOpen = false
}

const openDeleteDialog = (report) => {
  deleteDialog.value.report = report
  deleteDialog.value.isOpen = true
}

const confirmDelete = () => {
  const { report } = deleteDialog.value
  const index = reports.value.findIndex((r) => r.id === report.id)
  if (index > -1) {
    reports.value.splice(index, 1)
    $q.notify({
      color: 'positive',
      message: '报告删除成功'
    })
  }
  deleteDialog.value.isOpen = false
}

onMounted(() => {
  console.log('onMounted')
})

onBeforeMount(() => {
  // let res = await api(xxxxx)
  // reports.value = res
  reports.value = [
    {
      id: 1,
      name: '安全巡检报告',
      creationDate: '2025-06-20 15:47:30',
      size: '2.5 MB',
      version: 'v1.0'
    },
    {
      id: 2,
      name: '季度安全审计报告',
      creationDate: '2025-05-15 11:28:00',
      size: '4.1 MB',
      version: 'v1.2'
    }
  ]
})
</script>

<!-- 全局样式 (无 scoped) -->
<style>
/* --- 全局缩放控制参数 --- */
:root {
  --font-scale-factor: 1.3;
}

/* --- 弹窗样式 --- */
.dialog-card .text-h6 {
  font-size: calc(1.25rem * var(--font-scale-factor));
}
.dialog-card .q-card__section {
  font-size: calc(1rem * var(--font-scale-factor));
}
.dialog-card .q-field__native,
.dialog-card .q-field__label {
  font-size: calc(1rem * var(--font-scale-factor));
}
.dialog-card .q-btn .q-btn__content {
  font-size: calc(0.9rem * var(--font-scale-factor));
}
.q-tooltip {
  font-size: calc(12px * var(--font-scale-factor));
}
</style>

<!-- 局部样式 (有 scoped) -->
<style scoped>
/* --- 【新增】外部容器样式 --- */
.layout-container {
  background-color: #292a2d;
  padding: 20px; /* 在这里设置想要的留白大小 */
  min-height: 100vh; /* 确保容器至少和屏幕一样高 */
  box-sizing: border-box; /* 确保 padding 不会增加总宽高 */
}

/* --- 整体背景和布局 --- */
/* 【修改】移除 .page-background 的背景色，因为它已由 layout-container 提供 */
.page-background {
  /* background-color: #292a2d; */ /* 这一行可以注释或删除 */
}
.page-background :deep(.q-page) {
  background-color: #292a2d;
}
.page-background :deep(.q-header) {
  background: #292a2d;
  border-bottom: 1px solid #4a5562;
}

/* --- 顶部操作栏 --- */
.action-button {
  background-color: #4c6afc;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  font-size: calc(17px * var(--font-scale-factor));
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
.report-table {
  background-color: #333438;
  border-radius: 8px;
}
.report-table :deep(thead tr th) {
  color: white;
  font-weight: bold;
  background-color: #3c415c;
  font-size: calc(16px * var(--font-scale-factor));
  border-bottom: none;
}
.report-table :deep(tbody td) {
  color: #e0e0e0;
  font-size: calc(14px * var(--font-scale-factor));
  border-color: #424242;
}
.report-table :deep(tbody tr:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
</style>
