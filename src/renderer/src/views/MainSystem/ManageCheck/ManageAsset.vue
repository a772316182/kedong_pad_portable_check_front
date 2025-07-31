<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// 引入 useQuasar 以使用 Dialog 和 Notify 插件
import { useQuasar } from 'quasar';

const router = useRouter();
// 初始化 Quasar
const $q = useQuasar();

// --- Data Models ---
const assets = ref([
  { id: 1, name: 'DESKTOP-KMPG2RJ', ip: '192.168.1.101', mac: '0C-9A-3C-FA-FA-D4', type: '主机设备', highRiskPort: '无', feature: 'windowsMicrosoft Windows 10 专业版', osName: 'windowsMicrosoft Windows 10 专业版', osVersion: '10.0.19042', vendor: 'Microsoft', model: 'Virtual Machine', securityZone: '安全区I', lastCheck: '2025-07-30', status: 'passed' },
  { id: 2, name: 'Linx', ip: '10.1.1.10', mac: '00:0c:29:98:1e:cb', type: '主机设备', highRiskPort: '无', feature: 'Linux 5.4', osName: 'Linux 5.4', osVersion: '5.4', vendor: 'Linux', model: 'Generic', securityZone: '安全区II', lastCheck: '2025-07-28', status: 'failed' },
  { id: 3, name: 'DESKTOP-RU0VMDI', ip: '10.1.1.13', mac: '00-0C-29-5D-47-33', type: '主机设备', highRiskPort: '无', feature: '凝思6.0.60', osName: '凝思安全操作系统', osVersion: '6.0.60', vendor: '凝思', model: 'Workstation', securityZone: '安全区I', status: 'unchecked' },
  { id: 4, name: 'Firewall-01', ip: '10.105.71.254', mac: '3c:e5:a6:80:5b:0f', type: '网络设备', highRiskPort: '无', feature: '--', osName: 'VendorOS', osVersion: 'v2.1', vendor: 'Cisco', model: 'ASA 5506', securityZone: '边界', lastCheck: '', status: 'unchecked' },
]);

// --- Dialog & Selection Control ---
const isAddDialogOpen = ref(false);
const isDetailDialogOpen = ref(false);
const isMergeDialogOpen = ref(false);
const isFilterDrawerVisible = ref(false);

const selectedAssetsIds = ref([]);
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

// --- Methods ---

const navigateTo = (path) => {
  router.push(path)
}

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
    id: newId, name: newAsset.value.name, ip: newAsset.value.ip, mac: newAsset.value.mac,
    type: newAsset.value.type, securityZone: newAsset.value.securityZone,
    vendor: newAsset.value.vendor, model: newAsset.value.model,
    highRiskPort: '无', feature: '--', status: 'unchecked'
  });
  isAddDialogOpen.value = false;
};

const openDetailDialog = (asset) => {
  currentDetailAsset.value = asset;
  isDetailDialogOpen.value = true;
};

const openMergeDialog = () => {
  if (selectedAssetsIds.value.length !== 2) {
    $q.notify({ color: 'warning', textColor: 'black', message: '请正好选择两个资产进行合并！' });
    return;
  }
  assetsToMerge.value = selectedAssetsIds.value.map(id => assets.value.find(a => a.id === id));
  isMergeDialogOpen.value = true;
};

