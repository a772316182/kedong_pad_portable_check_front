<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-grey-9 text-white">
      <q-toolbar>
        <q-btn
          unelevated
          padding="10px 20px"
          class="exit-button"
          label="上一步"
          @click="navigateTo('/techcheck')"
        />
        <q-toolbar-title class="text-center">
          正在核查
        </q-toolbar-title>
        <q-btn flat round dense icon="sync_alt" label="切换" @click="toggleView" />
        <q-btn flat round dense icon="filter_alt" label="筛选" @click="filterDrawer = true" class="q-mx-sm" />
        <q-btn flat round dense icon="bar_chart" label="查看统计图" />
      </q-toolbar>
    </q-header>

    <!-- 筛选功能的抽屉面板 -->
    <q-drawer
      v-model="filterDrawer"
      side="right"
      overlay
      bordered
      :width="350"
      class="bg-grey-2"
    >
      <div class="q-pa-md">
        <h6 class="q-my-md">筛选</h6>

        <!-- 设备类型 -->
        <div class="q-mb-lg">
          <p class="text-weight-medium">设备类型</p>
          <q-btn-toggle
            v-model="filters.deviceType"
            push
            glossy
            toggle-color="primary"
            :options="[
              {label: '全部设备', value: 'all'},
              {label: '手机', value: 'phone'},
              {label: '主机设备', value: 'host'},
              {label: '网络设备', value: 'network'}
            ]"
          />
        </div>

        <!-- 核查状态 -->
        <div class="q-mb-lg">
          <p class="text-weight-medium">核查状态</p>
          <q-btn-toggle
            v-model="filters.checkStatus"
            push
            glossy
            toggle-color="primary"
            :options="[
              {label: '全部状态', value: 'all'},
              {label: '通过', value: 'passed'},
              {label: '未通过', value: 'failed'},
              {label: '未核查', value: 'unchecked'}
            ]"
          />
        </div>

        <!-- 安全分区 -->
        <div class="q-mb-lg">
          <p class="text-weight-medium">安全分区</p>
          <q-btn-toggle
            v-model="filters.securityZone"
            push
            glossy
            toggle-color="primary"
            :options="[
              {label: '全部', value: 'all'},
              {label: '安全一区', value: 'zone1'},
              {label: '安全二区', value: 'zone2'}
            ]"
          />
        </div>

        <!-- 资产保存状态 -->
        <div class="q-mb-lg">
          <p class="text-weight-medium">资产保存状态</p>
          <q-btn-toggle
            v-model="filters.saveStatus"
            push
            glossy
            toggle-color="primary"
            :options="[
              {label: '全部', value: 'all'},
              {label: '存在', value: 'exist'},
              {label: '不存在', value: 'not_exist'}
            ]"
          />
        </div>

        <q-space />

        <!-- 底部操作按钮 -->
        <div class="absolute-bottom q-pa-md row q-gutter-md">
          <q-btn label="重置" type="reset" color="grey-6" class="col" @click="resetFilters" />
          <q-btn label="筛选" color="primary" class="col" @click="applyFilters" />
        </div>
      </div>
    </q-drawer>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="q-pa-sm bg-grey-3">
        <!-- 第一层功能按钮 -->
        <q-toolbar class="bg-white q-mb-sm rounded-borders shadow-2">
          <q-btn flat color="primary" label="资产列表" />
          <q-btn flat color="dark" label="资产导入" />
          <q-btn flat color="dark" label="资产导出" />
          <q-space />
          <q-btn color="primary" label="切换连接" />
        </q-toolbar>

        <!-- 第二层功能按钮 (根据图片和您的描述更新) -->
        <q-toolbar class="bg-white q-mb-sm rounded-borders shadow-2 row items-center">
          <q-btn-group flat>
            <q-btn label="全部核查" @click="showAllAssets" />
            <q-btn label="免登录检查" />
            <q-btn label="登录检查" />
            <q-btn label="登录异常" @click="handleLoginAnomalyClick"/>
            <q-btn label="查看拓扑" />
            <q-btn label="报告导出" />
          </q-btn-group>
        </q-toolbar>


        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'">
          <q-table
            :rows="filteredAssets"
            :columns="columns"
            row-key="name"
            class="shadow-2"
            table-header-class="bg-grey-2"
            selection="single"
            v-model:selected="selectedRow"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn size="sm" color="teal" label="资产详情" class="q-mr-sm" />
                <q-btn size="sm" color="teal" label="核查记录" class="q-mr-sm" />
                <!-- 仅在状态为'登录异常'时显示此按钮 -->
                <q-btn v-if="props.row.status === '登录异常'" size="sm" color="negative" label="登记核验" @click="showAnomalySheet(props.row)" />
              </q-td>
            </template>
          </q-table>
        </div>

        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="row q-col-gutter-md">
          <div v-for="asset in filteredAssets" :key="asset.name" class="col-xs-12 col-sm-6 col-md-4">
            <q-card class="shadow-2">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="text-h6">{{ asset.name }}</div>
                    <div class="text-subtitle2">{{ asset.type }}</div>
                  </div>
                  <div class="col-auto">
                    <q-chip :color="getChipColor(asset.status)" text-color="white" dense>
                      {{ asset.status }}
                    </q-chip>
                  </div>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div>MAC地址: {{ asset.mac }}</div>
                <div>资产状态: {{ asset.assetStatus }}</div>
                <div>安全分区: {{ asset.securityZone }}</div>
              </q-card-section>
              <q-separator />
              <q-card-actions align="around">
                <q-btn flat color="primary">资产详情</q-btn>
                <q-btn flat color="primary">核查记录</q-btn>
                <!-- 仅在状态为'登录异常'时显示此按钮 -->
                <q-btn v-if="asset.status === '登录异常'" flat color="negative" @click="showAnomalySheet(asset)">登记核验</q-btn>
                <q-btn v-else flat color="primary">选定</q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>

      </q-page>
    </q-page-container>

    <!-- 异常情况选择 - 居中对话框 -->
    <q-dialog v-model="anomalySheet">
      <q-card style="min-width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">选择异常情况</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="reason in anomalyReasons" :key="reason.value" tag="label" v-ripple>
              <q-item-section>
                <q-item-label>{{ reason.label }}</q-item-label>
              </q-item-section>
              <q-item-section side >
                <q-radio v-model="selectedAnomaly" :val="reason.value" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn label="确认登记" color="primary" @click="registerAnomaly" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

