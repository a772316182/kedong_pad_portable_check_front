<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

// --- View Control ---
// 'card' for the grid view, 'list' for the dual-pane view
const viewMode = ref('card');

// --- Unified Data Model (from the more detailed first file) ---
const assets = ref([
  { id: 1, name: 'DESKTOP-KMPG2RJ', ip: '192.168.1.101', mac: '0C-9A-3C-FA-FA-D4', type: '主机设备', highRiskPort: '无', feature: 'windowsMicrosoft Windows 10 专业版', osName: 'windowsMicrosoft Windows 10 专业版', osVersion: '10.0.19042', vendor: 'Microsoft', model: 'Virtual Machine', securityZone: '安全区I', lastCheck: '2025-07-30', status: 'passed' },
  { id: 2, name: 'Linx', ip: '10.1.1.10', mac: '00:0c:29:98:1e:cb', type: '主机设备', highRiskPort: '无', feature: 'Linux 5.4', osName: 'Linux 5.4', osVersion: '5.4', vendor: 'Linux', model: 'Generic', securityZone: '安全区II', lastCheck: '2025-07-28', status: 'failed' },
  { id: 3, name: 'DESKTOP-RU0VMDI', ip: '10.1.1.13', mac: '00-0C-29-5D-47-33', type: '主机设备', highRiskPort: '无', feature: '凝思6.0.60', osName: '凝思安全操作系统', osVersion: '6.0.60', vendor: '凝思', model: 'Workstation', securityZone: '安全区I', lastCheck: '', status: 'unchecked' },
  { id: 4, name: 'Firewall-01', ip: '10.105.71.254', mac: '3c:e5:a6:80:5b:0f', type: '网络设备', highRiskPort: '无', feature: '--', osName: 'VendorOS', osVersion: 'v2.1', vendor: 'Cisco', model: 'ASA 5506', securityZone: '边界', lastCheck: '', status: 'unchecked' },
  { id: 5, name: '服务器-01', ip: '10.105.71.240', mac: 'f4:6b:8c:c9:86:a7', type: '主机设备', highRiskPort: '无', feature: 'Windows Server 2019', osName: 'Windows Server 2019', osVersion: '10.0.17763', vendor: 'Dell', model: 'PowerEdge R740', securityZone: '安全I区', lastCheck: '2025-06-19', status: 'passed' }
]);

// --- Dialog & Selection Control ---
const isAddDialogOpen = ref(false);
const isDetailDialogOpen = ref(false);
const isMergeDialogOpen = ref(false);
const isFilterDrawerVisible = ref(false);

const selectedAssetsIds = ref([]); // For card view multi-selection
const selectedAssetId = ref(1); // For list view single-selection
const currentDetailAsset = ref(null);
const assetsToMerge = ref([]);

// --- New Asset Form Model ---
const getInitialNewAssetState = () => ({
  name: '', type: null, securityZone: null, ip: '', mac: '', vendor: '', model: ''
});
const newAsset = ref(getInitialNewAssetState());

// --- Computed Properties ---
const totalAssets = computed(() => assets.value.length);
const passedCount = computed(() => assets.value.filter(a => a.status === 'passed').length);
const failedCount = computed(() => assets.value.filter(a => a.status === 'failed').length);
const uncheckedCount = computed(() => assets.value.filter(a => a.status === 'unchecked').length);

// For List/Detail View:
const currentAssetDetails = computed(() => {
  return assets.value.find(asset => asset.id === selectedAssetId.value) || null;
});

// --- Methods ---

const navigateTo = (path) => {
  router.push(path)
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'card' ? 'list' : 'card';
};

const selectAsset = (id) => {
  selectedAssetId.value = id;
};

const toggleSelection = (assetId) => {
  const index = selectedAssetsIds.value.indexOf(assetId);
  if (index > -1) {
    selectedAssetsIds.value.splice(index, 1);
  } else {
    selectedAssetsIds.value.push(assetId);
  }
};

const openAddDialog = () => { isAddDialogOpen.value = true; };
const onAddDialogHide = () => { newAsset.value = getInitialNewAssetState(); };

