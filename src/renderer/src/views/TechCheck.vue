<script setup>
import { ref, reactive } from 'vue';
import router from '../router'
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

// --- 响应式数据 ---

// 当前步骤
const currentStep = ref('site'); // 'site', 'task'

// 模拟数据
const sites = reactive([
  { name: "站点1", details: "站点详情..." },
  { name: "站点2", details: "站点详情..." },
]);
const tasks = reactive([
  { name: "250620_250621_1533", start: "2025-06-21", end: "2025-06-21", status: "执行中" },
]);

// 选中的站点和任务
const selectedSite = ref(sites[0]);
const selectedTask = ref(null);
const selectedConnection = ref(null);
selectedConnection.value = false

// 弹窗控制
const connectionDialog = ref(false);

// --- 方法 ---

// 导航到下一步
const nextStep = (stepName) => {
  currentStep.value = stepName;
};

const goBack = () => {
  if (currentStep.value === 'site') {
    navigateTo('/executeCheck')
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
  connectionDialog.value = true; // 打开连接方式选择弹窗
};

// 确认连接方式并跳转
const confirmConnection = () => {
  if (selectedConnection.value) {
    // 导航到下一个相关页面，例如 InProgressCheck
    navigateTo('/techcheckinprogress');
    connectionDialog.value = false;
  }
};

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-page text-white">
    <q-header class="bg-dark-page q-pa-sm">
      <q-toolbar>
        <q-btn unelevated color="teal-6" label="上一步" @click="goBack" />
        <q-space />
        <q-toolbar-title class="text-center text-h5 text-weight-bold">
          启动核查
        </q-toolbar-title>
        <q-space />
        <q-btn flat dense icon="swap_horiz" label="切换" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 步骤条 -->
        <div class="stepper-container row q-col-gutter-none">
          <div class="col text-center stepper-item" :class="{active: currentStep === 'qualitative', done: true, 'text-red-5': true}">任务定性</div>
          <div class="col text-center stepper-item" :class="{active: currentStep === 'site', done: currentStep === 'task'}">站点确认</div>
          <div class="col text-center stepper-item" :class="{active: currentStep === 'task'}">任务确认</div>
        </div>

        <!-- 步骤面板 -->
        <div class="q-mt-md">
          <!-- 步骤2: 站点确认 -->
          <q-card v-if="currentStep === 'site'" flat class="bg-white text-black" style="height: 65vh;">
            <q-card-section class="q-pa-none fit">
              <div class="row items-center q-pa-md">
                <p class="col text-red-5">已选定技术监督检查，请确认本次核查在哪个站点开展</p>
                <q-btn color="green-6" unelevated label="选定站点" @click="nextStep('task')" />
              </div>
              <div class="row fit" style="height: calc(100% - 70px);">
                <div class="col-4 q-pa-sm">
                  <q-list bordered separator>
                    <q-item-label header class="bg-grey-2">站点列表</q-item-label>
                    <q-item v-for="site in sites" :key="site.name" clickable v-ripple :active="selectedSite && selectedSite.name === site.name" @click="selectSite(site)" active-class="bg-teal-5 text-white">
                      <q-item-section>{{ site.name }}</q-item-section>
                    </q-item>
                  </q-list>
                </div>
                <div class="col-8 q-pa-md">
                  <div v-if="selectedSite">
                    <div class="text-h6 q-mb-md">站点详情</div>
                    <!-- 站点详情内容 -->
                    <p>{{ selectedSite.details }}</p>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- 步骤3: 任务确认 -->
          <q-card v-if="currentStep === 'task'" flat class="bg-transparent text-white">
            <q-card-section>
              <div class="row items-center">
                <p class="col text-red-5">已确认站点为: <span class="text-weight-bold text-white">{{ selectedSite.name }}</span>, 请先确认本次核查对应任务</p>
                <q-btn
                  color="green-6"
                  unelevated
                  label="选定任务"
                  :disable="!selectedTask"
                  @click="connectionDialog = true"
                />
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
                  <q-td :props="props" :class="{'bg-teal-7': selectedTask && selectedTask.name === props.row.name}">
                    {{ props.value }}
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>

    <!-- 连接方式弹窗 -->
    <q-dialog v-model="connectionDialog">
      <q-card style="width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">选定连接方式</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none text-grey-7">请检查当前便携式核查工具是否已连接待核查设备或接入待核查设备所在网络，并选定当前连接方式。</q-card-section>
        <q-card-section class="row q-col-gutter-md">
          <div v-for="conn in ['网络连接', 'USB连接', '串口连接']" :key="conn" class="col-4">
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
          <q-btn flat v-close-popup label="取消" />
          <q-btn
            label="确认"
            color="primary"
            :disable="!selectedConnection"
            @click="confirmConnection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
.bg-dark-page {
  background-color: #2e3c41;
}
.bg-dark-content {
  background-color: #3a4c52;
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
  border: 1px solid #ccc;
}
.stepper-item.active {
  background-color: #009688; /* teal-6 */
  color: white;
  border-color: #009688;
}
.stepper-item.done {
  border-color: #ccc;
}
</style>
