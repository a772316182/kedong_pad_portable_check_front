<script setup>
import { ref, reactive } from 'vue'
import router from "../../../router";

// --- 响应式状态 ---

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}
// 控制顶部页签的当前选中项
const tab = ref('create_task')

// --- “任务列表”视图的数据 (View 1) ---
const showCreateDialog = ref(false)
const createForm = reactive({
  taskName: '',
  stationName: '',
  checkItems: {
    baseline: false, weakPassword: true, bruteForce: false, portScan: true,
    externalScan: false, internalScan: false, legacyProtocol: false,
  },
  checkScope: {
    '区A网 192.11.12.11-33': true, '区A网 192.11.12.31-33': false, '区A网 192.11.12.11-33_2': false,
    '区B网 192.11.12.11-33': false, '区B网 192.11.12.31-33': false, '区B网 192.11.12.11-33_2': false,
    '区C网 192.11.12.11-33': false, '区D网 192.11.12.31-33': false,
  }
});
const taskTableColumns = [
  { name: 'id', label: '编号', align: 'left', field: 'id', sortable: true },
  { name: 'name', label: '任务名称', align: 'left', field: 'name', sortable: true },
  { name: 'time', label: '创建时间', align: 'left', field: 'time', sortable: true },
  { name: 'items', label: '核查项', align: 'left', field: 'items' },
  { name: 'status', label: '任务状态', align: 'center', field: 'status' },
  { name: 'actions', label: '操作', align: 'left', field: 'actions' }
];
const taskTableRows = reactive([
  { id: 1, name: '通知单1', time: '2021-01-01 13:00:00', items: ['基线核查', '高危端口', '端口令扫描', '漏洞扫描'], status: '进行中' },
  { id: 2, name: '通知单2', time: '2021-01-01 00:12:00', items: ['违规外联'], status: '已完成' },
  { id: 3, name: '通知单3', time: '2026-01-01 00:00:00', items: ['基线核查', '高危端口', '端口令扫描', '漏洞扫描'], status: '已完成' },
]);
const taskPagination = ref({ rowsPerPage: 10 })

// --- “基础检查”视图的数据 (View 2) ---
const zoneSelection = reactive({
  zoneB: { main: false, children: { '192.168.11.11 - 192.168.11.12': false, '192.168.11.13 - 192.168.11.14': false }},
  zoneA: { main: true, children: { '10.0.0.1 - 10.0.0.2': false, '10.0.0.3 - 10.0.0.4': false }}
});
const checkTableColumns = [
  { name: 'id', label: '编号', field: 'id' }, { name: 'deviceName', label: '设备名称', field: 'deviceName' },
  { name: 'network', label: '所属网段', field: 'network' }, { name: 'deviceType', label: '设备类型', field: 'deviceType' },
  { name: 'ip', label: '设备IP', field: 'ip' }, { name: 'mac', label: 'MAC地址', field: 'mac' },
  { name: 'progress', label: '核查进度', field: 'progress' }
];
const checkTableRows = reactive([
  { id: 1, deviceName: '服务器-A01', network: '生产网段', deviceType: '服务器', ip: '192.168.1.101', mac: '00:1A:C2:7B:00:47', progress: { status: 'in_progress', value: 75 } },
  { id: 2, deviceName: '交换机-C12', network: '办公网段', deviceType: '网络设备', ip: '10.0.0.12', mac: '00:1B:44:11:3A:B7', progress: { status: 'completed' } },
  { id: 3, deviceName: '工作站-W22', network: '研发网段', deviceType: '终端设备', ip: '172.16.8.22', mac: '08:00:27:BE:36:FA', progress: { status: 'not_started' } },
  { id: 4, deviceName: '工作站-W23', network: '研发网段', deviceType: '终端设备', ip: '172.16.8.23', mac: '08:09:27:BE:36:FB', progress: { status: 'error', message: '网络不通' } },
]);
const checkTableSelection = ref([]);