const saveNewAsset = () => {
  if (!newAsset.value.name || !newAsset.value.type || !newAsset.value.ip) {
    $q.notify({ color: 'negative', message: '请填写所有必填项！' });
    return;
  }
  const newId = Date.now();
  assets.value.push({
    id: newId,
    name: newAsset.value.name,
    ip: newAsset.value.ip,
    mac: newAsset.value.mac,
    type: newAsset.value.type,
    securityZone: newAsset.value.securityZone,
    vendor: newAsset.value.vendor,
    model: newAsset.value.model,
    highRiskPort: '无',
    feature: '--',
    status: 'unchecked',
    lastCheck: '',
    osName: '',
    osVersion: ''
  });
  isAddDialogOpen.value = false;
};

const openDetailDialog = (asset) => {
  currentDetailAsset.value = asset;
  isDetailDialogOpen.value = true;
};

const openMergeDialog = () => {
  if (viewMode.value === 'list') {
    $q.notify({ color: 'info', message: '请在卡片视图下进行资产合并操作。' });
    return;
  }
  if (selectedAssetsIds.value.length !== 2) {
    $q.notify({ color: 'warning', message: '请在卡片视图中正好选择两个资产进行合并！' });
    return;
  }
  assetsToMerge.value = selectedAssetsIds.value.map(id => assets.value.find(a => a.id === id));
  isMergeDialogOpen.value = true;
};

const deleteSelectedAssets = () => {
  if (viewMode.value === 'list') {
    $q.notify({ color: 'info', message: '请在卡片视图下进行批量删除操作。' });
    return;
  }
  if (selectedAssetsIds.value.length === 0) {
    $q.notify({ color: 'warning', message: '请在卡片视图中至少选择一个资产进行删除' });
    return;
  }
  const confirmed = window.confirm(`您确定要删除选中的 ${selectedAssetsIds.value.length} 个资产吗？`);
  if (confirmed) {
    assets.value = assets.value.filter(asset => !selectedAssetsIds.value.includes(asset.id));
    selectedAssetsIds.value = [];
    $q.notify({ color: 'positive', message: '删除成功' });
  }
};

