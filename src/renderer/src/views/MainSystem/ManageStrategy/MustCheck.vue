<script setup>
import { ref, computed } from 'vue';
//  useRouter 用于导航, useRoute 用于获取当前路由信息
import { useRouter, useRoute } from 'vue-router';
// 引入 useQuasar 以使用通知和加载插件
import { useQuasar } from 'quasar';

const $q = useQuasar(); // 初始化 Quasar 插件
const router = useRouter();
const route = useRoute(); // 获取当前路由对象

// 控制编辑抽屉的显示/隐藏
const editDrawerOpen = ref(false);

// 判断当前是否为编辑模式 (通过 URL 的 ?mode=edit 参数)
const isEditMode = computed(() => route.query.mode === 'edit');

// 当前选中的核查项ID (用于高亮和内容显示)
const activeCheckItemId = ref(1);

// 用于编辑抽屉的临时数据对象，避免直接修改列表中的原始数据
const editingItem = ref(null);

// 左侧核查项列表数据模型
const checkItems = ref([
  {
    id: 1,
    label: '身份鉴别',
    selected: true,
    details: {
      checkPoints: [ // 将细节拆分为“核查点”数组以支持更复杂的编辑
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

// 计算属性：根据 activeCheckItemId 找到当前激活的核查项的完整信息
const activeCheckItem = computed(() => {
  return checkItems.value.find(item => item.id === activeCheckItemId.value);
});

// 方法：返回上一页
const goBack = () => {
  router.go(-1);
};

// 方法：点击左侧列表项时，更新激活的ID
const selectItem = (itemId) => {
  activeCheckItemId.value = itemId;
};


// --- 编辑相关方法 ---

// 方法：打开编辑抽屉，并深拷贝数据
const openEditDrawer = (item) => {
  editingItem.value = JSON.parse(JSON.stringify(item));
  editDrawerOpen.value = true;
};

// 方法：保存抽屉里的修改，并提供即时反馈
const saveChanges = () => {
  if (!editingItem.value) return;
  const index = checkItems.value.findIndex(item => item.id === editingItem.value.id);
  if (index !== -1) {
    // 1. 用修改后的数据替换掉原始数据
    checkItems.value[index] = editingItem.value;
    // 2. 立即将左侧激活项设置为刚修改的项，让用户看到变化
    activeCheckItemId.value = editingItem.value.id;
  }
  // 3. 关闭抽屉并清空临时编辑数据
  editDrawerOpen.value = false;
  editingItem.value = null;
};

// 方法：取消编辑
const cancelEdit = () => {
  editDrawerOpen.value = false;
  editingItem.value = null;
};

// 方法：在编辑抽屉中新增一个核查依据
const addBasis = (checkPoint) => {
  if (!checkPoint.basis) {
    checkPoint.basis = [];
  }
  checkPoint.basis.push({ id: `new_${Date.now()}`, text: '' });
};

// 方法：在编辑抽屉中删除一个核查依据
const removeBasis = (checkPoint, basisIndex) => {
  checkPoint.basis.splice(basisIndex, 1);
};

// 方法：点击顶部保存按钮，保存所有修改并返回
const saveAndGoBack = () => {
  // 在这里可以添加调用后端API的逻辑来保存 checkItems.value 的数据
  console.log('正在保存所有修改...', checkItems.value);

  $q.loading.show({ message: '正在保存...' });

  // 模拟一个异步保存操作
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
    <!-- 顶部主标题栏 -->
    <q-header elevated class="bg-secondary text-white">
      <!-- 第一个工具栏: 标题、返回和顶部保存按钮 -->
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title class="text-weight-bold">
          234
          <!-- 编辑图标，仅在编辑模式下显示 -->
          <q-icon v-if="isEditMode" name="edit" class="q-ml-xs cursor-pointer" />
        </q-toolbar-title>

        <q-space />
        <!-- 新增的保存按钮，仅在编辑模式下显示 -->
        <q-btn
          v-if="isEditMode"
          label="保存"
          color="primary"
          unelevated
          @click="saveAndGoBack"
        />
      </q-toolbar>

      <!-- 第二个工具栏: 详细信息 -->
      <q-toolbar>
        <div class="row items-center q-gutter-x-xl text-body2">
          <span>适用对象：主机设备-Linux</span>
          <span>更新时间：2025-07-31 10:50:28</span>
          <span>核查项总数：{{ totalCheckItems }}</span>
        </div>
      </q-toolbar>
    </q-header>


    <!-- 主体内容 -->
    <q-page-container>
      <q-page class="main-content row">
        <!-- 左侧核查项列表 -->
        <div class="col-3 left-panel">
          <div class="text-h6 text-grey-8 q-pa-md">核查项</div>
          <q-list separator>
            <q-item
              v-for="item in checkItems"
              :key="item.id"
              clickable
              v-ripple
              :active="activeCheckItemId === item.id"
              @click="selectItem(item.id)"
              class="check-item"
              active-class="active-check-item"
            >
              <q-item-section avatar>
                <q-checkbox v-model="item.selected" dense />
              </q-item-section>
              <q-item-section>{{ item.label }}</q-item-section>

              <!-- 编辑按钮，仅在编辑模式下显示 -->
              <q-item-section side v-if="isEditMode">
                <q-btn
                  flat
                  round
                  dense
                  icon="open_in_new"
                  @click.stop="openEditDrawer(item)"
                  title="编辑此项"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- 右侧详情展示 -->
        <div class="col-9 right-panel q-pa-lg">
          <div v-if="activeCheckItem && activeCheckItem.details">
            <q-card v-for="cp in activeCheckItem.details.checkPoints" :key="cp.id" flat bordered class="q-mb-md">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <q-checkbox :model-value="true" dense class="q-mr-sm"/>
                  <div class="text-h6 text-weight-bold">{{ cp.name }} <span v-if="cp.isAuto">(自动核查)</span></div>
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

                <div class="q-mt-md text-subtitle1"><span class="text-weight-medium">口令最小长度：</span>{{ cp.minLength || '未设置' }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- 编辑抽屉弹窗 -->
    <q-drawer v-model="editDrawerOpen" side="right" overlay bordered :width="500" class="bg-white">
      <div v-if="editingItem" class="column full-height">
        <!-- 抽屉头部 -->
        <q-toolbar class="bg-blue-1 text-primary">
          <q-toolbar-title class="text-weight-bold">编辑</q-toolbar-title>
          <q-btn flat round dense icon="save" @click="saveChanges" color="primary">
            <q-tooltip>保存此项修改</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" @click="cancelEdit" />
        </q-toolbar>

        <!-- 抽屉内容 -->
        <q-scroll-area class="col">
          <div class="q-pa-md">
            <!-- 编辑核查项名称 -->
            <div class="text-caption text-grey-7">核查项 *</div>
            <q-input v-model="editingItem.label" outlined dense class="q-mb-md" />

            <!-- 遍历并编辑所有核查点 -->
            <div v-for="(cp, cpIndex) in editingItem.details.checkPoints" :key="cp.id" class="q-mb-lg q-pa-md rounded-borders" style="border: 1px solid #e0e0e0;">

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
/* 主页面背景 */
.page-background {
  background-color: #f0f2f5;
}

/* 左侧面板 */
.left-panel {
  background-color: #ffffff;
  border-right: 1px solid #dcdcdc;
  /* 自动计算高度，减去 Header 的总高度 */
  height: calc(100vh - (var(--q-header-size)));
  overflow-y: auto;
}

.check-item {
  font-weight: 500;
  color: #333;
}
/* 激活(选中)的列表项样式 */
.active-check-item {
  background-color: #e3f2fd !important;
  color: #1976d2 !important;
  border-left: 4px solid #1976d2;
}

/* 右侧详情面板 */
.right-panel {
  background-color: #f9f9f9;
  height: calc(100vh - (var(--q-header-size)));
  overflow-y: auto;
}
.detail-card {
  background-color: #ffffff;
}
.basis-item {
  line-height: 1.8;
  margin-bottom: 8px;
}
</style>
