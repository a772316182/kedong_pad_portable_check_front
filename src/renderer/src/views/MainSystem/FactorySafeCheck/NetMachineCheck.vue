<script setup>
import { ref, reactive } from 'vue'
import router from "../../../router";

// --- 响应式状态 ---

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}
// 控制顶部页签的当前选中项, 默认显示第一页
const tab = ref('create_task')

// --- (视图 1) 任务列表和弹窗 ---

// 控制“创建核查任务”弹窗的显示状态
const showCreateDialog = ref(false)

// “创建核查任务”弹窗的表单数据模型
const createForm = reactive({
  taskName: '',
  stationName: '',
  checkItems: {
    baseline: false, weakPassword: false, bruteForce: false, portScan: false,
    externalScan: false, internalScan: false, legacyProtocol: false,
  },
  selectedScope: [],
})

// 任务列表页表格定义与数据
const taskTableColumns = [
  { name: 'id', label: '编号', align: 'left', field: 'id', sortable: true },
  { name: 'name', label: '任务名称', align: 'left', field: 'name', sortable: true },
  { name: 'time', label: '创建时间', align: 'left', field: 'time', sortable: true },
  { name: 'items', label: '核查项', align: 'left', field: 'items' },
  { name: 'status', label: '任务状态', align: 'center', field: 'status' },
  { name: 'actions', label: '操作', align: 'left', field: 'actions' }
];
const taskTableRows = reactive([
  { id: 1, name: '核心网络设备年度巡检', time: '2025-06-28 13:00:00', items: ['主机漏洞', '防火墙策略'], status: '进行中' },
  { id: 2, name: '数据库服务器安全加固核查', time: '2025-06-27 09:12:00', items: ['主机策略'], status: '已完成' },
  { id: 3, name: 'Web应用防火墙规则审计', time: '2025-06-26 15:00:00', items: ['防火墙策略', '漏洞扫描', '纵向加密'], status: '已完成' },
  { id: 4, name: '月度安全设备巡检', time: '2025-06-05 10:00:00', items: ['主机策略', '纵向策略'], status: '进行中' },
]);
const taskPagination = ref({ rowsPerPage: 10 });

// 弹窗内核查范围表格定义与数据
const scopeTableColumns = [
  { name: 'id', label: '序号', align: 'left', field: 'id' },
  { name: 'zone', label: '安全区', align: 'left', field: 'zone' },
  { name: 'deviceName', label: '设备名称', align: 'left', field: 'deviceName' },
  { name: 'ip', label: '网络设备IP', align: 'left', field: 'ip', sortable: true },
  { name: 'deviceType', label: '设备类型', align: 'left', field: 'deviceType' },
  { name: 'manageIp', label: '检查工控IP', align: 'left', field: 'manageIp' },
];
const scopeTableRows = reactive([
  { id: 1, zone: '核心生产区', deviceName: '数据服务器-DB01', ip: '172.17.8.11', deviceType: '服务器', manageIp: '' },
  { id: 2, zone: 'DMZ区', deviceName: '防火墙-FW02', ip: '203.0.113.25', deviceType: '安全设备', manageIp: '' },
  { id: 3, zone: '办公接入区', deviceName: '接入交换机-SW45', ip: '10.5.32.78', deviceType: '网络设备', manageIp: '' },
  { id: 4, zone: '测试环境区', deviceName: '虚拟主机-VM09', ip: '192.168.100.45', deviceType: '虚拟化设备', manageIp: '' },
  { id: 5, zone: '开发隔离区', deviceName: '构建服务器-BLD01', ip: '10.88.77.66', deviceType: '服务器', manageIp: '' },
  { id: 6, zone: '核心生产区', deviceName: '负载均衡设备-LB07', ip: '172.17.8.15', deviceType: '网络设备', manageIp: '' },
]);

