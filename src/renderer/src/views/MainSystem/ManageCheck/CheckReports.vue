<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn unelevated color="primary" icon="arrow_back_ios" label="返回" @click="navigateTo('mainView')"/>
        <q-toolbar-title class="q-ml-md">
          报告管理
        </q-toolbar-title>
        <div class="row items-center q-gutter-x-md">
        <q-btn unelevated label="导入" class="action-button" icon="file_upload" />
        <q-btn unelevated label="导出" class="action-button" icon="file_download" />
        </div>
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="q-pa-md bg-dark-page">

        <!-- 报告表格 -->
        <q-table
          :rows="reports"
          :columns="reportColumns"
          row-key="id"
          class="text-grey-4"
          separator="cell"
          dark
          flat
          bordered
          card-class="bg-dark-table-card"
          table-header-class="bg-dark-table-header text-white"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-sm">
              <q-btn flat dense round icon="visibility" class="text-light-blue-4" @click="navigateTo('reportview')">
                <q-tooltip>查看报告详情</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="usb" class="text-light-blue-4" @click="downloadToUSB(props.row)">
                <q-tooltip>导出到U盘</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="drive_file_rename_outline" class="text-light-blue-4" @click="openRenameDialog(props.row)">
                <q-tooltip>重命名报告</q-tooltip>
              </q-btn>
              <q-btn flat dense round icon="delete" class="text-red-4" @click="openDeleteDialog(props.row)">
                <q-tooltip>删除</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

      </q-page>
    </q-page-container>

    <!-- 重命名弹窗 -->
    <q-dialog v-model="renameDialog.isOpen" persistent>
      <q-card dark bordered style="width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">重命名报告</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
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
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="确认" color="primary" @click="confirmRename" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 删除确认弹窗 -->
    <q-dialog v-model="deleteDialog.isOpen" persistent>
      <q-card dark bordered style="width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">确认删除</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          您确定要删除报告 “{{ deleteDialog.report?.name }}” 吗？
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="删除" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'

const $q = useQuasar();
const router = useRouter()

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}
// 表格列定义
const reportColumns = [
  { name: 'name', required: true, label: '报告名称', align: 'left', field: 'name', sortable: true },
  { name: 'creationDate', label: '生成时间', align: 'left', field: 'creationDate', sortable: true },
  { name: 'size', label: '文件大小', align: 'left', field: 'size', sortable: true },
  { name: 'version', label: '版本号', align: 'left', field: 'version' },
  { name: 'actions', label: '操作', align: 'center', field: 'actions' },
];

// 模拟报告数据
const reports = ref([
  { id: 1, name: '安全巡检报告', creationDate: '2025-06-20 15:47:30', size: '2.5 MB', version: 'v1.0' },
  { id: 2, name: '季度安全审计报告', creationDate: '2025-05-15 11:28:00', size: '4.1 MB', version: 'v1.2' },
]);

// 重命名和删除弹窗的状态
const renameDialog = ref({
  isOpen: false,
  report: null,
  newName: ''
});
const deleteDialog = ref({
  isOpen: false,
  report: null
});

// 查看报告 (实际项目中会跳转路由)
const viewReport = (report) => {
  $q.notify({
    message: `正在查看报告: ${report.name}`,
    color: 'info',
    icon: 'visibility'
  });
  // 例如: router.push(`/reports/${report.id}`)
};

// 下载到U盘
const downloadToUSB = (report) => {
  $q.notify({
    message: `已将报告 “${report.name}” 发送到U盘`,
    color: 'positive',
    icon: 'usb'
  });
};

// 打开重命名弹窗
const openRenameDialog = (report) => {
  renameDialog.value.report = report;
  renameDialog.value.newName = report.name;
  renameDialog.value.isOpen = true;
};

// 确认重命名
const confirmRename = () => {
  const { report, newName } = renameDialog.value;
  if (newName && newName.trim() !== '') {
    const index = reports.value.findIndex(r => r.id === report.id);
    if (index !== -1) {
      reports.value[index].name = newName;
      $q.notify({
        color: 'positive',
        message: '报告已成功重命名'
      });
    }
  }
  renameDialog.value.isOpen = false;
};

// 打开删除弹窗
const openDeleteDialog = (report) => {
  deleteDialog.value.report = report;
  deleteDialog.value.isOpen = true;
};

// 确认删除
const confirmDelete = () => {
  const { report } = deleteDialog.value;
  const index = reports.value.findIndex(r => r.id === report.id);
  if (index > -1) {
    reports.value.splice(index, 1);
    $q.notify({
      color: 'positive',
      message: '报告删除成功'
    });
  }
  deleteDialog.value.isOpen = false;
};

</script>

<style lang="sass" scoped>
.action-button
  background-color: #4c6afc
  color: white
  font-weight: bold
  border-radius: 6px
  padding: 4px 12px

.bg-dark-header
  background: #272727

.bg-dark-page
  background: #363636

.bg-dark-table-header
  background: #424864 !important

.bg-dark-table-card
  background: #363636

.q-toolbar__title
  font-weight: bold
</style>