// --- “检查结果”视图的数据 (NEW - View 3) ---
const resultsTableColumns = [
  { name: 'id', label: '编号', field: 'id', align: 'left', sortable: true },
  { name: 'deviceName', label: '设备名称', field: 'deviceName', align: 'left', sortable: true },
  { name: 'deviceType', label: '设备类型', field: 'deviceType', align: 'left', sortable: true },
  { name: 'ip1', label: '设备IP1', field: 'ip1', align: 'left', sortable: true },
  { name: 'ip2', label: '设备IP2', field: 'ip2', align: 'left', sortable: true },
  { name: 'baseline', label: '基线核查', field: 'baseline', align: 'center', sortable: true },
  { name: 'vulnScan', label: '漏洞扫描', field: 'vulnScan', align: 'center', sortable: true },
  { name: 'highRiskPort', label: '高危端口', field: 'highRiskPort', align: 'center', sortable: true },
  { name: 'weakPass', label: '弱口令扫描', field: 'weakPass', align: 'center', sortable: true },
  { name: 'illegalOutreach', label: '违规外联', field: 'illegalOutreach', align: 'center', sortable: true },
  { name: 'illegalDevice', label: '违规外设', field: 'illegalDevice', align: 'center', sortable: true },
  { name: 'malware', label: '恶意代码配置', field: 'malware', align: 'center', sortable: true },
  { name: 'networkConfig', label: '网络规划配置', field: 'networkConfig', align: 'center', sortable: true }
];
const resultsTableRows = reactive([
  { id: 1, deviceName: '核心数据库服务器', deviceType: '数据库', ip1: '192.168.1.101', ip2: '10.0.0.101', baseline: '合格', vulnScan: '不合格', highRiskPort: '不合格', weakPass: '合格', illegalOutreach: '合格', illegalDevice: '合格', malware: '不合格', networkConfig: '合格' },
  { id: 2, deviceName: 'Web应用服务器', deviceType: '应用服务器', ip1: '192.168.1.102', ip2: '10.0.0.102', baseline: '不合格', vulnScan: '不合格', highRiskPort: '合格', weakPass: '不合格', illegalOutreach: '合格', illegalDevice: '合格', malware: '不合格', networkConfig: '合格' },
  { id: 3, deviceName: '文件存储服务器', deviceType: '存储设备', ip1: '192.168.1.103', ip2: '10.0.0.103', baseline: '合格', vulnScan: '合格', highRiskPort: '不合格', weakPass: '不合格', illegalOutreach: '不合格', illegalDevice: '不合格', malware: '不合格', networkConfig: '不合格' },
  { id: 4, deviceName: '防火墙网关', deviceType: '网络安全', ip1: '192.168.1.1', ip2: '10.0.0.1', baseline: '合格', vulnScan: '合格', highRiskPort: '合格', weakPass: '合格', illegalOutreach: '合格', illegalDevice: '合格', malware: '合格', networkConfig: '未核查' },
  { id: 5, deviceName: '开发测试服务器', deviceType: '虚拟化', ip1: '192.168.1.201', ip2: '10.0.0.201', baseline: '不合格', vulnScan: '不合格', highRiskPort: '不合格', weakPass: '不合格', illegalOutreach: '不合格', illegalDevice: '不合格', malware: '不合格', networkConfig: '不合格' },
  { id: 6, deviceName: '邮件服务器', deviceType: '通信服务', ip1: '192.168.1.15', ip2: '10.0.0.15', baseline: '合格', vulnScan: '不合格', highRiskPort: '合格', weakPass: '合格', illegalOutreach: '合格', illegalDevice: '合格', malware: '合格', networkConfig: '合格' }
]);

