<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 控制站点信息卡的显示/隐藏
const isSiteCardVisible = ref(true);

// 站点卡片的数据模型
const siteData = ref({
  id: 1,
  name: '省调1',
  company: '所属公司A',
  lastCheck: '2025-06-20',
  personInCharge: '张三',
  contact: '13800138000',
});

// --- 新增：弹窗控制和数据模型 ---

// 控制“新增站点”弹窗的显示/隐藏
const isAddDialogVisible = ref(false);

// “新增站点”表单的初始空状态
const getInitialNewSiteState = () => ({
  name: '',
  type: '主站', // 默认选中主站
  province: null,
  city: null,
  company: null,
  level: null,
  personInCharge: '',
  contact: '',
  networkPlan: '',
  network1Realtime: '',
  network2Realtime: '',
  network1NonRealtime: '',
  network2NonRealtime: '',
});

// “新增站点”表单的数据模型
const newSite = ref(getInitialNewSiteState());

// 下拉框的选项数据（模拟）
const provinceOptions = ref(['四川省', '云南省', '贵州省']);
const cityOptions = ref(['成都市', '绵阳市', '德阳市']);
const companyOptions = ref(['国网四川省电力公司', '四川能源投资集团']);
const levelOptions = ref(['35KV', '110KV', '220KV', '330KV', '500KV', '750KV', '800KV']);

// --- 按钮点击事件处理函数 ---

// 返回上一页
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}

// 顶栏操作
const importData = () => console.log('触发：导入');
const exportData = () => console.log('触发：导出');
const filterData = () => console.log('触发：筛选');

// --- 修改：点击“添加”按钮，显示弹窗 ---
const addData = () => {
  isAddDialogVisible.value = true;
};

// --- 新增：弹窗内的操作 ---
const submitNewSite = () => {
  console.log('提交新站点数据:', newSite.value);
  // 在这里可以添加表单验证和API调用逻辑
  isAddDialogVisible.value = false; // 提交后关闭弹窗
};

// 弹窗关闭时重置表单
const onDialogHide = () => {
  newSite.value = getInitialNewSiteState();
};


// 卡片内操作
const viewDetails = (id) => console.log(`触发：查看站点 ${id}`);
const pinCard = () => console.log('触发：钉住卡片');