const deleteSingleAsset = (id) => {
  const confirmed = window.confirm(`您确定要删除该资产吗？`);
  if (confirmed) {
    const index = assets.value.findIndex(asset => asset.id === id);
    if (index > -1) {
      assets.value.splice(index, 1);
      $q.notify({ color: 'positive', message: '删除成功' });
    }
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 主内容区 -->
    <q-page class="main-content-area">
      <!-- 顶部操作栏 -->
      <div class="row items-center no-wrap top-bar q-mb-md">
        <q-btn unelevated label="返回" @click="navigateTo('/stationview')" class="action-button" icon="arrow_back"/>
        <div class="text-h4 text-white text-weight-bolder q-ml-lg" style="color: #4c6afc;">资产管理</div>
        <q-space/>
        <div class="row items-center q-gutter-x-md">
          <q-btn
            unelevated
            label="切换视图"
            @click="toggleView"
            class="action-button"
            :icon="viewMode === 'card' ? 'view_list' : 'grid_view'"
          />
          <q-btn unelevated label="排序" @click="isFilterDrawerVisible = true" class="action-button" icon="sort"/>
          <q-btn unelevated label="删除" @click="deleteSelectedAssets" class="action-button-delete" icon="delete"/>
          <q-btn unelevated label="添加" @click="openAddDialog" class="action-button" icon="add"/>
        </div>
      </div>

      <!-- View: Card Grid -->
      <div v-if="viewMode === 'card'">
        <q-card class="info-panel q-pa-md q-mb-lg" flat>
          <div class="row items-center justify-between">
            <div class="column q-gutter-y-sm">
              <span class="text-body1">站点：四川省调</span>
              <span class="text-body1">资产数量：{{ totalAssets }}台</span>
            </div>
            <div class="column items-end q-gutter-y-sm">
              <div class="text-grey-5">最近核查：</div>
              <div class="row items-center q-gutter-x-lg text-body1">
                <span><q-badge color="green" rounded class="q-mr-sm"/>通过：{{ passedCount }}台</span>
                <span><q-badge color="red" rounded class="q-mr-sm"/>未通过：{{ failedCount }}台</span>
                <span><q-badge color="grey" rounded class="q-mr-sm"/>未核查：{{ uncheckedCount }}台</span>
              </div>
            </div>
            <q-btn color="primary" label="资产合并" unelevated @click="openMergeDialog" class="action-button" icon="merge_type"/>
          </div>
        </q-card>
        <div class="row q-col-gutter-lg">
          <div v-for="asset in assets" :key="asset.id" class="col-12 col-sm-6 col-md-4">
            <q-card class="asset-card" flat :class="{'selected-card': selectedAssetsIds.includes(asset.id)}">
              <div class="status-badge" :class="`status-${asset.status}`">
                {{ asset.status === 'passed' ? '通过' : asset.status === 'failed' ? '未通过' : '未核查' }}
              </div>
              <q-card-section>
                <div class="text-h6 text-weight-bold q-mb-sm">{{ asset.name || asset.ip }}</div>
                <div class="asset-info"><span>设备IP：</span>{{ asset.ip }}</div>
                <div class="asset-info"><span>MAC地址：</span>{{ asset.mac }}</div>
                <div class="asset-info"><span>设备类型：</span>{{ asset.type }}</div>
                <div class="asset-info"><span>开启高危端口：</span>{{ asset.highRiskPort }}</div>
                <div class="asset-info"><span>资产特征识别：</span>
                  <span class="feature-text">{{ asset.feature }}</span>
                </div>
              </q-card-section>
              <q-separator color="rgba(255,255,255,0.1)"/>
              <q-card-actions align="left" class="q-pa-sm q-gutter-x-sm">
                <q-btn flat dense no-caps label="资产详情" color="light-blue-3" @click="openDetailDialog(asset)"/>
                <q-btn flat dense no-caps label="核查记录" color="light-blue-3"/>
                <q-btn flat dense no-caps label="选定" color="light-blue-1" @click="toggleSelection(asset.id)"/>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <!-- View: List/Detail -->
      <div v-if="viewMode === 'list'">
        <q-card class="info-panel q-pa-md q-mb-lg" flat>
          <div class="row items-center justify-between">
            <span class="text-body1">当前站点：四川省调</span>
            <div class="text-red">总记录总数：{{ totalAssets }}</div>
            <q-btn color="primary" label="资产合并" unelevated @click="openMergeDialog" class="action-button" icon="merge_type"/>
          </div>
        </q-card>
        <div class="row main-panel-container">
          <!-- Left Panel -->
          <div class="col-3 left-panel">
            <div class="panel-header">
              <span>资产列表</span>
              <q-btn unelevated color="primary" label="新增" dense @click="openAddDialog"/>
            </div>
            <q-list separator>
              <q-item
                v-for="asset in assets"
                :key="asset.id"
                clickable v-ripple
                :active="selectedAssetId === asset.id"
                @click="selectAsset(asset.id)"
                class="asset-item"
                active-class="active-asset-item"
              >
                <q-item-section>{{ asset.ip }}</q-item-section>
                <q-item-section side>
                  <q-btn round flat dense icon="close" size="sm" @click.stop="deleteSingleAsset(asset.id)"/>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
          <!-- Right Panel -->
          <div class="col-9 right-panel">
            <div class="panel-header">
              <span>资产详情</span>
              <q-btn flat dense round icon="edit" @click="currentAssetDetails && openDetailDialog(currentAssetDetails)"/>
            </div>
            <div v-if="currentAssetDetails" class="detail-grid">
              <div class="detail-label">设备名称</div><div class="detail-value">{{ currentAssetDetails.name }}</div>
              <div class="detail-label">设备类型</div><div class="detail-value">{{ currentAssetDetails.type }}</div>
              <div class="detail-label">最近核查</div><div class="detail-value">{{ currentAssetDetails.lastCheck }}</div>
              <div class="detail-label">开启高危端口</div><div class="detail-value">{{ currentAssetDetails.highRiskPort }}</div>
              <div class="detail-label">资产特征识别</div><div class="detail-value">{{ currentAssetDetails.feature }}</div>
              <div class="detail-label">安全分区</div><div class="detail-value">{{ currentAssetDetails.securityZone }}</div>
              <div class="detail-label">设备IP</div><div class="detail-value">{{ currentAssetDetails.ip }}</div>
              <div class="detail-label">MAC地址</div><div class="detail-value">{{ currentAssetDetails.mac }}</div>
              <div class="detail-label">设备厂商</div><div class="detail-value">{{ currentAssetDetails.vendor }}</div>
              <div class="detail-label">设备型号</div><div class="detail-value">{{ currentAssetDetails.model }}</div>
            </div>
            <div v-else class="flex flex-center text-grey-5" style="height: 100%;">
              请从左侧选择一个资产查看详情
            </div>
          </div>
        </div>
      </div>
    </q-page>

    <!-- Dialogs (shared between views) -->
    <q-drawer v-model="isFilterDrawerVisible" side="right" overlay behavior="mobile" bordered :width="300" class="bg-dark text-white">
      <div class="q-pa-md">排序功能开发中...</div>
    </q-drawer>

    <q-dialog v-model="isAddDialogOpen" @hide="onAddDialogHide">
      <q-card style="width: 600px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <q-btn flat label="批量新增" class="text-grey"/>
          <q-separator vertical inset />
          <div class="text-h6 q-ml-md">新增资产</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <q-form class="q-gutter-md">
            <div class="row items-center"><span class="form-label red-star">设备名称：</span><q-input outlined dense v-model="newAsset.name" class="col"/></div>
            <div class="row items-center"><span class="form-label red-star">设备类型：</span><q-select outlined dense v-model="newAsset.type" :options="['主机设备', '网络设备', '安全设备', '未知']" class="col"/></div>
            <div class="row items-center"><span class="form-label">安全分区：</span><q-select outlined dense v-model="newAsset.securityZone" :options="['安全区I', '安全区II', '边界']" class="col"/></div>
            <div class="row items-center"><span class="form-label red-star">设备IP：</span><q-input outlined dense v-model="newAsset.ip" class="col"/></div>
            <div class="row items-center"><span class="form-label">MAC地址：</span><q-input outlined dense v-model="newAsset.mac" class="col"/></div>
            <div class="row items-center"><span class="form-label">设备厂商：</span><q-input outlined dense v-model="newAsset.vendor" class="col"/></div>
            <div class="row items-center"><span class="form-label">设备型号：</span><q-input outlined dense v-model="newAsset.model" class="col"/></div>
          </q-form>
          <q-card-actions align="center" class="q-mt-lg q-gutter-x-md">
            <q-btn label="新增网卡" color="primary" outline />
            <q-btn label="保存" color="primary" unelevated @click="saveNewAsset" style="width: 100px" />
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isDetailDialogOpen">
      <q-card v-if="currentDetailAsset" style="width: 600px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">资产详情</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <q-form class="q-gutter-md">
            <div class="row items-center"><span class="form-label">设备名称：</span><q-input readonly outlined dense :model-value="currentDetailAsset.name" class="col"/></div>
            <div class="row items-center"><span class="form-label">设备类型：</span><q-input readonly outlined dense :model-value="currentDetailAsset.type" class="col"/></div>
            <div class="row items-center"><span class="form-label">最近核查：</span><q-input readonly outlined dense :model-value="currentDetailAsset.lastCheck" class="col"/></div>
            <div class="row items-center"><span class="form-label">安全分区：</span><q-input readonly outlined dense :model-value="currentDetailAsset.securityZone" class="col"/></div>
            <div class="row items-center"><span class="form-label">设备IP：</span><q-input readonly outlined dense :model-value="currentDetailAsset.ip" class="col"/></div>
            <div class="row items-center"><span class="form-label">MAC地址：</span><q-input readonly outlined dense :model-value="currentDetailAsset.mac" class="col"/></div>
            <div class="row items-center"><span class="form-label">操作系统名称：</span><q-input readonly outlined dense :model-value="currentDetailAsset.osName" class="col"/></div>
            <div class="row items-center"><span class="form-label">操作系统版本号：</span><q-input readonly outlined dense :model-value="currentDetailAsset.osVersion" class="col"/></div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isMergeDialogOpen">
      <q-card v-if="assetsToMerge.length === 2" style="width: 800px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">资产合并</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="merge-grid">
            <div class="text-h6 text-center">{{ assetsToMerge[0].name }}</div><div></div><div class="text-h6 text-center">{{ assetsToMerge[1].name }}</div>
            <div class="cell">{{ assetsToMerge[0].ip }}</div><div class="cell label">设备IP:</div><div class="cell"><q-toggle :model-value="true" color="primary"/>{{ assetsToMerge[1].ip }}</div>
            <div class="cell">{{ assetsToMerge[0].mac }}</div><div class="cell label">设备MAC:</div><div class="cell"><q-toggle :model-value="true" color="primary"/>{{ assetsToMerge[1].mac }}</div>
            <div class="cell">{{ assetsToMerge[0].type }}</div><div class="cell label">设备类型:</div><div class="cell"><q-toggle :model-value="true" color="primary"/>{{ assetsToMerge[1].type }}</div>
            <div class="cell">{{ assetsToMerge[0].securityZone }}</div><div class="cell label">所属分区:</div><div class="cell"><q-toggle :model-value="true" color="primary"/>{{ assetsToMerge[1].securityZone }}</div>
            <div class="cell cell-multiline">{{ assetsToMerge[0].osName }}</div><div class="cell label">操作系统:</div><div class="cell cell-multiline"><q-radio :model-value="true" color="primary"/>{{ assetsToMerge[1].osName }}</div>
            <div class="cell">{{ assetsToMerge[0].osVersion }}</div><div class="cell label">系统版本:</div><div class="cell"><q-radio :model-value="true" color="primary"/>{{ assetsToMerge[1].osVersion }}</div>
            <div class="cell">{{ assetsToMerge[0].vendor }}</div><div class="cell label">厂商信息:</div><div class="cell"><q-radio :model-value="true" color="primary"/>{{ assetsToMerge[1].vendor }}</div>
            <div class="cell">{{ assetsToMerge[0].model }}</div><div class="cell label">设备型号:</div><div class="cell"><q-radio :model-value="true" color="primary"/>{{ assetsToMerge[1].model }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-lg q-gutter-x-md">
          <q-btn label="暂时合并" color="primary" unelevated outline style="width: 120px"/>
          <q-btn label="确认合并" color="primary" unelevated style="width: 120px"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
/* --- General & Unified Styles --- */
.page-background { background-color: #292a2d; }
.main-content-area { padding: 24px; padding-top: 80px; }
.action-button { background-color: #4c6afc; color: white; font-weight: bold; border-radius: 6px; padding: 4px 12px; }
.action-button .q-icon { font-size: 1.2em; margin-right: 4px; }
.action-button-delete { background-color: #ff5252; color: white; font-weight: bold; border-radius: 6px; padding: 4px 12px; }
.action-button-delete .q-icon { font-size: 1.2em; margin-right: 4px; }
.info-panel { background-color: #333438; color: #e0e0e0; border-radius: 8px; }
.top-bar { padding-bottom: 1rem; }

/* --- Card View Specific Styles --- */
.asset-card {
  background-color: #3d4a58;
  color: #e0e0e0;
  border-radius: 12px;
  position: relative;
  border: 1px solid #4f5b68;
  /* **** MODIFIED: Added transition for smooth effect **** */
  transition: all 0.3s ease;
}
.asset-card.selected-card {
  border-color: #4c6afc;
  box-shadow: 0 0 10px rgba(76, 106, 252, 0.5);
  /* **** MODIFIED: Added brightness filter for darkening effect **** */
  filter: brightness(0.8);
}
.status-badge { position: absolute; top: 10px; right: 10px; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; }
.status-passed { background-color: #28a745; }
.status-failed { background-color: #dc3545; }
.status-unchecked { background-color: #6c757d; }
.asset-info { font-size: 0.9rem; margin-bottom: 2px; }
.asset-info span { color: #aeb8c4; display: inline-block; width: 100px; }
.asset-info .feature-text { color: #69c0ff; font-weight: 500; }

/* --- List/Detail View Specific Styles --- */
.main-panel-container { height: calc(100vh - 200px); }
.left-panel, .right-panel { background-color: #333438; color: #e0e0e0; border: 1px solid #424242; }
.left-panel { border-right: none; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background-color: rgba(76, 106, 252, 0.1); border-bottom: 1px solid #4c6afc; font-weight: bold; color: #fff; }
.asset-item { color: #e0e0e0; font-size: 1rem; }
.asset-item .q-item__section--side .q-btn { color: #9e9e9e; }
.active-asset-item { background-color: #4c6afc !important; color: white !important; }
.detail-grid { display: grid; grid-template-columns: 150px 1fr; gap: 16px; padding: 24px; color: #e0e0e0; }
.detail-label { font-weight: 500; color: #aeb8c4; text-align: right; }
.detail-value { color: #e0e0e0; }

/* --- Dialog Styles --- */
.form-label { width: 120px; font-weight: 500; text-align: right; margin-right: 16px; white-space: nowrap; }
.red-star::before { content: '* '; color: red; }
.merge-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px 16px; align-items: center; }
.merge-grid .cell { background-color: #f5f5f5; padding: 8px; border-radius: 4px; color: #333}
.merge-grid .label { font-weight: bold; text-align: center; background-color: transparent; }
.merge-grid .cell-multiline { line-height: 1.2; }
</style>