import { useRouter } from 'vue-router'

// 1. 初始化路由
const router = useRouter()
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
// 使用 router.push 进行页面跳转
  router.push(path)
}

// 使用 Quasar 的 notify 插件
const $q = useQuasar();

// 视图模式控制 ('list' 或 'grid')
const viewMode = ref('list');

// 筛选抽屉的显示状态
const filterDrawer = ref(false);

// 异常登记面板的显示状态
const anomalySheet = ref(false);

// 当前选中的资产
const selectedAsset = ref(null);

// 表格中选中的行
const selectedRow = ref([]);

// 选中的异常原因
const selectedAnomaly = ref('serial');

// 切换视图模式
const toggleView = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list';
};

// 表格列定义
const columns = [
  { name: 'name', required: true, label: '资产名称', align: 'left', field: row => row.name, sortable: true },
  { name: 'type', align: 'center', label: '设备类型', field: 'type', sortable: true },
  { name: 'featureCode', label: '资产特征码', field: 'featureCode', sortable: true },
  { name: 'openPorts', label: '开启系统端口', field: 'openPorts' },
  { name: 'status', label: '资产状态', field: 'status' },
  { name: 'securityZone', label: '安全分区', field: 'securityZone' },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' }
];

// 模拟的原始资产数据
const allAssets = ref([
  { name: '10.105.71.240', type: '主机设备', featureCode: '...', openPorts: '无', status: '登录异常', securityZone: '安全二区', mac: '00:1A:2B:3C:4D:5E', assetStatus: '存在' },
  { name: '10.105.71.241', type: '网络设备', featureCode: 'F4-8E-38-9B-7C-2D', openPorts: '80, 443', status: '安全', securityZone: '安全一区', mac: 'F4:8E:38:9B:7C:2D', assetStatus: '存在' },
  { name: '10.105.71.242', type: '手机', featureCode: '无', openPorts: '无', status: '安全', securityZone: '安全二区', mac: 'A0:B1:C2:D3:E4:F5', assetStatus: '不存在' },
  { name: '10.105.71.243', type: '主机设备', featureCode: '无', openPorts: '22, 3389', status: '高危', securityZone: '安全一区', mac: '12:34:56:78:90:AB', assetStatus: '存在' },
  { name: '10.105.71.244', type: '未知', featureCode: '...', openPorts: '无', status: '未核查', securityZone: '安全二区', mac: 'DE:AD:BE:EF:00:01', assetStatus: '存在' },
  { name: '10.105.71.245', type: '主机设备', featureCode: '...', openPorts: '无', status: '登录异常', securityZone: '安全一区', mac: '1A:2B:3C:4D:5E:6F', assetStatus: '存在' },
]);

