<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { policies } from '../data/policyStore.js'; // 确认路径正确

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

const editDrawerOpen = ref(false);
const isDetailDialogOpen = ref(false);

const editablePolicyName = ref('');
const originalPolicyName = ref('');
const currentPolicyInfo = ref({ object: '', updated: '' });
const checkItems = ref([]);

// 【关键新增】1. 引入控制标题编辑模式的状态
const isTitleEditing = ref(false);
const tempPolicyName = ref(''); // 用于在取消编辑时恢复原标题

const priorityOptions = ['必选项', '可选项', '随机项'];

// 【关键修正】移除 isEditMode，因为页面始终可编辑
// const isEditMode = computed(() => route.query.mode === 'edit');
// 始终处于可编辑状态
const isEditMode = ref(true);


onMounted(() => {
  const policyNameFromRoute = route.query.name;
  if (policyNameFromRoute) {
    originalPolicyName.value = policyNameFromRoute;
    editablePolicyName.value = policyNameFromRoute;

    const policyData = policies.find(p => p.name === policyNameFromRoute);

    if (policyData) {
      if (!policyData.details) policyData.details = {};
      if (!policyData.details.checkItems) policyData.details.checkItems = [];

      checkItems.value = JSON.parse(JSON.stringify(policyData.details.checkItems));
      currentPolicyInfo.value.object = policyData.object;
      currentPolicyInfo.value.updated = policyData.updated;
    } else {
      handlePolicyNotFound();
    }
  } else {
    handlePolicyNotFound();
  }
});

// 【关键新增】2. 新增用于控制标题编辑的函数
const startTitleEdit = () => {
  tempPolicyName.value = editablePolicyName.value; // 保存当前值以备取消
  isTitleEditing.value = true;
};
const confirmTitleEdit = () => {
  isTitleEditing.value = false;
  // v-model 已经更新了 editablePolicyName
};
const cancelTitleEdit = () => {
  editablePolicyName.value = tempPolicyName.value; // 恢复原始值
  isTitleEditing.value = false;
};


const handlePolicyNotFound = () => {
  $q.notify({ color: 'negative', message: '未找到指定的策略或缺少参数' });
  router.push('/manageStrategy');
};

const totalCheckItems = computed(() => {
  let total = 0;
  checkItems.value.forEach(group => {
    total += group.details?.checkPoints?.length || 0;
  });
  return total;
});
const selectedCheckItems = computed(() => {
  let count = 0;
  checkItems.value.forEach(group => {
    if (group.details && group.details.checkPoints) {
      count += group.details.checkPoints.filter(cp => cp.selected).length;
    }
  });
  return count;
});

const updateParentSelection = (parentItem) => {
  if (!parentItem || !parentItem.details || !parentItem.details.checkPoints) return;
  const hasSelection = parentItem.details.checkPoints.some(cp => cp.selected);
  parentItem.selected = hasSelection;
};

const goBack = () => { router.go(-1); };
const openDetailDialog = (item) => { currentDetailItem.value = item; isDetailDialogOpen.value = true; };
const openEditDrawer = (item) => { editingItem.value = JSON.parse(JSON.stringify(item)); editDrawerOpen.value = true; };

const saveChanges = () => {
  if (!editingItem.value) return;
  const index = checkItems.value.findIndex(p => p.id === editingItem.value.id);
  if (index !== -1) {
    checkItems.value[index] = editingItem.value;
  }
  editDrawerOpen.value = false;
  editingItem.value = null;
};

const cancelEdit = () => { editDrawerOpen.value = false; editingItem.value = null; };
const addBasis = (checkPoint) => { if (!checkPoint.basis) checkPoint.basis = []; checkPoint.basis.push({ id: `new_${Date.now()}`, text: '' }); };
const removeBasis = (checkPoint, basisIndex) => { checkPoint.basis.splice(basisIndex, 1); };
const addCheckPoint = () => {
  if (!editingItem.value.details.checkPoints) editingItem.value.details.checkPoints = [];
  const newCheckPoint = {
    id: `new_cp_${Date.now()}`, name: '', requirement: '', minLength: null,
    isAuto: false, basis: [], priority: '必选项', selected: false,
  };
  editingItem.value.details.checkPoints.push(newCheckPoint);
};

