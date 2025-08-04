<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter();

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}
// --- 响应式数据 ---

// 当前步骤
const currentStep = ref('qualitative'); // 'qualitative', 'site', 'task'

// 模拟数据
const sites = reactive([
  { name: "站点1", province: "江苏省", city: "南京市", company: "国网江苏省电力有限公司", contact: "张三" },
  { name: "站点2", province: "浙江省", city: "杭州市", company: "国网浙江省电力有限公司", contact: "李四" },
]);
const tasks = reactive([
  { name: "任务A", start: "2025-06-20", end: "2025-06-21", status: "未开始" },
  { name: "250620_250621_1533", start: "2025-06-20", end: "2025-06-21", status: "执行中" },
]);

// 选中的站点和任务
const selectedSite = ref(sites[0]);
const selectedTask = ref(null);
const selectedConnection = ref(null);

// 弹窗控制
const addTaskDialog = ref(false);
const connectionDialog = ref(false);

// --- 计算属性 ---
// 根据当前步骤动态计算“上一步/返回”按钮的文本
const backButtonLabel = computed(() => {
  return currentStep.value === 'qualitative' ? '返回' : '上一步';
});

// --- 方法 ---

// 导航到下一步
const nextStep = (stepName) => {
  currentStep.value = stepName;
};

// 处理返回/上一步的逻辑
const goBack = () => {
  if (currentStep.value === 'qualitative') {
    navigateTo('/mainview')
  } else if (currentStep.value === 'site') {
    currentStep.value = 'qualitative';
  } else if (currentStep.value === 'task') {
    currentStep.value = 'site';
  }
};


// 当在站点列表中选择一个站点时
const selectSite = (site) => {
  selectedSite.value = site;
};

// 当在任务列表中选择一个任务时
const selectTask = (task) => {
  selectedTask.value = task;
  // 打开连接方式选择弹窗
  connectionDialog.value = true;
};

