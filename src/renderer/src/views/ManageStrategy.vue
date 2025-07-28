<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router'

// 定义组件可以触发的事件
const router = useRouter()

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

// --- 响应式数据 ---
const policies = reactive([
  { name: '网络设备', updated: '2025-04-18', items: 29, object: '网络设备' },
  { name: '网络设备-交换机', updated: '2025-04-18', items: 18, object: '网络设备-交换机' },
  { name: '网络设备-路由器', updated: '2025-04-18', items: 17, object: '网络设备-路由器' },
  { name: '主机设备-Windows', updated: '2025-04-18', items: 21, object: '主机设备-Windows' },
  {
    name: '必选项核查',
    updated: '2025-04-18',
    items: 8,
    object: '全部设备',
    link: 'RequiredCheck'
  },
  { name: '弱密码核查', updated: '2025-04-18', items: 2, object: '主机设备-Linux' },
  { name: '主机设备-Linux', updated: '2025-04-18', items: 23, object: '主机设备-Linux' }
]);

// 控制抽屉和对话框的显示状态
const isFilterDrawerVisible = ref(false);
const isAddDialogVisible = ref(false);
const isAlertDialogVisible = ref(false);
const alertMessage = ref('');

// 新增策略表单的数据模型
const newPolicy = reactive({
  name: '',
  object: '',
  items: null
});

// --- 方法 ---
const handleCardClick = () => {
  alertMessage.value = '需要新增策略请联系厂家'
  isAlertDialogVisible.value = true;
};

const handleAddNewPolicy = () => {
  // 简单的表单验证
  if (!newPolicy.name || !newPolicy.object || !newPolicy.items) {
    alertMessage.value = '请填写所有字段！';
    isAlertDialogVisible.value = true;
    return;
  }
  // 在这里添加新增策略的逻辑
  policies.push({ ...newPolicy, updated: new Date().toISOString().split('T')[0] });
  // 重置表单并关闭对话框
  newPolicy.name = '';
  newPolicy.object = '';
  newPolicy.items = null;
  isAddDialogVisible.value = false;
};
</script>

<template>
  <!-- 使用 QLayout 作为页面根布局，并应用深青色背景 -->
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-teal-9 text-white">
      <q-toolbar>
        <q-btn label="返回" color="primary" @click="navigateTo('/mainview')" />
        <q-toolbar-title>
          策略管理
        </q-toolbar-title>
        <q-space />
        <q-btn flat dense label="导入" icon="file_upload" class="q-mr-sm" />
        <q-btn flat dense label="导出" icon="file_download" class="q-mr-sm" />
        <q-btn flat dense label="筛选" icon="filter_alt" @click="isFilterDrawerVisible = true" />
        <q-btn color="light-blue-6" label="新增" icon="add" @click="handleCardClick()" class="q-ml-md" />
      </q-toolbar>
    </q-header>

    <!-- 右侧筛选抽屉 -->
    <q-drawer v-model="isFilterDrawerVisible" side="right" overlay behavior="mobile" bordered :width="300" class="bg-teal-9 text-white">
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <h5 class="q-mt-none q-mb-md">筛选</h5>
          <!-- 筛选表单内容可以放在这里 -->
          <q-btn color="light-blue-6" label="应用筛选" class="full-width q-mt-md" @click="isFilterDrawerVisible = false" />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 策略卡片网格 -->
        <div class="row q-col-gutter-md">
          <div v-for="policy in policies" :key="policy.name" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card class="cursor-pointer full-height bg-white text-black" flat bordered v-ripple>
              <q-card-section>
                <div class="text-h6 text-teal-9">{{ policy.name }}</div>
                <div class="text-subtitle2 text-grey-7">更新时间: {{ policy.updated }}</div>
              </q-card-section>
              <q-card-section class="q-pt-none text-grey-8">
                <div>检查项数: {{ policy.items }}</div>
                <div>使用对象: {{ policy.object }}</div>
              </q-card-section>
              <q-separator />
              <q-card-actions align="right">
                <q-btn flat color="blue-6" label="查看"
                       @click="navigateTo('/mustcheck')"></q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 新增策略对话框 -->
    <q-dialog v-model="isAddDialogVisible">
      <q-card class="bg-white text-black" style="width: 500px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">新增策略</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="handleAddNewPolicy" class="q-gutter-md">
            <q-input outlined v-model="newPolicy.name" label="策略名称" />
            <q-input outlined v-model="newPolicy.object" label="适用对象" />
            <q-input outlined v-model.number="newPolicy.items" type="number" label="检查项数" />

            <div class="row justify-end q-mt-lg">
              <q-btn label="取消" type="reset" color="grey-6" flat class="q-mr-sm" v-close-popup />
              <q-btn label="确认新增" type="submit" color="teal-6"/>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 提示信息对话框 -->
    <q-dialog v-model="isAlertDialogVisible">
      <q-card class="bg-white text-grey-9">
        <q-card-section>
          <div class="text-h6">提示</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ alertMessage }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
.full-height {
  height: 100%;
}
/* 使用 Quasar 的颜色变量来覆盖默认样式 */
.bg-teal-10 {
  background-color: #2d3a3a; /* 一个自定义的深青色 */
}
.bg-teal-9 {
  background-color: #1d2b2b; /* 一个更深的青色 */
}
</style>