// --- 方法 ---
function openCreateDialog() { showCreateDialog.value = true; }
function handleSave() {
  console.log('保存的数据:', createForm);
  showCreateDialog.value = false;
}

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-page">
    <q-header elevated class="bg-dark-header" height-hint="64">
      <q-toolbar>
        <q-breadcrumbs class="text-white">
          <template v-slot:separator><q-icon size="1.2em" name="chevron_right" /></template>
          <div class="col-auto"><q-btn color="primary" unelevated icon="home" label="返回" @click="navigateTo('/factorysafecheck')" /></div>
          <div class="col"><div class="text-h6">任务列表</div></div>
        </q-breadcrumbs>
        <q-space />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-lg">
        <div class="column no-wrap" style="height: 100%;">
          <div class="col-auto">
            <q-tabs v-model="tab" dense align="left" class="text-grey-6" active-color="white" indicator-color="white" no-caps>
              <q-tab name="create_task" icon="edit_note" label="创建任务" />
              <q-tab name="draft_check" icon="drafts" label="基础检查" />
              <q-tab name="check_result" icon="checklist" label="检查结果" />
            </q-tabs>
            <q-separator />
          </div>

          <div class="col q-pt-md">
            <q-tab-panels v-model="tab" animated class="bg-transparent full-height">

              <!-- 面板一: 任务列表 -->
              <q-tab-panel name="create_task" class="q-pa-none">
                <q-card flat bordered class="full-height">
                  <q-card-section>
                    <div class="row items-center no-wrap">
                      <div class="col"><div class="text-h6">任务列表</div></div>
                      <div class="col-auto"><q-btn color="primary" unelevated icon="add" label="创建核查任务" @click="openCreateDialog" /></div>
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <q-table :rows="taskTableRows" :columns="taskTableColumns" row-key="id" flat :pagination="taskPagination" class="custom-table">
                      <template v-slot:body-cell-items="props"><q-td :props="props"><q-chip v-for="item in props.value" :key="item" dense outline color="primary" :label="item" class="q-mr-xs"/></q-td></template>
                      <template v-slot:body-cell-status="props"><q-td :props="props"><q-chip :color="props.value === '进行中' ? 'grey-5' : 'green-5'" text-color="white" dense :label="props.value" class="status-chip"/></q-td></template>
                      <template v-slot:body-cell-actions="props"><q-td :props="props"><q-btn flat dense no-caps label="查看" class="action-btn" /><q-btn v-if="props.row.status === '进行中'" flat dense no-caps label="暂停" class="action-btn" /><q-btn flat dense no-caps label="下载" class="action-btn" /><q-btn flat dense no-caps label="删除" class="action-btn text-negative" /></q-td></template>
                    </q-table>
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <!-- 面板二: 基础检查 -->
              <q-tab-panel name="draft_check" class="q-pa-none">
                <div class="row q-col-gutter-md full-height">
                  <div class="col-12 col-md-3 bg-dark-header"><q-card flat class="full-height"><q-list dense><q-item tag="label" v-ripple><q-item-section avatar><q-checkbox color="theme-primary" dense v-model="zoneSelection.zoneB.main" /></q-item-section><q-item-section><q-item-label class="text-white">全选 B区</q-item-label></q-item-section></q-item><q-list dense class="q-pl-lg"><q-item v-for="(value, key) in zoneSelection.zoneB.children" :key="key" tag="label" v-ripple><q-item-section avatar><q-checkbox color="theme-primary" dense v-model="zoneSelection.zoneB.children[key]" /></q-item-section><q-item-section><q-item-label class="text-white">{{ key }}</q-item-label></q-item-section></q-item></q-list><q-separator spaced dark /><q-item tag="label" v-ripple><q-item-section avatar><q-checkbox color="theme-primary" dense v-model="zoneSelection.zoneA.main" /></q-item-section><q-item-section><q-item-label class="text-white">全选 A区</q-item-label></q-item-section></q-item><q-list dense class="q-pl-lg"><q-item v-for="(value, key) in zoneSelection.zoneA.children" :key="key" tag="label" v-ripple><q-item-section avatar><q-checkbox color="theme-primary" dense v-model="zoneSelection.zoneA.children[key]" /></q-item-section><q-item-section><q-item-label class="text-white">{{ key }}</q-item-label></q-item-section></q-item></q-list></q-list></q-card></div>
                  <div class="col-12 col-md-9"><q-card flat class="full-height"><q-card-section class="row items-center q-pb-none"><div class="text-h6">基础检查表</div><q-space /><q-btn unelevated color="theme-primary" label="批量检查" /><q-btn unelevated color="theme-orange" label="取消检查" class="q-ml-sm" /></q-card-section><q-card-section><q-table :rows="checkTableRows" :columns="checkTableColumns" row-key="id" selection="multiple" v-model:selected="checkTableSelection" flat class="full-width-table" hide-bottom><template v-slot:body-cell-progress="props"><q-td :props="props" class="progress-cell"><div v-if="props.row.progress.status === 'in_progress'" class="progress-container"><q-linear-progress :value="props.row.progress.value / 100" color="theme-primary" class="q-mr-sm" /><span class="text-grey-7">{{ props.row.progress.value }}%</span></div><div v-else-if="props.row.progress.status === 'completed'" class="text-positive text-weight-medium">已完成</div><div v-else-if="props.row.progress.status === 'not_started'" class="text-grey-6">未开始</div><div v-else-if="props.row.progress.status === 'error'"><q-badge color="negative">{{ props.row.progress.message }}</q-badge></div></q-td></template></q-table></q-card-section><q-separator /><q-card-section class="row items-center"><div class="text-grey-7">第 1-4 条, 共 4 条</div><q-space /><q-btn unelevated label="上一步" color="grey-5" text-color="black" @click="tab = 'create_task'" /><q-btn unelevated label="下一步" color="grey-5" text-color="black" class="q-ml-sm" @click="tab = 'check_result'" /></q-card-section></q-card></div>
                </div>
              </q-tab-panel>

              <!-- 面板三: 检查结果 (NEW) -->
              <q-tab-panel name="check_result" class="q-pa-none">
                <div class="column full-height">
                  <!-- Stepper -->
                  <!-- Results Card -->
                  <div class="col">
                    <q-card flat bordered class="full-height results-card">
                      <q-card-section><div class="text-h6">检查结果表</div></q-card-section>
                      <q-card-section class="q-pt-none">
                        <q-table class="results-table" :rows="resultsTableRows" :columns="resultsTableColumns" row-key="id" flat>
                          <template v-for="col in ['baseline', 'vulnScan', 'highRiskPort', 'weakPass', 'illegalOutreach', 'illegalDevice', 'malware', 'networkConfig']" :key="col" v-slot:[`body-cell-${col}`]="props">
                            <q-td :props="props">
                              <q-chip dense outline
                                      :class="{
                                                    'result-chip-pass': props.value === '合格',
                                                    'result-chip-fail': props.value === '不合格',
                                                    'result-chip-unknown': props.value === '未核查'
                                                }"
                                      :label="props.value"
                              />
                            </q-td>
                          </template>
                        </q-table>
                      </q-card-section>
                      <q-space />
                      <q-card-actions align="center" class="q-pa-md">
                        <q-btn unelevated color="theme-primary" label="上一步" @click="tab = 'draft_check'" />
                        <q-btn unelevated color="theme-primary" label="完成" class="q-ml-md" @click="tab = 'create_task'" />
                      </q-card-actions>
                    </q-card>
                  </div>
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 创建核查任务弹窗 (一直保留) -->
    <q-dialog v-model="showCreateDialog" persistent><q-card style="width: 700px; max-width: 80vw; color: black;" class="bg-white"><q-card-section><div class="text-h6">创建核查任务</div></q-card-section><q-card-section class="q-pt-none"><div class="row q-col-gutter-lg"><div class="col-6"><div class="text-subtitle2 q-mb-xs">任务名称</div><q-input filled dense v-model="createForm.taskName" /></div><div class="col-6"><div class="text-subtitle2 q-mb-xs">厂站名称</div><q-input filled dense v-model="createForm.stationName" /></div></div></q-card-section><q-card-section class="q-pt-none"><div class="text-subtitle2 q-mb-sm">核查项目</div><div class="row q-col-gutter-sm"><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.baseline" label="基线核查" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.weakPassword" label="高危端口" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.bruteForce" label="漏洞扫描" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.portScan" label="端口令扫描" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.externalScan" label="违规外联" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.internalScan" label="违规内联" /></div><div class="col-4"><q-checkbox dense v-model="createForm.checkItems.legacyProtocol" label="恶意代码告警情况" /></div></div></q-card-section><q-card-section class="q-pt-none"><div class="text-subtitle2 q-mb-sm">核查范围</div><div class="row q-col-gutter-x-sm q-col-gutter-y-xs"><div v-for="(value, key) in createForm.checkScope" :key="key" class="col-12 col-xs-4 "><q-checkbox dense v-model="createForm.checkScope[key]" :label="key" /></div></div></q-card-section><q-card-actions align="right" class="bg-white q-pa-md"><q-btn label="取消" color="grey-7" flat v-close-popup /><q-btn label="保存" color="primary" unelevated @click="handleSave" /></q-card-actions></q-card></q-dialog>

  </q-layout>
