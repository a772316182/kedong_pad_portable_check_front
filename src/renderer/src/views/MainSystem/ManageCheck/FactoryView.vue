<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="text-white bg-light-blue-grey">
      <q-toolbar>
        <q-btn label="返回" class="bg-primary" @click = "navigateTo('manageCheck')"/>
        <q-toolbar-title>
          站点列表
        </q-toolbar-title>
        <q-space />
        <q-btn icon="add" color="primary" label="添加站点" @click="addSite" />
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="q-pa-md bg-light-blue-grey">

        <!-- 功能按钮工具栏 -->
        <q-toolbar class="bg-white q-mb-sm rounded-borders shadow-2">
          <q-btn-group flat>
            <q-btn label="批量删除" icon="delete" color="negative" @click="bulkDelete" :disable="selected.length === 0"/>
            <q-btn label="导出数据" icon="archive" />
          </q-btn-group>
          <q-space />
          <q-input dense outlined debounce="300" v-model="globalFilter" placeholder="搜索全站...">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-toolbar>

        <q-table
          :rows="originalRows"
          :columns="columns"
          :filter="globalFilter"
          row-key="id"
          v-model:pagination="pagination"
          selection="multiple"
          v-model:selected="selected"
          class="shadow-2"
          table-header-class="bg-grey-8 text-white"
        >
          <!-- 自定义操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn size="sm" color="teal" label="编辑" @click="editItem(props.row)" class="q-mr-sm" />
              <q-btn size="sm" color="grey-7" label="删除" @click="deleteItem(props.row)" />
            </q-td>
          </template>

        </q-table>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'

const $q = useQuasar();

// 表格列定义
const columns = [
  { name: 'id', required: true, label: '编号', align: 'left', field: 'id', sortable: true },
  { name: 'province', label: '省份', align: 'left', field: 'province', sortable: true },
  { name: 'city', label: '城市', align: 'left', field: 'city', sortable: true },
  { name: 'siteName', label: '站点名称', align: 'left', field: 'siteName', sortable: true },
  { name: 'vendorType', label: '厂商类型', align: 'center', field: 'vendorType', sortable: true },
  { name: 'telegramLevel', label: '电报等级', align: 'center', field: 'telegramLevel', sortable: true },
  { name: 'userCount', label: '接入用户数量', align: 'center', field: 'userCount', sortable: true },
  { name: 'auditCount', label: '稽查数量', align: 'center', field: 'auditCount', sortable: true },
  { name: 'lastInspection', label: '最近巡检时间', align: 'left', field: 'lastInspection', sortable: true },
  { name: 'configOverview', label: '配置概览', align: 'left', field: 'configOverview' },
  // 操作列在模板中单独定义
  { name: 'actions', label: '操作', field: 'actions', align: 'center' }
];

// 模拟的站点数据
const originalRows = ref([
  { id: 'S001', province: '广东', city: '深圳', siteName: '深圳南山站点', vendorType: '华为', telegramLevel: '一级', userCount: 1024, auditCount: 15, lastInspection: '2025-06-18 10:00', configOverview: '正常' },
  { id: 'S002', province: '北京', city: '北京', siteName: '北京海淀站点', vendorType: '中兴', telegramLevel: '二级', userCount: 2048, auditCount: 5, lastInspection: '2025-06-19 11:30', configOverview: '需关注' },
  { id: 'S003', province: '上海', city: '上海', siteName: '上海浦东站点', vendorType: '华为', telegramLevel: '一级', userCount: 1536, auditCount: 8, lastInspection: '2025-06-20 09:00', configOverview: '正常' },
  { id: 'S004', province: '广东', city: '广州', siteName: '广州天河站点', vendorType: '思科', telegramLevel: '三级', userCount: 800, auditCount: 22, lastInspection: '2025-06-15 14:00', configOverview: '异常' },
  { id: 'S005', province: '浙江', city: '杭州', siteName: '杭州西湖站点', vendorType: '华为', telegramLevel: '二级', userCount: 1200, auditCount: 3, lastInspection: '2025-06-21 16:45', configOverview: '正常' },
]);

// 用于表格多选
const selected = ref([]);

// 用于全局搜索
const globalFilter = ref('');

// 分页配置
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10
});

// 添加站点
const addSite = () => {
  $q.notify({
    message: '触发“添加站点”操作',
    color: 'positive',
    icon: 'add_circle'
  });
  // 在此实现添加站点的逻辑，例如弹出一个对话框
};

// 编辑项目
const editItem = (item) => {
  $q.notify({
    message: `正在编辑: ${item.siteName}`,
    color: 'info',
    icon: 'edit'
  });
  // 在此实现编辑逻辑
};

// 删除单个项目
const deleteItem = (item) => {
  $q.dialog({
    title: '确认删除',
    message: `您确定要删除站点“${item.siteName}”吗？`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    const index = originalRows.value.findIndex(row => row.id === item.id);
    if (index > -1) {
      originalRows.value.splice(index, 1);
    }
    $q.notify({
      message: '删除成功',
      color: 'positive',
      icon: 'check'
    });
  });
};

// 批量删除
const bulkDelete = () => {
  $q.dialog({
    title: '确认批量删除',
    message: `您确定要删除选中的 ${selected.value.length} 个站点吗？`,
    cancel: true,
    persistent: true
  }).onOk(() => {
    const idsToDelete = selected.value.map(item => item.id);
    originalRows.value = originalRows.value.filter(row => !idsToDelete.includes(row.id));
    selected.value = []; // 清空选择
    $q.notify({
      message: '批量删除成功',
      color: 'positive',
      icon: 'check'
    });
  });
}

const router = useRouter()
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

</script>

<style scoped>
.q-btn{
  text-transform: none;
}
.bg-light-blue-grey {
  background-color: #1d2b2b; /* 图片中的浅蓝灰色背景 */
  color: #333;
}
.bg-table-theme {
  background-color: #ffffff; /* 表格背景为白色 */
  color: #333;
}
</style>
