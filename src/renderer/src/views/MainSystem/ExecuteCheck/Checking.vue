<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import * as XLSX from 'xlsx';

const $q = useQuasar();
const router = useRouter();

// #region --- 筛选器相关状态与函数 ---
const isFilterDrawerOpen = ref(false);
const filters = reactive({
  deviceType: 'all',
  checkStatus: 'all',
  securityZone: 'all',
  probeStatus: 'all',
});
const filterOptions = ref([
  { title: '设备类型', key: 'deviceType', options: [ { id: 'all', label: '全部类型' }, { id: 'unknown', label: '未知' }, { id: 'host', label: '主机设备' }, { id: 'network', label: '网络设备' }, { id: 'security', label: '安防设备' }, { id: 'isolation', label: '间隔层设备' }, { id: 'suspected_isolation', label: '疑似间隔层设备' }, { id: 'other', label: '其他' } ] },
  { title: '核查状态', key: 'checkStatus', options: [ { id: 'all', label: '全部状态' }, { id: 'passed', label: '通过' }, { id: 'not_passed', label: '未通过' }, { id: 'not_checked', 'label': '未核查' }, { id: 'to_confirm', label: '待确认' } ] },
  { title: '安全分区', key: 'securityZone', options: [ { id: 'all', label: '全部' }, { id: 'unknown', label: '未知' }, { id: 'zone1', label: '安全一区' }, { id: 'zone2', label: '安全二区' } ] },
  { title: '资产探查状态', key: 'probeStatus', options: [ { id: 'all', label: '全部' }, { id: 'alive', label: '存活' }, { id: 'not_alive', label: '不存活' } ] },
  { title: '高危端口', key: 'probeStatus', options: [ { id: 'all', label: '全部' }, { id: 'alive', label: '存活' }, { id: 'not_alive', 'label': '不存活' } ] }
]);
const resetFilters = () => { for (const key in filters) { filters[key] = 'all'; } };
const applyFilters = () => {
  console.log('应用筛选:', JSON.parse(JSON.stringify(filters)));
  isFilterDrawerOpen.value = false;
};
// #endregion

// #region --- 弹窗状态管理 ---
const dialogs = reactive({
  assetProbe: false,
  loginlessCheck: false,
  protocolSelection: false,
  credentialConfig: false, // 新增：登录凭据配置弹窗
  assetMerge: false,
  assetDetail: false,
  editAsset: false,
  importAssets: false,
  exportAssets: false,
  confirmDelete: false,
});
// #endregion

// #region --- Data Models & Configs ---
const assets = ref([
  { id: 1, name: '192.168.1.101', type: '主机设备', feature: 'Microsoft Windows 10 专业版', port: '无', status: '未核查', zone: '安全区I', selected: false, mac: '0C-9A-3C-FA-FA-D4', commissioningDate: '2024-01-15', vendor: 'Microsoft', model: 'Virtual Machine', discoveryStatus: '存活', systemVersion: '10.0.19042', assetName: 'DESKTOP-KMPG2RJ' },
  { id: 2, name: '10.1.1.10', type: '主机设备', feature: 'Linux 5.4', port: '无', status: '通过', zone: '安全区II', selected: false, mac: '00:0c:29:98:1e:cb', commissioningDate: '2023-11-20', vendor: 'Linux', model: 'Generic', discoveryStatus: '存活', systemVersion: '5.4', assetName: 'Linx' },
  { id: 3, name: '10.105.71.244', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false, mac: '0A:1B:2C:3D:4E:03', commissioningDate: '2024-03-10', vendor: 'Dell', model: 'PowerEdge R740', discoveryStatus: '存活', systemVersion: '-', assetName: 'DELL-SERVER' },
]);

const loginlessCheckConfig = reactive({
  localIp: '10.105.71.233',
  subnetMask: '255.255.255.0',
  gateway: '',
  highRiskPortScan: true,
  tcpPorts: '21,23,25,109,110,135,139,445,3389',
  udpPorts: '53,67,69,137,138,5353',
  fingerprintCollection: false,
  checkSpeed: 'medium',
  useRange: false,
  startIp: '',
  endIp: '',
});

const columns = [
  { name: 'name', label: '资产IP', field: 'name', align: 'left', sortable: true },
  { name: 'discoveryStatus', label: '探查状态', field: 'discoveryStatus', align: 'center' },
  { name: 'type', label: '设备类型', field: 'type', align: 'left', sortable: true },
  { name: 'feature', label: '资产特征识别', field: 'feature', align: 'left' },
  { name: 'port', label: '开启高危端口', field: 'port', align: 'left' },
  { name: 'status', label: '资产状态', field: 'status', align: 'left', sortable: true },
  { name: 'zone', label: '安全分区', field: 'zone', align: 'left', sortable: true },
  { name: 'actions', label: '操作', align: 'center', style: 'width: 350px' },
];

const pagination = ref({
  rowsPerPage: 0
});
// #endregion

// #region --- 登录检查相关状态与函数 ---
const selectedProtocol = ref(null);
const loginCredentials = ref([]);
const protocols = [
  { id: 'ssh', label: 'SSH协议', icon: 'terminal' },
  { id: 'https', label: 'HTTPS协议', icon: 'http' },
  { id: 'serial', label: '串口', icon: 'power_input' }
];

const openProtocolDialog = () => {
  selectedProtocol.value = null; // 重置已选协议
  dialogs.protocolSelection = true;
}

