<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- 控制器 ---
const isMergeDialogOpen = ref(false); // 控制资产合并弹窗
const selectedAssetId = ref(1); // 当前选中的资产ID

// --- 数据模型 ---

// 左侧资产列表
const assetList = ref([
  { id: 1, ip: '10.105.71.240' },
  { id: 2, ip: '10.105.71.242' },
  { id: 3, ip: '10.105.71.244' },
  { id: 4, ip: '10.105.71.243' },
  { id: 5, ip: '10.105.71.254' },
  { id: 6, ip: '10.105.71.245' },
  { id: 7, ip: '10.105.71.234' },
  { id: 8, ip: '10.105.71.249' },
]);

// 资产的详细信息 (实际项目中可能通过API获取)
const assetDetails = ref({
  id: 1,
  name: '服务器-01',
  type: '主机设备',
  lastCheck: '2025-06-19',
  highRiskPort: '无',
  feature: 'Windows Server 2019',
  securityZone: '安全I区',
  ip: '10.105.71.240',
  mac: 'f4:6b:8c:c9:86:a7',
  vendor: 'Dell',
  model: 'PowerEdge R740',
});

// 计算属性：根据selectedAssetId动态显示详情
// (此处为演示，实际应根据ID从完整列表中查找)
const currentAssetDetails = computed(() => assetDetails.value);

// 资产合并弹窗的数据模型
const mergeData = ref({
  assetA: { name: '', ip: '10.105.71.234', mac: '58:53:c0:65:3d:4d', type: '未知', partition: '安全II区', feature: 'Linux Kernel 5.x' },
  assetB: { name: '交换机-核心', ip: '10.105.71.234', mac: '58:53:c0:65:3d:4d', type: '网络设备', partition: '安全II区', feature: 'Cisco IOS' },
  // 'A' 或 'B'，决定合并后使用哪个源的数据
  selection: {
    name: 'B', ip: 'A', mac: 'A', type: 'B', partition: 'A', feature: 'B'
  }
});


