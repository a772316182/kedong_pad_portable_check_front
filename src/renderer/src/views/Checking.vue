<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();

const isFilterDrawerOpen = ref(false);

const filters = reactive({
  deviceType: 'all',
  checkStatus: 'all',
  securityZone: 'all',
  probeStatus: 'all',
});

const filterOptions = ref([
  {
    title: '设备类型',
    key: 'deviceType',
    options: [
      { id: 'all', label: '全部类型' },
      { id: 'unknown', label: '未知' },
      { id: 'host', label: '主机设备' },
      { id: 'network', label: '网络设备' },
      { id: 'security', label: '安防设备' },
      { id: 'isolation', label: '间隔层设备' },
      { id: 'suspected_isolation', label: '疑似间隔层设备' },
      { id: 'other', label: '其他' },
    ]
  },
  {
    title: '核查状态',
    key: 'checkStatus',
    options: [
      { id: 'all', label: '全部状态' },
      { id: 'passed', label: '通过' },
      { id: 'not_passed', label: '未通过' },
      { id: 'not_checked', label: '未核查' },
      { id: 'to_confirm', label: '待确认' },
    ]
  },
  {
    title: '安全分区',
    key: 'securityZone',
    options: [
      { id: 'all', label: '全部' },
      { id: 'unknown', label: '未知' },
      { id: 'zone1', label: '安全一区' },
      { id: 'zone2', label: '安全二区' },
    ]
  },
  {
    title: '资产探查状态',
    key: 'probeStatus',
    options: [
      { id: 'all', label: '全部' },
      { id: 'alive', label: '存活' },
      { id: 'not_alive', label: '不存活' },
    ]
  },
  {
    title: '高危端口',
    key: 'probeStatus',
    options: [
      { id: 'all', label: '全部' },
      { id: 'alive', label: '存活' },
      { id: 'not_alive', 'label': '不存活' },
    ]
  }
]);

const resetFilters = () => {
  for (const key in filters) {
    filters[key] = 'all';
  }
};

const applyFilters = () => {
  console.log('应用筛选:', JSON.parse(JSON.stringify(filters)));
  isFilterDrawerOpen.value = false;
};

// --- Dialogs & State Control ---
const dialogs = reactive({
  assetProbe: false,
  loginlessCheck: false,
  protocolSelection: false,
  httpsConfig: false,
  sshInfo: false,
  loginCheck: false,
  mentionCheck: false,
  // START: 恢复报告导出流程的正确弹窗状态
  exportReport: false,
  assetDetail: false, // 纯展示的详情弹窗
  editAsset: false,   // 可编辑的弹窗
  // END: 恢复报告导出流程的正确弹窗状态
});

// START: 修改后的报告导出流程数据和方法
// ===============================================
const activeAssetForDialogs = ref(null); // 用于展示详情
const editableAssetData = ref(null); // 用于编辑，与原数据隔离

const deviceTypeOptions = ['主机设备', '网络设备', '安全设备', '其他'];
const securityZoneOptions = ['安全I区', '安全II区', '安全III区', '未知'];

// 1. 打开“导出报告”弹窗
const openExportReportDialog = () => {
  dialogs.exportReport = true;
};

// 2. 处理点击“导出全部”，打开“资产详情”弹窗
const handleExportAll = () => {
  activeAssetForDialogs.value = {
    name: 'sf-server-01',
    type: '主机设备',
    highRiskPort: '无',
    securityZone: '安全II区',
    networks: [
      { id: 1, ip: '10.105.71.97', mac: '6c:92:bf:64:67:e0' },
      { id: 2, ip: '10.51.16.79', mac: '9c:c2:c4:6d:2c:19' },
      { id: 3, ip: '172.16.10.1', mac: '02:42:bf:59:53:85' },
    ],
    osName: '银河OS 6.0.100',
    osVersion: '6.0.100',
    vendor: 'Linux',
    model: '6.0.80',
  };

  dialogs.exportReport = false; // 关闭当前弹窗
  dialogs.assetDetail = true;  // 打开资产详情弹窗
};