const openCredentialDialog = () => {
  if (!selectedProtocol.value) {
    $q.notify({ type: 'negative', message: '请选择一个网络协议！' });
    return;
  }

  const selectedAssets = assets.value.filter(a => a.selected);
  if (selectedAssets.length === 0) {
    $q.notify({ type: 'negative', message: '请在主列表中至少选择一个资产进行登录检查！' });
    return;
  }

  const getDefaultPort = (protocol) => {
    if (protocol === 'ssh') return '22';
    if (protocol === 'https') return '443';
    return '';
  }

  loginCredentials.value = selectedAssets.map(asset => ({
    id: asset.id,
    ip: asset.name,
    assetType: asset.type,
    port: getDefaultPort(selectedProtocol.value),
    username: '',
    password: '',
    privilegeUsername: '',
    privilegePassword: ''
  }));

  dialogs.protocolSelection = false;
  dialogs.credentialConfig = true;
};

const removeCredentialRow = (index) => {
  loginCredentials.value.splice(index, 1);
};

const applySameAsAbove = (index) => {
  if (index > 0) {
    const prev = loginCredentials.value[index - 1];
    loginCredentials.value[index] = { ...loginCredentials.value[index], ...prev, id: loginCredentials.value[index].id, ip: loginCredentials.value[index].ip };
  }
};

const confirmCredentials = () => {
  console.log("最终凭据信息:", JSON.parse(JSON.stringify(loginCredentials.value)));
  $q.notify({ type: 'positive', message: '登录检查任务已开始' });
  dialogs.credentialConfig = false;
  navigateTo('/logincheckinprogress')
};

// #endregion


// #region --- 资产添加与编辑 ---
const selectedAsset = ref(null);
const assetToDeleteId = ref(null);
const assetTypes = ['未知', '主机设备', '网络设备', '安防设备', '间隔层设备', '疑似间隔层设备', '其他'];

const openAddAssetDialog = () => {
  selectedAsset.value = {
    name: '', type: '未知', commissioningDate: '', feature: '', vendor: '', model: '', assetName: ''
  };
  dialogs.editAsset = true;
};

const openEditAssetDialog = (asset) => {
  selectedAsset.value = { ...asset };
  dialogs.editAsset = true;
};

const saveAsset = () => {
  if (!selectedAsset.value.name) {
    $q.notify({ type: 'negative', message: '资产IP不能为空！' });
    return;
  }
  if (selectedAsset.value.id) {
    const index = assets.value.findIndex(a => a.id === selectedAsset.value.id);
    if (index !== -1) {
      assets.value[index] = { ...assets.value[index], ...selectedAsset.value };
      $q.notify({ type: 'positive', message: '资产更新成功' });
    }
  } else {
    const newAsset = {
      ...selectedAsset.value,
      id: Date.now(),
      port: '无',
      status: '未核查',
      zone: '未知',
      selected: false,
      discoveryStatus: '存活',
      mac: 'N/A'
    };
    assets.value.unshift(newAsset);
    $q.notify({ type: 'positive', message: '资产添加成功' });
  }
  dialogs.editAsset = false;
};

const deleteAsset = (id) => {
  assetToDeleteId.value = id;
  dialogs.confirmDelete = true;
};

const confirmDeleteAsset = () => {
  if (assetToDeleteId.value) {
    const index = assets.value.findIndex(a => a.id === assetToDeleteId.value);
    if (index !== -1) {
      assets.value.splice(index, 1);
      $q.notify({ type: 'positive', message: '账外资产已删除' });
    }
  }
  dialogs.confirmDelete = false;
  assetToDeleteId.value = null;
};
// #endregion


// #region --- 资产合并 ---
const assetsToMerge = ref([]);
const mergedAsset = ref({});
const mergeConflictFields = [
  { label: '设备IP', key: 'name' },
  { label: '设备MAC', key: 'mac' },
  { label: '设备类型', key: 'type' },
  { label: '所属分区', key: 'zone' },
  { label: '操作系统', key: 'feature' },
  { label: '系统版本', key: 'systemVersion' },
  { label: '厂商信息', key: 'vendor' },
  { label: '设备型号', key: 'model' },
];

const openMergeDialog = () => {
  const selected = assets.value.filter(a => a.selected);
  if (selected.length < 2) {
    $q.notify({ type: 'warning', message: '请至少选择两个资产进行合并！' });
    return;
  }
  assetsToMerge.value = selected.map(a => ({...a}));
  mergedAsset.value = { ...selected[0] };
  dialogs.assetMerge = true;
};

const getUniqueValuesForField = (key) => {
  if (!assetsToMerge.value || assetsToMerge.value.length === 0) return [];
  const values = new Set(assetsToMerge.value.map(asset => asset[key]).filter(val => val != null && val !== ''));
  return Array.from(values);
};

const confirmMerge = () => {
  const primaryId = mergedAsset.value.id;
  const primaryIndex = assets.value.findIndex(a => a.id === primaryId);

  if(primaryIndex === -1) {
    $q.notify({ type: 'negative', message: '合并失败：找不到基准资产。' });
    return;
  }

  const allMergedIds = new Set(assetsToMerge.value.map(a => a.id));
  const idsToDelete = [...allMergedIds].filter(id => id !== primaryId);

  assets.value[primaryIndex] = { ...mergedAsset.value, selected: false };

  assets.value = assets.value.filter(asset => !idsToDelete.includes(asset.id));

  dialogs.assetMerge = false;
  assetsToMerge.value = [];
  mergedAsset.value = {};
  $q.notify({ type: 'positive', message: '资产合并成功！' });
};
// #endregion


