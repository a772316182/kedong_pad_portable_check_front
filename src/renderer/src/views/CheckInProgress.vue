<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

// --- 响应式数据 ---

// 表格列定义
const columns = [
  { name: 'name', required: true, label: '资产名称', align: 'left', field: 'id', sortable: true },
  { name: 'type', align: 'left', label: '设备类型', field: 'type', sortable: true },
  { name: 'fingerprint', align: 'left', label: '资产特征识别', field: 'fingerprint' },
  { name: 'ports', align: 'left', label: '开放端口/服务', field: 'ports' },
  { name: 'status', align: 'left', label: '资产状态', field: 'status', sortable: true },
  { name: 'zone', align: 'left', label: '安全分区', field: 'zone' },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' }
];

// 资产列表
const assets = reactive(Array.from({ length: 10 }, (_, i) => ({
  id: `10.105.71.${240 + i}`,
  type: '未知',
  fingerprint: '无',
  ports: '无',
  status: '在线',
  zone: '安全二区'
})));

// 表格选中的行
const selectedAssets = ref([]);

// 控制所有弹窗的显示状态
const modals = reactive({
  noUsb: false,
  noConnection: false,
  loginException: false,
  exportReportChoice: false,
  exportReportConfirm: false,
});

// 报告导出表单的数据模型
const reportExport = reactive({
  name: '合规项安全核查报告1',
  template: 'generic'
});

// --- 方法 ---

// 打开指定弹窗的通用函数
const openModal = (modalName) => {
  if (modals.hasOwnProperty(modalName)) {
    modals[modalName] = true;
  }
};

// 报告导出流程
const showExportConfirm = () => {
  modals.exportReportChoice = false;
  modals.exportReportConfirm = true;
};