// --- (视图 2) 基础检查页表格定义与数据 ---
const checkTableColumns = [
  { name: 'id', label: '编号', align: 'left', field: 'id' },
  { name: 'deviceName', label: '设备名称', align: 'left', field: 'deviceName' },
  { name: 'deviceType', label: '设备类型', align: 'left', field: 'deviceType' },
  { name: 'ip', label: '设备IP', align: 'left', field: 'ip' },
  { name: 'mac', label: 'MAC地址', align: 'left', field: 'mac' },
  { name: 'progress', label: '核查进度', align: 'center', field: 'progress' },
];
const checkTableRows = reactive([
  { id: 1, deviceName: '服务器-A01', deviceType: '服务器', ip: '192.168.1.101', mac: '00:1A:C2:7B:00:47', progress: { status: 'in_progress', value: 75 } },
  { id: 2, deviceName: '交换机-C12', deviceType: '网络设备', ip: '10.0.0.12', mac: '00:1B:44:11:3A:B7', progress: { status: 'completed' } },
  { id: 3, deviceName: '工作站-W22', deviceType: '终端设备', ip: '172.16.8.22', mac: '08:00:27:BE:36:FA', progress: { status: 'not_started' } },
  { id: 4, deviceName: '工作站-W23', deviceType: '终端设备', ip: '172.16.8.23', mac: '08:09:27:BE:36:FB', progress: { status: 'error', message: '网络不通' } },
]);
const checkPagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 4 });

// --- (视图 3) 检查结果页表格定义与数据 ---
const resultsTableColumns = [
  { name: 'id', label: '编号', align: 'left', field: 'id' },
  { name: 'deviceName', label: '设备名称', align: 'left', field: 'deviceName' },
  { name: 'deviceType', label: '设备类型', align: 'left', field: 'deviceType' },
  { name: 'ip1', label: '设备IP1', align: 'left', field: 'ip1' },
  { name: 'ip2', label: '设备IP2', align: 'left', field: 'ip2' },
  { name: 'result', label: '核查结果', align: 'center', field: 'result' },
];
const resultsTableRows = reactive([
  { id: 1, deviceName: '核心数据库服务器', deviceType: '数据库', ip1: '192.168.1.101', ip2: '10.0.0.101', result: '合格' },
  { id: 2, deviceName: 'Web应用服务器', deviceType: '应用服务器', ip1: '192.168.1.102', ip2: '10.0.0.102', result: '不合格' },
  { id: 3, deviceName: '文件存储服务器', deviceType: '存储设备', ip1: '192.168.1.103', ip2: '10.0.0.103', result: '合格' },
  { id: 4, deviceName: '防火墙网关', deviceType: '网络安全', ip1: '192.168.1.1', ip2: '10.0.0.1', result: '合格' },
]);


// --- 方法 ---
function openCreateDialog() {
  createForm.taskName = '';
  createForm.stationName = '';
  Object.keys(createForm.checkItems).forEach(key => createForm.checkItems[key] = false);
  createForm.selectedScope = [];
  showCreateDialog.value = true;
}

