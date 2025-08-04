<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter();

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`);
  // 在实际应用中，您会使用 router.push 进行页面跳转
  router.push(path);
  //alert(`模拟跳转到: ${path}`);
}

// --- 响应式数据 ---

// 当前步骤: 'task-selection' (任务选择), 'task-qualification' (任务定性)
const currentStep = ref('task-selection');

// 模拟任务数据
// 您可以把 tasks 设置为空数组 [] 来测试列表为空的场景
// const tasks = reactive([]);
const tasks = reactive([
  { id: 1, name: "主机设备-Linux-安全检查", policy: "主机设备-Linux", lastUpdate: "2025-07-03" },
  { id: 2, name: "主机设备-Windows-安全检查", policy: "主机设备-Windows", lastUpdate: "2025-07-03" },
  { id: 3, name: "网络安全-月度检查", policy: "网络安全", lastUpdate: "2025-07-03" },
  { id: 4, name: "弱密码专项排查", policy: "否", lastUpdate: "2025-04-18" },
]);

// 模拟任务定性类型
const qualificationTypes = reactive([
  { id: 'manual', name: '人工审查', icon: 'person_search' },
  { id: 'auto', name: '自动审查', icon: 'smart_toy' }
]);

// 选中的任务和定性方式
const selectedTask = ref(null);
const selectedQualifications = ref([]); // 支持多选，存储定性类型的id

// --- 计算属性 ---

// 根据当前步骤动态计算“上一步/返回”按钮的文本
const backButtonLabel = computed(() => {
  return currentStep.value === 'task-selection' ? '返回' : '上一步';
});

// --- 方法 ---

// 处理返回/上一步的逻辑
const goBack = () => {
  if (currentStep.value === 'task-selection') {
    // 假设返回到主视图
    navigateTo('/managecheck');
  } else if (currentStep.value === 'task-qualification') {
    // 从定性返回任务选择时，清空选择
    selectedQualifications.value = [];
    currentStep.value = 'task-selection';
  }
};

// 选择一个任务并进入下一步
const selectTaskAndProceed = (task) => {
  selectedTask.value = task;
  currentStep.value = 'task-qualification';
};

// 切换定性方式的选中状态
const toggleQualification = (typeId) => {
  const index = selectedQualifications.value.indexOf(typeId);
  if (index === -1) {
    // 如果不存在，则添加
    selectedQualifications.value.push(typeId);
  } else {
    // 如果已存在，则移除
    selectedQualifications.value.splice(index, 1);
  }
};

// 最终确认选择
const confirmSelection = () => {
  if (selectedQualifications.value.length === 0) {
    alert("请至少选择一个审查方式");
    return;
  }
  console.log("任务已确认:", selectedTask.value.name);
  console.log("定性方式:", selectedQualifications.value.join(', '));
  // 可以在这里执行后续逻辑，例如跳转到核查页面
  alert(`已选定任务 "${selectedTask.value.name}"\n审查方式: ${selectedQualifications.value.join(', ')}`);
  navigateTo('/checking');
};

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-page text-white">
    <q-header class="bg-dark-page q-pa-sm">
      <q-toolbar>
        <q-btn unelevated color="primary" :label="backButtonLabel" @click="goBack" icon="arrow_back" />
        <q-space />
        <q-toolbar-title class="text-center text-h5 text-weight-bold">
          启动核查
        </q-toolbar-title>
        <q-space />
        <!-- 动态头部按钮：仅在任务定性步骤且已选择方式时显示 -->
        <q-btn
          v-if="currentStep === 'task-qualification'"
          color="primary"
          unelevated
          label="确定"
          :disable="selectedQualifications.length === 0"
          @click="confirmSelection"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 步骤条 -->
        <div class="stepper-container row q-col-gutter-none">
          <div class="col text-center stepper-item" :class="{active: currentStep === 'task-selection', done: currentStep === 'task-qualification'}">任务选择</div>
          <div class="col text-center stepper-item" :class="{active: currentStep === 'task-qualification'}">任务定性</div>
        </div>

        <!-- 步骤面板 -->
        <div class="q-mt-xl">
          <!-- 步骤1: 任务选择 -->
          <div v-if="currentStep === 'task-selection'">
            <div class="row items-center q-mb-md">
              <p class="col text-grey-4">请选择需要执行的核查任务</p>
              <q-btn color="primary" unelevated label="新增任务" @click="navigateTo('/taskcheck')" />
            </div>

            <!-- 列表为空时的状态 -->
            <div v-if="tasks.length === 0" class="empty-state text-center q-pa-xl bg-dark-content rounded-borders">
              <q-icon name="inbox" size="5em" color="grey-7" />
              <div class="text-h6 text-grey-6 q-mt-md">列表为空！</div>
              <div class="text-grey-5 q-mt-sm">当前没有可执行的任务，请先创建。</div>
              <q-btn
                class="q-mt-lg"
                color="primary"
                unelevated
                label="创建任务"
                @click="navigateTo('/task-create')"
              />
            </div>

            <!-- 任务列表 -->
            <q-list v-else dark separator class="bg-dark-content rounded-borders">
              <q-item
                v-for="task in tasks"
                :key="task.id"
                clickable
                v-ripple
                class="q-py-md list-item-hover"
                @click="selectTaskAndProceed(task)"
              >
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ task.name }}</q-item-label>
                  <q-item-label caption class="text-grey-5">关联策略: {{ task.policy }} | 最后更新: {{ task.lastUpdate }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" color="grey-6" />
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- 步骤2: 任务定性 -->
          <div v-if="currentStep === 'task-qualification' && selectedTask">
            <p class="text-grey-4 q-mb-lg">
              已选择任务: <span class="text-weight-bold text-white">{{ selectedTask.name }}</span>。请选定审查方式（可多选）。
            </p>
            <div class="row q-col-gutter-xl justify-center">
              <div
                class="col-12 col-sm-6 col-md-4"
                v-for="q_type in qualificationTypes"
                :key="q_type.id"
              >
                <q-card
                  class="qualification-card text-center cursor-pointer"
                  :class="{ 'selected': selectedQualifications.includes(q_type.id) }"
                  flat
                  @click="toggleQualification(q_type.id)"
                >
                  <q-card-section class="q-py-lg">
                    <q-icon :name="q_type.icon" size="4.5em" />
                    <div class="text-h6 q-mt-md">{{ q_type.name }}</div>
                  </q-card-section>
                  <q-chip
                    v-if="selectedQualifications.includes(q_type.id)"
                    icon="check"
                    color="positive"
                    text-color="white"
                    label="已选定"
                    class="absolute-top-right q-ma-sm"
                  />
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.bg-dark-page {
  background-color: #292a2d;
}
.bg-dark-content {
  background-color: #3a3c52; /* 列表和卡片的背景色 */
}
.rounded-borders {
  border-radius: 8px;
}
.q-list--dark.q-list--separator > .q-item-type + .q-item-type {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
.list-item-hover:hover {
  background-color: rgba(76, 106, 252, 0.2) !important;
}

/* 步骤条样式 */
.stepper-container {
  background-color: #3a3c52;
  border-radius: 8px;
  color: #ccc;
  padding: 0;
  overflow: hidden;
  border: 1px solid #5f6368;
}
.stepper-item {
  padding: 12px;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
}
.stepper-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 25px solid transparent;
  border-bottom: 25px solid transparent;
  border-left: 20px solid #3a3c52;
  z-index: 1;
  transition: border-color 0.3s ease;
}
.stepper-item.active {
  background-color: #4c6afc;
  color: white;
}
.stepper-item.active::after {
  border-left-color: #4c6afc;
}

.stepper-item.done {
  background-color: #5f6368;
  color: #e0e0e0;
}
.stepper-item.done::after {
  border-left-color: #5f6368;
}

/* 任务定性卡片样式 */
.qualification-card {
  background-color: #3a3c52;
  border: 2px solid #5f6368;
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

/* 列表为空状态样式 */
.empty-state {
  border: 2px dashed #5f6368;
}
</style>
