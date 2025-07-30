<template>
  <q-page class="bg-secondary">

    <!-- 1. 顶部栏 (沿用上一次的风格) -->
    <div class="bg-secondary text-white shadow-2">
      <q-toolbar>
        <q-btn flat dense icon="home" label="返回" no-caps @click="$router.push('/mainview')" />
        <q-toolbar-title>
          / 系统管理
        </q-toolbar-title>
      </q-toolbar>
    </div>

    <!-- 主内容区 -->
    <div class="q-pa-md ">
      <!-- 2. 四个功能切换按钮 (Tabs) -->
      <q-tabs
        v-model="activeTab"
        align="left"
        class="text-light-blue-3 q-mb-md"
        active-color="white"
        active-bg-color="primary"
        indicator-color="transparent"
      >
        <q-tab name="baseline" label="基线核查配置" />
        <q-tab name="alert" label="告警验证配置" />
        <q-tab name="template" label="导入模板配置" />
        <q-tab name="auth" label="授权管理" />
      </q-tabs>

      <!-- 3. 内容面板 -->
      <q-card flat bordered>
        <q-tab-panels v-model="activeTab" animated>

          <!-- 面板1: 基线核查配置 -->
          <q-tab-panel name="baseline" class="q-pa-none ">
            <div class="q-pa-md text-h5 text-weight-bold">基线核查配置</div>
            <q-table
              :rows="baselineRows"
              :columns="baselineColumns"
              row-key="id"
              separator="cell"
              flat
              :pagination="pagination"
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-toggle v-model="props.row.status" color="primary" />
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense color="primary" label="编辑" class="q-mr-sm" />
                  <q-btn flat dense color="negative" label="删除" />
                </q-td>
              </template>
              <!-- 通用分页插槽 -->
              <template v-slot:pagination="scope">
                <CustomPagination :scope="scope" @set-page="updatePagination" />
              </template>
            </q-table>
          </q-tab-panel>

          <!-- 面板2: 告警验证配置 -->
          <q-tab-panel name="alert" class="q-pa-none">
            <div class="q-pa-md">
              <div class="row items-center justify-between">
                <div class="text-h5 text-weight-bold">告警验证配置</div>
                <q-select
                  v-model="alertPolicyType"
                  :options="alertPolicyOptions"
                  label="策略类型"
                  dense
                  outlined
                  style="min-width: 200px;"
                />
              </div>
            </div>
            <q-table
              :rows="alertRows"
              :columns="alertColumns"
              row-key="id"
              separator="cell"
              flat
              :pagination="pagination"
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-toggle v-model="props.row.status" color="primary" />
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense color="primary" label="编辑" class="q-mr-sm" />
                  <q-btn flat dense color="negative" label="删除" />
                </q-td>
              </template>
              <!-- 通用分页插槽 -->
              <template v-slot:pagination="scope">
                <CustomPagination :scope="scope" @set-page="updatePagination" />
              </template>
            </q-table>
          </q-tab-panel>

          <!-- 面板3: 导入模板配置 -->
          <q-tab-panel name="template" class="q-pa-none">
            <div class="q-pa-md row items-center justify-between">
              <div class="text-h5 text-weight-bold">导入模板配置</div>
              <q-btn color="primary" icon="add" label="添加模板" />
            </div>
            <q-table
              :rows="templateRows"
              :columns="templateColumns"
              row-key="id"
              separator="cell"
              flat
              :pagination="pagination"
            >
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense color="primary" label="下载" class="q-mr-sm" />
                  <q-btn flat dense color="negative" label="删除" />
                </q-td>
              </template>
              <!-- 通用分页插槽 -->
              <template v-slot:pagination="scope">
                <CustomPagination :scope="scope" @set-page="updatePagination" />
              </template>
            </q-table>
          </q-tab-panel>

          <!-- 面板4: 授权管理 -->
          <q-tab-panel name="auth" class="q-pa-md">
            <div class="text-h5 text-weight-bold q-mb-xl">授权管理</div>

            <!-- 未授权状态 -->
            <div v-if="!isAuthorized" class="column items-center q-gutter-y-lg text-center">
              <div class="text-subtitle1 text-grey-8">当前该设备未授权，授权后方可正常使用</div>
              <div class="text-body1">本机注册码: <span class="text-weight-bold">XXXXXXXXXXXXXXXXXXXXXX</span></div>
              <div class="text-body1">
                请将注册码发送给亚信科技广东分公司系统专员，专员会返回授权序列号<br/>
                联系方式: XXXXXXXXXXX 张三
              </div>
              <div class="row items-center" style="width: 450px;">
                <q-input
                  v-model="licenseKey"
                  outlined
                  dense
                  placeholder="请在此处输入授权序列号"
                  class="col"
                />
                <q-btn color="primary" label="验证" class="q-ml-md" @click="verifyLicense" />
              </div>
            </div>

            <!-- 授权成功状态 -->
            <div v-else class="column items-center q-gutter-y-lg text-center">
              <q-icon name="check_circle" color="positive" size="80px" />
              <div class="text-h4 text-weight-bold">授权成功</div>
              <div class="text-body1">本机注册码: <span class="text-weight-bold">XXXXXXXXXXXXXXXXXXXXXX</span></div>
              <div class="text-body1">本机授权码: <span class="text-weight-bold text-positive">YYYYYYYYYYYYYYYYYYYYYY</span></div>
            </div>
          </q-tab-panel>

        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
