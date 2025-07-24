<script setup>
import { ref, reactive, onUnmounted } from 'vue';
import router from '../router'

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

// --- 响应式数据 ---

// 当前步骤: 1=识别结果, 2=策略匹配, 3=策略预览, 4=核查进度
const currentStep = ref(1);

// 进度条的值 (0 to 1)
const progressBarValue = ref(0.25);
const progressLabels = reactive([
  { name: '登录成功', active: true },
  { name: '策略匹配', active: false },
  { name: '核查完成', active: false },
]);

// 核查进度模拟
const checkProgress = ref(0.1);
const checkStatus = ref('进行中');
const checkInterval = ref(null);

// --- 方法 ---

const goToStep = (step) => {
  currentStep.value = step;
  // 更新进度条
  if (step === 1) {
    progressBarValue.value = 0.25;
    progressLabels[1].active = false;
    progressLabels[2].active = false;
  } else if (step === 2) {
    progressBarValue.value = 0.60;
    progressLabels[1].active = true;
    progressLabels[2].active = false;
  }
};

const startCheck = () => {
  goToStep(4); // 切换到核查进度视图
  progressBarValue.value = 0.85; // 更新主进度条
  checkProgress.value = 0.1;
  checkStatus.value = '进行中';

  // 模拟核查进度条的增长
  checkInterval.value = setInterval(() => {
    checkProgress.value += 0.15;
    if (checkProgress.value >= 1) {
      clearInterval(checkInterval.value);
      checkProgress.value = 1;
      checkStatus.value = '已完成';
      progressBarValue.value = 1; // 主进度条满
      progressLabels[2].active = true; // 点亮最后一步
    }
  }, 500);
};

// 在组件卸载时清除定时器，防止内存泄漏
onUnmounted(() => {
  if (checkInterval.value) {
    clearInterval(checkInterval.value);
  }
});

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-page text-white">
    <q-header class="bg-dark-page q-pa-sm">
      <q-toolbar>
        <q-btn unelevated color="teal-6" label="返回" @click="router.go(-1);" />
        <q-chip square color="grey-8" text-color="white" class="q-ml-md">
          10.105.71.97
        </q-chip>
        <q-space />
        <q-toolbar-title class="text-center text-h5 text-weight-bold">
          正在登录核查
        </q-toolbar-title>
        <q-space />
        <div class="text-caption text-grey-5">
          当前电量: 22% <q-icon name="battery_full" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 进度条 -->
        <div class="q-mb-lg">
          <q-linear-progress :value="progressBarValue" color="light-blue-6" track-color="grey-7" style="height: 8px" rounded />
          <div class="row text-caption text-grey-5 q-mt-xs">
            <div class="col text-left" :class="{'text-white text-weight-bold': progressLabels[0].active}">{{ progressLabels[0].name }}</div>
            <div class="col text-center" :class="{'text-white text-weight-bold': progressLabels[1].active}">{{ progressLabels[1].name }}</div>
            <div class="col text-right" :class="{'text-white text-weight-bold': progressLabels[2].active}">{{ progressLabels[2].name }}</div>
          </div>
        </div>

        <!-- 步骤面板 -->
        <q-card flat class="bg-white text-black">
          <!-- 步骤1: 主机识别结果 -->
          <q-card-section v-if="currentStep === 1">
            <div class="text-h6 text-center text-grey-8 q-mb-md">主机识别结果</div>
            <q-markup-table flat separator="cell">
              <thead><tr><th>设备名称</th><th>设备类型</th><th>设备厂商</th><th>系统版本</th><th>IP</th><th>MAC地址</th></tr></thead>
              <tbody><tr><td>sf-server...</td><td>主机设备</td><td>unknown</td><td>LinuxOS</td><td>10.51.18.79</td><td>...</td></tr></tbody>
            </q-markup-table>
            <div class="text-center q-mt-lg">
              <q-btn color="light-blue-6" label="下一步" @click="goToStep(2)" />
            </div>
          </q-card-section>

          <!-- 步骤2: 策略匹配 -->
          <q-card-section v-if="currentStep === 2">
            <div class="text-h6 text-center text-grey-8 q-mb-md">检查项策略匹配</div>
            <q-markup-table flat separator="cell">
              <thead><tr><th>资产IP</th><th>设备名称</th><th>设备类型</th><th>厂商信息</th><th>操作系统</th><th>核查策略</th></tr></thead>
              <tbody><tr><td>10.105.71.97</td><td>sf-server-01</td><td>主机设备</td><td>unknown</td><td>Linux 3.12</td><td><q-btn flat dense color="primary" label="预览" @click="goToStep(3)" /></td></tr></tbody>
            </q-markup-table>
            <div class="text-center q-mt-lg q-gutter-md">
              <q-btn color="teal-6" label="选择设备" />
              <q-btn color="light-blue-6" label="策略确认" @click="startCheck" />
            </div>
          </q-card-section>

          <!-- 步骤3: 策略预览 -->
          <q-card-section v-if="currentStep === 3">
            <div class="text-h6 text-center text-grey-8 q-mb-sm">主机设备-Linux</div>
            <div class="text-caption text-grey-6 text-center q-mb-md">更新时间: 2025-04-18 19:34:25 核查项总数: 17</div>
            <div class="row" style="height: 50vh;">
              <div class="col-4"><q-list bordered separator><q-item clickable class="bg-grey-2">核查项</q-item></q-list></div>
              <div class="col-8 q-pl-md"><p><b>核查要求:</b> 系统应采用授权机制...</p></div>
            </div>
            <div class="text-center q-mt-md">
              <q-btn color="grey-6" label="返回" @click="goToStep(2)" />
            </div>
          </q-card-section>

          <!-- 步骤4: 核查进度 -->
          <q-card-section v-if="currentStep === 4">
            <div class="text-h6 text-center text-grey-8 q-mb-md">核查进度</div>
            <q-markup-table flat separator="none">
              <thead><tr><th>设备名称</th><th>IP地址</th><th style="width: 40%">核查进度</th><th>通过率</th></tr></thead>
              <tbody>
              <tr>
                <td>sf-server-01</td>
                <td>10.105.71.97</td>
                <td><q-linear-progress rounded size="20px" :value="checkProgress" color="light-blue-6" /></td>
                <td :class="checkStatus === '已完成' ? 'text-green' : 'text-orange'">{{ checkStatus === '已完成' ? '0/3' : '进行中' }}</td>
              </tr>
              </tbody>
            </q-markup-table>
            <div class="text-center q-mt-lg q-gutter-md">
              <q-btn v-if="checkStatus !== '已完成'" color="red" label="终止" />
              <q-btn v-if="checkStatus === '已完成'" color="grey-6" label="关闭" />
              <q-btn
                v-if="checkStatus === '已完成'"
                color="primary"
                label="下一步"
                @click="navigateTo('/checkresult')"
              />
            </div>
          </q-card-section>

        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.bg-dark-page {
  background-color: #2e3c41;
}
</style>
