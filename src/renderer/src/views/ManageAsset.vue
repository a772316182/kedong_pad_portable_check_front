<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
const plan = ref('free')
const router = useRouter();
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}
// --- Dialog & Menu Control ---
const isAddDialogOpen = ref(false);
const isFilterDialogOpen = ref(false);
const isFilterDrawerVisible = ref(false);

// --- Data Models ---

// 主页面资产列表数据
const assets = ref([
  { id: 1, ip: '10.105.71.240', mac: 'f4:6b:8c:c9:86:a7', type: '未知', highRiskPort: '无', feature: '--', status: 'unchecked' },
  { id: 2, ip: '10.105.71.242', mac: 'f4:6b:8c:8d:4a:22', type: '未知', highRiskPort: '无', feature: '--', status: 'unchecked' },
  { id: 3, ip: '10.105.71.244', mac: 'a4:be:2b:4d:ab:9d', type: '未知', highRiskPort: '无', feature: '--', status: 'unchecked' },
  { id: 4, ip: '10.105.71.243', mac: 'a4:be:2b:4d:b1:71', type: '未知', highRiskPort: '无', feature: '--', status: 'unchecked' },
  { id: 5, ip: '10.105.71.254', mac: '3c:e5:a6:80:5b:0f', type: '未知', highRiskPort: '无', feature: 'unchecked' },
  { id: 6, ip: '10.105.71.245', mac: '00:e6:30:06:1b:e9', type: '未知', highRiskPort: '无', feature: 'unchecked' },
]);

// 新增资产弹窗的数据模型
const addAssetTab = ref('single'); // 'single' 或 'batch'
const newAsset = ref({
  name: '', type: null, securityZone: null, ip: '', mac: '', vendor: '', model: ''
});

// 筛选条件弹窗的数据模型
const filters = ref({
  deviceType: '全部类型', checkStatus: '全部状态', securityZone: '全部类型',
  highRisk: '全部', ipSearch: '', keywordSearch: ''
});

// --- Computed Properties ---
const totalAssets = computed(() => assets.value.length);
// (可以根据真实数据扩展)
const passedCount = ref(0);
const failedCount = ref(0);
const uncheckedCount = computed(() => assets.value.filter(a => a.status === 'unchecked').length);

