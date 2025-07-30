<template>
  <!-- 整个页面容器，移除内边距，因为顶栏和内容区需要自己控制 -->
  <q-page class="bg-grey-9">

    <!-- 1. 新的顶部栏 (替换了原有的面包屑) -->
    <!-- 背景色 bg-teal-9 是一个比默认 primary 更深的青色 -->
    <div class="bg-teal-6 text-white shadow-2">
      <q-toolbar>
        <!-- 返回按钮 -->
        <q-btn flat dense icon="arrow_back" label="返回" no-caps @click="goBack" />

        <!-- 居中标题 -->
        <q-toolbar-title class="text-center text-weight-bold">
          用户管理
        </q-toolbar-title>

        <!-- 使用一个不可见的按钮来占位，以确保标题绝对居中 -->
        <q-btn flat dense icon="arrow_back" style="opacity: 0; pointer-events: none;" />
      </q-toolbar>
    </div>

    <!-- 主内容区，添加内边距 -->
    <div class="q-pa-md">
      <!-- 2. 页面主标题和操作按钮 -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h5 text-weight-bold text-white">用户列表</div>
        <q-btn
          color="primary"
          label="添加用户"
          icon="add"
          @click="openAddUserDialog"
        />
      </div>

      <!-- 3. 用户数据表格 -->
      <!-- 使用 dark 属性适配深色背景，card-class 来设置卡片背景色 -->
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :pagination="initialPagination"
        separator="cell"
        flat
        bordered
      >
        <!-- 自定义表头插槽，用于添加搜索图标 -->
        <template v-slot:header-cell="props">
          <q-th :props="props">
            <div class="row items-center no-wrap">
              <span>{{ props.col.label }}</span>
              <!-- 只在特定列显示搜索图标 -->
              <q-icon
                v-if="['username', 'name', 'department', 'created_at'].includes(props.col.name)"
                name="search"
                size="18px"
                class="q-ml-xs cursor-pointer"
                color="grey-7"
              />
            </div>
          </q-th>
        </template>

        <!-- 自定义“操作”列的内容 -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense color="primary" label="编辑" class="q-mr-sm" @click="onEdit(props.row)" />
            <q-btn flat dense color="negative" label="删除" @click="onDelete(props.row)" />
          </q-td>
        </template>

        <!-- 自定义分页控件，以完全匹配截图 (美化后版本) -->
        <template v-slot:pagination="scope">
          <div class="row items-center justify-start full-width q-pa-sm text-grey-8">
            <!-- 左侧信息 -->
            <div>
              第 {{ scope.pagination.page * scope.pagination.rowsPerPage - scope.pagination.rowsPerPage + 1 }}-{{ Math.min(scope.pagination.page * scope.pagination.rowsPerPage, scope.pagination.rowsNumber) }} 条, 共 {{ scope.pagination.rowsNumber }} 条
            </div>

            <q-space />

            <!-- 右侧控件组 -->
            <div class="row items-center q-gutter-md">
              <q-pagination
                v-model="scope.pagination.page"
                :max="scope.pagesNumber"
                direction-links
                flat
                color="grey-8"
                active-color="primary"
                @update:model-value="(page) => scope.setPagination({ page })"
              />

              <div class="row items-center">
                <q-select
                  v-model="scope.pagination.rowsPerPage"
                  :options="[5, 10, 20, 50]"
                  dense
                  borderless
                  @update:model-value="(rowsPerPage) => scope.setPagination({ rowsPerPage })"
                />
                <span>条/页</span>
              </div>

              <div class="row items-center">
                <span>跳至</span>
                <q-input
                  v-model.number="jumpToPage"
                  dense
                  borderless
                  type="number"
                  class="q-mx-xs"
                  style="width: 50px; text-align: center; border: 1px solid #ccc; border-radius: 4px;"
                  @keyup.enter="jumpToPageAction(scope)"
                />
                <span>页</span>
                <q-btn flat dense label="确定" class="q-ml-sm text-primary text-weight-bold" @click="jumpToPageAction(scope)" />
              </div>
            </div>
          </div>
        </template>

      </q-table>
    </div>

    <!-- 4. 添加新用户弹窗 (无修改) -->
    <q-dialog v-model="showAddUserDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">添加新用户</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="newUserContent"
            type="textarea"
            placeholder="这里是添加用户的内容..."
            autofocus
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="grey-8" v-close-popup />
          <q-btn label="确认添加" color="primary" @click="confirmAddUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router'; // 引入 useRouter