// --- 修改后的删除方法 ---
const deleteSelectedAssets = () => {
  if (selectedAssetsIds.value.length === 0) {
    $q.notify({
      color: 'warning',
      textColor: 'black',
      message: '请至少选择一个资产进行删除'
    });
    return;
  }

  // 使用浏览器原生的 confirm 对话框
  const confirmed = window.confirm(`您确定要删除选中的 ${selectedAssetsIds.value.length} 个资产吗？此操作不可撤销。`);

  if (confirmed) {
    // 过滤掉主数据中被选中的项
    assets.value = assets.value.filter(asset => !selectedAssetsIds.value.includes(asset.id));

    // 清空选择
    selectedAssetsIds.value = [];

    $q.notify({
      color: 'positive',
      message: '删除成功'
    });
  }
};

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 顶部状态栏 -->
    <div class="status-bar row items-center justify-between q-px-md">
      <span>2025-07-31 13:32:12</span>
      <div class="text-h4 text-white text-weight-bolder text-center">资产管理</div>
      <span>当前电量: 57% <q-icon name="battery_full"/></span>
    </div>

    <!-- 主内容区 -->
    <q-page class="main-content-area">
      <!-- 顶部操作栏 -->
      <div class="row items-center no-wrap top-bar q-mb-md">
        <q-btn unelevated label="返回" @click="navigateTo('/stationview')" class="back-button"/>
        <div class="row items-center q-gutter-x-lg q-ml-xl">
          <q-btn flat dense no-caps class="action-btn" icon="swap_horiz" label="切换"/>
          <q-btn flat dense no-caps class="action-btn" icon="sort" label="排序" @click="isFilterDrawerVisible = true"/>
          <q-btn flat dense no-caps class="action-btn" icon="filter_list" label="筛选"/>
        </div>
        <q-space/>
        <div class="row items-center q-gutter-x-lg">
          <q-btn flat dense no-caps class="action-btn delete-btn" icon="delete" label="删除" @click="deleteSelectedAssets"/>
          <q-btn flat dense no-caps class="action-btn" icon="add" label="添加" @click="openAddDialog"/>
        </div>
      </div>

      <!-- 信息概览栏 -->
      <q-card class="info-panel q-pa-md q-mb-lg" flat>
        <div class="row items-center justify-between">
          <div class="column q-gutter-y-sm">
            <span class="text-body1">站点：四川省调</span>
            <span class="text-body1">资产数量：{{ totalAssets }}台</span>
          </div>
          <div class="column items-end q-gutter-y-sm">
            <div class="text-grey-7">最近核查：</div>
            <div class="row items-center q-gutter-x-lg text-body1">
              <span><q-badge color="green" rounded class="q-mr-sm"/>通过：{{ passedCount }}台</span>
              <span><q-badge color="red" rounded class="q-mr-sm"/>未通过：{{ failedCount }}台</span>
              <span><q-badge color="grey" rounded class="q-mr-sm"/>未核查：{{ uncheckedCount }}台</span>
            </div>
          </div>
          <q-btn color="primary" label="资产合并" unelevated @click="openMergeDialog"/>
        </div>
      </q-card>

      <!-- 资产卡片网格 -->
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
            <q-separator/>
            <q-card-actions align="left" class="q-pa-sm q-gutter-x-sm">
              <q-btn flat dense no-caps label="资产详情" @click="openDetailDialog(asset)"/>
              <q-btn flat dense no-caps label="核查记录"/>
              <q-btn flat dense no-caps label="选定" color="primary" @click="toggleSelection(asset.id)"/>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-page>

    <!-- 弹窗部分 -->
    <q-drawer v-model="isFilterDrawerVisible" side="right" overlay behavior="mobile" bordered :width="300" class="bg-teal-9 text-white">
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
            <div class="row items-center"><span class="form-label red-star">设备名称：</span><q-input outlined dense v-model="newAsset.name" placeholder="请输入名称" class="col"/></div>
            <div class="row items-center"><span class="form-label red-star">设备类型：</span><q-select outlined dense v-model="newAsset.type" :options="['主机设备', '网络设备', '安全设备', '未知']" placeholder="请选择设备类型" class="col"/></div>
            <div class="row items-center"><span class="form-label">开启高危端口：</span><span class="text-grey-7 q-ml-md">无</span></div>
            <div class="row items-center"><span class="form-label">安全分区：</span><q-select outlined dense v-model="newAsset.securityZone" :options="['安全区I', '安全区II', '边界']" placeholder="请选择安全分区" class="col"/></div>
            <div class="row items-center"><span class="form-label red-star">设备IP：</span><q-input outlined dense v-model="newAsset.ip" placeholder="请输入设备IP" class="col"/></div>
            <div class="row items-center"><span class="form-label">MAC地址：</span><q-input outlined dense v-model="newAsset.mac" placeholder="请输入MAC地址" class="col"/></div>
            <div class="row items-center"><span class="form-label">设备厂商：</span><q-input outlined dense v-model="newAsset.vendor" placeholder="请输入" class="col"/></div>
            <div class="row items-center"><span class="form-label">设备型号：</span><q-input outlined dense v-model="newAsset.model" placeholder="请输入" class="col"/></div>
          </q-form>
          <q-card-actions align="center" class="q-mt-lg q-gutter-x-md">
            <q-btn label="新增网卡" color="primary" outline />
            <q-btn label="保存" color="teal" unelevated @click="saveNewAsset" style="width: 100px" />
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
            <div class="row items-center"><span class="form-label">开启高危端口：</span><q-input readonly outlined dense :model-value="currentDetailAsset.highRiskPort" class="col"/></div>
            <div class="row items-center"><span class="form-label">安全分区：</span><q-select readonly outlined dense :model-value="currentDetailAsset.securityZone" :options="['安全区I', '安全区II', '边界']" class="col"/></div>
            <div class="row items-center"><span class="form-label">设备IP：</span><q-input readonly outlined dense :model-value="currentDetailAsset.ip" class="col"/></div>
            <div class="row items-center"><span class="form-label">MAC地址：</span><q-input readonly outlined dense :model-value="currentDetailAsset.mac" class="col"/></div>
            <div class="row items-center"><span class="form-label">操作系统名称：</span><q-input readonly outlined dense :model-value="currentDetailAsset.osName" class="col"/></div>
            <div class="row items-center"><span class="form-label">操作系统版本号：</span><q-input readonly outlined dense :model-value="currentDetailAsset.osVersion" class="col"/></div>
          </q-form>
          <q-card-actions align="center" class="q-mt-lg">
            <q-btn label="编辑" color="teal" unelevated style="width: 100px"/>
          </q-card-actions>
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
            <div class="cell">{{ assetsToMerge[0].model }}</div><div class="cell label">内核版本:</div><div class="cell"><q-radio :model-value="true" color="primary"/>{{ assetsToMerge[1].model }}</div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-lg q-gutter-x-md">
          <q-btn label="暂时合并" color="primary" unelevated outline style="width: 120px"/>
          <q-btn label="确认合并" color="teal" unelevated style="width: 120px"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
