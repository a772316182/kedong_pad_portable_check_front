<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 顶部主工具栏 (样式更新) -->
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn unelevated color="primary" icon="arrow_back_ios" label="返回" @click="navigateTo('/managecheck')"/>
        <q-toolbar-title class="q-ml-md">
          任务管理
        </q-toolbar-title>
        <q-space />
        <q-btn-group unelevated>
          <q-btn icon="file_upload" label="导入" color="primary" @click="importDialogOpen = true" />
          <q-btn icon="file_download" label="导出" color="primary" @click="exportDialogOpen = true" />
          <q-btn icon="add" label="新增任务" color="primary" @click="openDrawer('single')" />
        </q-btn-group>
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 (样式更新) -->
    <q-page-container>
      <q-page class="q-pa-md bg-dark-page ">
        <div class="main-content-area">
        <!-- 任务表格 -->
        <q-table
          :rows="tasks"
          :columns="taskTableColumns"
          row-key="id"
          class="text-grey-4"
          separator="cell"
          dark
          flat
          bordered
          card-class="bg-dark-table-card"
          table-header-class="bg-dark-table-header text-white"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip :color="props.row.statusColor" text-color="white" dense :label="props.row.status" />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-sm">
              <q-btn v-if="!props.row.expired" flat dense round icon="visibility" class="text-light-blue-4" @click="navigateTo('/checking')">
                <q-tooltip>核查详情</q-tooltip>
              </q-btn>
              <q-btn v-if="props.row.expired" flat dense round icon="visibility" class="text-light-blue-4" disabled>
                <q-tooltip>核查详情</q-tooltip>
              </q-btn>
              <!-- 条件渲染：只有任务所有者才能看到编辑和删除按钮 -->
              <template v-if="props.row.owner === currentUser">
                <q-btn flat dense round icon="edit" class="text-light-blue-4" @click="openEditDrawer(props.row)">
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <q-btn flat dense round icon="delete" class="text-red-4" @click="deleteTask(props.row)">
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </template>
            </q-td>
          </template>
        </q-table>
        </div>
      </q-page>
    </q-page-container>

    <!-- 批量导入弹窗 -->
    <q-dialog v-model="importDialogOpen">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">批量导入任务</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-file
            v-model="importFile"
            label="选择文件 (.xlsx, .xls)"
            outlined
            accept=".xlsx, .xls"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <div class="q-mt-sm text-caption text-grey">
            请上传指定模板的Excel文件。
            <a href="#" class="text-primary">下载模板</a>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="primary" label="开始导入" @click="handleImport" :disable="!importFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 批量导出弹窗 -->
    <q-dialog v-model="exportDialogOpen">
      <q-card style="width: 500px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">批量导出任务</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div>
            <div class="text-subtitle2 q-mb-sm">导出范围</div>
            <q-option-group
              v-model="exportScope"
              :options="[
                { label: '所有任务', value: 'all' },
                { label: '已选中的任务 (' + selectedTasks.length + '条)', value: 'selected', disable: selectedTasks.length === 0 }
              ]"
              inline
            />
          </div>
          <div>
            <div class="text-subtitle2 q-mb-sm">文件格式</div>
            <q-option-group
              v-model="exportFormat"
              :options="[
                { label: 'Excel (.xlsx)', value: 'xlsx' },
                { label: 'CSV (.csv)', value: 'csv' }
              ]"
              inline
            />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="取消" v-close-popup />
          <q-btn color="primary" label="确认导出" @click="handleExport" />
        </q-card-actions>
      </q-card>
    </q-dialog>


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
        <div class="absolute-bottom q-pa-md"><q-btn color="teal-6" label="保存" class="full-width" size="lg" @click="submitAndClose"/></div>
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
        </q-list>
      </div>

      <!-- 同站点多时间段视图 -->
      <div v-if="drawerView === 'batch-time'">
        <q-toolbar>
          <q-btn flat round dense icon="arrow_back_ios" @click="drawerView = 'batch'"/>
          <q-toolbar-title>同站点多时间段</q-toolbar-title>
          <q-btn icon="file_upload" label="导入" @click="importDialogOpen = true" />
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
        <div class="absolute-bottom q-pa-md"><q-btn color="teal-6" label="确定" class="full-width" size="lg" @click="submitAndClose"/></div>
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
        <div class="absolute-bottom q-pa-md"><q-btn color="teal-6" label="保存" class="full-width" size="lg" @click="saveAndCloseEditDrawer"/></div>
      </div>
    </q-drawer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'
