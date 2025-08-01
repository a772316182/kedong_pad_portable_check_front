<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar();

// 策略数据模型
const policy = ref({
  name: '',
  target: '',
  basis: '',
});

// 点击“适用对象”的事件处理
const selectObject = () => {
  // 在这里可以实现一个对话框或者下拉菜单来选择对象
  $q.notify('触发“选择适用对象”操作');
  // 模拟选择
  policy.value.target = '所有主机';
};

// 点击“确定”按钮的事件处理
const submitForm = () => {
  // 表单验证
  if (!policy.value.name || !policy.value.target) {
    $q.notify({
      color: 'negative',
      message: '策略名称和适用对象为必填项',
      icon: 'warning',
    });
    return;
  }

  // 在此实现提交表单的逻辑
  console.log('提交的策略:', policy.value);

  $q.notify({
    color: 'positive',
    message: '策略新增成功',
    icon: 'check_circle',
  });
};

// 定义组件可以触发的事件
const router = useRouter()

// --- MODIFICATION START ---
// 修改 navigateTo 函数以接受一个可选的 'mode' 参数
const navigateTo = (path, mode) => {
  let finalPath = path;
  // 如果 mode 是 'edit'，则在路径后附加查询参数
  if (mode === 'edit') {
    finalPath += '?mode=edit';
  }
  console.log(`正在跳转到: ${finalPath}`);
  // 使用 router.push 进行页面跳转
  router.push(finalPath);
}
// --- MODIFICATION END ---


// --- 响应式数据 --- --暂无后端都是模拟数据
const policies = reactive([
  {
    name: '主机设备-Linux',
    updated: '2025-07-03',
    items: 8,
    object: '主机设备-Linux',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '主机设备-Windows',
    updated: '2025-07-03',
    items: 8,
    object: '主机设备-Windows',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '网络设备',
    updated: '2025-07-03',
    items: 16,
    object: '网络设备',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '网络安全',
    updated: '2025-07-03',
    items: 15,
    object: '网络安全',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '网络安全告警检查',
    updated: '2025-07-03',
    items: 8,
    object: '网络安全告警点对点检查',
    preset_strategy: true,
    owned: false,
    enabled: true
  },
  {
    name: '弱密码核查',
    updated: '2025-04-18',
    items: 2,
    object: '主机设备-Linux',
    preset_strategy: false,
    owned: true,
    enabled: true
  },
  {
    name: '主机设备-Linux',
    updated: '2025-04-18',
    items: 23,
    object: '主机设备-Linux',
    preset_strategy: false,
    owned: true,
    enabled: true
  }
])

// 控制抽屉和对话框的显示状态
const isFilterDrawerVisible = ref(false)
const isAddDialogVisible = ref(false)
const isAlertDialogVisible = ref(false)
const alertMessage = ref('')

// 新增策略表单的数据模型
const newPolicy = reactive({
  name: '',
  object: '',
  items: null
})

const customStrategy = ref({ enabled: false})

// --- 方法 ---
const handleCardClick = () => {
  alertMessage.value = '需要新增策略请联系厂家'
  isAlertDialogVisible.value = true
}

const handleAddNewPolicy = () => {
  // 简单的表单验证
  if (!newPolicy.name || !newPolicy.object || !newPolicy.items) {
    alertMessage.value = '请填写所有字段！'
    isAlertDialogVisible.value = true
    return
  }
  // 在这里添加新增策略的逻辑
  policies.push({ ...newPolicy, updated: new Date().toISOString().split('T')[0] })
  // 重置表单并关闭对话框
  newPolicy.name = ''
  newPolicy.object = ''
  newPolicy.items = null
  isAddDialogVisible.value = false
}
</script>