// 3. 从“资产详情”打开“编辑资产”弹窗
const openEditAssetDialog = () => {
  // 深拷贝一份数据用于编辑，避免直接修改原数据
  editableAssetData.value = JSON.parse(JSON.stringify(activeAssetForDialogs.value));
  dialogs.assetDetail = false; // 关闭详情弹窗
  dialogs.editAsset = true;   // 打开编辑弹窗
};

// 4. 在编辑弹窗中新增网卡
const addNewNetworkCard = () => {
  if (editableAssetData.value && editableAssetData.value.networks) {
    editableAssetData.value.networks.push({ id: Date.now(), ip: '', mac: '' });
  }
};

// 5. 在编辑弹窗中移除网卡
const removeNetworkCard = (index) => {
  if (editableAssetData.value && editableAssetData.value.networks) {
    editableAssetData.value.networks.splice(index, 1);
  }
};

// 6. 保存资产编辑
const saveAssetChanges = () => {
  // 实际应用中这里会调用API保存 `editableAssetData.value` 的数据
  console.log('保存资产:', JSON.parse(JSON.stringify(editableAssetData.value)));

  // 假设保存成功，将修改后的数据同步回原数据
  activeAssetForDialogs.value = JSON.parse(JSON.stringify(editableAssetData.value));

  dialogs.editAsset = false; // 关闭编辑弹窗

  $q.notify({
    type: 'positive',
    message: '保存成功',
    position: 'top',
    timeout: 2000,
  });
};
// ===============================================
// END: 修改后的报告导出流程数据和方法