// 确认连接方式并跳转
const confirmConnection = () => {
  if (selectedConnection.value) {
    connectionDialog.value = false;
    // 导航到“正在核查”页面
    navigateTo("/checking");
  }
};

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-page text-white">
    <q-header class="bg-dark-page q-pa-sm">
      <q-toolbar>
        <q-btn unelevated color="primary" :label="backButtonLabel" @click="goBack" />
        <q-space />
        <q-toolbar-title class="text-center text-h5 text-weight-bold">
          启动核查
        </q-toolbar-title>
        <q-space />
        <!-- 动态头部按钮 -->
        <q-btn v-if="currentStep === 'site'" color="primary" unelevated label="选定站点" @click="nextStep('task')" />
        <q-btn v-if="currentStep === 'task' && selectedTask" color="primary" unelevated label="选定任务" @click="connectionDialog = true" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 步骤条 -->
        <div class="stepper-container row q-col-gutter-none">
          <div class="col text-center stepper-item" :class="{active: currentStep === 'qualitative', done: currentStep !== 'qualitative'}">选择任务</div>
          <div class="col text-center stepper-item" :class="{active: currentStep === 'site', done: currentStep === 'task'}">站点确认</div>
          <div class="col text-center stepp er-item" :class="{active: currentStep === 'task'}">任务定性</div>
        </div>

        <!-- 步骤面板 -->
        <div class="q-mt-md">
          <!-- 步骤1: 任务定性 -->
          <div v-if="currentStep === 'qualitative'" class="text-center flex flex-center">
            <div class="q-pa-md" style="width: 100%; max-width: 600px;">
              <q-list separator>
                <q-item clickable v-ripple class="q-py-lg" @click='navigateTo("/stationview")'>
                  <q-item-section avatar>
                    <q-icon color="primary" name="desktop_windows" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-h6">站点管理</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>

                <q-item v-ripple clickable class="q-py-lg" @click='navigateTo("/taskcheck")'>
                  <q-item-section avatar>
                    <q-icon color="primary" name="folder_open" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-h6">任务管理</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple class="q-py-lg" @click="nextStep('site')">
                  <q-item-section avatar>
                    <q-icon color="primary" name="assignment" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-h6">开始核查</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="chevron_right" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

          </div>

          <!-- 步骤2: 站点确认 -->
          <q-card v-if="currentStep === 'site'" flat class="bg-white text-black" style="height: 65vh;">
            <q-card-section class="q-pa-none fit">
              <div class="row fit">
                <div class="col-4 q-pa-sm">
                  <q-list bordered separator>
                    <q-item-label header class="bg-grey-2">站点列表</q-item-label>
                    <q-item v-for="site in sites" :key="site.name" clickable v-ripple :active="selectedSite && selectedSite.name === site.name" @click="selectSite(site)" active-class="bg-primary text-white">
                      <q-item-section>{{ site.name }}</q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div class="col-8 q-pa-md">
                  <div v-if="selectedSite">
                    <div class="text-h6 q-mb-md">站点详情</div>
                    <q-list dense>
                      <q-item><q-item-section><q-item-label caption>站点名称</q-item-label><q-item-label>{{ selectedSite.name }}</q-item-label></q-item-section></q-item>
                      <q-item><q-item-section><q-item-label caption>省份</q-item-label><q-item-label>{{ selectedSite.province }}</q-item-label></q-item-section></q-item>
                      <q-item><q-item-section><q-item-label caption>地市</q-item-label><q-item-label>{{ selectedSite.city }}</q-item-label></q-item-section></q-item>
                      <q-item><q-item-section><q-item-label caption>所属公司</q-item-label><q-item-label>{{ selectedSite.company }}</q-item-label></q-item-section></q-item>
                      <q-item><q-item-section><q-item-label caption>负责人</q-item-label><q-item-label>{{ selectedSite.contact }}</q-item-label></q-item-section></q-item>
                    </q-list>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- 步骤3: 任务确认 -->
          <q-card v-if="currentStep === 'task'" flat class="bg-transparent text-white">
            <q-card-section>
              <div class="row items-center">
                <p class="col text-grey-4">已确认站点为: <span class="text-weight-bold text-white">{{ selectedSite.name }}</span>, 请先确认本次核查对应任务</p>
                <q-btn color="primary" label="新增任务" @click="addTaskDialog = true" />
              </div>
              <q-table
                :rows="tasks"
                row-key="name"
                dark
                flat
                dense
                hide-bottom
                class="q-mt-md bg-dark-content"
                @row-click="(evt, row) => selectTask(row)"
              >
                <template v-slot:body-cell="props">
                  <q-td :props="props" :class="{'bg-primary': selectedTask && selectedTask.name === props.row.name}">
                    {{ props.value }}
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <!-- 新增任务弹窗 -->
    <q-dialog v-model="addTaskDialog">
      <q-card style="width: 500px;">
        <q-card-section><div class="text-h6">创建核查任务</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input outlined label="任务名称" />
          <q-select outlined label="核查范围" :options="['全部资产', '部分资产']" />
          <q-input outlined type="date" stack-label label="计划开始时间" />
          <q-input outlined type="date" stack-label label="计划结束时间" />
          <q-input outlined label="任务责任单位" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn label="确定" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 连接方式弹窗 -->
    <q-dialog v-model="connectionDialog">
      <q-card style="width: 500px;">
        <q-card-section><div class="text-h6">选定连接方式</div></q-card-section>
        <q-card-section class="q-pt-none text-grey-7">请检查当前便携式核查工具是否已连接待核查设备或接入待核查设备所在网络，并选定当前连接方式。</q-card-section>
        <q-card-section class="row q-col-gutter-md">
          <div class="col-4" v-for="conn in ['网络连接', 'USB连接', '串口连接']" :key="conn">
            <q-btn
              outline
              class="fit"
              :color="selectedConnection === conn ? 'primary' : 'grey-7'"
              @click="selectedConnection = conn"
            >
              <div class="column items-center q-pa-sm">
                <q-icon name="router" size="lg" />
                <div>{{ conn }}</div>
              </div>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn label="确认" color="primary" :disable="!selectedConnection" @click="confirmConnection" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
.bg-dark-page {
  background-color: #292a2d;
}
.bg-dark-header {
  background-color: #2e3c41;
}
.bg-dark-content {
  background-color: #3a3c52;
}
.q-item {
  background-color: #ffffff;
  color: #000000;
  border-radius: 8px;
  margin-bottom: 26px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.q-list--separator > .q-item:not(:first-child) {
  border-top: none;
}
.stepper-container {
  background-color: #fff;
  border-radius: 8px;
  color: #333;
  padding: 0;
}
.stepper-item {
  padding: 12px;
  font-weight: 600;
  color: #888;
}
.stepper-item.active {
  background-color: #4c6afc; /* teal-6 */
  color: white;
}
.stepper-item:first-child.active {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
.stepper-item:last-child.active {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>