// 关闭卡片
const closeCard = () => {
  isSiteCardVisible.value = false;
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- 顶部的状态栏 (时间 & 返回按钮) -->
    <div class="status-bar row items-center justify-between q-px-md">
      <span>2025-06-20 15:48:51</span>
      <div class="text-h4 text-white text-weight-bolder">站点管理</div>
      <span class="text-white">当前电量: 15% <q-icon name="o6" /></span>
    </div>
    <q-page padding>
      <!-- 主内容区域 -->
      <div class="main-content-area">
        <!-- 标题和操作按钮栏 -->
        <div class="row items-center no-wrap q-mb-xl">
          <div class="row items-center q-gutter-x-lg q-ml-xl">
            <q-btn unelevated label="返回" @click="navigateTo('/managecheck')" class="back-button" />
            <q-btn flat dense no-caps class="action-btn" icon="o1" label="切换" @click="navigateTo('/multiasset')" />
            <q-btn flat dense no-caps class="action-btn" icon="o2" label="导入" @click="importData" />
            <q-btn flat dense no-caps class="action-btn" icon="o3" label="导出" @click="exportData" />
          </div>
          <q-space />
          <div class="row items-center q-gutter-x-lg">
            <q-btn flat dense no-caps class="action-btn" icon="o4" label="筛选" @click="filterData" />
            <q-btn flat dense no-caps class="action-btn" icon="o5" label="添加" @click="addData" />
          </div>
        </div>

        <!-- 浮动信息卡片 -->
        <q-card v-if="isSiteCardVisible" class="floating-card" flat>
          <!-- 卡片头部：标题和操作按钮 -->
          <q-card-section class="row items-center q-py-sm q-px-md">
            <div class="text-h6 text-weight-bold">{{ siteData.name }}</div>
            <q-space />
            <q-btn flat round dense icon="o7" color="grey-7" @click="pinCard" />
            <q-btn flat round dense icon="o8" color="grey-7" @click="closeCard" />
          </q-card-section>

          <q-separator />

          <!-- 卡片身体：详细信息 -->
          <q-card-section class="q-gutter-y-sm text-body1">
            <div><span class="text-grey-7">所属公司：</span>{{ siteData.company }}</div>
            <div><span class="text-grey-7">最近核查：</span>{{ siteData.lastCheck }}</div>
            <div><span class="text-grey-7">负责人：</span>{{ siteData.personInCharge }}</div>
            <div><span class="text-grey-7">联系方式：</span>{{ siteData.contact }}</div>
          </q-card-section>

          <!-- 卡片底部：操作按钮 -->
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="查看" color="grey-8" @click="navigateTo('/manageasset')" />
            <q-btn flat label="编辑" class="edit-button" @click="viewDetails(siteData.id)" />
          </q-card-actions>
        </q-card>
      </div>
    </q-page>

    <!-- **** 新增: 新增站点弹窗 **** -->
    <q-dialog v-model="isAddDialogVisible" @hide="onDialogHide">
      <q-card class="dialog-card text-black" style="width: 750px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">新增站点</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-scroll-area style="height: 70vh;">
            <q-form class="q-gutter-y-md q-pr-md">
              <q-input outlined dense v-model="newSite.name" placeholder="请输入站点名称">
                <template #before>
                  <label class="dialog-label" style="font-size: large">
                    <span class="text-red">*</span> 站点名称:
                  </label>
                </template>
              </q-input>

              <div class="row items-center">
                <label class="dialog-label q-mr-md">
                  <span class="text-red">*</span> 站点类型:
                </label>
                <q-radio v-model="newSite.type" val="主站" label="主站" />
                <q-radio v-model="newSite.type" val="变电站" label="变电站" />
                <q-radio v-model="newSite.type" val="发电厂" label="发电厂" />
                <q-radio v-model="newSite.type" val="集控站" label="集控站" />
              </div>

              <q-select outlined dense v-model="newSite.province" :options="provinceOptions" placeholder="请选择所属省份">
                <template #before><label class="dialog-label" style="font-size: large">所属省份:</label></template>
              </q-select>

              <q-select outlined dense v-model="newSite.city" :options="cityOptions" placeholder="请选择所属地市">
                <template #before><label class="dialog-label" style="font-size: large">所属地市:</label></template>
              </q-select>

              <div class="row items-center no-wrap">
                <label class="dialog-label" style="font-size: large">所属公司:</label>
                <q-select outlined dense v-model="newSite.company" :options="companyOptions" placeholder="请选择所属公司" class="col q-ml-md"/>
                <q-btn color="primary" label="添加" class="q-ml-md" unelevated />
              </div>

              <q-select outlined dense v-model="newSite.level" :options="levelOptions" placeholder="请选择站点等级">
                <template #before><label class="dialog-label" style="font-size: large">站点等级:</label></template>
              </q-select>

              <q-input outlined dense v-model="newSite.personInCharge" placeholder="请输入站点负责人">
                <template #before><label class="dialog-label" style="font-size: large">站点负责人:</label></template>
              </q-input>

              <q-input outlined dense v-model="newSite.contact" placeholder="请输入联系方式">
                <template #before><label class="dialog-label" style="font-size: large">联系方式:</label></template>
              </q-input>

              <q-input outlined dense v-model="newSite.networkPlan" hint="网络示例: 192.168.1.1-192.168.1.254">
                <template #before><label class="dialog-label" style="font-size: large">接入网规划:</label></template>
              </q-input>

              <q-input outlined dense v-model="newSite.network1Realtime" placeholder="请输入">
                <template #before><label class="dialog-label" style="font-size: large">接入网一(实时):</label></template>
              </q-input>

              <q-input outlined dense v-model="newSite.network2Realtime" placeholder="请输入">
                <template #before><label class="dialog-label" style="font-size: large">接入网二(实时):</label></template>
              </q-input>

              <q-input outlined dense v-model="newSite.network1NonRealtime" placeholder="请输入">
                <template #before><label class="dialog-label" style="font-size: large">接入网一(非实时):</label></template>
              </q-input>

              <q-input outlined dense v-model="newSite.network2NonRealtime" placeholder="请输入">
                <template #before><label class="dialog-label" style="font-size: large">接入网二(非实时):</label></template>
              </q-input>

            </q-form>
          </q-scroll-area>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-lg">
          <q-btn label="取消" color="grey-6" style="width: 120px" v-close-popup />
          <q-btn label="保存" color="primary" style="width: 120px" @click="submitNewSite" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
/* 整体页面背景色 */
.page-background {
  background-color: #292a2d;
  overflow: hidden;
}

/* 顶部状态栏 */
.status-bar {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  color: white;
  z-index: 10;
}

/* 返回按钮样式 */
.back-button {
  background-color: #4c6afc;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  padding: 4px 16px;
}

/* 主内容区域 */
.main-content-area {
  padding-top: 60px;
}

/* 顶部操作按钮的统一样式 */
.action-btn {
  color: white;
  font-size: 1.5rem;
}
.action-btn .q-icon {
  font-size: 1.5em;
}

/* 浮动信息卡片的样式 */
.floating-card {
  position: absolute;
  top: 150px;
  left: 50px;
  width: 380px;
  background-color: #f7f8fa;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

/* 卡片内文本样式 */
.floating-card .text-body1 {
  color: #333;
}
.floating-card .text-body1 .text-grey-7 {
  display: inline-block;
  width: 80px;
}

/* 卡片底部的“编辑”按钮特殊样式 */
.edit-button {
  color: #1976D2;
  font-weight: bold;
}

/* --- 新增：弹窗样式 --- */
.dialog-card {
  background-color: white;
  border-radius: 8px;
}

/* 弹窗内左侧标签的统一样式 */
.dialog-label {
  width: 120px; /* 固定宽度以对齐 */
  text-align: right;
  padding-right: 12px;
  color: #333;
  font-weight: 500;
}
</style>
