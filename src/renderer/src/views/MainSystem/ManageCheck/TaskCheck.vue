<template>
  <q-layout view="lHh Lpr lFf" class="bg-page">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn flat dense icon="arrow_back_ios" label="返回" @click="navigateTo('/executeCheck')"/>
        <q-toolbar-title class="absolute-center">
          任务管理
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 新增任务按钮 (更新) -->
        <div class="row justify-end q-mb-md">
          <q-btn icon="add" color="primary" label="新增任务" @click="openDrawer('single')" />
        </div>

        <!-- 任务卡片列表 -->
        <div class="row q-col-gutter-md">
          <div v-for="task in tasks" :key="task.id" class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
            <q-card>
              <q-card-section>
                <div class="row items-start no-wrap">
                  <div class="col">
                    <div class="text-h6">{{ task.id }}...</div>
                    <div class="text-subtitle2 text-grey-7">站点: {{ task.station }}</div>
                  </div>
                  <div class="col-auto">
                    <q-chip :color="task.statusColor" text-color="white" dense :label="task.status" />
                    <q-btn icon="close" size="sm" flat round dense class="q-ml-sm" />
                  </div>
                </div>
                <div class="text-caption text-grey q-mt-sm">
                  时间: {{ task.timeRange }} <br/>
                  执行人: {{ task.executor }} <br/>
                  已通过: <span class="text-green">{{ task.passed }}台</span> &nbsp;
                  未通过: <span class="text-red">{{ task.failed }}台</span>
                </div>
              </q-card-section>
              <q-separator />
              <q-card-actions align="right">
                <q-btn flat color="primary" v-if="task.status!='已过期'">核查详情</q-btn>
                <q-btn flat color="primary" disabled v-if="task.status=='已过期'">核查详情</q-btn>
                <q-btn flat color="primary" @click="openEditDrawer(task)">编辑</q-btn>
                <q-btn flat color="negative" v-if="task.owned">删除</q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 新增任务抽屉 -->
    <q-drawer
      v-model="drawerOpen"
      side="right"
      :width="450"
      overlay
      bordered
      class="bg-white"
    >
      <!-- 单个新增视图 -->
      <div v-if="drawerView === 'single'">
        <q-toolbar>
          <q-toolbar-title>新增任务</q-toolbar-title>
          <q-btn flat dense color="primary" label="批量新增" @click="drawerView = 'batch'" />
        </q-toolbar>
        <q-separator/>
        <q-list class="q-pa-md">
          <q-item><q-input v-model="singleTask.name" label="任务名" dense outlined class="full-width"/></q-item>
          <q-item><q-input v-model="singleTask.time" label="执行时间" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="event" /></template></q-input></q-item>
          <q-item><q-input v-model="singleTask.executor" label="执行人" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="singleTask.creator" label="创建人" dense outlined class="full-width" readonly /></q-item>
          <q-item><q-input v-model="singleTask.province" label="省份" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="singleTask.city" label="地市" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="singleTask.station" label="站点" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item-label header>检查范围</q-item-label>
          <q-item><q-checkbox v-model="singleTask.scope" val="major" label="重大" /><q-checkbox v-model="singleTask.scope" val="large" label="较大" /><q-checkbox v-model="singleTask.scope" val="normal" label="一般" /></q-item>
        </q-list>
        <div class="absolute-bottom q-pa-md"><q-btn color="primary" label="保存" class="full-width" size="lg" @click="submitAndClose"/></div>
      </div>

      <!-- 批量新增主视图 -->
      <div v-if="drawerView === 'batch'">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back_ios" @click="drawerView = 'single'"/>
          <q-toolbar-title>批量新增</q-toolbar-title>
        </q-toolbar>
        <q-separator/>
        <q-list class="q-pa-md" separator>
          <q-item clickable v-ripple @click="drawerView = 'batch-time'">
            <q-item-section>同站点多时间段</q-item-section>
            <q-item-section side><q-icon name="arrow_forward_ios" /></q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="drawerView = 'batch-station'">
            <q-item-section>同时间段多站点</q-item-section>
            <q-item-section side><q-icon name="arrow_forward_ios" /></q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- 同站点多时间段视图 -->
      <div v-if="drawerView === 'batch-time'">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back_ios" @click="drawerView = 'batch'"/>
          <q-toolbar-title>同站点多时间段</q-toolbar-title>
        </q-toolbar>
        <q-separator/>
        <q-list class="q-pa-md">
          <q-item><q-input v-model="batchTimeTask.name" label="任务名" dense outlined class="full-width"/></q-item>
          <q-item><q-input v-model="batchTimeTask.executor" label="执行人" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="batchTimeTask.creator" label="创建人" dense outlined class="full-width" readonly /></q-item>
          <q-item><q-input v-model="batchTimeTask.province" label="省份" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="batchTimeTask.station" label="站点" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item-label header>检查范围</q-item-label>
          <q-item><q-checkbox v-model="batchTimeTask.scope" val="major" label="重大" /><q-checkbox v-model="batchTimeTask.scope" val="large" label="较大" /><q-checkbox v-model="batchTimeTask.scope" val="normal" label="一般" /></q-item>
          <q-item v-for="(time, index) in batchTimeTask.times" :key="index">
            <q-input v-model="time.value" :label="`执行时间${index + 1}`" dense outlined class="full-width" readonly>
              <template v-slot:append><q-icon name="event" /></template>
            </q-input>
          </q-item>
          <q-item><q-btn flat color="primary" label="添加执行时间" icon="add" @click="addExecutionTime"/></q-item>
        </q-list>
        <div class="absolute-bottom q-pa-md"><q-btn color="primary" label="确定" class="full-width" size="lg" @click="submitAndClose"/></div>
      </div>

      <!-- 同时间段多站点视图 -->
      <div v-if="drawerView === 'batch-station'">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back_ios" @click="drawerView = 'batch'"/>
          <q-toolbar-title>同时间段多站点</q-toolbar-title>
        </q-toolbar>
        <q-separator/>
        <q-list class="q-pa-md">
          <q-item><q-input v-model="batchStationTask.name" label="任务名" dense outlined class="full-width"/></q-item>
          <q-item><q-input v-model="batchStationTask.time" label="执行时间" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="event" /></template></q-input></q-item>
          <q-item><q-input v-model="batchStationTask.executor" label="执行人" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="batchStationTask.creator" label="创建人" dense outlined class="full-width" readonly /></q-item>
          <q-item><q-input v-model="batchStationTask.province" label="省份" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item-label header>检查范围</q-item-label>
          <q-item><q-checkbox v-model="batchStationTask.scope" val="major" label="重大" /><q-checkbox v-model="batchStationTask.scope" val="large" label="较大" /><q-checkbox v-model="batchStationTask.scope" val="normal" label="一般" /></q-item>
          <q-item v-for="(station, index) in batchStationTask.stations" :key="index">
            <q-input v-model="station.value" :label="`执行站点${index + 1}`" dense outlined class="full-width" readonly>
              <template v-slot:append><q-icon name="arrow_forward_ios" /></template>
            </q-input>
          </q-item>
          <q-item><q-btn flat color="primary" label="添加执行站点" icon="add" @click="addExecutionStation"/></q-item>
        </q-list>
        <div class="absolute-bottom q-pa-md"><q-btn color="primary" label="确定" class="full-width" size="lg" @click="submitAndClose"/></div>
      </div>

    </q-drawer>

    <!-- 编辑任务抽屉 -->
    <q-drawer
      v-model="editDrawerOpen"
      side="right"
      :width="450"
      overlay
      bordered
      class="bg-white"
    >
      <div v-if="editingTask">
        <q-toolbar>
          <q-toolbar-title>编辑任务</q-toolbar-title>
          <q-btn icon="close" flat round dense @click="editDrawerOpen = false" />
        </q-toolbar>
        <q-separator/>
        <q-list class="q-pa-md">
          <q-item><q-input v-model="editingTask.name" label="任务名" dense outlined class="full-width"/></q-item>
          <q-item><q-input v-model="editingTask.time" label="执行时间" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="event" /></template></q-input></q-item>
          <q-item><q-input v-model="editingTask.executor" label="执行人" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="editingTask.creator" label="创建人" dense outlined class="full-width" readonly /></q-item>
          <q-item><q-input v-model="editingTask.province" label="省份" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="editingTask.city" label="地市" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item><q-input v-model="editingTask.station" label="站点" dense outlined class="full-width" readonly><template v-slot:append><q-icon name="arrow_forward_ios" /></template></q-input></q-item>
          <q-item-label header>检查范围</q-item-label>
          <q-item><q-checkbox v-model="editingTask.scope" val="major" label="重大" /><q-checkbox v-model="editingTask.scope" val="large" label="较大" /><q-checkbox v-model="editingTask.scope" val="normal" label="一般" /></q-item>
        </q-list>
        <div class="absolute-bottom q-pa-md"><q-btn color="primary" label="保存" class="full-width" size="lg" @click="saveAndCloseEditDrawer"/></div>
      </div>
    </q-drawer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'

