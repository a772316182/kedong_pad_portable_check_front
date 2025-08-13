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
  httpsConfig: false,
  sshInfo: false,
  loginCheck: false,
  mentionCheck: false,
  exportReport: false,
  assetDetail: false,
  editAsset: false,
  importAssets: false,
  exportAssets: false,
});
// #endregion

// #region --- Data Models ---
const assets = ref([
  { id: 1, name: '10.105.71.240', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false, mac: '0A:1B:2C:3D:4E:01', commissioningDate: '2024-01-15', vendor: 'Cisco', model: 'Catalyst 9300' },
  { id: 2, name: '10.105.71.242', type: '主机设备', feature: 'Windows Server 2019', port: '无', status: '通过', zone: '安全一区', selected: false, mac: '0A:1B:2C:3D:4E:02', commissioningDate: '2023-11-20', vendor: 'HPE', model: 'ProLiant DL380' },
  { id: 3, name: '10.105.71.244', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false, mac: '0A:1B:2C:3D:4E:03', commissioningDate: '2024-03-10', vendor: 'Dell', model: 'PowerEdge R740' },
  { id: 4, name: '10.105.71.243', type: '安防设备', feature: 'Hikvision IDS', port: '8000', status: '未通过', zone: '边界', selected: false, mac: '0A:1B:2C:3D:4E:04', commissioningDate: '2023-09-01', vendor: 'Hikvision', model: 'iDS-2CD7A46G0' },
  { id: 5, name: '10.105.71.254', type: '网络设备', feature: 'H3C S5560', port: '无', status: '通过', zone: '安全二区', selected: false, mac: '0A:1B:2C:3D:4E:05', commissioningDate: '2022-05-18', vendor: 'H3C', model: 'S5560X-EI' },
  {id: 6, name: '10.105.71.253', type: '网络设备', feature: 'H3C 2332', port: '无', status: '未通过', zone: '安全二区', selected: false, mac: '0A:1B:2C:ee:4E:05', commissioningDate: '2022-02-18', vendor: 'H4C', model: 'wdw-EI'}
]);

// 主表格的列定义
const columns = [
  { name: 'name', label: '资产名称', field: 'name', align: 'left', sortable: true },
  { name: 'type', label: '设备类型', field: 'type', align: 'left', sortable: true },
  { name: 'feature', label: '资产特征识别', field: 'feature', align: 'left' },
  { name: 'port', label: '开启高危端口', field: 'port', align: 'left' },
  { name: 'status', label: '资产状态', field: 'status', align: 'left', sortable: true },
  { name: 'zone', label: '安全分区', field: 'zone', align: 'left', sortable: true },
  { name: 'actions', label: '操作', align: 'center' },
];

const pagination = ref({
  rowsPerPage: 0
});
// #endregion

// #region --- 资产探查 ---
const assetProbeConfig = ref({
  gateway: '192.168.1.0/24',
  rate: '高',
  rangeEnabled: false,
  range: '192.168.1.1-192.168.1.254\n10.0.0.1/24',
});