// #region --- 资产探查与标记 ---
const probeAndTagAssets = () => {
  $q.notify({ type: 'info', message: '正在模拟探查并标记资产...' });
  const liveScanResults = [
    { ip: '192.168.1.101', mac: '0C-9A-3C-FA-FA-D4' },
    { ip: '10.1.1.10', mac: '00:0c:29:98:1e:cb' },
    { ip: '10.105.71.99', mac: 'AA:BB:CC:DD:EE:FF' }, // 账外资产
  ];

  const liveIps = new Set(liveScanResults.map(r => r.ip));
  const assetIps = new Set(assets.value.map(a => a.name));

  assets.value.forEach(asset => {
    asset.discoveryStatus = liveIps.has(asset.name) ? '存活' : '不存活';
  });

  liveScanResults.forEach(scanResult => {
    if (!assetIps.has(scanResult.ip)) {
      assets.value.push({
        id: Date.now() + Math.random(), name: scanResult.ip, type: '未知', feature: '探查发现', port: '待检测', status: '未核查', zone: '未知', selected: false, mac: scanResult.mac, commissioningDate: new Date().toISOString().slice(0, 10), vendor: '未知', model: '未知', discoveryStatus: '账外资产', assetName: '未知名称'
      });
    }
  });

  $q.notify({ type: 'positive', message: '资产标记完成！' });
};
// #endregion

// #region --- 资产导入 ---
const importFile = ref(null);
const importPreviewData = ref([]);
const importPreviewColumns = ref([]);
const templateHeaders = [ '资产名称', '资产类型', '资产IP地址', '资产MAC地址', '资产投运日期', '操作系统发行版本', '设备品牌', '设备型号', '登录账号', '登录密码', '提权账号', '提权密码' ];
const importTemplateUrl = '/path-to-template/asset_import_template.xlsx';

const openImportDialog = () => {
  importFile.value = null;
  importPreviewData.value = [];
  importPreviewColumns.value = [];
  dialogs.importAssets = true;
};

const handleFileSelect = (file) => {
  if (!file) {
    importPreviewData.value = [];
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error('Excel文件为空或没有数据行。');
      }

      const headers = jsonData[0].map(h => h.trim());
      if (headers.indexOf('资产IP地址') === -1) {
        throw new Error('模板格式错误，未找到“资产IP地址”列。请下载标准模板。');
      }

      importPreviewColumns.value = templateHeaders.map(h => ({ name: h, label: h, field: h, align: 'left' }));

      const parsedData = jsonData.slice(1).map((row, rowIndex) => {
        const rowData = {};
        headers.forEach((header, colIndex) => {
          if (templateHeaders.includes(header)) {
            rowData[header] = row[colIndex];
          }
        });
        if (!rowData['资产IP地址']) {
          throw new Error(`数据错误：第 ${rowIndex + 2} 行的“资产IP地址”不能为空。`);
        }
        return rowData;
      });
      importPreviewData.value = parsedData;
      $q.notify({ type: 'positive', message: `文件解析成功，预览 ${parsedData.length} 条待导入数据。` });
    } catch (error) {
      $q.notify({ type: 'negative', message: `导入失败：${error.message}`, position: 'top' });
      importFile.value = null;
      importPreviewData.value = [];
      importPreviewColumns.value = [];
    }
  };
  reader.onerror = () => {
    $q.notify({ type: 'negative', message: '文件读取失败，请检查文件是否损坏或浏览器权限。' });
  }
  reader.readAsArrayBuffer(file);
};

const confirmImport = () => {
  if (importPreviewData.value.length === 0) {
    $q.notify({ type: 'warning', message: '没有可导入的数据' });
    return;
  }

  const existingAssetsMap = new Map(assets.value.map(asset => [asset.name, asset]));
  let newCount = 0;
  let updatedCount = 0;
  const newAssets = [];

  importPreviewData.value.forEach(item => {
    const ip = item['资产IP地址'];
    const existingAsset = existingAssetsMap.get(ip);

    if (existingAsset) {
      existingAsset.type = item['资产类型'] || existingAsset.type;
      existingAsset.feature = item['操作系统发行版本'] || existingAsset.feature;
      existingAsset.mac = item['资产MAC地址'] || existingAsset.mac;
      existingAsset.commissioningDate = item['资产投运日期'] || existingAsset.commissioningDate;
      existingAsset.vendor = item['设备品牌'] || existingAsset.vendor;
      existingAsset.model = item['设备型号'] || existingAsset.model;
      updatedCount++;
    } else {
      newAssets.push({
        id: Date.now() + Math.random(),
        name: ip,
        type: item['资产类型'] || '未知',
        feature: item['操作系统发行版本'] || '-',
        port: '无',
        status: '未核查',
        zone: item['安全分区情况'] || '未知',
        selected: false,
        mac: item['资产MAC地址'] || 'N/A',
        commissioningDate: item['资产投运日期'] || 'N/A',
        vendor: item['设备品牌'] || 'N/A',
        model: item['设备型号'] || 'N/A',
        discoveryStatus: '存活'
      });
      newCount++;
    }
  });

  if (newAssets.length > 0) {
    assets.value.unshift(...newAssets);
  }

  $q.notify({
    type: 'positive',
    message: `导入完成！新增 ${newCount} 条资产，更新 ${updatedCount} 条资产。`,
    position: 'top'
  });

  dialogs.importAssets = false;
};
// #endregion