<template>
  <!-- 使用 QLayout 作为页面根布局，并应用深青色背景 -->
  <q-layout view="lHh Lpr lFf" class="bg-secondary">
    <q-header elevated class="bg-secondary text-white">
      <q-toolbar>
        <q-btn label="返回" color="primary" @click="navigateTo('/mainview')" />
        <q-toolbar-title> 策略管理 </q-toolbar-title>
        <q-space />
        <q-btn flat dense label="导入" icon="file_upload" class="q-mr-sm" />
        <q-btn flat dense label="导出" icon="file_download" class="q-mr-sm" />
        <q-btn
          color="light-blue-6"
          label="新增"
          icon="add"
          class="q-ml-md"
          @click="handleCardClick()"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <!-- 策略卡片网格 -->
        <div class="row q-col-gutter-md">
          <div
            v-for="policy in policies"
            :key="policy.name"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <q-card v-ripple class="cursor-pointer full-height bg-white text-black" flat bordered>
              <q-card-section>
                <q-card-section v-if="policy.preset_strategy" class="float-right">
                  <q-chip class="bg-red-6 text-white">预制核查策略</q-chip>
                </q-card-section
                >
                <q-card-section v-if="!policy.preset_strategy" class="float-right">
                  <q-toggle v-model="customStrategy.enabled" color="blue-7" />
                </q-card-section>
                <div class="text-h6 text-primary">{{ policy.name }}</div>
                <div class="text-subtitle2 text-grey-7">最后更新时间: {{ policy.updated }}</div>
              </q-card-section>
              <q-card-section class="q-pt-none text-grey-8">
                <div>检查项数: {{ policy.items }}</div>
                <div>使用对象: {{ policy.object }}</div>
              </q-card-section>
              <q-separator />
              <q-card-actions v-if="policy.preset_strategy || !policy.owned" align="center">
                <q-btn
                  flat
                  color="blue-6"
                  label="查看"
                  style="width: 100%;"
                  @click="navigateTo('/mustcheck')"
                ></q-btn>
              </q-card-actions>
              <q-card-actions v-if="!policy.preset_strategy && policy.owned">
                <q-btn
                  flat
                  color="blue-6"
                  label="查看"
                  style="width: 31%"
                  @click="navigateTo('/mustcheck')"
                ></q-btn>
                <!-- --- MODIFICATION START --- -->
                <!-- 点击编辑按钮时，调用 navigateTo 并传入 'edit' 模式 -->
                <q-btn
                  flat
                  color="positive"
                  label="编辑"
                  style="width: 31%"
                  @click="navigateTo('/mustcheck', 'edit')"
                ></q-btn>
                <!-- --- MODIFICATION END --- -->
                <q-btn
                  flat
                  color="negative"
                  label="删除"
                  style="width: 31%"
                ></q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 新增策略对话框 -->
    <q-dialog v-model="isAddDialogVisible">
      <q-card class="bg-white text-black" style="width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">新增策略</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>

        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="handleAddNewPolicy">
            <q-input v-model="newPolicy.name" outlined label="策略名称" />
            <q-input v-model="newPolicy.object" outlined label="适用对象" />
            <q-input v-model.number="newPolicy.items" outlined type="number" label="检查项数" />

            <div class="row justify-end q-mt-lg">
              <q-btn v-close-popup label="取消" type="reset" color="grey-6" flat class="q-mr-sm" />
              <q-btn label="确认新增" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isAlertDialogVisible">
      <q-card class="column full-height" flat>
        <!-- 标题 -->
        <q-card-section class="q-py-md">
          <div class="text-h6">新增策略</div>
        </q-card-section>

        <!-- 表单区域 -->
        <q-card-section class="q-pt-none col">
          <q-list bordered separator>
            <q-item>
              <q-item-section>
                <q-item-label>
                  策略名称 <span class="text-red">*</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-input
                  v-model="policy.name"
                  placeholder="请输入"
                  borderless
                  dense
                  input-style="text-align: right;"
                />
              </q-item-section>
            </q-item>



            <q-item clickable v-ripple @click="selectObject">
              <q-item-section>
                <q-item-label>
                  策略引用 <span class="text-red">*</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center text-grey">
                  <span>{{ policy.target || '请选择' }}</span>
                  <q-icon name="chevron_right" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-space />

        <!-- 底部操作 -->
        <q-card-section class="q-pa-md">
          <q-btn
            v-close-popup
            color="teal-6"
            label="确定"
            unelevated
            class="full-width"
            size="lg"
            @click="submitForm"
          >
          </q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- 提示信息对话框 -->
  </q-layout>
</template>

<style lang="sass" scoped>
.q-item__section--side
  padding-left: 8px

.q-item__label
  font-size: 16px

.q-btn .q-icon
  color: white !important
</style>


<style scoped>
.full-height {
  height: 100%;
}
</style>