// 导入一个可复用的分页组件
const CustomPagination = {
  props: ['scope'],
  emits: ['set-page'],
  setup(props, { emit }) {
    const jumpToPage = ref(1);
    const jumpToPageAction = () => {
      const page = Number(jumpToPage.value);
      if (page > 0 && page <= props.scope.pagesNumber) {
        emit('set-page', { page });
      } else {
        useQuasar().notify({ type: 'negative', message: '请输入有效的页码！' });
      }
    };
    return { jumpToPage, jumpToPageAction };
  },
  template: `
    <div class="row items-center justify-start full-width q-pa-sm text-grey-8">
      <div>第 {{ scope.pagination.page * scope.pagination.rowsPerPage - scope.pagination.rowsPerPage + 1 }}-{{ Math.min(scope.pagination.page * scope.pagination.rowsPerPage, scope.pagination.rowsNumber) }} 条, 共 {{ scope.pagination.rowsNumber }} 条</div>
      <q-space />
      <div class="row items-center q-gutter-md">
        <q-pagination v-model="scope.pagination.page" :max="scope.pagesNumber" direction-links flat color="grey-8" active-color="primary" @update:model-value="(page) => $emit('set-page', { page })" />
        <div class="row items-center">
          <q-select v-model="scope.pagination.rowsPerPage" :options="[5, 10, 20, 50]" dense borderless @update:model-value="(rowsPerPage) => $emit('set-page', { rowsPerPage })" />
          <span>条/页</span>
        </div>
        <div class="row items-center">
            <span>跳至</span>
            <q-input v-model.number="jumpToPage" dense borderless type="number" class="q-mx-xs" style="width: 50px; text-align: center; border: 1px solid #ccc; border-radius: 4px;" @keyup.enter="jumpToPageAction" />
            <span>页</span>
            <q-btn flat dense label="确定" class="q-ml-sm text-primary text-weight-bold" @click="jumpToPageAction" />
        </div>
      </div>
    </div>
  `
};


// --- 通用和状态 ---
const $q = useQuasar();
const activeTab = ref('baseline'); // 默认激活第一个tab
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 4 }); // 通用分页

// --- 面板1: 基线核查配置 ---
const baselineColumns = [
  { name: 'id', label: '序号', field: 'id', align: 'left' },
  { name: 'status', label: '是否启用', field: 'status', align: 'left' },
  { name: 'name', label: '检测项名称', field: 'name', align: 'left' },
  { name: 'type', label: '检测类型', field: 'type', align: 'left' },
  { name: 'rule', label: '规则说明', field: 'rule', align: 'left', style: 'white-space: normal; min-width: 200px;' },
  { name: 'actions', label: '操作', align: 'left' },
];
const baselineRows = ref([
  { id: 1, status: true, name: '检测项1', type: '类型1', rule: '规则说明1' },
  { id: 2, status: true, name: '检测项2', type: '类型2', rule: '规则说明2' },
  { id: 3, status: false, name: '检测项3', type: '类型3', rule: '规则说明3' },
  { id: 4, status: true, name: '检测项4', type: '类型4', rule: '规则说明4' },
]);