// --- Methods ---
const resetFilters = () => {
  filters.value = {
    deviceType: '全部类型', checkStatus: '全部状态', securityZone: '全部类型',
    highRisk: '全部', ipSearch: '', keywordSearch: ''
  };
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 顶部状态栏 -->
    <div class="status-bar row items-center justify-between q-px-md">
      <span>2025-06-20 15:48:53</span>
      <q-btn unelevated label="返回" @click="navigateTo('/stationview')" class="back-button"/>
    </div>

    <!-- 主内容区 -->
    <q-page class="main-content-area">
      <!-- 顶部操作栏 -->
      <div class="row items-center no-wrap top-bar q-mb-md">
        <div class="text-h4 text-white text-weight-bolder">资产管理</div>
        <div class="row items-center q-gutter-x-lg q-ml-xl">
          <q-btn flat dense no-caps class="action-btn" icon="o1" label="切换"/>
          <!-- 排序按钮与下拉菜单 -->
          <q-btn flat dense no-caps class="action-btn" icon="o2" label="排序" @click="isFilterDrawerVisible = true"/>

          <q-btn flat dense no-caps class="action-btn" icon="o3" label="筛选" @click="isFilterDialogOpen = true"/>
        </div>
        <q-space/>
        <div class="row items-center q-gutter-x-lg">
          <span class="text-white">当前电量: 15% <q-icon name="06"/></span>
          <q-btn flat dense no-caps class="action-btn" icon="o4" label="添加" @click="isAddDialogOpen = true"/>
        </div>
      </div>

      <!-- 信息概览栏 -->
      <q-card class="info-panel q-pa-md q-mb-lg" flat>
        <div class="row items-center justify-between">
          <div class="column q-gutter-y-sm">
            <span class="text-body1">站点：省调1</span>
            <span class="text-body1">资产数量：{{ totalAssets }}台</span>
          </div>
          <div class="column items-end q-gutter-y-sm">
            <div class="row items-center q-gutter-x-lg text-body1">
              <span><q-badge color="green" rounded class="q-mr-sm"/>通过：{{ passedCount }}台</span>
              <span><q-badge color="red" rounded class="q-mr-sm"/>未通过：{{ failedCount }}台</span>
              <span><q-badge color="grey" rounded class="q-mr-sm"/>未核查：{{ uncheckedCount }}台</span>
            </div>
            <div class="text-grey-7">最近核查：</div>
          </div>
          <q-btn color="teal" label="资产合并" unelevated/>
        </div>
      </q-card>

      <!-- 资产卡片网格 -->
      <div class="row q-col-gutter-lg">
        <div v-for="asset in assets" :key="asset.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="asset-card" flat>
            <div class="status-badge">未核查</div>
            <q-btn flat round dense icon="o5" size="sm" class="close-btn"/>
            <q-card-section>
              <div class="text-h6 text-weight-bold q-mb-sm">{{ asset.ip }}</div>
              <div class="asset-info"><span>设备IP：</span>{{ asset.ip }}</div>
              <div class="asset-info"><span>MAC地址：</span>{{ asset.mac }}</div>
              <div class="asset-info"><span>设备类型：</span>{{ asset.type }}</div>
              <div class="asset-info"><span>开启高危端口：</span>{{ asset.highRiskPort }}</div>
              <div class="asset-info"><span>资产特征识别：</span>{{ asset.feature }}</div>
            </q-card-section>
            <q-separator/>
            <q-card-actions align="left" class="q-pa-sm q-gutter-x-sm">
              <q-btn flat dense no-caps label="资产详情"/>
              <q-btn flat dense no-caps label="核查记录"/>
              <q-btn flat dense no-caps label="选定" color="primary"/>
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </q-page>
    <!-- 右侧筛选抽屉 -->
    <q-drawer v-model="isFilterDrawerVisible" side="right" overlay behavior="mobile" bordered :width="300" class="bg-teal-9 text-white">
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <h5 class="q-mt-none q-mb-md">筛选</h5>
          <!-- 筛选表单内容可以放在这里 -->
            <div class="q-pa-md">
              <div class="q-gutter-sm">
                <q-radio v-model="plan" val="1" label="发现时间倒序" />
                <q-radio v-model="plan" val="2" label="发现时间正序" />
                <q-radio v-model="plan" val="3" label="IP升序" />
                <q-radio v-model="plan" val="4" label="IP降序" />
                <q-radio v-model="plan" val="5" label="高危端口数升序" />
                <q-radio v-model="plan" val="6" label="高危端口数降序" />
              </div>
              <div class="q-mt-md">
              </div>
            </div>
          <q-btn color="light-blue-6" label="重置" class="full-width q-mt-md" @click="isFilterDrawerVisible = false" />
          <q-btn color="light-blue-6" label="筛选" class="full-width q-mt-md" @click="isFilterDrawerVisible = false" />
        </div>
      </q-scroll-area>
    </q-drawer>
    <!-- 新增资产 Dialog -->
    <q-dialog v-model="isAddDialogOpen">
      <q-card style="width: 600px; max-width: 90vw;">
        <q-tabs v-model="addAssetTab" class="text-grey" active-color="primary" indicator-color="primary" align="left" narrow-indicator>
          <q-tab name="batch" label="批量新增"/>
          <q-tab name="single" label="新增资产"/>
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="addAssetTab" animated>
          <q-tab-panel name="batch"><div class="text-center q-pa-xl">批量新增功能开发中...</div></q-tab-panel>
          <q-tab-panel name="single" class="q-pa-lg">
            <q-form class="q-gutter-md">
              <div class="row items-center"><span class="form-label">设备名称：</span><q-input outlined dense v-model="newAsset.name" placeholder="请输入名称" class="col"/></div>
              <div class="row items-center"><span class="form-label">设备类型：</span><q-select outlined dense v-model="newAsset.type" :options="['类型A', '类型B']" label="请选择设备类型" class="col"/></div>
              <div class="row items-center"><span class="form-label">开启高危端口：</span><span class="text-grey-7">无</span></div>
              <div class="row items-center"><span class="form-label">安全分区：</span><q-select outlined dense v-model="newAsset.securityZone" :options="['分区A', '分区B']" label="请选择安全分区" class="col"/></div>
              <div class="row items-center"><span class="form-label">设备IP：</span><q-input outlined dense v-model="newAsset.ip" placeholder="请输入设备IP" class="col"/></div>
              <div class="row items-center"><span class="form-label">MAC地址：</span><q-input outlined dense v-model="newAsset.mac" placeholder="请输入MAC地址" class="col"/></div>
              <div class="row items-center"><span class="form-label">设备厂商：</span><q-input outlined dense v-model="newAsset.vendor" placeholder="请输入" class="col"/></div>
              <div class="row items-center"><span class="form-label">设备型号：</span><q-input outlined dense v-model="newAsset.model" placeholder="请输入" class="col"/></div>
            </q-form>
            <q-card-actions align="center" class="q-mt-lg q-gutter-x-md">
              <q-btn label="新增网卡" color="primary" outline />
              <q-btn label="保存" color="teal" unelevated @click="isAddDialogOpen = false" style="width: 100px" />
            </q-card-actions>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>

    <!-- 筛选条件 Dialog -->
    <q-dialog v-model="isFilterDialogOpen">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section class="text-center">
          <div class="text-h5">筛选条件选定</div>
        </q-card-section>
        <q-card-section class="q-gutter-y-lg">
          <div class="row items-center"><span class="form-label">设备类型</span><q-radio v-model="filters.deviceType" val="全部类型" label="全部类型"/><q-radio v-model="filters.deviceType" val="未知" label="未知"/><q-radio v-model="filters.deviceType" val="主机设备" label="主机设备"/><q-radio v-model="filters.deviceType" val="网络设备" label="网络设备"/><q-radio v-model="filters.deviceType" val="安全设备" label="安全设备"/><q-radio v-model="filters.deviceType" val="纵向隔离设备" label="纵向隔离设备"/><q-radio v-model="filters.deviceType" val="其他" label="其他"/></div>
          <div class="row items-center"><span class="form-label">核查状态</span><q-radio v-model="filters.checkStatus" val="全部状态" label="全部状态"/><q-radio v-model="filters.checkStatus" val="通过" label="通过"/><q-radio v-model="filters.checkStatus" val="未通过" label="未通过"/><q-radio v-model="filters.checkStatus" val="未核查" label="未核查"/><q-radio v-model="filters.checkStatus" val="待确认" label="待确认"/></div>
          <div class="row items-center"><span class="form-label">安全分区</span><q-radio v-model="filters.securityZone" val="全部类型" label="全部类型"/><q-radio v-model="filters.securityZone" val="安全区" label="安全区"/><q-radio v-model="filters.securityZone" val="安全II区" label="安全II区"/><q-radio v-model="filters.securityZone" val="未知" label="未知"/></div>
          <div class="row items-center"><span class="form-label">高危端口</span><q-radio v-model="filters.highRisk" val="全部" label="全部"/><q-radio v-model="filters.highRisk" val="有" label="有"/><q-radio v-model="filters.highRisk" val="无" label="无"/></div>
          <div class="row items-center"><span class="form-label">设备IP查询</span><q-input outlined dense v-model="filters.ipSearch" placeholder="请输入设备IP" class="col"/></div>
          <div class="row items-center"><span class="form-label">模糊查询</span><q-input outlined dense v-model="filters.keywordSearch" placeholder="请输入设备名称/厂商/型号/操作信息" class="col"/></div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-lg q-gutter-x-md">
          <q-btn label="重置" color="grey-6" @click="resetFilters" style="width: 100px" unelevated/>
          <q-btn label="筛选" color="teal" @click="isFilterDialogOpen = false" style="width: 100px" unelevated/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
.page-background {
  background-color: #313942;
}
.status-bar {
  position: absolute; top: 10px; left: 0; width: 100%; color: white; z-index: 10;
}
.back-button {
  background-color: #00796b; color: white; font-weight: bold; border-radius: 6px; padding: 4px 16px;
}
.main-content-area {
  padding: 60px 24px 24px;
}
.top-bar .action-btn {
  color: white; font-size: 1.5rem;
}
.info-panel {
  background-color: #3d4a58;
  color: #e0e0e0;
  border-radius: 8px;
}
.asset-card {
  background-color: #e0e6ec;
  border-radius: 12px;
  position: relative;
  border: 1px solid #c5cdd3;
}
.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}
.close-btn {
  position: absolute;
  top: 40px;
  right: 4px;
  color: grey;
}
.asset-info {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 2px;
}
.asset-info span {
  color: #666;
  display: inline-block;
  width: 100px;
}
.form-label {
  width: 120px;
  font-weight: 500;
  text-align: right;
  margin-right: 16px;
}
</style>