.page-background { background-color: #292a2d; }
.status-bar { position: absolute; top: 10px; left: 0; width: 100%; color: white; z-index: 10; }
.back-button { background-color: #4c6afc; color: white; font-weight: bold; border-radius: 6px; padding: 4px 16px; }
.main-content-area { padding: 60px 24px 24px; }
.top-bar .action-btn { color: white; font-size: 1.2rem; }
.delete-btn { color: #ff5252 !important; }
.info-panel { background-color: #3d4a58; color: #e0e0e0; border-radius: 8px; }
.asset-card { background-color: #e0e6ec; border-radius: 12px; position: relative; border: 1px solid #c5cdd3; transition: background-color 0.3s, border-color 0.3s; }
.asset-card.selected-card { background-color: #e3f2fd; border-color: #4c6afc; }
.status-badge { position: absolute; top: 10px; right: 10px; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; }
.status-passed { background-color: #28a745; }
.status-failed { background-color: #dc3545; }
.status-unchecked { background-color: rgba(0, 0, 0, 0.4); }
.asset-info { font-size: 0.9rem; color: #333; margin-bottom: 2px; }
.asset-info span { color: #666; display: inline-block; width: 100px; }
.asset-info .feature-text { color: #007bff; font-weight: 500; }
.form-label { width: 120px; font-weight: 500; text-align: right; margin-right: 16px; white-space: nowrap; }
.red-star::before { content: '* '; color: red; }
.merge-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px 16px; align-items: center; }
.merge-grid .cell { background-color: #f5f5f5; padding: 8px; border-radius: 4px; }
.merge-grid .label { font-weight: bold; text-align: center; background-color: transparent; }
.merge-grid .cell-multiline { line-height: 1.2; }
</style>