const confirmExport = () => {
  modals.exportReportConfirm = false;
  // 延迟显示最终提示，模拟导出过程
  setTimeout(() => {
    modals.noUsb = true;
  }, 500);
};

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-light-blue-grey">
    <q-header class="bg-light-blue-grey text-black q-pa-sm" style="border-bottom: 1px solid #dce3ec;">
      <q-toolbar>
        <q-btn color="light-blue-7" unelevated label="上一步" @click="navigateTo('/managecheck')"  />
        <q-space />
        <q-toolbar-title class="text-center text-h5 text-weight-bold">正在核查</q-toolbar-title>
        <q-space />
        <q-btn flat dense icon="swap_horiz" label="切换" class="q-mr-sm text-grey-8" />
        <q-btn flat dense icon="filter_list" label="筛选" class="text-grey-8" />
      </q-toolbar>
      <q-toolbar class="q-px-md q-gutter-sm">
        <q-btn-toggle
          model-value="discover"
          unelevated
          toggle-color="light-blue-7"
          text-color="black"
          :options="[
            {label: '识别设备', value: 'discover'},
            {label: '设备类型', value: 'type'}
          ]"
        />
        <q-space />
        <q-btn color="light-blue-7" unelevated label="资产探测" />
        <q-btn color="light-blue-7" unelevated label="资产导入" />
        <q-btn color="light-blue-7" unelevated label="资产导出" @click="openModal('noUsb')" />
        <q-btn color="light-blue-7" unelevated label="登录检查" @click="openModal('noConnection')" />
        <q-btn color="light-blue-7" unelevated label="登录异常" @click="openModal('loginException')" />
        <q-btn color="light-blue-7" unelevated label="报告导出" @click="openModal('exportReportChoice')" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <q-table
          :rows="assets"
          :columns="columns"
          row-key="id"
          selection="multiple"
          v-model:selected="selectedAssets"
          flat
          bordered
          class="bg-table-theme"
          table-header-class="bg-table-header"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="q-gutter-sm">
                <q-btn :color="props.row.selected ? 'green-6' : 'grey-6'" size="sm" dense unelevated>{{ props.row.selected ? '取消选定' : '选定' }}</q-btn>
                <q-btn color="blue-6" size="sm" dense unelevated>资产详情</q-btn>
                <q-btn color="teal-6" size="sm" dense unelevated>核查记录</q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-page>
    </q-page-container>

    <!-- 弹窗部分 -->

    <!-- 简单提示弹窗 (用于U盘未发现, 未选择连接方式) -->
    <q-dialog v-model="modals.noUsb">
      <q-card style="width: 300px">
        <q-card-section><div class="text-h6">提示</div></q-card-section>
        <q-card-section class="q-pt-none">未发现U盘</q-card-section>
        <q-card-actions align="right"><q-btn flat label="确定" color="primary" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="modals.noConnection">
      <q-card style="width: 300px">
        <q-card-section><div class="text-h6">提示</div></q-card-section>
        <q-card-section class="q-pt-none">请先选择连接方式</q-card-section>
        <q-card-actions align="right"><q-btn flat label="确定" color="primary" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 登录异常弹窗 -->
    <q-dialog v-model="modals.loginException">
      <q-card style="width: 400px">
        <q-card-section><div class="text-h6">提示</div></q-card-section>
        <q-card-section class="q-pt-none">当前未选定资产，请选定后进行异常情况登记。</q-card-section>
        <q-card-actions align="right"><q-btn flat label="确定" color="primary" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 报告导出 - 步骤1: 选择 -->
    <q-dialog v-model="modals.exportReportChoice">
      <q-card style="width: 450px;">
        <q-card-section><div class="text-h6">导出报告</div></q-card-section>
        <q-card-section class="q-pt-none row q-col-gutter-md justify-center">
          <div class="col-6 text-center">
            <q-btn flat class="fit" @click="showExportConfirm">
              <div class="column items-center">
                <q-icon name="description" color="primary" size="lg" />
                <div>导出全部</div>
              </div>
            </q-btn>
          </div>
          <div class="col-6 text-center">
            <q-btn flat class="fit" disable>
              <div class="column items-center text-grey-5">
                <q-icon name="plagiarism" size="lg" />
                <div>导出所选</div>
              </div>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-section class="text-caption text-grey-6 text-center q-pt-none">
          *导出报告将保存在当前目录下
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 报告导出 - 步骤2: 确认 -->
    <q-dialog v-model="modals.exportReportConfirm">
      <q-card style="width: 500px;">
        <q-form @submit.prevent="confirmExport">
          <q-card-section><div class="text-h6">导出报告</div></q-card-section>
          <q-card-section class="q-pt-none">
            <p class="text-grey-7">已选择 12/12 条核查记录，请输入报告名称。</p>
            <q-input outlined v-model="reportExport.name" label="报告名称" class="q-mb-md" />
            <div class="text-grey-8">请选择报告模板</div>
            <q-option-group
              v-model="reportExport.template"
              :options="[
                            { label: '通用报告模板', value: 'generic' },
                            { label: '综合业务系统模板', value: 'business' }
                        ]"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="取消" v-close-popup />
            <q-btn label="确认导出" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
.bg-light-blue-grey {
  background-color: #f0f4f8; /* 图片中的浅蓝灰色背景 */
  color: #333;
}
.bg-table-theme {
  background-color: #ffffff; /* 表格背景为白色 */
  color: #333;
}
.bg-table-header {
  background-color: #e3e8ee; /* 表格头部颜色 */
}

/* 覆盖 Quasar 默认样式以匹配图片 */
:deep(.q-toolbar) {
  padding: 8px 12px;
}
:deep(.q-table__container) {
  border-radius: 0;
  box-shadow: none;
  border: 1px solid #dce3ec;
}
:deep(thead tr th) {
  color: #555 !important;
  font-weight: 600;
}
:deep(tbody tr:nth-child(even)) {
  background-color: #f8f9fa;
}
:deep(.q-btn-toggle) {
  border: 1px solid #c2cde0;
  border-radius: 4px;
}
:deep(.q-btn-toggle .q-btn) {
  font-weight: 600;
}
</style>