function handleSave() {
  console.log('保存的数据:', {
    taskName: createForm.taskName,
    stationName: createForm.stationName,
    checkItems: createForm.checkItems,
    selectedScope: createForm.selectedScope,
  });
  showCreateDialog.value = false;
  // 保存后自动跳转到下一步
  tab.value = 'draft_check';
}

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-page">
    <q-header elevated class="bg-dark-header" height-hint="64">
      <q-toolbar>
        <q-breadcrumbs class="text-white">
          <template v-slot:separator>
            <q-icon size="1.2em" name="chevron_right" />
          </template>
          <div class="col-auto"><q-btn color="primary" unelevated icon="home" label="返回" @click="navigateTo('/factorysafecheck')" /></div>
          <div class="col"><div class="text-h6">网络设备检查</div></div>
        </q-breadcrumbs>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-lg">

        <q-toolbar class="column no-wrap" style="height: 100%; align-items: flex-start">
          <div class="col-auto text-white">
            <q-tabs v-model="tab" dense align="left" class="text-grey-4" active-color="white" indicator-color="white" no-caps >
              <q-tab name="create_task" icon="edit_note" label="创建任务" class = "step-item-new"/>
              <q-tab name="draft_check" icon="hourglass_empty" label="策略检查" class = "step-item-new"/>
              <q-tab name="check_result" icon="checklist" label="检查结果"  class = "step-item-new"/>
            </q-tabs>
            <q-separator />
          </div>
        </q-toolbar>

        <div class="column no-wrap" style="height: 100%;">

          <div class="q-pa-md">
            <q-tab-panels v-model="tab" animated class="bg-transparent full-height">

              <!-- 面板一: 创建任务 -->
              <q-tab-panel name="create_task" class="q-pa-none">
                <q-card flat class="full-height-card bg-white">
                  <q-card-section>
                    <div class="row items-center no-wrap">
                      <div class="col"><div class="text-h6 text-black">任务列表</div></div>
                      <div class="col-auto"><q-btn color="primary" unelevated icon="add" label="创建核查任务" @click="openCreateDialog" /></div>
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <q-table :rows="taskTableRows" :columns="taskTableColumns" row-key="id" flat :pagination="taskPagination" class="dark-theme-table">
                      <template v-slot:header-cell-name="props"><q-th :props="props">{{ props.col.label }} <q-icon name="search" size="1.2em" class="q-ml-xs" /></q-th></template>
                      <template v-slot:header-cell-time="props"><q-th :props="props">{{ props.col.label }} <q-icon name="search" size="1.2em" class="q-ml-xs" /></q-th></template>
                      <template v-slot:body-cell-items="props"><q-td :props="props"><q-chip v-for="item in props.value" :key="item" dense outline color="primary" :label="item" class="q-mr-xs" /></q-td></template>
                      <template v-slot:body-cell-status="props"><q-td :props="props"><q-chip :color="props.value === '进行中' ? 'orange-5' : 'green-5'" text-color="white" dense :label="props.value" class="status-chip"/></q-td></template>
                      <template v-slot:body-cell-actions="props"><q-td :props="props"><q-btn v-if="props.row.status === '已完成'" flat dense no-caps label="查看" class="action-btn" /><q-btn v-if="props.row.status === '进行中'" flat dense no-caps label="暂停" class="action-btn" /><q-btn flat dense no-caps label="下载" class="action-btn" /><q-btn flat dense no-caps label="删除" class="action-btn text-negative" /></q-td></template>
                    </q-table>
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <!-- 面板二: 基础检查 -->
              <q-tab-panel name="draft_check" class="q-pa-none">
                <q-card flat class="full-height-card bg-white">
                  <q-card-section>
                    <div class="row items-center no-wrap">
                      <div class="col"><div class="text-h6">基础检查表</div></div>
                      <div class="col-auto">
                        <q-btn color="primary" unelevated label="核查" />
                        <q-btn color="orange" unelevated label="取消" class="q-ml-sm"/>
                      </div>
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <q-table :rows="checkTableRows" :columns="checkTableColumns" row-key="id" flat hide-bottom class="dark-theme-table">
                      <template v-slot:header-cell="props"><q-th :props="props">{{ props.col.label }} <q-icon name="search" size="1.2em" class="q-ml-xs" /></q-th></template>
                      <template v-slot:body-cell-progress="props">
                        <q-td :props="props">
                          <div v-if="props.row.progress.status === 'in_progress'" class="row items-center no-wrap justify-center">
                            <q-linear-progress :value="props.row.progress.value / 100" color="primary" style="width: 100px" class="q-mr-sm" rounded/>
                            <span class="text-grey-4">进行中 ({{ props.row.progress.value }}%)</span>
                          </div>
                          <div v-else-if="props.row.progress.status === 'completed'"><q-chip dense outline color="green-4" text-color="green-4" label="已完成" /></div>
                          <div v-else-if="props.row.progress.status === 'not_started'"><q-chip dense outline color="grey-5" text-color="grey-5" label="未开始" /></div>
                          <div v-else-if="props.row.progress.status === 'error'"><q-chip dense outline color="red-4" text-color="red-4" :label="props.row.progress.message" /></div>
                        </q-td>
                      </template>
                    </q-table>
                  </q-card-section>
                  <q-space />
                  <q-card-actions align="center" class="q-pa-md">
                    <q-btn label="上一步" color="grey-6" outline @click="tab = 'create_task'" />
                    <q-btn label="下一步" color="primary" unelevated class="q-ml-md" @click="tab = 'check_result'" />
                  </q-card-actions>
                </q-card>
              </q-tab-panel>

              <!-- 面板三: 检查结果 -->
              <q-tab-panel name="check_result" class="q-pa-none">
                <q-card flat class="full-height-card bg-white">
                  <q-card-section><div class="text-h6">检查结果表</div></q-card-section>
                  <q-card-section class="q-pt-none">
                    <q-table :rows="resultsTableRows" :columns="resultsTableColumns" row-key="id" flat hide-bottom class="dark-theme-table">
                      <template v-slot:header-cell="props"><q-th :props="props">{{ props.col.label }} <q-icon name="search" size="1.2em" class="q-ml-xs" /></q-th></template>
                      <template v-slot:body-cell-result="props">
                        <q-td :props="props">
                          <q-chip dense outline :color="props.value === '合格' ? 'green-4' : 'red-4'" :text-color="props.value === '合格' ? 'green-4' : 'red-4'" :label="props.value" />
                        </q-td>
                      </template>
                    </q-table>
                  </q-card-section>
                  <q-space />
                  <q-card-actions align="center" class="q-pa-md">
                    <q-btn label="上一步" color="grey-6" outline @click="tab = 'draft_check'" />
                    <q-btn label="完成" color="primary" unelevated class="q-ml-md" @click="tab = 'create_task'" />
                  </q-card-actions>
                </q-card>
              </q-tab-panel>

            </q-tab-panels>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 创建核查任务弹窗 (保持不变) -->
    <q-dialog v-model="showCreateDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="row items-center">
          <div class="text-h6">创建核查任务</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none"><div class="row q-col-gutter-lg"><div class="col-6"><div class="text-subtitle2 q-mb-xs">任务名称</div><q-input filled dense v-model="createForm.taskName" bg-color="grey-2" /></div><div class="col-6"><div class="text-subtitle2 q-mb-xs">厂站名称</div><q-input filled dense v-model="createForm.stationName" bg-color="grey-2" /></div></div></q-card-section>
        <q-card-section class="q-pt-none bg-grey-2 q-ma-md" style="border-radius: 4px;"><div class="text-subtitle2 q-mb-sm">核查项目</div><div class="row q-col-gutter-sm"><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.baseline" label="基线核查" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.weakPassword" label="高危端口" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.bruteForce" label="漏洞扫描" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.portScan" label="端口令扫描" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.externalScan" label="违规外联" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.internalScan" label="违规内联" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.legacyProtocol" label="恶意代码告警情况" /></div></div></q-card-section>
        <q-card-section class="q-pt-none"><div class="text-subtitle2 q-mb-sm">核查范围</div><q-table :rows="scopeTableRows" :columns="scopeTableColumns" row-key="id" selection="multiple" v-model:selected="createForm.selectedScope" flat bordered hide-pagination class="scope-table"></q-table></q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn label="保存并下一步" color="primary" unelevated class="dialog-btn" @click="handleSave" />
          <q-btn label="取消" color="grey-7" flat class="dialog-btn q-ml-md" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
