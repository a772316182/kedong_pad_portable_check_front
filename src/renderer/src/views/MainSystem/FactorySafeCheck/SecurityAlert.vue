<template>
  <q-layout view="lHh Lpr lFf" class="bg-page">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-teal-8 text-grey-8">
      <q-toolbar>
        <q-breadcrumbs class="text-white">
          <template v-slot:separator>
            <q-icon size="1.2em" name="chevron_right" />
          </template>
          <div class="col-auto"><q-btn color="teal-6" unelevated icon="home" label="返回" @click="navigateTo('/factorysafecheck')" /></div>
          <div class="col"><div class="text-h6">安全告警验证</div></div>
        </q-breadcrumbs>
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="bg-page q-pa-lg">

        <!-- 步骤指示器 -->
        <q-toolbar class="column no-wrap" style="height: 100%; align-items: flex-start">
          <div class="col-auto text-white">
            <q-tabs>
              <q-tab name="create_task" icon="edit_note" label="创建任务" class = "step-item-new" :class="{ 'active': currentStep === 1 }" @click="goToStep(1)"/>
              <q-tab name="draft_check" icon="hourglass_empty" label="告警验证" class = "step-item-new"  :class="{ 'active': currentStep === 2 }" @click="goToStep(2)"/>
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
                    <q-btn flat dense color="primary" label="启动" class="q-mr-sm" />
                    <q-btn flat dense color="orange" label="暂停" class="q-mr-sm" />
                    <q-btn flat dense color="primary" label="查看" class="q-mr-sm" @click="viewTask(props.row)" />
                    <q-btn flat dense color="negative" label="删除" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <!-- 步骤 2: 告警验证 -->
          <div v-if="currentStep === 2">
            <div class="row q-col-gutter-md">
              <div class="col-3">
                <q-card class="shadow-2">
                  <q-card-section>
                    <div class="text-h6">筛选条件</div>
                  </q-card-section>
                  <q-list bordered separator>
                    <q-item-label header>安全区</q-item-label>
                    <q-item v-for="zone in filterOptions.zones" :key="zone.value" tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>{{ zone.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge color="grey-7" :label="zone.count" />
                      </q-item-section>
                    </q-item>
                    <q-item-label header>资产数量</q-item-label>
                    <q-item v-for="asset in filterOptions.assets" :key="asset.value" tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>{{ asset.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-badge color="grey-7" :label="asset.count" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </div>
              <div class="col-9">
                <q-card class="shadow-2">
                  <q-card-section>
                    <div class="row justify-between items-center">
                      <div class="text-h6">告警验证规则列表</div>
                      <q-btn color="primary" label="批量验证选择的告警" :disable="selectedAlerts.length === 0" />
                    </div>
                  </q-card-section>
                  <q-card-section class="q-pt-none">
                    <q-table
                      :rows="alerts"
                      :columns="alertColumns"
                      row-key="id"
                      selection="multiple"
                      v-model:selected="selectedAlerts"
                      flat
                    >
                      <template v-slot:body-cell-progress="props">
                        <q-td :props="props">
                          <q-chip dense :color="getStatusColor(props.value)" text-color="white" :label="props.value" />
                        </q-td>
                      </template>
                    </q-table>
                  </q-card-section>
                </q-card>
              </div>
            </div>
            <div class="row justify-center q-mt-md">
              <q-btn color="grey-8" label="上一步" @click="goToStep(1)" class="q-mr-md" />
              <q-btn color="primary" label="下一步" @click="goToStep(3)" />
            </div>
          </div>

          <!-- 步骤 3: 验证结果 -->
          <q-card v-if="currentStep === 3" class="shadow-2">
            <q-card-section>
              <div class="text-h6">验证结果表</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-table :rows="verificationResults" :columns="resultColumns" row-key="id" flat>
                <template v-slot:body-cell-result="props">
                  <q-td :props="props">
                    <q-chip dense :color="props.value === '合格' ? 'green' : 'red'" text-color="white">
                      {{ props.value }}
                    </q-chip>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
            <div class="row justify-center q-py-md">
              <q-btn color="grey-8" label="上一步" @click="goToStep(2)" class="q-mr-md" />
              <q-btn color="primary" label="完成" @click="goToStep(1)" />
            </div>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <!-- 创建任务对话框 -->
    <q-dialog v-model="createTaskDialog">
      <q-card class="bg-white" style="width: 900px; max-width: 80vw;">
        <q-card-section class="bg-primary text-white row items-center">
          <div class="text-h6">新建任务</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col"><q-input outlined v-model="newTask.name" label="任务名称" /></div>
            <div class="col"><q-input outlined v-model="newTask.station" label="厂站名称" /></div>
          </div>
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col"><q-input outlined v-model="newTask.ip1" label="本机IP1" /></div>
            <div class="col"><q-input outlined v-model="newTask.ip2" label="本机IP2" /></div>
          </div>

          <div class="text-subtitle1 q-mb-sm">检查项目</div>
          <q-table :rows="checkItems" :columns="checkItemColumns" row-key="id" selection="multiple" v-model:selected="newTask.selectedItems" dense flat bordered/>

          <div class="text-subtitle1 q-mt-md q-mb-sm">检查范围</div>
          <q-option-group
            v-model="newTask.scope"
            :options="[{label: '安全1区', value: 'zone1'}, {label: '安全2区', value: 'zone2'}]"
            color="primary"
            type="checkbox"
            inline
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="取消" color="grey-7" v-close-popup />
          <q-btn label="确认" color="primary" @click="saveNewTask" />
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
const selectedAlerts = ref([]);

const newTask = ref({
  name: '富国站及核查任务',
  station: '富国站',
  ip1: '',
  ip2: '',
  scope: [],
  selectedItems: [],
});

const goToStep = (step) => {
  currentStep.value = step;
};

// --- 数据定义 ---

const taskColumns = [
  { name: 'id', label: '编号', field: 'id', align: 'left' },
  { name: 'name', label: '任务名称', field: 'name', align: 'left' },
  { name: 'created', label: '创建时间', field: 'created', align: 'left' },
  { name: 'area', label: '检查范围', field: 'area', align: 'left' },
  { name: 'status', label: '任务状态', field: 'status', align: 'center' },
  { name: 'actions', label: '操作', field: 'actions', align: 'center' },
];
const tasks = ref([
  { id: 1, name: '富国站任务1', created: '2024-09-09 00:00:00', area: ['安全1区', '安全2区'], status: '进行中' },
  { id: 2, name: '富国站任务2', created: '2024-09-09 00:00:00', area: ['安全1区', '安全2区'], status: '已完成' },
]);

const checkItemColumns = [
  { name: 'id', label: '编号', field: 'id', align: 'left' },
  { name: 'trigger', label: '触发方式', field: 'trigger', align: 'left' },
  { name: 'deviceType', label: '设备类型', field: 'deviceType', align: 'left' },
  { name: 'event', label: '告警事件', field: 'event', align: 'left' },
  { name: 'notes', label: '备注', field: 'notes', align: 'left' },
];
const checkItems = ref([
  { id: 1, trigger: '自动', deviceType: '主机', event: '登录/退出日志', notes: 'XXXXXX' },
  { id: 2, trigger: '自动', deviceType: '交换机', event: '登录/退出日志', notes: 'XXXXXX' },
  { id: 3, trigger: '手动', deviceType: '交换机', event: '端口接入情况', notes: 'XXXXXX' },
  { id: 4, trigger: '手动', deviceType: '交换机', event: '配置变更日志', notes: 'XXXXXX' },
]);

const filterOptions = {
  zones: [ { label: 'I 区', value: 'I', count: 8 }, { label: 'II 区', value: 'II', count: 4 } ],
  assets: [ { label: '主机', value: 'host', count: 2 }, { label: '终端装置', value: 'terminal', count: 10 } ],
};

const alertColumns = [
  { name: 'zone', label: '安全区', field: 'zone', align: 'left' },
  { name: 'monitorDevice', label: '监测设备', field: 'monitorDevice', align: 'left' },
  { name: 'deviceName', label: '设备名称', field: 'deviceName', align: 'left' },
  { name: 'deviceType', label: '设备类型', field: 'deviceType', align: 'left' },
  { name: 'ip', label: '设备IP', field: 'ip', align: 'left' },
  { name: 'progress', label: '核查进度', field: 'progress', align: 'center' },
];
const alerts = ref([
  { id: 1, zone: 'II区', monitorDevice: '山东省调_青州站_I区_电...', deviceName: '山东省调', deviceType: '远动装置', ip: '10.200.114.24', progress: '未开始' },
  { id: 2, zone: 'II区', monitorDevice: '济南地调_英平站_I区_OM...', deviceName: '山东省调', deviceType: '主机', ip: '10.200.114.23', progress: '进行中' },
  { id: 3, zone: 'I区', monitorDevice: '济南地调_英平站_II区_SVR_1234', deviceName: '山东省调', deviceType: '远动装置', ip: '10.200.114.23', progress: '已完成' },
]);
const getStatusColor = (status) => {
  if (status === '进行中') return 'orange';
  if (status === '已完成') return 'green';
  return 'grey';
};

const resultColumns = [
  { name: 'zone', label: '安全区', field: 'zone', align: 'left' },
  { name: 'monitorDevice', label: '监测设备', field: 'monitorDevice', align: 'left' },
  { name: 'deviceName', label: '设备名称', field: 'deviceName', align: 'left' },
  { name: 'deviceType', label: '设备类型', field: 'deviceType', align: 'left' },
  { name: 'ip', label: '设备IP', field: 'ip', align: 'left' },
  { name: 'result', label: '告警验证结果', field: 'result', align: 'center' },
];
const verificationResults = ref([
  { id: 1, zone: 'II区', monitorDevice: '山东省调_青州站_I区_电...', deviceName: '山东省调', deviceType: '远动装置', ip: '10.200.114.24', result: '合格' },
  { id: 2, zone: 'II区', monitorDevice: '济南地调_英平站_I区_OM...', deviceName: '山东省调', deviceType: '主机', ip: '10.200.114.23', result: '不合格' },
]);


const viewTask = (task) => {
  console.log('查看任务:', task.name);
  goToStep(2);
};

const saveNewTask = () => {
  $q.notify({
    color: 'positive',
    message: '任务创建成功',
    icon: 'check'
  });
  createTaskDialog.value = false;
  newTask.value = { name: '富国站及核查任务', station: '富国站', ip1: '', ip2: '', scope: [], selectedItems: [] };
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
  background-color: #263238
</style>
