<template>
  <q-layout view="lHh Lpr lFf" class="bg-page">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-dark-header text-grey-8">
      <q-toolbar>
        <q-breadcrumbs class="text-white">
          <template v-slot:separator>
            <q-icon size="1.2em" name="chevron_right" />
          </template>
        <div class="col-auto"><q-btn color="primary" unelevated icon="home" label="返回" @click="navigateTo('/factorysafecheck')" /></div>
        <div class="col"><div class="text-h6">安全策略检查</div></div>
        </q-breadcrumbs>
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="bg-page q-pa-lg">

        <!-- 步骤指示器 (新样式) -->
        <q-toolbar class="column no-wrap" style="height: 100%; align-items: flex-start">
          <div class="col-auto text-white">
            <q-tabs>
              <q-tab name="create_task" icon="edit_note" label="创建任务" class = "step-item-new" :class="{ 'active': currentStep === 1 }" @click="goToStep(1)"/>
              <q-tab name="draft_check" icon="hourglass_empty" label="策略检查" class = "step-item-new"  :class="{ 'active': currentStep === 2 }" @click="goToStep(2)"/>
              <q-tab name="check_result" icon="checklist" label="检查结果"  class = "step-item-new"  :class="{ 'active': currentStep === 3 }" @click="goToStep(3)"/>
            </q-tabs>
            <q-separator />
          </div>
        </q-toolbar>

        <div class="q-pa-md">
          <!-- 步骤 1: 任务列表 -->
          <q-card v-if="currentStep === 1" class="shadow-2">
            <q-card-section>
              <div class="row justify-between items-center">
                <div class="text-h6">核查任务列表</div>
                <q-btn color="primary" icon="add" label="创建核查任务" @click="createTaskDialog = true" />
              </div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-table
                :rows="tasks"
                :columns="taskColumns"
                row-key="id"
                selection="multiple"
                v-model:selected="selectedTasks"
                flat
              >
                <template v-slot:body-cell-area="props">
                  <q-td :props="props">
                    <q-chip v-for="tag in props.value" :key="tag" dense outline color="primary" :label="tag" class="q-mr-xs" />
                  </q-td>
                </template>
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip dense :color="props.value === '进行中' ? 'orange' : 'green'" text-color="white">
                      {{ props.value }}
                    </q-chip>
                  </q-td>
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense color="primary" label="暂停" class="q-mr-sm" />
                    <q-btn flat dense color="primary" label="下载" class="q-mr-sm" />
                    <q-btn flat dense color="primary" label="查看" class="q-mr-sm" @click="viewTask(props.row)" />
                    <q-btn flat dense color="negative" label="删除" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <!-- 步骤 2: 策略检查 -->
          <div v-if="currentStep === 2">
            <div class="row q-col-gutter-md">
              <div class="col-3">
                <q-card class="shadow-2">
                  <q-card-section>
                    <div class="text-h6">筛选条件</div>
                  </q-card-section>
                  <q-card-section>
                    <p class="text-weight-medium">安全区</p>
                    <q-checkbox v-model="filters.zones" val="I区" label="I 区" />
                    <q-checkbox v-model="filters.zones" val="II区" label="II 区" />
                    <p class="text-weight-medium q-mt-md">资产类型</p>
                    <!-- ... 更多筛选 ... -->
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-9">
                <q-card class="shadow-2">
                  <q-tabs v-model="policyTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
                    <q-tab name="host" label="主机策略" />
                    <q-tab name="vertical" label="纵向策略" />
                    <q-tab name="isolation" label="隔离策略" />
                    <q-tab name="firewall" label="防火墙策略" />
                  </q-tabs>
                  <q-separator />
                  <q-tab-panels v-model="policyTab" animated>
                    <q-tab-panel name="host">
                      <div class="text-h6 q-mb-md">主机策略表</div>
                      <q-table :rows="hostPolicies" :columns="policyCheckColumns" row-key="id" flat />
                    </q-tab-panel>
                    <q-tab-panel name="vertical">
                      <div class="text-h6 q-mb-md">纵向策略表</div>
                      <q-table :rows="verticalPolicies" :columns="policyCheckColumns" row-key="id" flat />
                    </q-tab-panel>
                    <q-tab-panel name="isolation">
                      <div class="text-h6 q-mb-md">隔离策略表</div>
                      <q-table :rows="isolationPolicies" :columns="policyCheckColumns" row-key="id" flat />
                    </q-tab-panel>
                    <q-tab-panel name="firewall">
                      <div class="text-h6 q-mb-md">防火墙策略表</div>
                      <q-table :rows="firewallPolicies" :columns="policyCheckColumns" row-key="id" flat />
                    </q-tab-panel>
                  </q-tab-panels>
                </q-card>
              </div>
            </div>
            <div class="row justify-center q-mt-md">
              <q-btn color="grey-8" label="上一步" @click="goToStep(1)" class="q-mr-md" />
              <q-btn color="primary" label="下一步" @click="goToStep(3)" />
            </div>
          </div>

          <!-- 步骤 3: 核查结果 -->
          <q-card v-if="currentStep === 3" class="shadow-2">
            <q-tabs v-model="resultTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify">
              <q-tab name="host" label="主机策略核查结果" />
              <q-tab name="vertical" label="纵向策略核查结果" />
              <q-tab name="isolation" label="隔离策略核查结果" />
              <q-tab name="firewall" label="防火墙策略核查结果" />
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="resultTab" animated>
              <q-tab-panel name="host">
                <div class="text-h6 q-mb-md">主机策略核查结果</div>
                <q-table :rows="hostResults" :columns="hostResultColumns" row-key="id" flat>
                  <template v-slot:body-cell-result="props">
                    <q-td :props="props">
                      <q-chip dense :color="props.value === '合格' ? 'green' : 'red'" text-color="white">
                        {{ props.value }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-tab-panel>
              <q-tab-panel name="vertical">
                <div class="text-h6 q-mb-md">纵向策略核查结果</div>
                <q-table :rows="verticalResults" :columns="genericResultColumns" row-key="id" flat>
                  <template v-slot:body-cell-result="props">
                    <q-td :props="props">
                      <q-chip dense :color="props.value === '合格' ? 'green' : 'red'" text-color="white">
                        {{ props.value }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-tab-panel>
              <q-tab-panel name="isolation">
                <div class="text-h6 q-mb-md">隔离策略核查结果</div>
                <q-table :rows="isolationResults" :columns="genericResultColumns" row-key="id" flat>
                  <template v-slot:body-cell-result="props">
                    <q-td :props="props">
                      <q-chip dense :color="props.value === '合格' ? 'green' : 'red'" text-color="white">
                        {{ props.value }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-tab-panel>
              <q-tab-panel name="firewall">
                <div class="text-h6 q-mb-md">防火墙策略核查结果</div>
                <q-table :rows="firewallResults" :columns="genericResultColumns" row-key="id" flat>
                  <template v-slot:body-cell-result="props">
                    <q-td :props="props">
                      <q-chip dense :color="props.value === '合格' ? 'green' : 'red'" text-color="white">
                        {{ props.value }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-tab-panel>
            </q-tab-panels>
            <div class="row justify-center q-py-md">
              <q-btn color="grey-8" label="上一步" @click="goToStep(2)" class="q-mr-md" />
              <q-btn color="primary" label="完成" @click="goToStep(1)" />
            </div>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <!-- 创建任务对话框 (样式更新) -->
    <q-dialog v-model="createTaskDialog" transition-show="scale" transition-hide="scale">
      <q-card class="bg-grey-3 text-black" style="width: 900px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">新建任务</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <q-input  filled v-model="newTask.name" label="任务名称" class="q-mb-md" />
          <q-input  filled v-model="newTask.product" label="产品名称" class="q-mb-md" />

          <div class="text-subtitle1 q-mb-sm">检查范围</div>
          <q-option-group
            dark
            v-model="newTask.scope"
            :options="scopeOptions"
            color="primary"
            type="checkbox"
            inline
            class="q-mb-md"
          />

          <div v-if="newTask.scope.includes('host')">
            <div class="text-h6 q-my-md">检查对象：主机</div>
            <q-table :rows="hosts" :columns="deviceSelectionColumns" row-key="id" selection="multiple" v-model:selected="newTask.selectedHosts" dense />
          </div>
          <div v-if="newTask.scope.includes('vertical')">
            <div class="text-h6 q-my-md">检查对象：纵向</div>
            <q-table :rows="verticals" :columns="deviceSelectionColumns" row-key="id" selection="multiple" v-model:selected="newTask.selectedVerticals" dense />
          </div>
          <div v-if="newTask.scope.includes('isolation')">
            <div class="text-h6 q-my-md">检查对象：隔离</div>
            <q-table dark :rows="isolations" :columns="deviceSelectionColumns" row-key="id" selection="multiple" v-model:selected="newTask.selectedIsolations" dense />
          </div>
          <div v-if="newTask.scope.includes('firewall')">
            <div class="text-h6 q-my-md">检查对象：防火墙</div>
            <q-table dark :rows="firewalls" :columns="deviceSelectionColumns" row-key="id" selection="multiple" v-model:selected="newTask.selectedFirewalls" dense />
          </div>
        </q-card-section>

        <q-separator color="grey-8" />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="取消" color="grey-7" v-close-popup />
          <q-btn label="保存" color="primary" @click="saveNewTask" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'

const $q = useQuasar();
const currentStep = ref(1);
const createTaskDialog = ref(false);
const selectedTasks = ref([]);
const policyTab = ref('host');
const resultTab = ref('host');

const newTask = ref({
  name: '',
  product: '',
  scope: ['host'],
  selectedHosts: [],
  selectedVerticals: [],
  selectedIsolations: [],
  selectedFirewalls: [],
});

const scopeOptions = [
  { label: '主机策略检查', value: 'host' },
  { label: '纵向策略检查', value: 'vertical' },
  { label: '隔离策略检查', value: 'isolation' },
  { label: '防火墙策略检查', value: 'firewall' },
];

const filters = ref({
  zones: [],
});

const goToStep = (step) => {
  currentStep.value = step;
};

// --- 数据定义 ---

const taskColumns = [
  { name: 'id', label: '编号', field: 'id', align: 'left' },
  { name: 'name', label: '任务名称', field: 'name', align: 'left' },
  { name: 'created', label: '创建时间', field: 'created', align: 'left' },
  { name: 'area', label: '机房区域', field: 'area', align: 'left' },
  { name: 'status', label: '任务状态', field: 'status', align: 'center' },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' },
];
const tasks = ref([
  { id: 1, name: '核心网络设备年度巡检', created: '2025-06-28 13:00:00', area: ['主机房', '防火墙策略'], status: '进行中' },
  { id: 2, name: '数据库服务器安全基线检查', created: '2025-06-27 09:12:00', area: ['主机房'], status: '已完成' },
  { id: 3, name: 'Web应用防火墙访问策略审计', created: '2025-06-26 15:00:00', area: ['防火墙策略', '隔离策略', '纵向加密'], status: '已完成' },
  { id: 4, name: '月度安全设备巡检', created: '2025-06-25 10:00:00', area: ['主机房', '纵向加密'], status: '进行中' },
]);

// --- 创建任务对话框内的数据 ---
const deviceSelectionColumns = [
  { name: 'name', label: '设备名称', field: 'name', align: 'left' },
  { name: 'ip', label: '设备IP', field: 'ip', align: 'left' },
];
const hosts = ref([
  { id: 'h1', name: '主机1', ip: '192.168.1.1' },
  { id: 'h2', name: '主机2', ip: '192.168.1.2' },
]);
const verticals = ref([
  { id: 'v1', name: '交换机1', ip: '192.168.2.1' },
  { id: 'v2', name: '交换机2', ip: '192.168.2.2' },
]);
const isolations = ref([
  { id: 'i1', name: '隔离网闸1', ip: '192.168.3.1' },
]);
const firewalls = ref([
  { id: 'f1', name: '防火墙1', ip: '192.168.4.1' },
]);

// --- 步骤2的数据 ---
const policyCheckColumns = [
  { name: 'id', label: '编号', field: 'id', align: 'left' },
  { name: 'name', label: '设备名称', field: 'name', align: 'left' },
  { name: 'ip1', label: '设备IP1', field: 'ip1', align: 'left' },
  { name: 'ip2', label: '设备IP2', field: 'ip2', align: 'left' },
  { name: 'zone', label: '安全区', field: 'zone', align: 'left' },
  { name: 'type', label: '设备类型', field: 'type', align: 'left' },
];
const hostPolicies = ref([ { id: 1, name: '山东省调', ip1: '10.200.114.23', ip2: '10.200.114.23', zone: 'I区', type: '主机' } ]);
const verticalPolicies = ref([ { id: 1, name: '山东省调', ip1: '10.200.114.23', ip2: '-', zone: 'I区', type: '纵向' } ]);
const isolationPolicies = ref([ { id: 1, name: '山东省调', ip1: '10.200.114.23', ip2: '-', zone: 'I区', type: '隔离' } ]);
const firewallPolicies = ref([ { id: 1, name: '山东省调', ip1: '10.200.114.23', ip2: '-', zone: 'I区', type: '防火墙' } ]);


// --- 步骤3的数据 ---
const hostResultColumns = [
  { name: 'id', label: '编号', field: 'id', align: 'left' },
  { name: 'name', label: '设备名称', field: 'name', align: 'left' },
  { name: 'ip1', label: '设备IP1', field: 'ip1', align: 'left' },
  { name: 'ip2', label: '设备IP2', field: 'ip2', align: 'left' },
  { name: 'os', label: '操作系统', field: 'os', align: 'left' },
  { name: 'count', label: '策略数量', field: 'count', align: 'center' },
  { name: 'result', label: '核查结果', field: 'result', align: 'center' },
];
const hostResults = ref([
  { id: 1, name: '山东省调', ip1: '10.200.114.23', ip2: '10.200.114.23', os: 'win', count: 1, result: '合格' },
  { id: 2, name: '山东省调', ip1: '10.200.114.23', ip2: '10.200.114.23', os: 'win', count: 1, result: '不合格' },
]);
const genericResultColumns = [
  { name: 'id', label: '编号', field: 'id', align: 'left' },
  { name: 'name', label: '设备名称', field: 'name', align: 'left' },
  { name: 'type', label: '设备类型', field: 'type', align: 'left' },
  { name: 'ip1', label: '设备IP1', field: 'ip1', align: 'left' },
  { name: 'zone', label: '安全区', field: 'zone', align: 'left' },
  { name: 'count', label: '策略数量', field: 'count', align: 'center' },
  { name: 'result', label: '核查结果', field: 'result', align: 'center' },
];
const verticalResults = ref([ { id: 1, name: '山东省调', type: '纵向', ip1: '10.200.114.23', zone: 'I区', count: 5, result: '合格' } ]);
const isolationResults = ref([ { id: 1, name: '山东省调', type: '隔离', ip1: '10.200.114.23', zone: 'I区', count: 2, result: '不合格' } ]);
const firewallResults = ref([ { id: 1, name: '山东省调', type: '防火墙', ip1: '10.200.114.23', zone: 'I区', count: 120, result: '合格' } ]);


const viewTask = (task) => {
  console.log('查看任务:', task.name);
  goToStep(2);
};

const saveNewTask = () => {
  // 在此添加保存任务的逻辑
  $q.notify({
    color: 'positive',
    message: '任务创建成功',
    icon: 'check'
  });
  createTaskDialog.value = false;
  goToStep(2);
  // 清空 newTask 对象
  newTask.value = {
    name: '',
    product: '',
    scope: ['host'],
    selectedHosts: [],
    selectedVerticals: [],
    selectedIsolations: [],
    selectedFirewalls: [],
  };
}

const router = useRouter()
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

</script>

<style lang="sass" scoped>
.step-item-new
  padding: 12px 24px
  cursor: pointer
  display: flex
  align-items: center
  gap: 8px
  border-bottom: 4px solid transparent
  transition: all 0.3s
  &:hover
    background-color: rgba(255, 255, 255, 0.1)

.step-item-new.active
  border-bottom: 4px solid $primary
  color: $primary

.q-btn
  text-transform: none

.bg-page
  background-color: #292a2d

.bg-dark-header
  background-color: #414853
</style>