/* 主题样式 */
.bg-page {
  background-color: #292a2d;
}

.bg-dark-header {
  background-color: #414853; /* 一个更深的灰色作为头部背景 */
}

.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
}
.text-h6 {
  color: white;
}

/* 表格样式 (适配深色主题) */
.dark-theme-table {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.dark-theme-table :deep(thead) {
  background-color: rgba(255, 255, 255, 0.1);
}
.dark-theme-table :deep(th) {
  font-weight: 600;
}

.dark-theme-table :deep(tbody td) {
}

.dark-theme-table :deep(.q-table__control .q-select),
.dark-theme-table :deep(.q-table__control .q-btn) {
  color: white;
}
.status-chip {
  min-width: 60px;
  justify-content: center;
}
.action-btn {
  color: #4db6ac; /* 浅青色 */
  margin-right: 8px;
  font-weight: 500;
}
.action-btn.text-negative {
  color: #e57373 !important; /* 浅红色 */
}


/* 弹窗样式 (保持不变) */
.dialog-card {
  width: 900px;
  max-width: 90vw;
  /* 弹窗内为浅色主题 */
  color: #333;
  background: white;
}
.dialog-card .text-h6, .dialog-card .text-subtitle2 {
  color: #333;
}
.dialog-btn {
  width: 140px;
}
.scope-table :deep(thead) {
  background-color: #f0f2f5;
}
</style>