// --- Data Models ---
const assets = ref([
  { id: 1, name: '10.105.71.240', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 2, name: '10.105.71.242', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 3, name: '10.105.71.244', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 4, name: '10.105.71.243', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 5, name: '10.105.71.254', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 6, name: '10.105.71.245', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 7, name: '10.105.71.234', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 8, name: '10.105.71.249', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
]);

const columns = [
  { name: 'name', label: '资产名称', field: 'name', align: 'left' },
  { name: 'type', label: '设备类型', field: 'type', align: 'left' },
  { name: 'feature', label: '资产特征识别', field: 'feature', align: 'left' },
  { name: 'port', label: '开启高危端口', field: 'port', align: 'left' },
  { name: 'status', label: '资产状态', field: 'status', align: 'left' },
  { name: 'zone', label: '安全分区', field: 'zone', align: 'left' },
  { name: 'actions', label: '查看详情', align: 'center' },
];

const assetProbeConfig = ref({ ip: '10.105.71.233', subnet: '255.255.255.0', gateway: '', zone: '安全区', rate: '高', range: '' });
const loginlessCheckConfig = ref({ ip: '10.105.71.233', subnet: '255.255.255.0', gateway: '', highRiskScan: true, rate: '高', range: '' });
const loginCheckCredentials = ref([
  { id: 1, ip: '10.105.71.97', port: '', username: '', password: '', authUser: '', authPass: '' }
]);
const httpsConfig = ref({ ip: '10.105.71.233', subnet: '255.255.255.0', gateway: '', port: '28081' });
const sshInfo = ref({ ip: '10.105.71.233', subnet: '255.255.255.0', gateway: '10.105.71.1' });
const deviceType = ref('主机设备');

const toggleSelection = (row) => { row.selected = !row.selected; };
const addNewCredential = () => {
  loginCheckCredentials.value.push({ id: Date.now(), ip: '', port: '', username: '', password: '', authUser: '', authPass: '' });
};

const selectProtocol = (protocol) => {
  dialogs.protocolSelection = false;
  if (protocol === 'https') {
    dialogs.httpsConfig = true;
  } else if (protocol === 'ssh') {
    dialogs.loginCheck = true;
  }
};

const confirmLoginCredentials = () => {
  dialogs.loginCheck = false;
  dialogs.sshInfo = true;
};

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- Top Bar -->
    <div class="top-bar row items-center justify-between q-px-md">
      <span>2025-06-20 15:50:24</span>
      <div>
        <q-btn flat dense no-caps class="header-action-btn" icon="o" label="切换"/>
        <q-btn flat dense no-caps class="header-action-btn" icon="o" label="筛选" @click="isFilterDrawerOpen = true"/>
        <q-btn flat dense no-caps class="header-action-btn" icon="o" label="查看统计图"/>
        <span class="q-ml-md">当前电量: 14% <q-icon name="o"/></span>
      </div>
    </div>
    <!-- “正在核查 标题” -->
    <div class="main-header row items-center q-px-md">
      <div>
        <q-btn class="back-button" unelevated label="上一步" @click="navigateTo('/executeCheck')" />
      </div>
      <q-space />
      <div class="text-h4 text-weight-bolder">正在核查</div>
      <q-space />
      <div class="row items-center no-wrap">
        <span class="text-body1">连接方式: 网络连接</span>
        <q-btn color="primary" label="切换连接" unelevated class="q-ml-md"/>
      </div>
    </div>

    <q-page class="main-content-area">
      <!-- Info & Main Actions Panel -->
      <q-card class="info-panel q-pa-sm q-mb-md" flat>
        <div class="row items-center justify-between">
          <div>
            <span class="text-body1">当前站点：省调1</span>
            <span class="text-body1 q-ml-lg">资产总数：114</span>
          </div>
          <div class="row items-center q-gutter-x-sm">
            <q-btn class="main-action-btn" unelevated label="资产导出"/>
            <q-btn class="main-action-btn" unelevated label="资产导入"/>
          </div>
        </div>
      </q-card>

      <!-- Sub Actions & Table -->
      <q-card class="table-container" flat>
        <div class="sub-actions-bar row items-center q-gutter-x-sm q-pa-md">
          <q-btn class="sub-action-btn" unelevated label="资产探查" @click="dialogs.assetProbe = true"/>
          <q-btn class="sub-action-btn" unelevated label="免登录检查" @click="dialogs.loginlessCheck = true"/>
          <q-btn class="sub-action-btn" unelevated label="登录检查" @click="dialogs.protocolSelection = true"/>
          <q-btn class="sub-action-btn" unelevated label="登录异常"/>
          <q-btn class="main-action-btn" unelevated label="查看拓扑"/>
          <q-btn class="main-action-btn" unelevated label="报告导出" @click="openExportReportDialog"/>
        </div>
        <!-- Assets Table -->
        <q-table :rows="assets" :columns="columns" row-key="id" flat hide-bottom class="assets-table">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn :color="props.row.selected ? 'grey-6' : 'primary'" :label="props.row.selected ? '取消选定' : '选定'" dense unelevated @click="toggleSelection(props.row)"/>
              <q-btn color="teal" label="资产详情" dense unelevated/>
              <q-btn color="teal" label="核查记录" class="sub-action-btn" unelevated @click="dialogs.mentionCheck=true;"/>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </q-page>

    <q-drawer v-model="isFilterDrawerOpen" side="right" bordered :width="350" class="filter-drawer">
      <div class="column full-height">
        <div class="q-pa-md filter-drawer-header"><div class="text-h6">筛选</div></div>
        <q-separator />
        <q-scroll-area class="col">
          <q-list class="q-pa-md">
            <q-item class="q-pa-none column items-start q-mb-md">
              <q-item-label header class="text-weight-bold">设备IP查询</q-item-label>
              <q-input v-model="filters.ipAddress" outlined dense clearable class="full-width" placeholder="请输入IP地址或关键词">
                <template v-slot:prepend><q-icon name="search" /></template>
              </q-input>
            </q-item>
            <q-separator class="q-mb-lg" />
            <q-item v-for="category in filterOptions" :key="category.key" class="q-pa-none column items-start">
              <q-item-label header class="text-weight-bold">{{ category.title }}</q-item-label>
              <div class="q-gutter-sm q-mb-lg">
                <q-btn v-for="option in category.options" :key="option.id" unelevated dense no-caps :class="{ 'active-filter': filters[category.key] === option.id }" class="filter-option-btn" :label="option.label" @click="filters[category.key] = option.id" />
              </div>
            </q-item>
          </q-list>
        </q-scroll-area>
        <q-separator />
        <div class="q-pa-md row q-gutter-md">
          <q-btn label="重置" color="grey-6" outline class="col" @click="resetFilters" />
          <q-btn label="筛选" color="primary" unelevated class="col" @click="applyFilters" />
        </div>
      </div>
    </q-drawer>

    <!-- === DIALOGS === -->
    <q-dialog v-model="dialogs.assetProbe"><q-card class="form-dialog"><q-card-section class="row items-center"><div class="text-h6">资产探查配置</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section><q-card-section class="q-pt-none"><div class="form-row"><span class="form-label">本机IP地址:</span><div>{{ assetProbeConfig.ip }}</div><q-space/><q-btn size="sm" color="primary" outline label="历史记录"/></div><div class="form-row"><span class="form-label">子网掩码:</span><div>{{ assetProbeConfig.subnet }}</div></div><div class="form-row"><span class="form-label">网关:</span><q-input dense outlined v-model="assetProbeConfig.gateway" placeholder="请输入网关"/></div><div class="form-row"><span class="form-label">安全分区:</span><q-radio v-model="assetProbeConfig.zone" val="安全区" label="安全区"/><q-radio v-model="assetProbeConfig.zone" val="安全II区" label="安全II区"/></div><div class="form-row"><span class="form-label">资产探查速率:</span><q-radio v-model="assetProbeConfig.rate" val="高" label="高"/><q-radio v-model="assetProbeConfig.rate" val="中" label="中"/><q-radio v-model="assetProbeConfig.rate" val="低" label="低"/></div><div class="form-row"><span class="form-label">起止范围:</span><q-toggle v-model="assetProbeConfig.rangeEnabled" label="启用"/></div><div class="form-row" v-if="assetProbeConfig.rangeEnabled"><span class="form-label">IP范围:</span><q-input class="col" type="textarea" outlined v-model="assetProbeConfig.range" hint="多个分段: 192.168.1.1-192.168.1.254"/></div></q-card-section><q-card-actions align="center" class="q-pa-md"><q-btn label="确定" color="teal" unelevated style="width:100px"/></q-card-actions></q-card></q-dialog>
    <q-dialog v-model="dialogs.loginlessCheck"><q-card class="form-dialog"><q-card-section class="row items-center"><div class="text-h6">免登录检查配置</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section><q-card-section class="q-pt-none"><div class="form-row"><span class="form-label">本机IP地址:</span><div>{{ loginlessCheckConfig.ip }}</div><q-space/><q-btn size="sm" color="primary" outline label="历史记录"/></div><div class="form-row"><span class="form-label">子网掩码:</span><div>{{ loginlessCheckConfig.subnet }}</div></div><div class="form-row"><span class="form-label">网关:</span><q-input dense outlined v-model="loginlessCheckConfig.gateway" placeholder="请输入网关"/></div><div class="form-row"><span class="form-label">高危端口扫描:</span><q-toggle v-model="loginlessCheckConfig.highRiskScan" color="teal"/></div><div class="form-row"><span class="form-label">端口号TCP:</span><div class="text-grey-7 text-caption">21,23,25,109,110,135,139,445,3389</div></div><div class="form-row"><span class="form-label">端口号UDP:</span><div class="text-grey-7 text-caption">67,69,137,138,5353</div></div><div class="form-row"><span class="form-label">指纹特征采集:</span><q-toggle v-model="loginlessCheckConfig.fingerprint" color="teal"/></div><div class="form-row"><span class="form-label">免登录检查速率:</span><q-radio v-model="loginlessCheckConfig.rate" val="高" label="高"/><q-radio v-model="loginlessCheckConfig.rate" val="中" label="中"/><q-radio v-model="loginlessCheckConfig.rate" val="低" label="低"/></div><div class="form-row"><span class="form-label">起止范围:</span><q-toggle v-model="loginlessCheckConfig.rangeEnabled" label="启用"/></div></q-card-section><q-card-actions align="center" class="q-pa-md"><q-btn label="确定" color="teal" unelevated style="width:100px"/></q-card-actions></q-card></q-dialog>
    <q-dialog v-model="dialogs.loginCheck" full-width><q-card class="login-check-dialog"><q-card-section class="row items-center"><div class="text-h6">登录账号与密码配置</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section><q-card-section><div class="row items-center q-gutter-x-md q-mb-md"><q-btn label="批量填充" color="primary" outline/><q-btn label="添加" color="primary" @click="addNewCredential"/><q-select dense outlined v-model="deviceType" :options="['主机设备', '网络设备']" label="设备类型" style="width: 200px" /></div><div class="cred-table-header row"><div class="col-2">资产IP</div><div class="col">端口号</div><div class="col">登录账号</div><div class="col">登录密码</div><div class="col">授权账号</div><div class="col">授权密码</div><div class="col-1">操作</div></div><div v-for="(cred, index) in loginCheckCredentials" :key="cred.id" class="cred-table-row row"><div class="col-2">{{ cred.ip }}</div><div class="col"><q-input dense outlined v-model="cred.port" placeholder="请输入..."/></div><div class="col"><q-input dense outlined v-model="cred.username" placeholder="请输入..."/></div><div class="col"><q-input dense outlined type="password" v-model="cred.password" placeholder="请输入..."/></div><div class="col"><q-input dense outlined v-model="cred.authUser" placeholder="请输入..."/></div><div class="col"><q-input dense outlined type="password" v-model="cred.authPass" placeholder="请输入..."/></div><div class="col-1 text-center"><q-btn flat round color="negative" icon="delete" @click="loginCheckCredentials.splice(index, 1)"/></div></div></q-card-section><q-card-actions align="center" class="q-pa-md"><q-btn label="确定" color="teal" unelevated style="width:100px" @click="confirmLoginCredentials"/></q-card-actions></q-card></q-dialog>
    <q-dialog v-model="dialogs.protocolSelection"><q-card style="width: 500px"><q-card-section class="row items-center"><div class="text-h6">选定网络协议</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section><q-card-section class="text-center"><div class="text-grey-8">已选定：【网络模式】</div><p>请结合待查资产的特征识别结果，选定合适的网络协议开展后续核查。</p><div class="row q-gutter-xl justify-center q-py-md"><q-card class="protocol-card" flat bordered clickable @click="selectProtocol('ssh')"><q-card-section class="text-center"><q-icon name="o" size="4em" color="blue-8"/><div class="text-subtitle1 text-weight-medium q-mt-sm">ssh协议</div></q-card-section></q-card><q-card class="protocol-card" flat bordered clickable @click="selectProtocol('https')"><q-card-section class="text-center"><q-icon name="o" size="4em" color="green-8"/><div class="text-subtitle1 text-weight-medium q-mt-sm">https协议</div></q-card-section></q-card></div></q-card-section></q-card></q-dialog>
    <q-dialog v-model="dialogs.httpsConfig"><q-card class="form-dialog" style="width: 600px"><q-card-section class="row items-center"><div class="text-h6">Https连接配置</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section><q-card-section class="q-pt-none"><div class="form-row"><span class="form-label">本机IP地址:</span><div>{{ httpsConfig.ip }}</div><q-space/><q-btn size="sm" color="primary" outline label="历史记录"/></div><div class="form-row"><span class="form-label">子网掩码:</span><div>{{ httpsConfig.subnet }}</div></div><div class="form-row"><span class="form-label">网关:</span><q-input dense outlined v-model="httpsConfig.gateway"/></div><div class="form-row"><span class="form-label">Https端口:</span><q-input dense outlined v-model="httpsConfig.port"/></div><div class="q-mt-md text-caption text-grey-7"><q-icon name="info" /> 本机Https服务开启后，待核查设备上通过访问 https://10.105.71.233:28081 下载核查脚本</div></q-card-section><q-card-actions align="center" class="q-gutter-x-lg q-pa-md"><q-btn label="关闭" color="grey" style="width: 150px"/><q-btn label="开启HTTPS连接" color="teal" unelevated style="width: 150px" @click="navigateTo('/logincheckinprogress')"/></q-card-actions></q-card></q-dialog>
    <q-dialog v-model="dialogs.sshInfo"><q-card class="form-dialog" style="width: 500px"><q-card-section class="row items-center"><div class="text-h6">IP信息</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section><q-card-section class="q-pt-none"><div class="text-center text-grey-8 q-mb-md">连接方式: ssh协议</div><div class="form-row"><span class="form-label">本地IP:</span><div>{{ sshInfo.ip }}</div></div><div class="form-row"><span class="form-label">子网掩码:</span><div>{{ sshInfo.subnet }}</div></div><div class="form-row"><span class="form-label">网关:</span><q-input dense outlined v-model="sshInfo.gateway"/></div></q-card-section><q-card-actions align="center" class="q-gutter-x-lg q-pa-md"><q-btn label="上一步" color="grey" @click="dialogs.sshInfo = false; dialogs.loginCheck = true;"/><q-btn label="确定" color="teal" unelevated @click="navigateTo('/logincheckinprogress')"/></q-card-actions></q-card></q-dialog>
    <q-dialog v-model="dialogs.mentionCheck"><q-card class="form-dialog"><q-card-section class="row items-center"><div class="text-h6">提示</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section><q-card-section class="q-pt-none"><p>本设备未在最近一次核查时核查，仅支持查看历史核查记录</p></q-card-section><q-btn  label="退出" color="grey" @click="dialogs.mentionCheck = false;"padding="12px 151px"/><q-btn  label="历史记录" color="green" unelevated @click="navigateTo('/historylog')"padding="12px 151px"/></q-card></q-dialog>

    <!-- START: 新增的报告导出流程弹窗 (已恢复正确流程) -->
    <!-- =============================================== -->

    <!-- 弹窗1: 导出报告选项 -->
    <q-dialog v-model="dialogs.exportReport">
      <q-card style="width: 500px;">
        <q-card-section class="row items-center"><div class="text-h6">导出报告</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section class="row items-center justify-center q-gutter-xl q-py-xl">
          <q-card class="export-option-card" flat bordered clickable v-ripple @click="handleExportAll">
            <q-card-section class="text-center"><q-icon name="o" size="4em" color="primary"/><div class="text-subtitle1 q-mt-sm">导出全部</div></q-card-section>
          </q-card>
          <q-card class="export-option-card" flat bordered clickable v-ripple>
            <q-card-section class="text-center"><q-icon name="o" size="4em" color="primary"/><div class="text-subtitle1 q-mt-sm">导出选中</div></q-card-section>
          </q-card>
        </q-card-section>
        <q-card-section class="text-center text-caption text-grey-7 q-pt-none">* 导出的报告中不含无核查记录的资产</q-card-section>
      </q-card>
    </q-dialog>

    <!-- 弹窗2: 资产详情 (纯展示) -->
    <q-dialog v-model="dialogs.assetDetail">
      <q-card class="form-dialog" style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center"><div class="text-h6">资产详情</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-scroll-area style="height: 60vh;">
          <q-card-section v-if="activeAssetForDialogs" class="q-pt-none">
            <div class="form-row"><span class="form-label">设备名称:</span><span>{{ activeAssetForDialogs.name }}</span></div>
            <div class="form-row"><span class="form-label">设备类型:</span><span>{{ activeAssetForDialogs.type }}</span></div>
            <div class="form-row"><span class="form-label">开启高危端口:</span><span>{{ activeAssetForDialogs.highRiskPort }}</span></div>
            <div class="form-row"><span class="form-label">安全分区:</span><span>{{ activeAssetForDialogs.securityZone }}</span></div>
            <div v-for="net in activeAssetForDialogs.networks" :key="net.id">
              <div class="form-row"><span class="form-label">设备IP:</span><span>{{ net.ip }}</span></div>
              <div class="form-row"><span class="form-label">MAC地址:</span><span>{{ net.mac }}</span></div>
            </div>
            <div class="form-row"><span class="form-label">操作系统名称:</span><span>{{ activeAssetForDialogs.osName }}</span></div>
            <div class="form-row"><span class="form-label">操作系统版本:</span><span>{{ activeAssetForDialogs.osVersion }}</span></div>
            <div class="form-row"><span class="form-label">设备厂商:</span><span>{{ activeAssetForDialogs.vendor }}</span></div>
            <div class="form-row"><span class="form-label">设备型号:</span><span>{{ activeAssetForDialogs.model }}</span></div>
          </q-card-section>
        </q-scroll-area>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="关闭" color="grey" v-close-popup/>
          <q-btn unelevated label="编辑" color="primary" @click="openEditAssetDialog"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 弹窗3: 编辑资产 (完全可编辑) -->
    <q-dialog v-model="dialogs.editAsset">
      <q-card class="form-dialog" style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center"><div class="text-h6">编辑资产</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-scroll-area style="height: 60vh;">
          <q-card-section v-if="editableAssetData" class="q-pt-none">
            <div class="form-row"><span class="form-label">设备名称:</span><q-input dense outlined v-model="editableAssetData.name" class="col"/></div>
            <div class="form-row"><span class="form-label">设备类型:</span><q-select dense outlined v-model="editableAssetData.type" :options="deviceTypeOptions" class="col"/></div>
            <div class="form-row"><span class="form-label">开启高危端口:</span><q-input dense outlined v-model="editableAssetData.highRiskPort" class="col"/></div>
            <div class="form-row"><span class="form-label">安全分区:</span><q-select dense outlined v-model="editableAssetData.securityZone" :options="securityZoneOptions" class="col"/></div>
            <div v-for="(net, index) in editableAssetData.networks" :key="net.id" class="q-mb-md">
              <div class="form-row">
                <span class="form-label">设备IP:</span>
                <q-input dense outlined v-model="net.ip" class="col"/>
                <q-btn v-if="index > 0" flat round dense icon="delete" color="negative" @click="removeNetworkCard(index)" class="q-ml-sm"/>
              </div>
              <div class="form-row">
                <span class="form-label">MAC地址:</span>
                <q-input dense outlined v-model="net.mac" class="col"/>
              </div>
            </div>
            <div class="row justify-end q-mt-sm"><q-btn flat label="新增网卡" color="primary" icon="add" @click="addNewNetworkCard"/></div>
            <div class="form-row"><span class="form-label">操作系统名称:</span><q-input dense outlined v-model="editableAssetData.osName" class="col"/></div>
            <div class="form-row"><span class="form-label">操作系统版本:</span><q-input dense outlined v-model="editableAssetData.osVersion" class="col"/></div>
            <div class="form-row"><span class="form-label">设备厂商:</span><q-input dense outlined v-model="editableAssetData.vendor" class="col"/></div>
            <div class="form-row"><span class="form-label">设备型号:</span><q-input dense outlined v-model="editableAssetData.model" class="col"/></div>
          </q-card-section>
        </q-scroll-area>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn unelevated label="保存" color="teal" style="width: 120px" @click="saveAssetChanges"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =============================================== -->
    <!-- END: 新增的报告导出流程弹窗 (已恢复正确流程) -->

  </q-layout>
</template>

<style scoped>
/* Main Layout & Theme */
.page-background { background-color: #2c3a45; }
.top-bar, .main-header { color: white; padding-top: 8px; padding-bottom: 8px; }
.back-button { background-color: #00796b; color: white; border-radius: 6px; }
.header-action-btn { font-size: 0.9rem; }
.main-content-area { padding: 10px 24px 24px; position: relative; top: -8px; }
.info-panel { background-color: #3d4a58; color: #e0e0e0; border-radius: 8px; }
.table-container { border-radius: 8px; overflow: hidden; }

/* Action Buttons */
.main-action-btn, .sub-action-btn {
  background-color: #00796b;
  color: white;
  font-weight: 500;
}
.sub-actions-bar { background-color: #eef1f3; }

/* Table Style */
.assets-table { border-top: 1px solid #e0e0e0; }
:deep(.assets-table thead tr) { background-color: #f5f5f5; }
:deep(.assets-table th) { font-weight: bold; color: #333; }
:deep(.assets-table tbody tr:nth-child(even)) { background-color: #f9f9f9; }

/* Dialog Styles */
.form-dialog { width: 700px; max-width: 90vw; }
.form-row { display: flex; align-items: center; margin-bottom: 16px; min-height: 40px; }
.form-label { width: 150px; font-weight: 500; text-align: right; padding-right: 16px; flex-shrink: 0;}
.form-row span:not(.form-label) {
  flex-grow: 1;
}

.protocol-card {
  width: 150px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.protocol-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.login-check-dialog { min-width: 80vw; }
.cred-table-header, .cred-table-row {
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 8px;
}
.cred-table-header { font-weight: bold; background-color: #f5f5f5; border-radius: 4px; }
.cred-table-row { border-bottom: 1px solid #eee; }

.filter-drawer-header {
  border-bottom: 1px solid #e0e0e0;
}

.filter-option-btn {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 4px 12px;
}

.active-filter {
  background-color: var(--q-primary) !important;
  color: white !important;
  border-color: var(--q-primary) !important;
}

/* START: 新增的导出选项卡片样式 */
.export-option-card {
  width: 180px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.export-option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
/* END: 新增的导出选项卡片样式 */
</style>
