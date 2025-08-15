<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { policies } from '../data/policyStore.js'; // 确认路径正确

const $q = useQuasar();
const router = useRouter();
const route = useRoute();

// 控制编辑模式
const isEditMode = ref(false);

const editDrawerOpen = ref(false);
const isDetailDialogOpen = ref(false);

const editablePolicyName = ref('');
const originalPolicyName = ref('');
const currentPolicyInfo = ref({ object: '', updated: '' });
const checkItems = ref([]);

const isTitleEditing = ref(false);
const tempPolicyName = ref('');

// 定义加固优先级的选项
const priorityOptions = [
  { label: '必查项', value: '必查项' },
  { label: '可选项', value: '可选项' },
  { label: '建议项', value: '建议项' }
];

// 用于弹窗和抽屉的数据模型
const currentDetailItem = ref(null);
const editingItem = ref(null);


onMounted(() => {
  // 从路由查询参数中确定模式
  const modeFromRoute = route.query.mode;
  isEditMode.value = (modeFromRoute === 'edit'); // 如果 mode 是 'edit'，则为 true，否则为 false

  const policyNameFromRoute = route.query.name;
  if (policyNameFromRoute) {
    originalPolicyName.value = policyNameFromRoute;
    editablePolicyName.value = policyNameFromRoute;

    const policyData = policies.find(p => p.name === policyNameFromRoute);

    if (policyData) {
      if (!policyData.details) policyData.details = {};
      if (!policyData.details.checkItems) policyData.details.checkItems = [];

      const processedCheckItems = JSON.parse(JSON.stringify(policyData.details.checkItems));
      processedCheckItems.forEach(item => {
        if (item.details && item.details.checkPoints) {
          item.details.checkPoints.forEach(cp => {
            if (!cp.priority) {
              cp.priority = '可选项';
            }
          });
        }
      });
      checkItems.value = processedCheckItems;

      currentPolicyInfo.value.object = policyData.object;
      currentPolicyInfo.value.updated = policyData.updated;
    } else {
      handlePolicyNotFound();
    }
  } else {
    handlePolicyNotFound();
  }
});