// --- 方法 ---
const goBack = () => router.go(-1);
const selectAsset = (id) => { selectedAssetId.value = id; };
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 顶部状态栏 -->
    <div class="status-bar row items-center justify-between q-px-md">
      <span>2025-06-20 15:49:24</span>
      <q-btn unelevated label="返回" @click="goBack" class="back-button"/>
    </div>

    <!-- 主内容区 -->
    <q-page class="main-content-area">
      <!-- 顶部操作栏 -->
      <div class="row items-center no-wrap top-bar q-mb-md">
        <div class="text-h4 text-white text-weight-bolder">资产管理</div>
        <q-space />
        <div class="row items-center q-gutter-x-lg">
          <q-btn flat dense no-caps class="action-btn" icon="o" label="切换"/>
          <q-btn flat dense no-caps class="action-btn" icon="o" label="排序"/>
          <q-btn flat dense no-caps class="action-btn" icon="o" label="筛选"/>
          <span class="text-white">当前电量: 15% <q-icon name="o"/></span>
          <q-btn flat dense no-caps class="action-btn" icon="o" label="添加"/>
        </div>
      </div>

      <!-- 信息概览栏 -->
      <q-card class="info-panel q-pa-sm q-mb-md" flat>
        <div class="row items-center justify-between">
          <div class="column q-gutter-y-sm">
            <span class="text-body1">当前站点：省调1</span>
          </div>
          <div class="text-red">总记录总数：{{ assetList.length }}</div>
          <q-btn color="primary" label="资产合并" unelevated @click="isMergeDialogOpen = true"/>
        </div>
      </q-card>

      <!-- 双栏布局 -->
      <div class="row main-panel-container">
        <!-- 左侧资产列表 -->
        <div class="col-3 left-panel">
          <div class="panel-header">
            <span>资产列表</span>
            <q-btn unelevated color="primary" label="新增" dense/>
          </div>
          <q-list separator>
            <q-item
              v-for="asset in assetList"
              :key="asset.id"
              clickable v-ripple
              :active="selectedAssetId === asset.id"
              @click="selectAsset(asset.id)"
              class="asset-item"
              active-class="active-asset-item"
            >
              <q-item-section>{{ asset.ip }}</q-item-section>
              <q-item-section side>
                <q-btn round flat dense icon="close" size="sm"/>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 右侧资产详情 -->
        <div class="col-9 right-panel">
          <div class="panel-header">
            <div>
              <span>资产详情</span>
              <q-btn round flat dense icon="o" class="q-ml-sm"/>
            </div>
          </div>
          <div class="detail-grid">
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
        </div>
      </div>
    </q-page>

    <!-- 资产合并 Dialog -->
    <q-dialog v-model="isMergeDialogOpen">
      <q-card class="merge-dialog">
        <q-card-section>
          <div class="text-h6">请选定计划与当前资产：{{ mergeData.assetA.ip }}合并的另一个资产</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row text-center text-weight-bold q-mb-sm">
            <div class="col"></div>
            <div class="col-5">资产合并</div>
            <div class="col-5">待合并资产</div>
          </div>
          <div class="row items-center q-mb-sm">
            <div class="col merge-label">资产名称</div>
            <div class="col-5"><q-input outlined dense v-model="mergeData.assetA.name" placeholder="请输入待合并资产"/></div>
            <div class="col-5"><q-toggle v-model="mergeData.selection.name" true-value="B" false-value="A" color="teal"/> {{ mergeData.assetB.name }}</div>
          </div>
          <!-- 其他合并项 -->
          <div class="row items-center q-mb-sm"><div class="col merge-label">设备IP</div><div class="col-5">{{ mergeData.assetA.ip }}</div><div class="col-5"><q-toggle v-model="mergeData.selection.ip" true-value="B" false-value="A" color="teal"/> {{ mergeData.assetB.ip }}</div></div>
          <div class="row items-center q-mb-sm"><div class="col merge-label">设备MAC</div><div class="col-5">{{ mergeData.assetA.mac }}</div><div class="col-5"><q-toggle v-model="mergeData.selection.mac" true-value="B" false-value="A" color="teal"/> {{ mergeData.assetB.mac }}</div></div>
          <div class="row items-center q-mb-sm"><div class="col merge-label">设备类型</div><div class="col-5">{{ mergeData.assetA.type }}</div><div class="col-5"><q-toggle v-model="mergeData.selection.type" true-value="B" false-value="A" color="teal"/> {{ mergeData.assetB.type }}</div></div>
          <div class="row items-center q-mb-sm"><div class="col merge-label">所属分区</div><div class="col-5"><q-radio v-model="mergeData.selection.partition" val="A" :label="mergeData.assetA.partition"/></div><div class="col-5"><q-radio v-model="mergeData.selection.partition" val="B" :label="mergeData.assetB.partition"/></div></div>
          <div class="row items-center q-mb-sm"><div class="col merge-label">设备特征</div><div class="col-5">{{ mergeData.assetA.feature }}</div><div class="col-5"><q-toggle v-model="mergeData.selection.feature" true-value="B" false-value="A" color="teal"/> {{ mergeData.assetB.feature }}</div></div>
          <div class="row items-center q-mb-sm"><div class="col merge-label">操作系统</div><div class="col-5">--</div><div class="col-5"><q-radio checked-icon="task_alt" unchecked-icon="panorama_fish_eye" /> --</div></div>
          <div class="row items-center q-mb-sm"><div class="col merge-label">系统版本</div><div class="col-5">--</div><div class="col-5"><q-radio checked-icon="task_alt" unchecked-icon="panorama_fish_eye" /> --</div></div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-lg q-gutter-x-md">
          <q-btn label="智能合并" color="primary" outline style="width: 120px" @click="isMergeDialogOpen = false"/>
          <q-btn label="确认合并" color="teal" unelevated style="width: 120px" @click="isMergeDialogOpen = false"/>
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
.top-bar .action-btn { color: white; font-size: 1rem; }
.info-panel { background-color: #3f3f44; color: #e0e0e0; border-radius: 8px; }
.main-panel-container { height: calc(100vh - 180px); /* 视口高度减去顶部所有栏的高度 */ }

.left-panel, .right-panel { background-color: #f7f8fa; border: 1px solid #e0e0e0; }
.left-panel { border-right: none; }
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #eef1f3;
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
  color: #333;
}
.asset-item { font-size: 1rem; }
.active-asset-item {
  background-color: #313942 !important;
  color: white !important;
}
.detail-grid {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  padding: 24px;
}
.detail-label { font-weight: 500; color: #555; text-align: right; }
.detail-value { color: #333; }

.merge-dialog { width: 800px; max-width: 90vw; }
.merge-label { text-align: right; padding-right: 16px; font-weight: 500; color: #555; }
</style>
