<script setup>
import { ref, computed } from 'vue';
//  useRouter 用于导航, useRoute 用于获取当前路由信息
import { useRouter, useRoute } from 'vue-router';
// 引入 useQuasar 以使用通知和加载插件
import { useQuasar } from 'quasar';

const $q = useQuasar(); // 初始化 Quasar 插件
const router = useRouter();
const route = useRoute(); // 获取当前路由对象

// --- MODIFIED: 控制器 ---
const editDrawerOpen = ref(false); // 编辑抽屉
const isDetailDialogOpen = ref(false); // 新增：详情弹窗

// --- MODIFIED: 数据模型 ---
// 判断当前是否为编辑模式 (通过 URL 的 ?mode=edit 参数)
const isEditMode = computed(() => route.query.mode === 'edit');

// 用于编辑抽屉的临时数据对象
const editingItem = ref(null);
// 新增：用于详情弹窗的只读数据对象
const currentDetailItem = ref(null);

// 左侧核查项列表数据模型 (现在用于卡片)
const checkItems = ref([
  {
    id: 1,
    label: '身份鉴别',
    selected: true,
    details: {
      checkPoints: [
        {
          id: 'cp1-1',
          name: '配置口令复杂度策略',
          requirement: '口令由字母、数字和特殊字符组成',
          minLength: 8,
          isAuto: true,
          basis: [
            { id: 'b1', text: '《信息安全技术网络安全等级保护》' },
          ]
        },
        {
          id: 'cp1-2',
          name: '用户登录失败锁定',
          requirement: '连续登录失败5次后，账户锁定',
          minLength: null,
          isAuto: true,
          basis: []
        }
      ]
    },
  },
  { id: 2, label: '访问控制', selected: false, details: { checkPoints: [{ id: 'cp2-1', name: '访问控制策略', requirement: '...', minLength: null, isAuto: false, basis: [] }] } },
  { id: 3, label: '入侵防范', selected: false, details: { checkPoints: [{ id: 'cp3-1', name: '入侵防范策略', requirement: '...', minLength: null, isAuto: false, basis: [] }] } },
  { id: 4, label: '网络配置', selected: true, details: { checkPoints: [{ id: 'cp4-1', name: '网络配置策略', requirement: '...', minLength: null, isAuto: false, basis: [] }] } },
  { id: 5, label: '安全管理', selected: false, details: { checkPoints: [{ id: 'cp5-1', name: '安全管理策略', requirement: '...', minLength: null, isAuto: false, basis: [] }] } },
  { id: 6, label: '日志审计', selected: false, details: { checkPoints: [{ id: 'cp6-1', name: '日志审计策略', requirement: '...', minLength: null, isAuto: false, basis: [] }] } },
  { id: 7, label: '违规行为', selected: false, details: { checkPoints: [{ id: 'cp7-1', name: '违规行为策略', requirement: '...', minLength: null, isAuto: false, basis: [] }] } },
  { id: 8, 'label': '恶意代码检查', selected: true, details: { checkPoints: [{ id: 'cp8-1', name: '恶意代码检查策略', requirement: '...', minLength: null, isAuto: false, basis: [] }] } },
]);

// 计算属性：动态计算核查项总数
const totalCheckItems = computed(() => checkItems.value.length);
const selectedCheckItems = computed(() => checkItems.value.filter(item => item.selected).length);

// --- 方法 ---

const goBack = () => {
  router.go(-1);
};

// 新增：打开详情弹窗
const openDetailDialog = (item) => {
  currentDetailItem.value = item;
  isDetailDialogOpen.value = true;
};

// --- 编辑相关方法 (逻辑不变) ---

const openEditDrawer = (item) => {
  editingItem.value = JSON.parse(JSON.stringify(item));
  editDrawerOpen.value = true;
};

const saveChanges = () => {
  if (!editingItem.value) return;
  const index = checkItems.value.findIndex(item => item.id === editingItem.value.id);
  if (index !== -1) {
    checkItems.value[index] = editingItem.value;
  }
  editDrawerOpen.value = false;
  editingItem.value = null;
};

const cancelEdit = () => {
  editDrawerOpen.value = false;
  editingItem.value = null;
};

const addBasis = (checkPoint) => {
  if (!checkPoint.basis) {
    checkPoint.basis = [];
  }
  checkPoint.basis.push({ id: `new_${Date.now()}`, text: '' });
};

const removeBasis = (checkPoint, basisIndex) => {
  checkPoint.basis.splice(basisIndex, 1);
};