const router = useRouter();

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}

const $q = useQuasar();
const drawerOpen = ref(false);
const drawerView = ref('single'); // 'single', 'batch', 'batch-time', 'batch-station'
const editDrawerOpen = ref(false);
const editingTask = ref(null);
const selectedTasks = ref([]);

// 新增：导入/导出功能的状态
const importDialogOpen = ref(false);
const exportDialogOpen = ref(false);
const importFile = ref(null);
const exportScope = ref('all');
const exportFormat = ref('xlsx');

// 新增：模拟当前用户
const currentUser = ref('operator');

// 模拟主页任务数据 (新增 owner 属性)
const tasks = ref([
  { id: '250708_250711', station: '四川省调', timeRange: '2025-07-08~2025-07-31', executor: '全部', passed: 0, failed: 3, status: '延期执行中', statusColor: 'orange-9', owner: 'operator', expired: false },
  { id: '新建测试', station: '新建站', timeRange: '2025-07-30~2025-08-01', executor: '全部', passed: 0, failed: 0, status: '待执行', statusColor: 'amber', owner: 'admin', expired: false },
  { id: '250709_250718', station: '甘孜集控', timeRange: '2025-07-09~2025-07-18', executor: '全部', passed: 0, failed: 0, status: '已过期', statusColor: 'grey', owner: 'admin', expired: true },
  { id: '250709_250718_2', station: '甘孜集控', timeRange: '2025-07-09~2025-07-18', executor: '全部', passed: 2, failed: 0, status: '已过期', statusColor: 'grey', owner: 'operator', expired: true },
]);

// 新增：表格列定义
const taskTableColumns = [
  { name: 'id', required: true, label: '任务名称', align: 'left', field: row => row.id, sortable: true },
  { name: 'station', label: '站点', align: 'left', field: 'station', sortable: true },
  { name: 'timeRange', label: '时间', align: 'left', field: 'timeRange', sortable: true },
  { name: 'executor', label: '执行人', align: 'left', field: 'executor' },
  { name: 'passed', label: '已通过', align: 'center', field: 'passed' },
  { name: 'failed', label: '未通过', align: 'center', field: 'failed' },
  { name: 'status', label: '状态', align: 'center', field: 'status' },
  { name: 'actions', label: '操作', align: 'center', field: 'actions' },
];

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

// 新增：删除任务函数
const deleteTask = (taskToDelete) => {
  $q.dialog({
    title: '确认删除',
    message: `您确定要删除任务 “${taskToDelete.id}” 吗？`,
    cancel: true,
    persistent: true,
    dark: true
  }).onOk(() => {
    const index = tasks.value.findIndex(task => task.id === taskToDelete.id);
    if (index > -1) {
      tasks.value.splice(index, 1);
      $q.notify({
        color: 'positive',
        message: '任务删除成功'
      });
    }
  });
};

// 新增：导入/导出处理函数
const handleImport = () => {
  if (!importFile.value) {
    $q.notify({
      color: 'negative',
      message: '请先选择要导入的文件',
      icon: 'warning'
    });
    return;
  }
  // 模拟导入逻辑
  $q.notify({
    color: 'positive',
    message: `文件 "${importFile.value.name}" 已开始导入`,
    icon: 'check'
  });
  importDialogOpen.value = false;
  importFile.value = null;
};

const handleExport = () => {
  // 模拟导出逻辑
  $q.notify({
    color: 'positive',
    message: `任务已导出为 ${exportFormat.value.toUpperCase()} 格式`,
    icon: 'file_download'
  });
  exportDialogOpen.value = false;
};

</script>

<style lang="sass" scoped>
.bg-dark-header
  background: #272727

.bg-dark-page
  background: #292a2d

.main-content-area
  padding-top: 20px;

.bg-dark-table-header
  background: #424864 !important

.bg-dark-table-card
  background: #363636

.q-toolbar__title
  font-weight: bold

.q-item__label--header
  font-weight: bold
  color: $grey-8

.q-item
  padding-left: 0
  padding-right: 0
</style>