</template>

<style scoped>
/* 定义颜色变量 */
:root {
  --theme-primary-color: #00897b; /* 深青色 */
  --theme-orange-color: #f57c00; /* 橙色 */
  --theme-pass-color: #4caf50; /* 合格-绿色 */
  --theme-fail-color: #f44336; /* 不合格-红色 */
  --theme-unknown-color: #9e9e9e; /* 未核查-灰色 */
}
.bg-dark-header{
  background: #414853;
}
/* 主框架样式 */
.bg-page { background-color: #292a2d; }
.custom-table { border: 1px solid #e0e0e0; }
.custom-table :deep(thead) { background-color: #fafafa; }
.custom-table :deep(th) { font-weight: 600; color: #333; }
.custom-table :deep(tbody tr:nth-of-type(even)) { background-color: #f9f9f9; }
.status-chip { min-width: 60px; justify-content: center; }
.action-btn { color: #027be3; margin-right: 8px; font-weight: 500; }
.action-btn.text-negative { color: #c10015 !important; }

/* 基础检查视图样式 */
.full-width-table :deep(thead tr) { background-color: #f5f5f5; color: black }
.full-width-table :deep(tbody tr) { color: black }
.full-width-table :deep(th) { font-weight: 600; }
.progress-cell .progress-container { display: flex; align-items: center; width: 100%; }
.progress-cell .q-linear-progress { flex-grow: 1; }
.col-12.col-md-9 .q-card.full-height { background-color: white; color: black; }
.col-12.col-md-9 .q-card.full-height .text-h6 { color: black; }

/* 检查结果视图样式 (NEW) */
.results-stepper { background-color: white; border-radius: 4px 4px 0 0; }
.step-item { display: flex; align-items: center; gap: 8px; font-size: 16px; color: #757575; }
.step-item.done { color: var(--theme-pass-color); }
.step-item.active { color: var(--theme-primary-color); font-weight: bold; }
.results-card { background-color: white; border-radius: 0 0 4px 4px; display: flex; flex-direction: column;}
.results-table :deep(thead) { background-color: #e8f5e9; } /* 浅绿色表头 */
.results-table :deep(tbody tr:nth-of-type(even)) { background-color: #f1f8e9; } /* 斑马条纹 */
.results-table :deep(th) { color: #333; font-weight: 600; }
.result-chip-pass { color: var(--theme-pass-color); border-color: var(--theme-pass-color); }
.result-chip-fail { color: var(--theme-fail-color); border-color: var(--theme-fail-color); }
.result-chip-unknown { color: var(--theme-unknown-color); border-color: var(--theme-unknown-color); }

/* 通用样式 */
.q-card { background-color: rgba(255, 255, 255, 0.05); color: white; }
.text-h6 { color: white; }
.q-card.full-height { background-color: transparent; box-shadow: none; border: 1px solid rgba(255,255,255,0.2)}

/* 按钮颜色 */
.q-btn[color="theme-primary"], .q-linear-progress[color="theme-primary"], .q-checkbox[color="theme-primary"] :deep(.q-checkbox__inner--truthy .q-checkbox__bg) {
  background-color: var(--theme-primary-color); color: var(--theme-primary-color) !important;
}
.q-btn[color="theme-orange"] { background-color: var(--theme-orange-color); color: white; }
</style>
