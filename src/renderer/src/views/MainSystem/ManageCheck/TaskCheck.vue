<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar style="min-height: 80px;">
        <q-btn unelevated label="返回上一级" @click="goBack" class="action-button" icon="arrow_back" size="lg" />
        <q-toolbar-title class="q-ml-lg text-h4 text-weight-bolder">
          任务管理
        </q-toolbar-title>
        <q-space />
        <div class="row items-center q-gutter-x-md">
          <q-btn unelevated label="导入" @click="importData" class="action-button" icon="file_upload" size="lg" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page padding>
        <!-- 主内容区域 -->
        <div class="main-content-area">
          <q-table
            class="site-table"
            flat
            dark
            :rows="tasks"
            :columns="columns"
            row-key="id"
            hide-bottom
            :rows-per-page-options="[0]"
          >
            <!-- 自定义状态列 -->
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip :color="props.row.statusColor" text-color="white" dense>
                  {{ props.row.status }}
                </q-chip>
              </q-td>
            </template>

            <!-- 自定义操作列 -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="q-gutter-x-sm text-center">
                <q-btn flat dense round @click="openViewDialog(props.row)" icon="visibility" color="light-blue-3">
                  <q-tooltip>查看详情</q-tooltip>
                </q-btn>
                <q-btn flat dense round @click="openEditDialog(props.row.id)" icon="edit" color="light-blue-3">
                  <q-tooltip>编辑</q-tooltip>
                </q-btn>
                <q-btn flat dense round @click="deleteRow(props.row.id)" icon="close" color="negative">
                  <q-tooltip class="bg-red">删除此任务</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </div>
      </q-page>
    </q-page-container>

    <!-- 用于查看详情的弹窗 -->
    <q-dialog v-model="isViewDialogVisible">
      <q-card class="dialog-card text-black" style="width: 850px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h5">任务详情</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-lg" v-if="viewingTask">
          <div class="q-gutter-y-md">
            <div class="row items-center">
              <div class="col-3 detail-label">任务名称 (ID):</div>
              <div class="col-9 text-body1">{{ viewingTask.id }}</div>
            </div>
            <div class="row items-center">
              <div class="col-3 detail-label">站点:</div>
              <div class="col-9 text-body1 text-weight-bold">{{ viewingTask.station }}</div>
            </div>
            <!-- 修改: 显示开始和结束时间 -->
            <div class="row items-center">
              <div class="col-3 detail-label">时间范围:</div>
              <div class="col-9 text-body1">{{ viewingTask.startTime }} 至 {{ viewingTask.endTime }}</div>
            </div>
            <div class="row items-center">
              <div class="col-3 detail-label">执行人:</div>
              <div class="col-9 text-body1">{{ viewingTask.executor }}</div>
            </div>
            <div class="row items-center">
              <div class="col-3 detail-label">任务状态:</div>
              <div class="col-9">
                <q-chip :color="viewingTask.statusColor" text-color="white" dense>
                  {{ viewingTask.status }}
                </q-chip>
              </div>
            </div>
            <div class="row items-center">
              <div class="col-3 detail-label">已通过 / 未通过:</div>
              <div class="col-9 text-body1">
                <span class="text-positive">{{ viewingTask.passed }}</span> / <span class="text-negative">{{ viewingTask.failed }}</span>
              </div>
            </div>
            <div class="row items-center">
              <div class="col-3 detail-label">所有者:</div>
              <div class="col-9 text-body1">{{ viewingTask.owner }}</div>
            </div>
            <div class="row items-center">
              <div class="col-3 detail-label">是否已过期:</div>
              <div class="col-9 text-body1">{{ viewingTask.expired ? '是' : '否' }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="关闭" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 用于新增和编辑的通用弹窗 -->
    <q-dialog v-model="isDialogVisible" @hide="onDialogHide">
      <q-card class="dialog-card text-black" style="width: 850px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h5">{{ dialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit.prevent="submitForm" class="q-gutter-y-md">
            <div class="row items-center">
              <div class="col-2 dialog-label">任务名称(ID):</div>
              <div class="col-10">
                <q-input outlined dense v-model="taskForm.id" :readonly="editingTaskId !== null" hint="新增时自动生成，编辑时不可修改" />
              </div>
            </div>
            <div class="row items-center">
              <div class="col-2 dialog-label">站点:</div>
              <div class="col-10">
                <q-input outlined dense v-model="taskForm.station" :rules="[val => !!val || '站点名称不能为空']" />
              </div>
            </div>

            <!-- 修改: 使用两个日期选择器替换原来的时间范围输入框 -->
            <div class="row items-center">
              <div class="col-2 dialog-label">开始时间:</div>
              <div class="col-10">
                <q-input filled dense v-model="taskForm.startTime" mask="date" :rules="['date']">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="taskForm.startTime">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="关闭" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row items-center">
              <div class="col-2 dialog-label">结束时间:</div>
              <div class="col-10">
                <q-input filled dense v-model="taskForm.endTime" mask="date" :rules="['date']">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="taskForm.endTime">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="关闭" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row items-center">
              <div class="col-2 dialog-label">执行人:</div>
              <div class="col-10">
                <q-input outlined dense v-model="taskForm.executor" />
              </div>
            </div>
            <div class="row items-center">
              <div class="col-2 dialog-label">任务状态:</div>
              <div class="col-10">
                <q-select outlined dense v-model="taskForm.status" :options="statusOptions" emit-value map-options />
              </div>
            </div>
            <div class="row items-center">
              <div class="col-2 dialog-label">备注(所有者):</div>
              <div class="col-10">
                <q-input outlined dense v-model="taskForm.owner" />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-lg">
          <q-btn label="取消" color="grey-6" style="width: 140px" size="lg" v-close-popup />
          <q-btn label="保存" color="primary" style="width: 140px" size="lg" @click="submitForm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { lastValidReferrer } from '../../../router/aaanavigation.js';

const router = useRouter();
const allowedReferrerPaths = ['/stationandtask', '/executecheck'];

const goBack = () => {
  const previousPath = router.options.history.state.back;
  if (previousPath && allowedReferrerPaths.includes(previousPath)) {
    router.back();
  } else {
    router.push(lastValidReferrer.value);
  }
};

// 修改: 更新数据结构
const tasks = ref([
  { id: '250708_250711', station: '四川省调', startTime: '2025-07-08', endTime: '2025-07-31', executor: '全部', passed: 0, failed: 3, status: '延期执行中', statusColor: 'orange-9', owner: 'operator', expired: false },
  { id: '新建测试', station: '新建站', startTime: '2025-07-30', endTime: '2025-08-01', executor: '全部', passed: 0, failed: 0, status: '待执行', statusColor: 'amber', owner: 'admin', expired: false },
  { id: '250709_250718', station: '甘孜集控', startTime: '2025-07-09', endTime: '2025-07-18', executor: '全部', passed: 0, failed: 0, status: '已过期', statusColor: 'grey', owner: 'admin', expired: true },
  { id: '250709_250718_2', station: '甘孜集控', startTime: '2025-07-09', endTime: '2025-07-18', executor: '全部', passed: 2, failed: 0, status: '已完成', statusColor: 'positive', owner: 'operator', expired: true },
]);

// 修改: 更新表格列定义
const columns = [
  { name: 'id', required: true, label: '任务名称', align: 'left', field: 'id', sortable: true },
  { name: 'station', align: 'left', label: '站点', field: 'station', sortable: true },
  { name: 'startTime', align: 'left', label: '开始时间', field: 'startTime', sortable: true },
  { name: 'endTime', align: 'left', label: '结束时间', field: 'endTime', sortable: true },
  { name: 'executor', align: 'left', label: '执行人', field: 'executor' },
  { name: 'passed', align: 'center', label: '已通过', field: 'passed' },
  { name: 'failed', align: 'center', label: '未通过', field: 'failed' },
  { name: 'status', align: 'center', label: '状态', field: 'status' },
  { name: 'actions', label: '操作', align: 'center' }
];

const isDialogVisible = ref(false);
const editingTaskId = ref(null);
const isViewDialogVisible = ref(false);
const viewingTask = ref(null);

const statusOptions = ref([
  { label: '待执行', value: '待执行', color: 'amber' },
  { label: '延期执行中', value: '延期执行中', color: 'orange-9' },
  { label: '已完成', value: '已完成', color: 'positive' },
  { label: '已过期', value: '已过期', color: 'grey' },
]);

// 修改: 更新表单初始状态
const getInitialFormState = () => ({
  id: `task_${Date.now()}`,
  station: '',
  startTime: '',
  endTime: '',
  executor: '全部',
  passed: 0,
  failed: 0,
  status: '待执行',
  statusColor: 'amber',
  owner: 'admin',
  expired: false
});

const taskForm = ref(getInitialFormState());

watch(() => taskForm.value.status, (newStatus) => {
  const selectedOption = statusOptions.value.find(option => option.value === newStatus);
  if (selectedOption) {
    taskForm.value.statusColor = selectedOption.color;
  }
});

const importData = () => console.log('触发：导入');

const openViewDialog = (task) => {
  viewingTask.value = task;
  isViewDialogVisible.value = true;
};

const openEditDialog = (id) => {
  const taskToEdit = tasks.value.find(task => task.id === id);
  if (taskToEdit) {
    editingTaskId.value = id;
    taskForm.value = { ...taskToEdit };
    isDialogVisible.value = true;
  }
};

const submitForm = () => {
  if (editingTaskId.value !== null) {
    const index = tasks.value.findIndex(task => task.id === editingTaskId.value);
    if (index !== -1) {
      tasks.value[index] = { ...taskForm.value };
    }
  } else {
    tasks.value.push({ ...taskForm.value });
  }
  isDialogVisible.value = false;
};

const onDialogHide = () => {
  editingTaskId.value = null;
  taskForm.value = getInitialFormState();
};

const deleteRow = (id) => {
  const index = tasks.value.findIndex(task => task.id === id);
  if (index > -1) {
    tasks.value.splice(index, 1);
  }
};

const dialogTitle = computed(() => {
  return editingTaskId.value === null ? '新增任务' : '编辑任务';
});
</script>

<style scoped>
/* 样式部分保持不变 */
.page-background {
  background-color: #292a2d;
  overflow: hidden;
}
.bg-dark-header {
  background: #272727 !important;
}
.main-content-area {
  padding-top: 20px;
}
.action-button {
  background-color: #4c6afc;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  padding: 4px 12px;
}
.action-button .q-icon {
  font-size: 1.2em;
  margin-right: 4px;
}
.site-table {
  background-color: #333438;
  border-radius: 8px;
}
:deep(.site-table thead tr th) {
  color: white;
  font-weight: bold;
  background-color: rgba(76, 106, 252, 0.2);
  font-size: 24px;
  height: 2.6em;
}
:deep(.site-table tbody td) {
  color: #e0e0e0;
  font-size: 22px;
  border-color: #424242;
  height: 3.25em;
}
:deep(.site-table tbody tr:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}
:deep(.site-table .q-chip) {
  font-weight: bold;
  padding: 4px 10px;
}
.dialog-card {
  background-color: white;
  border-radius: 8px;
}
.dialog-label {
  width: 140px;
  text-align: right;
  padding-right: 12px;
  color: #333;
  font-weight: 500;
  font-size: 16px;
}
.detail-label {
  font-size: 1rem;
  font-weight: 500;
  color: #616161;
  text-align: right;
  padding-right: 16px;
}
</style>