const startAssetProbe = () => {
  console.log("开始资产探查，配置如下:", JSON.parse(JSON.stringify(assetProbeConfig.value)));
  $q.notify({ type: 'positive', message: '资产探查任务已启动...', position: 'top' });
  setTimeout(() => {
    const discoveredAssets = [ { ip: '192.168.1.1', mac: '0A:1B:2C:3D:4E:5F' }, { ip: '192.168.1.5', mac: 'F0:E1:D2:C3:B4:A5' } ];
    console.log("发现存活资产:", discoveredAssets);
    $q.notify({ type: 'info', message: `探查完成，发现 ${discoveredAssets.length} 个存活资产。`, position: 'top' });
  }, 2000);
  dialogs.assetProbe = false;
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
const exportPreviewData = computed(() => assets.value);

const exportPreviewDisplayColumns = computed(() => columns.filter(c => c.name !== 'actions'));

const exportFileColumns = [
  { label: '资产名称', field: 'name' },
  { label: '资产类型', field: 'type' },
  { label: '资产IP地址', field: 'name' },
  { label: '资产MAC地址', field: 'mac' },
  { label: '安全分区情况', field: 'zone' },
  { label: '资产投运日期', field: 'commissioningDate' },
  { label: '操作系统发行版本', field: 'feature' },
  { label: '设备品牌', field: 'vendor' },
  { label: '设备型号', field: 'model' },
];

const openExportDialog = () => {
  dialogs.exportAssets = true;
};

const confirmExport = () => {
  const dataToExport = assets.value.map(asset => {
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
            <q-btn class="main-action-btn" unelevated label="资产添加"/>
            <q-btn class="main-action-btn" unelevated label="资产导入" @click="openImportDialog"/>
            <q-btn class="main-action-btn" unelevated label="资产导出" @click="openExportDialog"/>
            <q-btn class="sub-action-btn" unelevated label="资产探测" @click="dialogs.assetProbe = true"/>
            <q-btn class="main-action-btn" unelevated label="资产合并" @click="confirmImport"/>
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
          <q-btn v-if="autoCheckTasks && autoCheckTasks.includes('登录检查')" class="sub-action-btn" unelevated label="登录检查" @click="dialogs.protocolSelection = true"/>
          <q-btn v-if="autoCheckTasks && autoCheckTasks.includes('告警对点')" class="sub-action-btn" unelevated label="告警对点" @click="dialogs.protocolSelection = true"/>
          <q-btn v-if="autoCheckTasks && autoCheckTasks.includes('安防策略检查')" class="sub-action-btn" unelevated label="安防策略检查" @click="dialogs.protocolSelection = true"/>

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
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn :color="props.row.selected ? 'red-4' : 'primary'" :label="props.row.selected ? '取消选定' : '选定'" dense unelevated @click="toggleSelection(props.row)"/>
              <q-btn color="primary" label="资产详情" dense unelevated />
              <q-btn color="primary" label="核查记录" dense unelevated @click="dialogs.mentionCheck=true;"/>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </q-page>

    <q-drawer v-model="isFilterDrawerOpen" side="right" bordered :width="400" class="filter-drawer"></q-drawer>

    <q-dialog v-model="dialogs.assetProbe">
      <q-card class="form-dialog bg-dark-page text-h5 text-white" style="width: 800px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h5">资产探查配置</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="form-row">
            <span class="form-label">目标网络空间:</span>
            <q-input dark color="primary" dense outlined v-model="assetProbeConfig.gateway" placeholder="如 192.168.1.0/24" class="col"/>
          </div>
          <div class="form-row">
            <span class="form-label">自定义探查网段:</span>
            <q-toggle dark color="primary" v-model="assetProbeConfig.rangeEnabled" />
          </div>
          <div class="form-row" v-if="assetProbeConfig.rangeEnabled">
            <span class="form-label"></span>
            <q-input dark color="primary" class="col" type="textarea" outlined v-model="assetProbeConfig.range" hint="每行一个网段, 例如:&#10;192.168.1.1-192.168.1.254&#10;10.0.0.1/24" />
          </div>
          <div class="form-row">
            <span class="form-label">探查速度:</span>
            <q-radio dark dense v-model="assetProbeConfig.rate" val="高" label="高" color="primary" />
            <q-radio dark dense v-model="assetProbeConfig.rate" val="中" label="中" color="primary" />
            <q-radio dark dense v-model="assetProbeConfig.rate" val="低" label="低" color="primary" />
          </div>
          <div class="text-h5 text-grey-5 q-ml-md">* 无论何种模式，最大并发线程数均不超过100个。</div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-lg">
          <q-btn label="确定" color="primary" unelevated style="width: 120px; font-size: 1.3rem;" @click="startAssetProbe" />
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
            <q-file
              v-model="importFile"
              @update:model-value="handleFileSelect"
              label="点击选择 Excel 文件"
              dark outlined dense
              accept=".xlsx, .xls"
              class="col-auto"
              style="min-width: 300px;"
            >
              <template v-slot:prepend><q-icon name="attach_file" /></template>
              <template v-slot:after v-if="importFile">
                <q-btn round dense flat icon="cancel" @click.stop.prevent="importFile = null; importPreviewData = []" />
              </template>
            </q-file>
            <q-btn
              color="primary" unelevated no-caps icon="download"
              label="下载导入模板"
              @click="navigateTo(importTemplateUrl)"
              :disable="true" title="模板功能待实现"
            />
            <q-space/>
            <div class="text-grey-5 text-caption">* 请确保使用模板文件进行导入，且“资产IP地址”为必填项。</div>
          </div>
        </q-card-section>

        <q-card-section class="col" style="overflow: auto;">
          <div v-if="importPreviewData.length > 0" class="text-h6 q-mb-sm text-weight-regular">导入数据预览 ({{ importPreviewData.length }} 条)</div>
          <q-table
            v-if="importPreviewData.length > 0"
            :rows="importPreviewData"
            :columns="importPreviewColumns"
            row-key="资产IP地址"
            dark dense flat bordered
            class="import-preview-table"
            style="height: 100%;"
          >
          </q-table>
          <div v-else class="text-center text-grey-6 full-height flex flex-center">
            <q-icon name="cloud_upload" size="xl" />
            <span class="q-ml-md text-h3">请先选择文件以预览</span>
          </div>
        </q-card-section>

        <q-separator dark />
        <q-card-actions align="right" class="q-pa-md bg-dark-header">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn
            label="确认导入"
            color="primary"
            unelevated
            :disable="importPreviewData.length === 0"
            @click="confirmImport"
            style="min-width: 120px;"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.exportAssets" persistent>
      <q-card class="bg-dark-page text-white" style="width: 90vw; max-width: 1200px; height: 90vh; display: flex; flex-direction: column;">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h5">资产导出</div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="col-auto">
          <div class="text-h6 text-weight-regular">导出数据预览 ({{ exportPreviewData.length }} 条)</div>
          <div class="text-caption text-grey-5">以下是当前资产台账中所有数据的预览。最终导出的文件将包含更详细的字段。</div>
        </q-card-section>

        <q-card-section class="text-h5 col" style="overflow: auto;">
          <q-table
            :rows="exportPreviewData"
            :columns="exportPreviewDisplayColumns"
            row-key="id"
            dark dense flat bordered
            style="height: 100%;"
            :pagination="{ rowsPerPage: 0 }"
          >
          </q-table>
        </q-card-section>

        <q-separator dark />
        <q-card-actions align="right" class="q-pa-md bg-dark-header">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn
            label="确认并下载"
            color="primary"
            unelevated
            icon="file_download"
            @click="confirmExport"
            style="min-width: 150px;"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.loginlessCheck">
      <q-card class="bg-dark-page text-white" style="width: 500px">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h6">免登录检查</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div>请在此处配置免登录检查的相关参数...</div>
        </q-card-section>
        <q-separator dark/>
        <q-card-actions align="right" class="bg-dark-header q-pa-md">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn label="开始检查" color="primary" unelevated/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.protocolSelection">
      <q-card class="bg-dark-page text-white" style="width: 500px">
        <q-card-section class="row items-center bg-dark-header">
          <div class="text-h6">选择登录检查协议</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div>请在此处选择需要使用的登录检查协议...</div>
        </q-card-section>
        <q-separator dark/>
        <q-card-actions align="right" class="bg-dark-header q-pa-md">
          <q-btn label="取消" flat color="white" v-close-popup />
          <q-btn label="下一步" color="primary" unelevated/>
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
:deep(.q-table__bottom) { background: #3d4a58; border-top: 1px solid #4f5b68;}

/* Dialog Styles */
.form-dialog { width: 700px; max-width: 90vw; }
.form-row { display: flex; align-items: center; margin-bottom: 2rem; min-height: 40px; }
.form-label {
  width: 200px;
  font-weight: 500;
  text-align: right;
  padding-right: 20px;
  flex-shrink: 0;
  font-size: 1.5rem; /* 增大表单标签字体 */
}
.form-row span:not(.form-label) { flex-grow: 1; font-size: 1.5rem; }
.bg-dark-page { background-color: #292a2d; }
.bg-dark-header { background-color: #333438; }
:deep(.q-dialog .text-h5) { font-size: 1.85rem; } /* 增大弹窗标题 */
:deep(.q-dialog .text-h6) { font-size: 1.6rem; }
:deep(.q-dialog .q-field__native), :deep(.q-dialog .q-field__label) {
  font-size: 2rem;
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
</style>
