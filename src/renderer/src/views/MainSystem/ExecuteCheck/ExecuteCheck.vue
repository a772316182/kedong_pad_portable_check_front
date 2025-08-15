<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter();

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`);
  router.push(path);
}

// --- 响应式数据 ---
const currentStep = ref('site-selection');

const sites = reactive([
  { id: 'site-a', name: "总部数据中心", location: "北京", manager: "张三" },
  { id: 'site-b', name: "华东区域节点", location: "上海", manager: "李四" },
  { id: 'site-c', name: "华南区域节点", location: "广州", manager: "王五" },
  { id: 'site-d', name: "西南区域节点", location: "成都", manager: "赵六" },
  { id: 'site-e', name: "西北区域节点", location: "西安", manager: "孙七" },
  { id: 'site-f', name: "华中区域节点", location: "武汉", manager: "周八" },
  { id: 'site-g', name: "东北区域节点", location: "沈阳", manager: "钱九" },
]);

const tasks = reactive([
  {
    id: 250708,
    name: "250708_250711",
    site: "四川省调",
    startTime: "2025-07-08",
    endTime: "2025-07-31",
    executor: "全部",
    remarks: "operator"
  },
  {
    id: 250601,
    name: "250601_250630",
    site: "总部数据中心",
    startTime: "2025-06-01",
    endTime: "2025-06-30",
    executor: "网络安全组",
    remarks: "月度常规检查"
  },
  {
    id: 250515,
    name: "250515_250520",
    site: "华东区域节点",
    startTime: "2025-05-15",
    endTime: "2025-05-20",
    executor: "李四",
    remarks: "漏洞专项复查"
  },
]);


const qualificationTypes = reactive([
  { id: 'auto', name: '自动审查', icon: 'smart_toy' },
  { id: 'manual', name: '人工审查', icon: 'person_search' },
]);

const selectedSite = ref(null);
const selectedTask = ref(null);

const selectedQualifications = reactive({
  manual: [],
  auto: []
});

// *** 修改点: 更新人工审查的选项 ***
const qualificationOptions = {
  manual: [
    { label: '运行管理', value: '运行管理' },
    { label: '监督管理', value: '监督管理' },
    { label: '人员管理', value: '人员管理' },
    { label: '基础设施安全', value: '基础设施安全' },
    { label: '体系结构安全', value: '体系结构安全' },
    { label: '系统本体安全', value: '系统本体安全' },
    { label: '监测应急', value: '监测应急' },
  ],
  auto: [
    { label: '免登录检查', value: '免登录检查' },
    { label: '登录检查', value: '登录检查' },
    { label: '告警对点', value: '告警对点' },
    { label: '安防策略检查', value: '安防策略检查' },
  ]
};

const showAddTaskDialog = ref(false);

const taskDialogForm = reactive({
  name: '',
  site: '',
  startTime: '',
  endTime: '',
  executor: '',
  remarks: ''
});


const showQualificationDialog = ref(false);
const currentQualificationType = ref(null);

// --- 计算属性 ---
const backButtonLabel = computed(() => {
  return currentStep.value === 'site-selection' ? '返回' : '上一步';
});

const qualificationDialogTitle = computed(() => {
  if (!currentQualificationType.value) return '';
  const typeInfo = qualificationTypes.find(t => t.id === currentQualificationType.value);
  return `选择${typeInfo?.name || ''}方式`;
});

// --- 方法 ---
const selectSiteAndProceed = (site) => {
  selectedSite.value = site;
  currentStep.value = 'task-selection';
};

const selectTaskAndProceed = (task) => {
  selectedTask.value = task;
  currentStep.value = 'task-qualification';
};

const openAddTaskDialog = () => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + 14);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  taskDialogForm.name = `TASK_${Date.now().toString().slice(-6)}`;
  taskDialogForm.site = selectedSite.value?.name || '';
  taskDialogForm.startTime = formatDate(today);
  taskDialogForm.endTime = formatDate(futureDate);
  taskDialogForm.executor = '全部';
  taskDialogForm.remarks = '';
  showAddTaskDialog.value = true;
};

const saveNewTask = () => {
  if (!taskDialogForm.name.trim()) {
    alert("任务名称(ID)不能为空");
    return;
  }
  tasks.push({
    id: Date.now(),
    ...taskDialogForm
  });
  showAddTaskDialog.value = false;
};


const openQualificationDialog = (typeId) => {
  currentQualificationType.value = typeId;
  showQualificationDialog.value = true;
};

const confirmSelection = () => {
  if (selectedQualifications.manual.length === 0 && selectedQualifications.auto.length === 0) {
    alert("请至少选择一个审查方式");
    return;
  }
  const selectedDetails = [];
  if (selectedQualifications.auto.length > 0) {
    selectedDetails.push(`自动审查: ${selectedQualifications.auto.join(', ')}`);
  }
  if (selectedQualifications.manual.length > 0) {
    selectedDetails.push(`人工审查: ${selectedQualifications.manual.join(', ')}`);
  }
  console.log("站点已确认:", selectedSite.value.name);
  console.log("任务已确认:", selectedTask.value.name);
  console.log("定性方式详情:", selectedDetails.join('; '));
  alert(`已选定站点: "${selectedSite.value.name}"\n已选定任务 "${selectedTask.value.name}"\n审查方式:\n${selectedDetails.join('\n')}`);

  sessionStorage.setItem('selectedSite', JSON.stringify(selectedSite.value));
  sessionStorage.setItem('selectedTask', JSON.stringify(selectedTask.value));
  sessionStorage.setItem('selectedQualifications', JSON.stringify(selectedQualifications));

  navigateTo('/checking');
};
</script>

<template>
  <q-layout view="lHh LpR lFf" class="bg-dark-page text-white">
    <q-header class="bg-dark-page" bordered>
      <q-toolbar class="q-pt-sm q-pb-sm">
        <q-btn unelevated color="primary" :label="backButtonLabel" @click="navigateTo('/modeselect')" icon="arrow_back" class="header-button" />
        <q-space />
        <q-toolbar-title class="text-center text-weight-bold header-title">
          启动核查
        </q-toolbar-title>
        <q-space />
        <div style="width: 100px"></div>
      </q-toolbar>

      <div class="header-stepper-wrapper">
        <div class="stepper-container row q-col-gutter-none">
          <div class="col text-center stepper-item" :class="{active: currentStep === 'site-selection', done: ['task-selection', 'task-qualification'].includes(currentStep)}">站点选择</div>
          <div class="col text-center stepper-item" :class="{active: currentStep === 'task-selection', done: currentStep === 'task-qualification'}">任务选择</div>
          <div class="col text-center stepper-item" :class="{active: currentStep === 'task-qualification'}">任务定性</div>
        </div>
      </div>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-lg">
        <div>
          <div v-if="currentStep === 'site-selection'">
            <p class="step-description">请选择需要进行核查的站点</p>
            <q-list v-if="sites.length > 0" dark separator class="bg-dark-content rounded-borders">
              <q-item v-for="site in sites" :key="site.id" clickable v-ripple class="list-item-hover" @click="selectSiteAndProceed(site)">
                <q-item-section>
                  <q-item-label class="item-title">{{ site.name }}</q-item-label>
                  <q-item-label caption class="item-caption">所属公司: {{ site.location }} | 负责人: {{ site.manager }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-6" size="lg"/>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-if="currentStep === 'task-selection' && selectedSite">
            <p class="step-description">
              已选择站点: <span class="text-weight-bold text-white">{{ selectedSite.name }}</span>。请选择需要执行的核查任务。
            </p>
            <q-list v-if="tasks.length > 0" dark separator class="bg-dark-content rounded-borders">
              <q-item v-for="task in tasks" :key="task.id" clickable v-ripple class="list-item-hover" @click="selectTaskAndProceed(task)">
                <q-item-section>
                  <q-item-label class="item-title">{{ task.name }}</q-item-label>
                  <q-item-label caption class="item-caption">
                    站点: {{ task.site }} | 开始时间: {{ task.startTime }} | 结束时间: {{ task.endTime }} | 执行人: {{ task.executor }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-6" size="lg"/>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-if="currentStep === 'task-qualification' && selectedTask">
            <p class="step-description">
              已选定: <span class="text-weight-bold text-white">{{ selectedSite.name }} / {{ selectedTask.name }}</span>。请选定审查方式（可多选）。
            </p>
            <div class="row q-col-gutter-xl justify-center">
              <div class="col-12 col-sm-6 col-md-5" v-for="q_type in qualificationTypes" :key="q_type.id">
                <q-card class="qualification-card text-center cursor-pointer" :class="{ 'selected': selectedQualifications[q_type.id].length > 0 }" flat @click="openQualificationDialog(q_type.id)">
                  <q-card-section class="q-py-xl">
                    <q-icon :name="q_type.icon" size="6em" />
                    <div class="card-title">{{ q_type.name }}</div>
                    <div class="card-caption">
                      {{ selectedQualifications[q_type.id].length > 0 ? selectedQualifications[q_type.id].join(', ') : '点击选择' }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <q-footer class="bg-dark-page page-footer" bordered>
      <div v-if="currentStep === 'site-selection'" class="text-center">
        <q-btn color="primary" unelevated label="新增/编辑站点" @click="navigateTo('/stationview')" class="shadow-5 bottom-action-button" />
      </div>
      <div v-if="currentStep === 'task-selection'" class="row justify-center" style="gap: 60px; width: 100%;">
        <q-btn color="primary" unelevated label="新增任务" @click="openAddTaskDialog" class="shadow-5 bottom-action-button" />
        <q-btn color="primary" unelevated label="修改历史任务" @click="navigateTo('/taskcheck')" class="shadow-5 bottom-action-button" />
      </div>
      <div v-if="currentStep === 'task-qualification'" class="text-center">
        <q-btn color="primary" unelevated :disable="selectedQualifications.manual.length === 0 && selectedQualifications.auto.length === 0" @click="confirmSelection" class="shadow-10 final-confirm-btn">
          <q-icon name="rocket_launch" />
          开始核查
        </q-btn>
      </div>
    </q-footer>

    <q-dialog v-model="showAddTaskDialog" persistent>
      <q-card class="bg-dark-content text-white dialog-card">
        <q-card-section class="row items-center">
          <div class="dialog-title">新增/编辑任务</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input dark color="primary" v-model="taskDialogForm.name" label="任务名称(ID)" outlined class="q-mb-lg"/>
          <q-input dark color="primary" v-model="taskDialogForm.site" label="站点" outlined readonly hint="新增时自动填充" class="q-mb-lg"/>

          <div class="row q-gutter-md q-mb-lg">
            <q-input dark color="primary" v-model="taskDialogForm.startTime" label="开始时间" outlined class="col" mask="date" :rules="['date']">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="taskDialogForm.startTime" dark color="primary"><div class="row items-center justify-end"><q-btn v-close-popup label="关闭" color="primary" flat /></div></q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input dark color="primary" v-model="taskDialogForm.endTime" label="结束时间" outlined class="col" mask="date" :rules="['date']">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="taskDialogForm.endTime" dark color="primary"><div class="row items-center justify-end"><q-btn v-close-popup label="关闭" color="primary" flat /></div></q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <q-input dark color="primary" v-model="taskDialogForm.executor" label="执行人" outlined class="q-mb-lg"/>
        </q-card-section>

        <q-card-actions class="bg-dark-page q-pa-md" align="center">
          <q-btn label="取消" color="grey" v-close-popup class="dialog-action-btn" />
          <q-btn label="保存" color="primary" @click="saveNewTask" class="dialog-action-btn" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showQualificationDialog">
      <q-card class="bg-dark-content text-white dialog-card">
        <q-card-section class="row items-center">
          <div class="dialog-title">{{ qualificationDialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-option-group :options="qualificationOptions[currentQualificationType]" type="checkbox" v-model="selectedQualifications[currentQualificationType]" dark color="primary" keep-color />
        </q-card-section>
        <q-card-actions align="right" class="bg-dark-page q-pa-lg">
          <q-btn flat label="确定" color="primary" v-close-popup class="dialog-action-btn" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<style scoped>
/* --- 新增/修改的样式 --- */
.q-header.q-header--bordered,
.q-footer.q-footer--bordered {
  border-color: rgba(255, 255, 255, 0.12) !important;
}

/* [新增] 步骤条包装器，用于在 header 内部提供边距 */
.header-stepper-wrapper {
  padding: 0 24px 24px 24px;
}

.page-footer {
  padding: 16px;
  min-height: 124px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- 1. 顶部工具栏 (Header) --- */
.header-button {
  font-size: 1.2rem !important;
  padding: 8px 16px;
}
.header-title {
  font-size: 2.5rem !important;
}

/* --- 2. 步骤条 (Stepper) --- */
.stepper-item {
  padding: 22px 15px;
  font-size: 1.5rem;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
}
.stepper-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 38px solid transparent;
  border-bottom: 38px solid transparent;
  border-left: 25px solid #3a3c52;
  z-index: 1;
  transition: border-color 0.3s ease;
}

/* --- 3. 步骤描述文字 --- */
.step-description {
  font-size: 1.4rem;
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
}

/* --- 4. 列表项 (Sites & Tasks) --- */
.list-item-hover {
  padding: 25px 20px;
}
.item-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 10px;
}
.item-caption {
  font-size: 1.2rem;
  color: #c0c0c0 !important;
}

/* --- 5. 底部动作按钮 (Steps 1 & 2) --- */
.bottom-action-button {
  font-size: 1.4rem !important;
  min-width: 240px;
  padding: 15px 30px;
  border-radius: 8px;
}

/* --- 6. 定性卡片 (Step 3) --- */
.qualification-card {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-title {
  font-size: 2.2rem;
  font-weight: 500;
  margin-top: 1.5rem;
}
.card-caption {
  font-size: 1.3rem;
  color: #b0b0b0;
  margin-top: 1rem;
  padding: 0 1rem;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.selected .card-caption {
  color: #66a1ff;
  font-weight: bold;
}

/* --- 7. 最终确认按钮 (Step 3) --- */
.final-confirm-btn {
  width: 350px;
  height: 90px;
  font-size: 2.4rem;
  border-radius: 15px;
  font-weight: bold;
}
.final-confirm-btn .q-icon {
  font-size: 2.5rem;
  margin-right: 1rem;
}

/* --- 对话框样式 --- */
.dialog-card {
  width: 600px;
  max-width: 90vw;
}
.dialog-title {
  font-size: 1.8rem;
  font-weight: bold;
}
:deep(.q-field__label) {
  font-size: 1.2rem !important;
}
:deep(.q-field .q-field__native) {
  font-size: 1.2rem !important;
}
:deep(.q-option-group .q-checkbox__label) {
  font-size: 1.3rem;
}
.dialog-action-btn {
  font-size: 1.2rem !important;
  padding: 8px 24px;
}

/* --- 通用基础样式 (无需修改) --- */
.bg-dark-page { background-color: #292a2d; }
.bg-dark-content { background-color: #3a3c52; }
.rounded-borders { border-radius: 8px; }
.q-list--dark.q-list--separator > .q-item-type + .q-item-type {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.list-item-hover:hover {
  background-color: rgba(76, 106, 252, 0.2) !important;
}
.stepper-container {
  background-color: #3a3c52;
  border-radius: 8px;
  color: #ccc;
  padding: 0;
  overflow: hidden;
  border: 1px solid #5f6368;
}
.stepper-item.active { background-color: #4c6afc; color: white; }
.stepper-item.active::after { border-left-color: #4c6afc; }
.stepper-item.done { background-color: #5f6368; color: #e0e0e0; }
.stepper-item.done::after { border-left-color: #5f6368; }
.qualification-card {
  background-color: #3a3c52;
  border: 3px solid #5f6368;
  transition: all 0.2s ease-in-out;
  position: relative;
}
.qualification-card:hover {
  border-color: #8ab4f8;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.qualification-card.selected {
  border-color: #4c6afc;
  background-color: rgba(76, 106, 252, 0.1);
}
</style>