const $q = useQuasar();
const drawerOpen = ref(false);
const drawerView = ref('single'); // 'single', 'batch', 'batch-time', 'batch-station'
const editDrawerOpen = ref(false);
const editingTask = ref(null);

// 模拟主页任务数据
const tasks = ref([
  { id: '250708_250711', station: '四川省调', timeRange: '2025-07-08~2025-07-31', executor: '全部', passed: 0, failed: 3, status: '延期执行中', statusColor: 'orange-9', owned: true },
  { id: '新建测试', station: '新建站', timeRange: '2025-07-30~2025-08-01', executor: '全部', passed: 0, failed: 0, status: '待执行', statusColor: 'amber' , owned: false},
  { id: '250709_250718', station: '甘孜集控', timeRange: '2025-07-09~2025-07-18', executor: '全部', passed: 0, failed: 0, status: '已过期', statusColor: 'grey', owned: false },
  { id: '250709_250718_2', station: '甘孜集控', timeRange: '2025-07-09~2025-07-18', executor: '全部', passed: 2, failed: 0, status: '已过期', statusColor: 'grey' , owned: true},
]);

// 单个新增表单数据
const singleTask = ref({
  name: '',
  time: '',
  executor: '全部',
  creator: 'operator',
  province: '',
  city: '',
  station: '四川省调',
  scope: []
});