// --- 面板2: 告警验证配置 ---
const alertPolicyType = ref('主机策略');
const alertPolicyOptions = ref(['主机策略', '纵向策略', '隔离策略', '防火墙策略']);
const alertColumns = [
  { name: 'id', label: '序号', field: 'id', align: 'left' },
  { name: 'status', label: '是否启用', field: 'status', align: 'left' },
  { name: 'item', label: '核查项目', field: 'item', align: 'left' },
  { name: 'version', label: '系统版本', field: 'version', align: 'left' },
  { name: 'rule', label: '规则说明', field: 'rule', align: 'left', style: 'white-space: normal; min-width: 350px;' },
  { name: 'actions', label: '操作', align: 'left' },
];
const alertRows = ref([
  { id: 1, status: true, item: '检测项1', version: 'Windows Server 2025', rule: '主机配置的关键文件/目录不得缺失' },
  { id: 2, status: true, item: '检测项2', version: 'Windows Server 2025', rule: '规则说明2' },
  { id: 3, status: true, item: '检测项3', version: 'RHEL 9', rule: '主机网络连接白名单内的通信端口，目的端口和目的IP是否是同一个；主机源IP地址和至少20个IP地址段，服务端口为1024-65535' },
  { id: 4, status: false, item: '检测项4', version: 'Ubuntu 24 LTS', rule: '规则说明4' },
]);

// --- 面板3: 导入模板配置 ---
const templateColumns = [
  { name: 'id', label: '序号', field: 'id', align: 'left' },
  { name: 'name', label: '模板名称', field: 'name', align: 'left' },
  { name: 'path', label: '文件路径', field: 'path', align: 'left' },
  { name: 'notes', label: '备注', field: 'notes', align: 'left', style: 'white-space: normal; min-width: 250px;' },
  { name: 'actions', label: '操作', align: 'left' },
];
const templateRows = ref([
  { id: 1, name: '主机策略1', path: 'D:/host_policy.xml', notes: '备注1: 测试1; 测试2; 测试3; 测试4; 测试5' },
  { id: 2, name: '主机策略2', path: 'D:/host_policy.xml', notes: '备注1: 测试1; 测试2; 测试3; 测试4; 测试5' },
  { id: 3, name: '主机策略3', path: 'D:/host_policy.xml', notes: '备注1: 测试1; 测试2; 测试3; 测试4; 测试5' },
  { id: 4, name: '主机策略4', path: 'D:/host_policy.xml', notes: '备注1: 测试1; 测试2; 测试3; 测试4; 测试5' },
]);

// --- 面板4: 授权管理 ---
const isAuthorized = ref(false);
const licenseKey = ref('');
const verifyLicense = () => {
  if (licenseKey.value) {
    isAuthorized.value = true;
    $q.notify({ type: 'positive', message: '验证成功！' });
  } else {
    $q.notify({ type: 'negative', message: '请输入授权序列号！' });
  }
};

// --- 通用方法 ---
const updatePagination = (newPagination) => {
  pagination.value = { ...pagination.value, ...newPagination };
};
</script>

<style lang="scss">
// 沿用上一次的表格斑马纹样式
.q-table--striped tbody tr:nth-child(even) {
  background-color: #292a2d; // 一个非常浅的青色，与主题色搭配
}

// 给Tab按钮添加边框以区分
.q-tabs .q-tab {
  border: 1px solid #ddd;
  border-radius: 4px 4px 0 0;
  margin-right: 4px;
}
// 移除激活tab的底部边框，使其与面板融为一体
.q-tabs .q-tab.q-tab--active {
  border-bottom-color: transparent;
}
</style>
