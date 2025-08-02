<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 站点数据列表
const sites = ref([
  {
    id: 1,
    name: '省调1',
    company: '所属公司A',
    lastCheck: '2025-06-20',
    personInCharge: '张三',
    contact: '13800138000',
    type: '主站',
    province: '四川省',
    city: '成都市',
    level: '500KV',
    networkPlan: '192.168.1.1-254',
    network1Realtime: '10.1.1.1',
    network2Realtime: '10.2.2.2',
    network1NonRealtime: '10.3.3.3',
    network2NonRealtime: '10.4.4.4',
  },
  {
    id: 2,
    name: '成都变电站',
    company: '国网四川省电力公司',
    lastCheck: '2025-05-15',
    personInCharge: '李四',
    contact: '13900139000',
    type: '变电站',
    province: '四川省',
    city: '成都市',
    level: '220KV',
    networkPlan: '',
    network1Realtime: '',
    network2Realtime: '',
    network1NonRealtime: '',
    network2NonRealtime: '',
  },
  {
    id: 3,
    name: '西昌发电厂',
    company: '四川能源投资集团',
    lastCheck: '2025-04-30',
    personInCharge: '王五',
    contact: '13700137000',
    type: '发电厂',
    province: '四川省',
    city: '凉山州',
    level: '330KV',
    networkPlan: '',
    network1Realtime: '',
    network2Realtime: '',
    network1NonRealtime: '',
    network2NonRealtime: '',
  },
]);

// 表格列定义
const columns = [
  { name: 'name', required: true, label: '站点名称', align: 'left', field: row => row.name, sortable: true },
  { name: 'company', align: 'left', label: '所属公司', field: 'company', sortable: true },
  { name: 'lastCheck', align: 'left', label: '最近核查', field: 'lastCheck' },
  { name: 'personInCharge', align: 'left', label: '负责人', field: 'personInCharge' },
  { name: 'contact', align: 'left', label: '联系方式', field: 'contact' },
  { name: 'actions', label: '操作', align: 'center' }
];

// 弹窗控制和数据模型
const isDialogVisible = ref(false);
const editingSiteId = ref(null);

// 表单的初始空状态
const getInitialFormState = () => ({
  name: '',
  type: '主站',
  province: null,
  city: null,
  level: null,
  personInCharge: '',
  contact: '',
  networkPlan: '',
  network1Realtime: '',
  network2Realtime: '',
  network1NonRealtime: '',
  network2NonRealtime: '',
});

// 表单的数据模型
const siteForm = ref(getInitialFormState());

// 下拉框的选项数据
const provinceOptions = ref(['四川省', '云南省', '贵州省']);
const cityOptions = ref(['成都市', '绵阳市', '德阳市', '凉山州']);
const levelOptions = ref(['35KV', '110KV', '220KV', '330KV', '500KV', '750KV', '800KV']);
const siteTypeOptions = ref(['主站', '变电站', '发电厂', '集控站系统', '配电自动化系统', '负控系统', '通信网管系统主站']);


// 按钮点击事件处理函数
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}

const importData = () => console.log('触发：导入');
const exportData = () => console.log('触发：导出');

// "新增"按钮处理函数
const openAddDialog = () => {
  editingSiteId.value = null;
  siteForm.value = getInitialFormState();
  isDialogVisible.value = true;
};

// "编辑"按钮处理函数
const openEditDialog = (id) => {
  const siteToEdit = sites.value.find(site => site.id === id);
  if (siteToEdit) {
    editingSiteId.value = id;
    siteForm.value = { ...siteToEdit };
    isDialogVisible.value = true;
  }
};

// 表单提交逻辑
const submitForm = () => {
  if (editingSiteId.value !== null) {
    // 编辑模式
    const index = sites.value.findIndex(site => site.id === editingSiteId.value);
    if (index !== -1) {
      sites.value[index] = { ...sites.value[index], ...siteForm.value };
    }
    console.log('更新站点数据:', sites.value[index]);
  } else {
    // 新增模式
    const newId = sites.value.length > 0 ? Math.max(...sites.value.map(s => s.id)) + 1 : 1;
    const newSiteData = {
      id: newId,
      ...siteForm.value,
      company: 'N/A',
      lastCheck: new Date().toISOString().slice(0, 10),
    };
    sites.value.push(newSiteData);
    console.log('提交新站点数据:', newSiteData);
  }
  isDialogVisible.value = false;
};

// 弹窗关闭时重置状态
const onDialogHide = () => {
  editingSiteId.value = null;
  siteForm.value = getInitialFormState();
};

// 删除行操作
const deleteRow = (id) => {
  console.log(`触发：删除站点 ${id}`);
  const index = sites.value.findIndex(site => site.id === id);
  if (index > -1) {
    sites.value.splice(index, 1);
  }
};