// #region --- 资产导出 ---
const exportableAssets = computed(() => {
  const selected = assets.value.filter(a => a.selected);
  return selected.length > 0 ? selected : assets.value;
});

const exportPreviewDisplayColumns = computed(() => columns.filter(c => c.name !== 'actions'));

const exportFileColumns = [
  { label: '资产名称', field: 'assetName' },
  { label: '资产IP', field: 'name' },
  { label: '资产类型', field: 'type' },
  { label: '资产MAC地址', field: 'mac' },
  { label: '安全分区情况', field: 'zone' },
  { label: '资产投运日期', field: 'commissioningDate' },
  { label: '操作系统发行版本', field: 'feature' },
  { label: '设备品牌', field: 'vendor' },
  { label: '设备型号', field: 'model' },
  { label: '探查状态', field: 'discoveryStatus'},
];

const openExportDialog = () => {
  dialogs.exportAssets = true;
};

const confirmExport = () => {
  const dataToExport = exportableAssets.value.map(asset => {
    const row = {};
    exportFileColumns.forEach(col => {
      row[col.label] = asset[col.field] || 'N/A';
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "资产台账");

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "");
  XLSX.writeFile(workbook, `资产导出台账_${timestamp}.xlsx`);

  dialogs.exportAssets = false;
  $q.notify({ type: 'positive', message: '资产台账已开始导出...' });
};
// #endregion

// #region --- 其他函数 ---
const autoCheckTasks = ref(null);
const manualCheckTasks = ref([]);
onMounted(() => {
  const storedData = sessionStorage.getItem('selectedQualifications');
  if (storedData) {
    try {
      const qualifications = JSON.parse(storedData);
      autoCheckTasks.value = qualifications.auto || [];
      manualCheckTasks.value = qualifications.manual || [];
    } catch (e) {
      console.error("解析 sessionStorage 数据失败:", e);
      autoCheckTasks.value = [];
      manualCheckTasks.value = [];
    }
  } else {
    autoCheckTasks.value = ['免登录检查', '登录检查', '告警对点', '安防策略检查'];
    console.warn("未在 sessionStorage 中找到审查方式，显示所有默认按钮用于演示。")
  }
});

const toggleSelection = (row) => { row.selected = !row.selected; };

const navigateTo = (path) => { router.push(path); };

const startLoginlessCheck = () => {
  $q.notify({
    type: 'positive',
    message: '免登录检查任务已开始',
    caption: '配置已保存'
  });
  dialogs.loginlessCheck = false;
};
// #endregion
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <div class="main-header row items-center q-px-md">
      <div><q-btn class="back-button" unelevated label="上一步" @click="navigateTo('/executeCheck')" /></div>
      <q-space />
      <div class="text-h3 text-weight-bolder">正在核查</div>
      <q-space />
    </div>

    <q-page class="main-content-area">
      <q-card class="info-panel q-pa-md q-mb-md" flat>
        <div class="row items-center justify-between">
          <div class="row items-center q-gutter-x-md">
            <q-btn class="main-action-btn" unelevated label="资产添加" @click="openAddAssetDialog" />
            <q-btn class="main-action-btn" unelevated label="资产导入" @click="openImportDialog"/>
            <q-btn class="main-action-btn" unelevated label="资产导出" @click="openExportDialog"/>
            <q-btn class="sub-action-btn" unelevated label="探查并标记资产" @click="probeAndTagAssets" />
            <q-btn class="main-action-btn" unelevated label="资产合并" @click="openMergeDialog" />
          </div>
          <div class="info-panel-text">
            <span>当前站点：省调1</span>
            <span class="q-ml-xl">资产总数：{{ assets.length }}</span>
          </div>
        </div>
      </q-card>

      <q-card class="table-container" flat>
        <div class="sub-actions-bar row items-center q-gutter-x-md q-pa-md">
          <q-btn v-if="autoCheckTasks && autoCheckTasks.includes('免登录检查')" class="sub-action-btn" unelevated label="免登录检查" @click="dialogs.loginlessCheck = true"/>
          <q-btn v-if="autoCheckTasks && autoCheckTasks.includes('登录检查')" class="sub-action-btn" unelevated label="登录检查" @click="openProtocolDialog"/>
          <q-btn v-if="autoCheckTasks && autoCheckTasks.includes('告警对点')" class="sub-action-btn" unelevated label="告警对点" @click="openProtocolDialog"/>
          <q-btn v-if="autoCheckTasks && autoCheckTasks.includes('安防策略检查')" class="sub-action-btn" unelevated label="安防策略检查" @click="openProtocolDialog"/>

          <div v-if="manualCheckTasks.length > 0" class="manual-check-info text-white q-ml-md row items-center">
            <q-icon name="person_search" size="md" class="q-mr-sm" color="cyan-3"/>
            <span class="text-weight-medium">待人工核查: {{ manualCheckTasks.join('、') }}</span>
          </div>

          <q-space />

          <q-btn class="main-action-btn" unelevated label="查看拓扑"/>
          <q-btn class="main-action-btn" unelevated label="报告生成" @click="navigateTo('/checkreports')"/>
        </div>

        <q-table
          :rows="assets"
          :columns="columns"
          row-key="id"
          flat
          hide-bottom
          class="assets-table"
          :pagination="pagination"
        >
          <template v-slot:body-cell-discoveryStatus="props">
            <q-td :props="props">
              <q-badge
                :color="{
                  '存活': 'positive',
                  '不存活': 'grey-7',
                  '账外资产': 'warning'
                }[props.value]"
              >
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn :color="props.row.selected ? 'red-4' : 'primary'" :label="props.row.selected ? '取消选定' : '选定'" dense unelevated @click="toggleSelection(props.row)"/>
              <q-btn color="primary" label="编辑" dense unelevated @click="openEditAssetDialog(props.row)"/>
              <q-btn v-if="props.row.discoveryStatus === '账外资产'" color="negative" label="删除" dense unelevated @click="deleteAsset(props.row.id)"/>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </q-page>

    <q-drawer v-model="isFilterDrawerOpen" side="right" bordered :width="400" class="filter-drawer"></q-drawer>

    <q-dialog v-model="dialogs.assetMerge" persistent>
      <q-card class="bg-dark-page text-white" style="width: 1000px; max-width: 90vw;">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h5">资产合并</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-xl" v-if="assetsToMerge.length >= 2 && mergedAsset">
          <div class="q-mb-lg">
            <div class="text-grey-5 q-mb-xs">1. 从待合并资产中选择一个作为合并的基础。</div>
            <q-select
              dark dense filled
              :model-value="mergedAsset.id"
              @update:model-value="newId => mergedAsset = { ...assetsToMerge.find(a => a.id === newId) }"
              :options="assetsToMerge"
              :option-label="opt => `${opt.assetName || '未命名资产'} (${opt.name})`"
              option-value="id"
              label="合并基准资产"
              emit-value
              map-options
            />
          </div>

          <q-separator dark class="q-my-xl"/>

          <div class="text-grey-5 q-mb-lg">2. 审核并选择每个属性的最终值。</div>

          <div v-for="field in mergeConflictFields" :key="field.key" class="row items-center q-mb-md merge-row">
            <div class="col-3 text-grey-3 text-right q-pr-md" style="font-size: 1.2rem;">{{ field.label }}:</div>
            <div class="col-9">
              <q-select
                dark dense filled
                v-model="mergedAsset[field.key]"
                :options="getUniqueValuesForField(field.key)"
                label="选择最终值"
                clearable
              >
                <template v-if="!getUniqueValuesForField(field.key) || getUniqueValuesForField(field.key).length === 0" v-slot:no-option>
                  <q-item><q-item-section class="text-grey">无可用选项或数据为空</q-item-section></q-item>
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>

        <q-separator dark />
        <q-card-actions align="center" class="bg-dark-header q-pa-md q-gutter-md">
          <q-btn label="取消合并" flat color="white" v-close-popup style="min-width: 120px;" />
          <q-btn label="确认合并" color="primary" unelevated style="min-width: 120px;" @click="confirmMerge"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.confirmDelete" persistent>
      <q-card class="bg-dark-page text-white">
        <q-card-section class="row items-center">
          <div class="text-h6">确认删除</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          您确定要删除此账外资产吗？此操作不可撤销。
        </q-card-section>
        <q-card-actions align="right" class="bg-dark-header q-pa-md">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn label="确认删除" color="negative" unelevated @click="confirmDeleteAsset" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.editAsset" persistent>
      <q-card class="form-dialog bg-dark-page text-h5 text-white" style="width: 800px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h5">{{ selectedAsset && selectedAsset.id ? '编辑资产' : '添加资产' }}</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none" v-if="selectedAsset">
          <div class="form-row">
            <span class="form-label">资产IP:</span>
            <q-input dark color="primary" dense outlined v-model="selectedAsset.name" placeholder="请输入IP地址" class="col"/>
          </div>
          <div class="form-row">
            <span class="form-label">资产名称:</span>
            <q-input dark color="primary" dense outlined v-model="selectedAsset.assetName" placeholder="例如：DESKTOP-KMPG2RJ" class="col"/>
          </div>
          <div class="form-row">
            <span class="form-label">资产类型:</span>
            <q-select dark color="primary" dense outlined v-model="selectedAsset.type" :options="assetTypes" class="col"/>
          </div>
          <div class="form-row">
            <span class="form-label">资产投运日期:</span>
            <q-input dark color="primary" dense outlined v-model="selectedAsset.commissioningDate" placeholder="YYYY-MM-DD" class="col">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="selectedAsset.commissioningDate" mask="YYYY-MM-DD" dark>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="关闭" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="form-row">
            <span class="form-label">操作系统版本:</span>
            <q-input dark color="primary" dense outlined v-model="selectedAsset.feature" placeholder="例如：Windows Server 2019" class="col"/>
          </div>
          <div class="form-row">
            <span class="form-label">设备品牌:</span>
            <q-input dark color="primary" dense outlined v-model="selectedAsset.vendor" class="col"/>
          </div>
          <div class="form-row">
            <span class="form-label">设备型号:</span>
            <q-input dark color="primary" dense outlined v-model="selectedAsset.model" class="col"/>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md bg-dark-header">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn label="保存" color="primary" unelevated style="min-width: 120px;" @click="saveAsset" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.importAssets" persistent @hide="importFile = null">
      <q-card class="bg-dark-page text-white" style="width: 90vw; max-width: 1200px; height: 90vh; display: flex; flex-direction: column;">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h5">资产导入</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="col-auto">
          <div class="row items-center q-gutter-md">
            <q-file v-model="importFile" @update:model-value="handleFileSelect" label="点击选择 Excel 文件" dark outlined dense accept=".xlsx, .xls" class="text-h5 col-auto" style="min-width: 300px;">
              <template v-slot:prepend><q-icon name="attach_file" /></template>
              <template v-slot:after v-if="importFile"><q-btn round dense flat icon="cancel" @click.stop.prevent="importFile = null; importPreviewData = []" /></template>
            </q-file>
            <q-btn color="primary" unelevated no-caps icon="download" label="下载导入模板" @click="navigateTo(importTemplateUrl)" :disable="true" title="模板功能待实现" />
            <q-space/><div class="text-grey-5 text-h5">* 请确保使用模板文件进行导入，且“资产IP地址”为必填项。</div>
          </div>
        </q-card-section>
        <q-card-section class="col" style="overflow: auto;">
          <div v-if="importPreviewData.length > 0" class="text-h6 q-mb-sm text-weight-regular">导入数据预览 ({{ importPreviewData.length }} 条)</div>
          <q-table v-if="importPreviewData.length > 0" :rows="importPreviewData" :columns="importPreviewColumns" row-key="资产IP地址" dark dense flat bordered class="import-preview-table" style="height: 100%;"></q-table>
          <div v-else class="text-center text-grey-6 full-height flex flex-center"><q-icon name="cloud_upload" size="xl" /><span class="q-ml-md text-h5">请先选择文件以预览</span></div>
        </q-card-section>
        <q-separator dark /><q-card-actions align="right" class="q-pa-md bg-dark-header"><q-btn label="取消" flat color="white" v-close-popup /><q-btn label="确认导入" color="primary" unelevated :disable="importPreviewData.length === 0" @click="confirmImport" style="min-width: 120px;"/></q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.exportAssets" persistent>
      <q-card class="bg-dark-page text-white" style="width: 90vw; max-width: 1600px; height: 90vh; display: flex; flex-direction: column;">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h5">资产导出</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="col-auto">
          <div class="text-h6 text-weight-regular">导出数据预览 ({{ exportableAssets.length }} 条)</div>
          <div class="text-h5 text-grey-5">
            以下是待导出的资产预览。如果已在主列表选定资产，将只导出选定项；否则将导出全部资产。
          </div>
        </q-card-section>
        <q-card-section class="col" style="overflow: auto;">
          <q-table :rows="exportableAssets" :columns="exportPreviewDisplayColumns" row-key="id" dark bordered class="export-preview-table" style="height: 100%;" :pagination="{ rowsPerPage: 0 }"></q-table>
        </q-card-section>
        <q-separator dark /><q-card-actions align="right" class="q-pa-md bg-dark-header"><q-btn label="取消" flat color="white" v-close-popup /><q-btn label="确认并下载" color="primary" unelevated icon="file_download" @click="confirmExport" style="min-width: 150px;"/></q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.loginlessCheck" persistent>
      <q-card class="form-dialog loginless-check-dialog bg-dark-page text-h5 text-white" style="width: 1100px; max-width: 90vw;">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h6">免登录检查配置</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="form-row">
            <span class="form-label">本机IP地址:</span>
            <div class="col row items-center no-wrap">
              <q-input dark color="primary" dense outlined v-model="loginlessCheckConfig.localIp" class="text-h5 col"/>
              <q-btn flat color="primary" label="历史记录" class="q-ml-md" no-caps />
            </div>
          </div>
          <div class="form-row">
            <span class="form-label">子网掩码:</span>
            <q-input dark color="primary" dense outlined v-model="loginlessCheckConfig.subnetMask" class="text-h5 col"/>
          </div>
          <div class="form-row">
            <span class="form-label">网关:</span>
            <q-input dark color="primary" dense outlined v-model="loginlessCheckConfig.gateway" placeholder="请输入网关" class="text-h5 col"/>
          </div>
          <div class="form-row">
            <span class="form-label">高危端口扫描:</span>
            <div class="col">
              <q-toggle v-model="loginlessCheckConfig.highRiskPortScan" color="primary" :label="loginlessCheckConfig.highRiskPortScan ? '开启' : '关闭'" />
            </div>
          </div>
          <template v-if="loginlessCheckConfig.highRiskPortScan">
            <div class="form-row">
              <span class="form-label">端口号TCP:</span>
              <q-input dark color="primary" dense outlined v-model="loginlessCheckConfig.tcpPorts" type="textarea" autogrow class="text-h5 col"/>
            </div>
            <div class="form-row">
              <span class="form-label">端口号UDP:</span>
              <q-input dark color="primary" dense outlined v-model="loginlessCheckConfig.udpPorts" type="textarea" autogrow class="text-h5 col"/>
            </div>
          </template>
          <div class="form-row">
            <span class="form-label">指纹特征采集:</span>
            <div class="col">
              <q-toggle v-model="loginlessCheckConfig.fingerprintCollection" color="primary" :label="loginlessCheckConfig.fingerprintCollection ? '开启' : '关闭'" />
            </div>
          </div>
          <div class="form-row">
            <span class="form-label">免登录检查速率:</span>
            <div class="col row q-gutter-xl">
              <q-radio dark v-model="loginlessCheckConfig.checkSpeed" val="high" label="高" color="primary"/>
              <q-radio dark v-model="loginlessCheckConfig.checkSpeed" val="medium" label="中" color="primary"/>
              <q-radio dark v-model="loginlessCheckConfig.checkSpeed" val="low" label="低" color="primary"/>
            </div>
          </div>
          <div class="form-row">
            <span class="form-label">起止范围:</span>
            <div class="col">
              <q-toggle v-model="loginlessCheckConfig.useRange" color="primary" :label="loginlessCheckConfig.useRange ? '开启' : '关闭'" />
            </div>
          </div>
          <template v-if="loginlessCheckConfig.useRange">
            <div class="form-row">
              <span class="form-label">起始IP:</span>
              <q-input dark color="primary" dense outlined v-model="loginlessCheckConfig.startIp" placeholder="请输入起始IP地址" class="text-h5 col"/>
            </div>
            <div class="form-row">
              <span class="form-label">结束IP:</span>
              <q-input dark color="primary" dense outlined v-model="loginlessCheckConfig.endIp" placeholder="请输入结束IP地址" class="text-h5 col"/>
            </div>
          </template>
        </q-card-section>

        <q-separator dark/>
        <q-card-actions align="right" class="bg-dark-header q-pa-md">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn label="确定" color="primary" unelevated @click="startLoginlessCheck" style="min-width: 120px;"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.protocolSelection" persistent>
      <q-card class="bg-dark-page text-white" style="width: 800px;">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h6">选定网络协议</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-xl text-center">
          <div class="text-h6 q-mb-sm">已选定: <span class="text-primary">{{ selectedProtocol ? protocols.find(p=>p.id === selectedProtocol).label : '【网络模式】' }}</span></div>
          <div class="text-grey-5 q-mb-xl">请结合待查资产的特征识别结果，选定合适的网络协议开展后续核查。</div>
          <div class="row justify-center q-gutter-xl">
            <div v-for="p in protocols" :key="p.id"
                 class="protocol-card column items-center justify-center q-pa-lg cursor-pointer"
                 :class="{ 'active-protocol': selectedProtocol === p.id }"
                 @click="selectedProtocol = p.id">
              <q-icon :name="p.icon" size="4rem" class="q-mb-md" />
              <div class="text-h6">{{ p.label }}</div>
            </div>
          </div>
        </q-card-section>
        <q-separator dark />
        <q-card-actions align="right" class="bg-dark-header q-pa-md">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn label="确定" color="primary" unelevated @click="openCredentialDialog" style="min-width: 120px;" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.credentialConfig" persistent full-width>
      <q-card class="bg-dark-page text-white credential-dialog">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h6">登录账号及密码配置</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-md">
          <div class="row items-center q-gutter-md q-mb-md">
            <q-btn color="primary" unelevated label="批量填充" />
            <q-btn color="primary" unelevated label="添加" />
            <q-space />
            <div class="text-grey-5">当前站点：省调1</div>
          </div>
          <div class="credential-table-container">
            <div class="row credential-table-header text-center text-weight-bold">
              <div class="col-2">资产IP</div>
              <div class="col">端口号</div>
              <div class="col-2">登录账号</div>
              <div class="col-2">登录密码</div>
              <div class="col-2">提权账号</div>
              <div class="col-2">提权密码</div>
              <div class="col-1">操作</div>
            </div>
            <div v-for="(cred, index) in loginCredentials" :key="cred.id" class="row credential-table-row items-center">
              <div class="col-2 text-center">{{ cred.ip }}</div>
              <div class="col"><q-input dark dense outlined v-model="cred.port" placeholder="端口..."/></div>
              <div class="col-2"><q-input dark dense outlined v-model="cred.username" placeholder="账号..."/></div>
              <div class="col-2"><q-input dark dense outlined v-model="cred.password" type="password" placeholder="密码..."><template v-slot:append><q-icon name="visibility" class="cursor-pointer"/></template></q-input></div>
              <div class="col-2"><q-input dark dense outlined v-model="cred.privilegeUsername" placeholder="提权账号..."/></div>
              <div class="col-2"><q-input dark dense outlined v-model="cred.privilegePassword" type="password" placeholder="提权密码..."><template v-slot:append><q-icon name="visibility" class="cursor-pointer"/></template></q-input></div>
              <div class="col-1 row justify-center q-gutter-x-sm">
                <q-btn dense flat round icon="delete" color="negative" @click="removeCredentialRow(index)" />
                <q-btn dense flat round icon="arrow_upward" color="primary" @click="applySameAsAbove(index)"><q-tooltip>同上一笔</q-tooltip></q-btn>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator dark/>
        <q-card-actions align="right" class="bg-dark-header q-pa-md">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn label="确定" color="primary" unelevated @click="confirmCredentials" style="min-width: 120px;" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
/* --- 字体放大调整 --- */

/* Main Layout & Theme */
.page-background { background-color: #292a2d; font-size: 24px; /* 基础字体大小增大 */ }
.main-header { color: white; padding: 12px 24px; }
.back-button { background-color: #4c6afc; color: white; border-radius: 6px; font-size: 1.1rem; }
.header-action-btn { font-size: 1.1rem; }
.main-content-area { padding: 10px 24px 24px; position: relative; top: -8px; }
.info-panel { background-color: #3d4a58; color: #e0e0e0; border-radius: 8px; }
.info-panel-text { font-size: 2rem; }
.table-container { border-radius: 8px; overflow: hidden; }

/* Action Buttons */
.main-action-btn, .sub-action-btn {
  background-color: #2f48d6;
  color: white;
  font-weight: 500;
  font-size: 1.3rem; /* 增大按钮字体 */
  padding: 10px 20px;
}
.sub-actions-bar { background-color: #3d4a58; border-bottom: 1px solid #4f5b68;}

/* Table Style */
.assets-table { border-top: 1px solid #4f5b68; background: #3d4a58; color: #e0e0e0; }
:deep(.assets-table thead tr) { background-color: #424864; }
:deep(.assets-table th) {
  font-weight: bold;
  color: white;
  font-size: 1.4rem; /* 增大表头字体 */
}
:deep(.assets-table tbody td) {
  font-size: 1.5rem; /* 增大单元格字体 */
  padding-top: 24px;
  padding-bottom: 24px;
}
:deep(.assets-table .q-btn) {
  font-size: 1.3rem;
}
:deep(.assets-table .q-badge) {
  font-size: 1.2rem;
  padding: 8px 12px;
}
:deep(.q-table__bottom) { background: #3d4a58; border-top: 1px solid #4f5b68;}

/* 专门放大导出预览表格的字体 */
:deep(.export-preview-table th) {
  font-size: 1.6rem; /* 预览表头字体 */
}
:deep(.export-preview-table td) {
  font-size: 1.5rem; /* 预览单元格字体 */
  padding-top: 24px;
  padding-bottom: 24px;
}

/* Dialog Styles */
.form-dialog { width: 700px; max-width: 90vw; }
.form-row { display: flex; align-items: center; margin-bottom: 2.5rem; min-height: 40px; }
.form-label {
  width: 200px;
  font-weight: 500;
  text-align: right;
  padding-right: 20px;
  flex-shrink: 0;
  font-size: 1.6rem;
}
.form-row span:not(.form-label) { flex-grow: 1; font-size: 1.5rem; }
.bg-dark-page { background-color: #292a2d; }
.bg-dark-header { background-color: #333438; }
:deep(.q-dialog .text-h5) { font-size: 1.85rem; } /* 增大弹窗标题 */
:deep(.q-dialog .text-h6) { font-size: 1.75rem; }
:deep(.q-dialog .text-caption) { font-size: 1rem; }
:deep(.q-dialog .q-field__native), :deep(.q-dialog .q-field__label) {
  font-size: 1.4rem;
}

/* MODIFIED: Specifically target loginless-check-dialog form controls for further enlargement */
.loginless-check-dialog .form-label {
  font-size: 1.7rem;
}
:deep(.loginless-check-dialog .q-field__native),
:deep(.loginless-check-dialog .q-field__label) {
  font-size: 1.5rem;
}
:deep(.loginless-check-dialog .q-radio__label),
:deep(.loginless-check-dialog .q-toggle__label) {
  font-size: 1.5rem;
}


.protocol-card {
  border: 2px solid #555;
  border-radius: 8px;
  background-color: #3d4a58;
  transition: all 0.3s ease;
}
.protocol-card:hover {
  border-color: var(--q-primary);
  background-color: #4a596a;
}
.active-protocol {
  border-color: var(--q-primary);
  background-color: #2f48d6;
  color: white;
}

.credential-dialog {
  height: 90vh;
}
.credential-table-container {
  border: 1px solid #4f5b68;
  border-radius: 4px;
  font-size: 1.4rem;
}
.credential-table-header {
  background-color: #424864;
  padding: 12px 6px;
  border-bottom: 1px solid #4f5b68;
}
.credential-table-row {
  border-bottom: 1px solid #4f5b68;
  padding: 12px 6px;
}
.credential-table-row:last-child {
  border-bottom: none;
}
.credential-table-row .col, .credential-table-row .col-2 {
  padding-left: 6px;
  padding-right: 6px;
}
:deep(.credential-table-row .q-field) {
  font-size: 1.4rem;
}


/* New style for import preview table */
:deep(.import-preview-table .q-table__top),
:deep(.import-preview-table .q-table__bottom) {
  background-color: #333438;
}

/* Filter Drawer Styles */
.filter-drawer { background-color: #333438; color: #e0e0e0 }
.filter-drawer-header { border-bottom: 1px solid #4f5b68; font-size: 2rem; }
:deep(.filter-drawer .q-item__label--header) { font-size: 1.5rem; padding-left: 0;}
.filter-option-btn {
  background-color: #4a4d5e;
  color: #e0e0e0;
  border: 1px solid #5f6368;
  border-radius: 4px;
  padding: 6px 14px;
  font-size: 1.1rem;
}
.active-filter { background-color: var(--q-primary) !important; color: white !important; border-color: var(--q-primary) !important; }

/* Manual Check Info Styles */
.manual-check-info {
  background-color: rgba(0, 188, 212, 0.2);
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid rgba(0, 188, 212, 0.4);
  font-size: 1.2rem; /* 增大人工核查提示字体 */
}

/* Merge Dialog Styles */
.merge-row {
  border-bottom: 1px solid #4f5b68;
  padding-bottom: 1rem;
}
.merge-row:last-child {
  border-bottom: none;
}

:deep(.merge-row .q-field--filled .q-field__control) {
  background-color: #3d4a58;
}

:deep(.merge-row .q-radio__inner) {
  font-size: 2rem;
}
</style>