const startTitleEdit = () => {
  tempPolicyName.value = editablePolicyName.value;
  isTitleEditing.value = true;
};
const confirmTitleEdit = () => {
  isTitleEditing.value = false;
};
const cancelTitleEdit = () => {
  editablePolicyName.value = tempPolicyName.value;
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

const goBack = () => { router.go(-1); };
const openDetailDialog = (item) => { currentDetailItem.value = item; isDetailDialogOpen.value = true; };

const openEditDrawer = (item) => {
  const clonedItem = JSON.parse(JSON.stringify(item));
  if (clonedItem.details && clonedItem.details.checkPoints) {
    clonedItem.details.checkPoints.forEach(cp => {
      if (!cp.priority) {
        cp.priority = '可选项';
      }
    });
  }
  editingItem.value = clonedItem;
  editDrawerOpen.value = true;
};

const saveChanges = () => {
  if (!editingItem.value) return;
  const parentItemIndex = checkItems.value.findIndex(p => p.id === editingItem.value.id);
  if (parentItemIndex !== -1) {
    checkItems.value[parentItemIndex] = editingItem.value;
  }
  editDrawerOpen.value = false;
  editingItem.value = null;
};

const cancelEdit = () => { editDrawerOpen.value = false; editingItem.value = null; };
const addBasis = (checkPoint) => { if (!checkPoint.basis) checkPoint.basis = []; checkPoint.basis.push({ id: `new_${Date.now()}`, text: '' }); };
const removeBasis = (checkPoint, basisIndex) => { checkPoint.basis.splice(basisIndex, 1); };

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
          <div class="row items-center no-wrap q-ml-lg">

            <!-- 编辑模式 -->
            <div v-if="isEditMode">
              <!-- 可编辑的标题 -->
              <div v-if="!isTitleEditing" class="row items-center no-wrap cursor-pointer" @click="startTitleEdit">
                <!-- 【颜色修正】 -->
                <div class="text-h4 text-weight-bolder" style="color: #4c6afc;">{{ editablePolicyName }}</div>
                <q-icon name="edit" size="sm" class="q-ml-sm" color="primary" />
              </div>
              <!-- 标题输入框 -->
              <div v-else class="row items-center no-wrap q-gutter-x-sm">
                <q-input
                  v-model="editablePolicyName"
                  outlined dense dark autofocus class="title-edit-input"
                  @keyup.enter="confirmTitleEdit" @keyup.esc="cancelTitleEdit"
                />
                <q-btn flat dense round icon="check" color="positive" @click="confirmTitleEdit" />
                <q-btn flat dense round icon="close" color="negative" @click="cancelTitleEdit" />
              </div>
            </div>

            <!-- 查看模式 -->
            <!-- 【颜色修正】 -->
            <div v-else class="text-h4 text-weight-bolder" style="color: #4c6afc;">
              {{ editablePolicyName }}
            </div>

          </div>
          <q-space />

          <!-- 保存按钮，仅在编辑模式下显示 -->
          <q-btn v-if="isEditMode" unelevated label="保存" @click="saveAndGoBack" class="action-button" icon="save"/>
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
                  <span>核查项数：</span>
                  {{ item.details.checkPoints.filter(cp => cp.selected).length }} / {{ item.details.checkPoints.length }}
                </div>
              </q-card-section>
              <q-separator color="rgba(255,255,255,0.1)"/>
              <q-card-actions align="right" class="q-pa-sm q-gutter-x-sm">
                <q-btn flat dense no-caps label="详情" color="light-blue-3" @click="openDetailDialog(item)"/>
                <!-- 编辑按钮，仅在编辑模式下显示 -->
                <q-btn v-if="isEditMode" flat dense no-caps label="编辑" color="teal-3" @click="openEditDrawer(item)"/>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="refresh" color="primary" />
      </q-page-sticky>
    </q-page>

    <!-- 详情弹窗 -->
    <q-dialog v-model="isDetailDialogOpen">
      <q-card v-if="currentDetailItem" class="dialog-detail" style="width: 700px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ currentDetailItem.label }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <q-scroll-area style="height: 60vh;">
            <div class="q-pr-md">
              <q-card v-for="cp in currentDetailItem.details.checkPoints" :key="cp.id" flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-h6 text-weight-bold">
                    {{ cp.name }}
                    <q-badge v-if="cp.selected" color="positive" text-color="white" label="已选用" class="q-ml-sm" />
                    <q-badge v-else color="grey" text-color="white" label="未选用" class="q-ml-sm" />
                    <q-chip v-if="cp.isAuto" dense color="cyan" text-color="white" label="自动核查" class="q-ml-sm"/>
                  </div>
                </q-card-section>
                <q-card-section class="q-pt-none">
                  <div class="text-subtitle1 q-mb-md">
                    <span class="text-weight-medium">核查要求：</span>{{ cp.requirement }}
                    <span v-if="cp.minLength">，口令最小长度：{{ cp.minLength }}</span>
                  </div>
                  <div class="text-subtitle1 text-weight-medium q-mb-sm">核查依据：</div>
                  <div v-if="cp.basis && cp.basis.length > 0">
                    <div v-for="(basis, index) in cp.basis" :key="basis.id || index" class="text-body2 text-grey-8 basis-item">
                      {{ index + 1 }}、{{ basis.text }}
                    </div>
                  </div>
                  <div v-else class="text-grey">无</div>
                </q-card-section>
              </q-card>
            </div>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 编辑抽屉 -->
    <q-drawer v-model="editDrawerOpen" side="right" overlay bordered :width="500" class="drawer-edit bg-white">
      <div v-if="editingItem" class="column full-height">
        <q-toolbar class="bg-blue-1 text-primary">
          <q-toolbar-title class="text-weight-bold">编辑核查项</q-toolbar-title>
          <q-btn flat round dense icon="save" @click="saveChanges" color="primary">
            <q-tooltip>保存此项修改</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" @click="cancelEdit" />
        </q-toolbar>
        <q-scroll-area class="col">
          <div class="q-pa-md">
            <div class="text-caption text-grey-7">核查类别 *</div>
            <q-input v-model="editingItem.label" outlined dense class="q-mb-md" />
            <div v-for="(cp) in editingItem.details.checkPoints" :key="cp.id" class="q-mb-lg q-pa-md rounded-borders" style="border: 1px solid #e0e0e0;">

              <q-checkbox v-model="cp.selected" label="选用此核查项" color="primary" class="q-mb-md" />

              <!-- 加固优先级设置 -->
              <div class="text-caption text-grey-7">加固优先级</div>
              <q-btn-toggle
                v-model="cp.priority"
                :options="priorityOptions"
                unelevated
                toggle-color="primary"
                color="grey-6"
                text-color="white"
                no-caps
                class="q-mb-md full-width"
              />

              <div class="text-caption text-grey-7">核查项 *</div>
              <q-input v-model="cp.name" outlined dense class="q-mb-md" />
              <div class="text-caption text-grey-7">核查要求 *</div>
              <q-input v-model="cp.requirement" outlined dense type="textarea" autogrow class="q-mb-md" />
              <div class="text-caption text-grey-7">口令最小长度</div>
              <q-input v-model.number="cp.minLength" outlined dense type="number" class="q-mb-md" />
              <div class="text-caption text-grey-7 q-mb-xs">核查依据</div>
              <div v-for="(basis, basisIndex) in cp.basis" :key="basis.id" class="row items-center q-gutter-x-sm q-mb-xs">
                <q-input v-model="basis.text" outlined dense class="col" />
                <q-btn flat round dense color="negative" icon="delete" @click="removeBasis(cp, basisIndex)" />
              </div>
              <q-btn label="+ 新增核查依据" color="primary" flat unelevated @click="addBasis(cp)" class="full-width q-mt-sm" />
            </div>
          </div>
        </q-scroll-area>
      </div>
    </q-drawer>
  </q-layout>
</template>

<style>
/* --- 详情弹窗 --- */
.dialog-detail .text-h6 { font-size: 1.5rem; }
.dialog-detail .text-subtitle1 { font-size: 1.1rem; }
.dialog-detail .text-body2 { font-size: 1rem; }
.dialog-detail .q-chip { font-size: 0.8rem; }
.dialog-detail .basis-item { line-height: 1.8; margin-bottom: 8px; }

/* --- 编辑抽屉 --- */
.drawer-edit .q-toolbar__title { font-size: 1.25rem; }
.drawer-edit .text-caption { font-size: 0.85rem; }
.drawer-edit .q-field__native, .drawer-edit .q-field__label { font-size: 1rem; }
.drawer-edit .q-btn .q-btn__content { font-size: 0.9rem; }
.drawer-edit .q-checkbox__label { font-size: 1rem; }


/* --- 全局: 工具提示 --- */
.q-tooltip { font-size: 13px; }
</style>

<style scoped>
.page-background { background-color: #292a2d; }
.main-content-area { padding-top: 20px; }

/* --- 顶部操作栏 --- */
.action-button {
  background-color: #4c6afc;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  font-size: 1.1rem; /* 匹配图片字体 */
  padding: 8px 18px; /* 匹配图片按钮尺寸 */
}
.action-button .q-icon {
  font-size: 1.3em;
  margin-right: 6px;
}
.title-edit-input {
  font-size: 2.125rem;
  font-weight: 700;
}
.title-edit-input :deep(.q-field__native) {
  line-height: 1.25;
}
.page-background :deep(.text-h4) {
  font-size: 2.125rem; /* 匹配图片标题字体 */
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