// 动态显示弹窗标题
const dialogTitle = computed(() => {
  return editingSiteId.value === null ? '新增站点' : '编辑站点';
});

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-page padding>
      <!-- 主内容区域 -->
      <div class="main-content-area">
        <!-- 标题和操作按钮栏 -->
        <div class="row items-center no-wrap q-mb-md">
          <!-- 返回按钮 -->
          <q-btn unelevated label="返回" @click="navigateTo('/managecheck')" class="action-button q-mr-md" icon="arrow_back" />

          <!-- 标题 -->
          <div class="text-h4 text-weight-bolder" style="color: #4c6afc;">站点管理</div>

          <q-space />

          <!-- 其他操作按钮 -->
          <div class="row items-center q-gutter-x-md">
            <q-btn unelevated label="导入" @click="importData" class="action-button" icon="file_upload" />
            <q-btn unelevated label="导出" @click="exportData" class="action-button" icon="file_download" />
            <q-btn unelevated label="添加" @click="openAddDialog" class="action-button" icon="add" />
          </div>
        </div>

        <!-- 信息展示表格 -->
        <q-table
          class="site-table"
          flat
          dark
          :rows="sites"
          :columns="columns"
          row-key="id"
          hide-bottom
          :rows-per-page-options="[0]"
        >
          <!-- 自定义操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm text-center">
              <q-btn flat dense round @click="navigateTo('/manageasset')" icon="visibility" color="light-blue-3">
                <q-tooltip>查看</q-tooltip>
              </q-btn>
              <q-btn flat dense round @click="openEditDialog(props.row.id)" icon="edit" color="light-blue-3">
                <q-tooltip>编辑</q-tooltip>
              </q-btn>
              <q-btn flat dense round @click="deleteRow(props.row.id)" icon="close" color="negative">
                <q-tooltip class="bg-red">删除此站点</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>

      </div>
    </q-page>

    <!-- 用于新增和编辑的通用弹窗 -->
    <q-dialog v-model="isDialogVisible" @hide="onDialogHide">
      <q-card class="dialog-card text-black" style="width: 750px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ dialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-scroll-area style="height: 70vh;">
            <q-form class="q-gutter-y-md q-pr-md">
              <q-input outlined dense v-model="siteForm.name" placeholder="请输入站点名称">
                <template #before>
                  <label class="dialog-label" style="font-size: large">
                    <span class="text-red">*</span> 站点名称:
                  </label>
                </template>
              </q-input>

              <q-select outlined dense v-model="siteForm.type" :options="siteTypeOptions" placeholder="请选择站点类型">
                <template #before>
                  <label class="dialog-label" style="font-size: large">
                    <span class="text-red">*</span> 站点类型:
                  </label>
                </template>
              </q-select>

              <q-select outlined dense v-model="siteForm.province" :options="provinceOptions" placeholder="请选择所属省份">
                <template #before><label class="dialog-label" style="font-size: large">所属省份:</label></template>
              </q-select>

              <q-select outlined dense v-model="siteForm.city" :options="cityOptions" placeholder="请选择所属地市">
                <template #before><label class="dialog-label" style="font-size: large">所属地市:</label></template>
              </q-select>

              <q-select outlined dense v-model="siteForm.level" :options="levelOptions" placeholder="请选择站点等级">
                <template #before><label class="dialog-label" style="font-size: large">站点等级:</label></template>
              </q-select>

              <q-input outlined dense v-model="siteForm.personInCharge" placeholder="请输入站点负责人">
                <template #before><label class="dialog-label" style="font-size: large">站点负责人:</label></template>
              </q-input>

              <q-input outlined dense v-model="siteForm.contact" placeholder="请输入联系方式">
                <template #before><label class="dialog-label" style="font-size: large">联系方式:</label></template>
              </q-input>

              <q-input outlined dense v-model="siteForm.networkPlan" hint="网络示例: 192.168.1.1-192.168.1.254">
                <template #before><label class="dialog-label" style="font-size: large">接入网规划:</label></template>
              </q-input>

              <q-input outlined dense v-model="siteForm.network1Realtime" placeholder="请输入">
                <template #before><label class="dialog-label" style="font-size: large">接入网一(实时):</label></template>
              </q-input>

              <q-input outlined dense v-model="siteForm.network2Realtime" placeholder="请输入">
                <template #before><label class="dialog-label" style="font-size: large">接入网二(实时):</label></template>
              </q-input>

              <q-input outlined dense v-model="siteForm.network1NonRealtime" placeholder="请输入">
                <template #before><label class="dialog-label" style="font-size: large">接入网一(非实时):</label></template>
              </q-input>

              <q-input outlined dense v-model="siteForm.network2NonRealtime" placeholder="请输入">
                <template #before><label class="dialog-label" style="font-size: large">接入网二(非实时):</label></template>
              </q-input>

            </q-form>
          </q-scroll-area>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-lg">
          <q-btn label="取消" color="grey-6" style="width: 120px" v-close-popup />
          <q-btn label="保存" color="primary" style="width: 120px" @click="submitForm" />
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

/* 主内容区域 */
.main-content-area {
  padding-top: 20px;
}

/* 顶部操作按钮的新统一样式 */
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

/* 表格样式 */
.site-table {
  background-color: #333438;
  border-radius: 8px;
}
:deep(.site-table thead tr th) {
  color: white;
  font-weight: bold;
  background-color: rgba(76, 106, 252, 0.2);
  font-size: 16px;
}
:deep(.site-table tbody td) {
  color: #e0e0e0;
  font-size: 14px;
  border-color: #424242;
}
:deep(.site-table tbody tr:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* 弹窗样式 */
.dialog-card {
  background-color: white;
  border-radius: 8px;
}

.dialog-label {
  width: 120px;
  text-align: right;
  padding-right: 12px;
  color: #333;
  font-weight: 500;
}
</style>