// 用于存储当前筛选条件的 ref
const activeFilters = ref({});

// 计算属性，根据 activeFilters 动态计算显示的资产
const filteredAssets = computed(() => {
  if (Object.keys(activeFilters.value).length === 0) {
    return allAssets.value;
  }
  return allAssets.value.filter(asset => {
    return Object.entries(activeFilters.value).every(([key, value]) => {
      return asset[key] === value;
    });
  });
});


// 异常原因列表
const anomalyReasons = [
  { label: '【串口模式】现场无法提供连接线', value: 'serial' },
  { label: '【USB模式】结果回传异常', value: 'usb' },
  { label: '【网络模式】ssh服务未开启、登录账密错误', value: 'network' },
];

// 侧边栏筛选条件
const filters = ref({
  deviceType: 'all',
  checkStatus: 'all',
  securityZone: 'all',
  saveStatus: 'all'
});

// 显示异常登记面板
const showAnomalySheet = (asset) => {
  selectedAsset.value = asset;
  selectedAnomaly.value = 'serial'; // 重置默认选项
  anomalySheet.value = true;
};

// 提交异常登记
const registerAnomaly = () => {
  anomalySheet.value = false;
  $q.notify({
    message: '登记成功',
    color: 'positive',
    position: 'top',
    icon: 'check_circle',
    timeout: 2000
  });
  console.log(`为资产 ${selectedAsset.value.name} 登记异常: ${selectedAnomaly.value}`);
};

// 应用侧边栏的筛选
const applyFilters = () => {
  filterDrawer.value = false;
  // 在这里添加实际的筛选逻辑, 此处为示例
  $q.notify({
    message: '筛选条件已应用',
    color: 'info',
    position: 'top',
  });
  console.log('应用筛选:', filters.value);
}

// 重置侧边栏的筛选
const resetFilters = () => {
  filters.value = {
    deviceType: 'all',
    checkStatus: 'all',
    securityZone: 'all',
    saveStatus: 'all'
  };
  $q.notify({
    message: '筛选条件已重置',
    color: 'info',
    position: 'top',
  });
}

// 点击工具栏“登录异常”按钮
const handleLoginAnomalyClick = () => {
  if (selectedRow.value.length === 1) {
    showAnomalySheet(selectedRow.value[0]);
  } else {
    $q.notify({
      message: '请先在表格中选择一个资产',
      color: 'warning',
      position: 'top',
      icon: 'warning'
    });
  }
}

// 点击工具栏“全部核查”按钮，显示所有资产
const showAllAssets = () => {
  activeFilters.value = {};
  selectedRow.value = []; // 清空选择
  $q.notify({
    message: '已显示全部资产',
    color: 'info',
    position: 'top',
  });
}

// 根据资产状态返回不同的颜色
const getChipColor = (status) => {
  if (status === '安全') return 'green';
  if (status === '登录异常' || status === '高危') return 'red';
  return 'grey';
}

</script>

<style lang="sass">
.q-table__container
  border-radius: 8px

.q-toolbar
  padding: 0 8px

.q-btn
  text-transform: none // 让按钮文字不大写
</style>