const saveAndGoBack = () => {
  console.log('正在保存所有修改...', checkItems.value);
  $q.loading.show({ message: '正在保存...' });
  setTimeout(() => {
    $q.loading.hide();
    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: '保存成功！'
    });
    goBack();
  }, 1000);
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <q-page padding>
      <div class="main-content-area">
        <!-- 顶部操作栏，采用新风格 -->
        <div class="row items-center no-wrap q-mb-md">
          <q-btn unelevated label="返回" @click="goBack" class="action-button" icon="arrow_back" />
          <div class="text-h4 text-weight-bolder q-ml-lg" style="color: #4c6afc;">核查项管理</div>
          <q-icon v-if="isEditMode" name="edit" size="md" class="q-ml-sm" style="color: #4c6afc;" />
          <q-space />
          <q-btn v-if="isEditMode" unelevated label="保存" @click="saveAndGoBack" class="action-button" icon="save"/>
        </div>

        <!-- 信息概览栏，采用新风格 -->
        <q-card class="info-panel q-pa-md q-mb-lg" flat>
          <div class="row items-center justify-between">
            <div class="column q-gutter-y-sm">
              <span class="text-body1">适用对象：主机设备-Linux</span>
              <span class="text-body1">更新时间：2025-07-31 10:50:28</span>
            </div>
            <div class="column items-end q-gutter-y-sm">
              <div class="row items-center q-gutter-x-lg text-body1">
                <span>核查项总数：{{ totalCheckItems }}</span>
                <span><q-badge color="green" rounded class="q-mr-sm"/>已选：{{ selectedCheckItems }} 项</span>
              </div>
            </div>
          </div>
        </q-card>

        <!-- 卡片网格布局 -->
        <div class="row q-col-gutter-lg">
          <div v-for="item in checkItems" :key="item.id" class="col-12 col-sm-6 col-md-4">
            <q-card class="check-item-card" flat>
              <div class="status-badge" :class="item.selected ? 'status-passed' : 'status-unchecked'">
                {{ item.selected ? '已选用' : '未选用' }}
              </div>
              <q-card-section>
                <div class="text-h6 text-weight-bold q-mb-sm row items-center">
                  <q-checkbox v-model="item.selected" dense class="q-mr-sm" :disable="!isEditMode"/>
                  {{ item.label }}
                </div>
                <div class="item-info"><span>核查点数：</span>{{ item.details.checkPoints.length }}</div>
              </q-card-section>
              <q-separator color="rgba(255,255,255,0.1)"/>
              <q-card-actions align="right" class="q-pa-sm q-gutter-x-sm">
                <q-btn flat dense no-caps label="详情" color="light-blue-3" @click="openDetailDialog(item)"/>
                <q-btn v-if="isEditMode" flat dense no-caps label="编辑" color="teal-3" @click="openEditDrawer(item)"/>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
      <!-- 刷新按钮 -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="refresh" color="primary" />
      </q-page-sticky>
    </q-page>

    <!-- 新增：详情弹窗 -->
    <q-dialog v-model="isDetailDialogOpen">
      <q-card v-if="currentDetailItem" style="width: 700px; max-width: 90vw;">
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
                  <div class="text-h6 text-weight-bold">{{ cp.name }} <q-chip v-if="cp.isAuto" dense color="cyan" text-color="white" label="自动核查"/></div>
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

    <!-- 编辑抽屉 (未修改) -->
    <q-drawer v-model="editDrawerOpen" side="right" overlay bordered :width="500" class="bg-white">
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
            <div class="text-caption text-grey-7">核查项 *</div>
            <q-input v-model="editingItem.label" outlined dense class="q-mb-md" />
            <div v-for="(cp) in editingItem.details.checkPoints" :key="cp.id" class="q-mb-lg q-pa-md rounded-borders" style="border: 1px solid #e0e0e0;">
              <div class="text-caption text-grey-7">核查点 *</div>
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

<style scoped>
/* --- 全局和顶部栏样式 --- */
.page-background {
  background-color: #292a2d;
}
.main-content-area {
  padding-top: 20px;
}
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
.info-panel {
  background-color: #333438;
  color: #e0e0e0;
  border-radius: 8px;
}

/* --- 卡片样式 --- */
.check-item-card {
  background-color: #3d4a58;
  color: #e0e0e0;
  border-radius: 12px;
  position: relative;
  border: 1px solid #4f5b68;
}
.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
.status-passed { background-color: #28a745; }
.status-unchecked { background-color: #6c757d; }

.item-info {
  font-size: 0.9rem;
  margin-bottom: 2px;
}
.item-info span {
  color: #aeb8c4;
}

/* --- 详情弹窗内样式 --- */
.basis-item {
  line-height: 1.8;
  margin-bottom: 8px;
}
</style>