// 同站点多时间段表单数据
const batchTimeTask = ref({
  name: '',
  executor: '全部',
  creator: 'operator',
  province: '',
  station: '四川省调',
  scope: [],
  times: [
    { value: '2025-08-13~2025-08-21' },
    { value: '' },
  ]
});

// 同时间段多站点表单数据
const batchStationTask = ref({
  name: '',
  time: '',
  executor: '全部',
  creator: 'operator',
  province: '四川省',
  city: '巴中市',
  scope: [],
  stations: [
    { value: '新建站' },
    { value: '新建站' },
  ]
});

const openDrawer = (view) => {
  drawerView.value = view;
  drawerOpen.value = true;
};

const openEditDrawer = (task) => {
  editingTask.value = {
    id: task.id,
    name: task.id,
    time: task.timeRange,
    executor: task.executor,
    creator: 'operator', // 假设创建人不变
    province: '', // 卡片上无此信息
    city: '', // 卡片上无此信息
    station: task.station,
    scope: [] // 卡片上无此信息,
  };
  editDrawerOpen.value = true;
};

const addExecutionTime = () => {
  batchTimeTask.value.times.push({ value: '' });
};

const addExecutionStation = () => {
  batchStationTask.value.stations.push({ value: '' });
};

const submitAndClose = () => {
  // 在这里可以处理表单提交逻辑
  // 例如，根据 drawerView.value 来决定提交哪个表单的数据
  $q.notify({
    color: 'positive',
    message: '任务已保存',
    icon: 'check'
  });
  drawerOpen.value = false; // 关闭抽屉
};

const saveAndCloseEditDrawer = () => {
  if (!editingTask.value) return;

  const taskIndex = tasks.value.findIndex(t => t.id === editingTask.value.id);
  if (taskIndex !== -1) {
    // 更新任务数据
    tasks.value[taskIndex].id = editingTask.value.name;
    tasks.value[taskIndex].timeRange = editingTask.value.time;
    tasks.value[taskIndex].executor = editingTask.value.executor;
    tasks.value[taskIndex].station = editingTask.value.station;
  }

  $q.notify({
    color: 'positive',
    message: '任务已更新',
    icon: 'check'
  });
  editDrawerOpen.value = false; // 关闭编辑抽屉
};

const router = useRouter()
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

</script>

<style lang="sass" scoped>
.q-toolbar__title
  font-weight: bold

.q-item__label--header
  font-weight: bold
  color: $grey-8

.q-item
  padding-left: 0
  padding-right: 0

.bg-page
  background-color: #292a2d

.bg-dark-header
  background-color: #414853
</style>