const saveAndGoBack = () => {
  const policyToUpdate = policies.find(p => p.name === originalPolicyName.value);
  if (policyToUpdate) {
    $q.loading.show({ message: '正在保存...' });

    policyToUpdate.name = editablePolicyName.value;
    policyToUpdate.details.checkItems = checkItems.value;
    policyToUpdate.updated = new Date().toISOString().split('T')[0];

    setTimeout(() => {
      $q.loading.hide();
      $q.notify({ color: 'positive', icon: 'check_circle', message: '保存成功！' });
      goBack();
    }, 1000);
  } else {
    $q.notify({ color: 'negative', message: '保存失败：找不到原始策略' });
  }
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-page padding>
      <div class="main-content-area">
        <div class="row items-center no-wrap q-mb-md">
          <q-btn unelevated label="返回" @click="goBack" class="action-button" icon="arrow_back" />

          <!-- 【关键修正】3. 使用 v-if/v-else 切换标题的显示和编辑模式 -->
          <div class="row items-center no-wrap q-ml-lg">
            <!-- 显示模式 -->
            <div v-if="!isTitleEditing" class="row items-center no-wrap cursor-pointer" @click="startTitleEdit">
              <div class="text-h4 text-weight-bolder" style="color: #E0E0E0;">{{ editablePolicyName }}</div>
              <q-icon name="edit" size="sm" class="q-ml-sm" color="primary" />
            </div>

            <!-- 编辑模式 -->
            <div v-else class="row items-center no-wrap q-gutter-x-sm">
              <q-input
                v-model="editablePolicyName"
                outlined
                dense
                dark
                autofocus
                class="title-edit-input"
                @keyup.enter="confirmTitleEdit"
                @keyup.esc="cancelTitleEdit"
              />
              <q-btn flat dense round icon="check" color="positive" @click="confirmTitleEdit" />
              <q-btn flat dense round icon="close" color="negative" @click="cancelTitleEdit" />
            </div>
          </div>

          <q-space />
          <q-btn unelevated label="保存" @click="saveAndGoBack" class="action-button" icon="save"/>
        </div>

        <q-card class="info-panel q-pa-md q-mb-lg" flat>
          <div class="row items-center justify-between">
            <div class="column q-gutter-y-sm">
              <span class="text-body1">适用对象：{{ currentPolicyInfo.object }}</span>
              <span class="text-body1">更新时间：{{ currentPolicyInfo.updated }}</span>
            </div>
            <div class="column items-end q-gutter-y-sm">
              <div class="row items-center q-gutter-x-lg text-body1">
                <span>核查项总数：{{ totalCheckItems }}</span>
                <span><q-badge color="green" rounded class="q-mr-sm"/>已选：{{ selectedCheckItems }} 项</span>
              </div>
            </div>
          </div>
        </q-card>

        <div class="row q-col-gutter-lg">
          <div v-for="item in checkItems" :key="item.id" class="col-12 col-sm-6 col-md-4">
            <q-card class="check-item-card" flat>
              <div class="status-badge" :class="item.selected ? 'status-passed' : 'status-unchecked'">
                {{ item.selected ? '已选用' : '未选用' }}
              </div>
              <q-card-section>
                <div class="text-h6 text-weight-bold q-mb-sm row items-center">
                  {{ item.label }}
                </div>
                <div class="item-info">
                  <span>核查点数：</span>
                  {{ item.details.checkPoints.filter(cp => cp.selected).length }} / {{ item.details.checkPoints.length }}
                </div>
              </q-card-section>
              <q-separator color="rgba(255,255,255,0.1)"/>
              <q-card-actions align="right" class="q-pa-sm q-gutter-x-sm">
                <q-btn flat dense no-caps label="详情" color="light-blue-3" @click="openDetailDialog(item)"/>
                <q-btn flat dense no-caps label="编辑" color="teal-3" @click="openEditDrawer(item)"/>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="refresh" color="primary" />
      </q-page-sticky>
    </q-page>

    <!-- 弹窗和抽屉部分保持不变 -->
  </q-layout>
</template>

<!-- 全局样式保持不变 -->
<style> /* ... */ </style>

<!-- 局部样式 -->
<style scoped>
.page-background { background-color: #292a2d; }
.main-content-area { padding-top: 20px; }

/* --- 顶部操作栏 --- */
.action-button {
  background-color: #4c6afc;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  font-size: 1.1rem;
  padding: 8px 18px;
}
.action-button .q-icon {
  font-size: 1.3em;
  margin-right: 6px;
}

/* 【关键新增】为标题编辑输入框设置样式 */
.title-edit-input {
  /* 匹配 Quasar 的 h4 字体大小和粗细 */
  font-size: 2.125rem;
  font-weight: 700;
}
.title-edit-input :deep(.q-field__native) {
  /* 微调以确保与静态标题视觉上对齐 */
  line-height: 1.25;
}

/* --- 信息概览栏 --- */
.info-panel {
  background-color: #333438;
  color: #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
}

/* --- 卡片样式 --- */
.check-item-card {
  background-color: #3d4a58;
  color: #e0e0e0;
  border-radius: 12px;
  position: relative;
  border: 1px solid #4f5b68;
}
.check-item-card :deep(.text-h6) { font-size: 1.5rem; }
.check-item-card :deep(.q-btn) { font-size: 0.95rem; }
.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}
.status-passed { background-color: #28a745; }
.status-unchecked { background-color: #6c757d; }
.item-info { font-size: 1rem; margin-bottom: 2px; }
.item-info span { color: #aeb8c4; }

/* --- 悬浮按钮 --- */
.page-background :deep(.q-page-sticky .q-btn) {
  font-size: 1.6rem;
}
</style>