const $q = useQuasar();
const router = useRouter(); // 初始化 router

// 控制添加用户弹窗的显示状态
const showAddUserDialog = ref(false);
const newUserContent = ref('');
const jumpToPage = ref(1);

// 表格列定义 (无修改)
const columns = [
  { name: 'id', required: true, label: '序号', align: 'left', field: 'id', sortable: true },
  { name: 'username', align: 'left', label: '用户名', field: 'username', sortable: true },
  { name: 'name', align: 'left', label: '姓名', field: 'name', sortable: true },
  { name: 'department', align: 'left', label: '所属机构', field: 'department' },
  { name: 'created_at', align: 'left', label: '创建时间', field: 'created_at', sortable: true },
  { name: 'actions', label: '操作', field: 'actions', align: 'left' }
];

// 模拟的表格数据 (无修改)
const rows = ref([
  { id: 1, username: 'user001', name: '张三', department: '技术部', created_at: '2023-04-01T12:00:00' },
  { id: 2, username: 'user002', name: '李四', department: '市场部', created_at: '2023-04-02T13:30:00' },
  { id: 3, username: 'user003', name: '王五', department: '销售部', created_at: '2023-04-03T14:45:00' },
  { id: 4, username: 'user004', name: '赵六', department: '财务部', created_at: '2023-04-04T16:15:00' },
  { id: 5, username: 'user005', name: '孙七', department: '人力资源部', created_at: '2023-04-05T17:30:00' },
]);

// 分页初始配置 (无修改)
const initialPagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 5,
  rowsNumber: rows.value.length
});

// --- 方法 ---

// 新增：返回上一页的方法
const goBack = () => {
  // 可以使用 router.go(-1) 或者 window.history.back()
  // router.go(-1) 在单页应用中更健壮
  router.go(-1);
};

// 新增：跳转页面的通用方法
const jumpToPageAction = (scope) => {
  const page = Number(jumpToPage.value);
  if (page > 0 && page <= scope.pagesNumber) {
    scope.setPagination({ page });
  } else {
    $q.notify({
      type: 'negative',
      message: '请输入有效的页码！'
    })
  }
};


// 打开“添加用户”弹窗 (无修改)
const openAddUserDialog = () => {
  newUserContent.value = '';
  showAddUserDialog.value = true;
};

// 确认添加用户 (无修改)
const confirmAddUser = () => {
  if (!newUserContent.value) {
    $q.notify({
      type: 'warning',
      message: '内容不能为空！'
    });
    return;
  }

  console.log('添加新用户:', newUserContent.value);

  $q.notify({
    type: 'positive',
    message: '用户添加成功！'
  });

  showAddUserDialog.value = false;
};

// 点击编辑按钮 (无修改)
const onEdit = (row) => {
  console.log('编辑:', row);
  $q.notify(`编辑用户：${row.name}`);
};

// 点击删除按钮 (无修改)
const onDelete = (row) => {
  console.log('删除:', row);
  $q.dialog({
    title: '确认删除',
    message: `您确定要删除用户 “${row.name}” 吗？`,
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: '确认删除'
    },
    cancel: {
      flat: true,
      label: '取消'
    }
  }).onOk(() => {
    $q.notify({
      type: 'positive',
      message: `用户 “${row.name}” 已被删除。`
    });
  });
};
</script>

<style lang="scss">
// 调整表格斑马纹颜色以匹配截图 (无修改)
.q-table--striped tbody tr:nth-child(even) {
  background-color: #f7f9fa;
}

// 调整分页控件的边框 (无修改)
.q-table__bottom {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
