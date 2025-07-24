<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();


// --- State & Control ---
const dialogs = reactive({
  viewEvidence: false,
  selectEvidenceMethod: false,
});
const activeCategory = ref('intrusion_prevention'); // 左侧当前选中的分类
const activeFilterTab = ref('all'); // 顶部当前选中的过滤标签

// 新增：控制主/从视图切换的状态
const isDetailViewActive = ref(false);
const activeDetailItem = ref(null);


// --- Data Models ---
// 左侧分类列表
const categories = ref([
  { id: 'intrusion_prevention', label: '入侵防范', status: null },
  { id: 'identity_auth', label: '身份鉴别', status: 'error' },
  { id: 'access_control', label: '访问控制', status: 'error' },
]);

// 右侧核查项列表
const checkItems = ref([
  // `category` 字段用于关联左侧列表
  { id: 1, category: 'intrusion_prevention', name: '关闭不必要的服务 (自动核查)', status: 'passed', requirement: '应遵循最小安装的原则,主机安装和开启必要的服务，禁止与监控系统无关的应用服务。例如关闭或关闭无关或关闭无关的E-Mail、Web、FTP、telnet、rlogin、NetBIOS、DHCP、SNMPV3以下版本、SMB等服务或功能', evidence: '已取证', basis: '《信息安全技术网络安全等级保护基本要求》8.1.4.3 a)应保证操作系统...', supplementaryNote: '--' },
  { id: 2, category: 'intrusion_prevention', name: '关闭不必要的系统端口 (自动核查)', status: 'passed', requirement: '...', evidence: '已取证', basis: '...', supplementaryNote: '--' },
  { id: 3, category: 'intrusion_prevention', name: '禁止使用TELNET远程管理 (自动核查)', status: 'not_passed', requirement: '要求: 禁止使用TELNET远程管理', evidence: '已取证', basis: '...', supplementaryNote: '--' },
  { id: 4, category: 'intrusion_prevention', name: '关闭多余网络接口 (自动核查)', status: 'to_confirm', requirement: '要求: 禁用或删除多余的网络接口，以免私接网卡进行违规操作。', evidence: '已取证', basis: '...', supplementaryNote: '--' },
  { id: 5, category: 'identity_auth', name: '用户口令应有复杂度要求', status: 'not_passed', requirement: '...', evidence: '已取证', basis: '...', supplementaryNote: '--' },
]);

// --- Computed Properties ---
// 根据分类和过滤标签动态计算要显示的核查项
const filteredItems = computed(() => {
  return checkItems.value.filter(item => {
    const categoryMatch = item.category === activeCategory.value;
    if (activeFilterTab.value === 'all') return categoryMatch;
    // 假设 item.status 的值与 tab 的 name 一致
    const tabName = activeFilterTab.value;
    const itemStatus = item.status;
    return categoryMatch && (tabName === itemStatus || (tabName === 'not_passed' && itemStatus === 'not_passed'));
  });
});

const statusCounts = computed(() => {
  const counts = { all: 0, to_confirm: 0, not_passed: 0, passed: 0, not_applicable: 0 };
  checkItems.value.forEach(item => {
    if(item.category === activeCategory.value) {
      counts.all++;
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    }
  });
  return counts;
});

// --- Methods ---
const goBack = () => router.go(-2);
const getStatusInfo = (status) => {
  const map = {
    passed: { text: '通过', color: 'green-6' },
    not_passed: { text: '未通过', color: 'red-6' },
    to_confirm: { text: '待确认', color: 'orange-6' },
  };
  return map[status] || { text: '未知', color: 'grey' };
};
const openViewEvidenceDialog = () => { dialogs.viewEvidence = true; };
const openSelectEvidenceDialog = () => {
  dialogs.viewEvidence = false;
  dialogs.selectEvidenceMethod = true;
};

// 新增：切换到详情视图的方法
const showDetailView = (item) => {
  activeDetailItem.value = item;
  isDetailViewActive.value = true;
};

// 新增：从详情视图返回列表视图的方法
const hideDetailView = () => {
  isDetailViewActive.value = false;
  activeDetailItem.value = null; // 清理数据
};
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- Top Bar -->
    <div class="top-bar row items-center justify-between q-px-md">
      <span>2025-06-20 15:25:23</span>
      <span>当前电量: 22% <q-icon name="o_battery_2_bar"/></span>
    </div>

    <!-- Main Header -->
    <div class="main-header row items-center q-px-md">
      <q-btn unelevated label="返回" @click="goBack" class="back-button"/>
      <div class="text-h4 text-weight-bolder q-ml-lg">核查结果</div>
    </div>

    <q-page class="main-content-area">
      <!-- Info Panel -->
      <q-card class="info-panel q-pa-md q-mb-md" flat>
        <div class="row items-center justify-between">
          <div class="row items-center q-gutter-x-xl">
            <q-btn flat dense no-caps class="info-btn">10.105.71.97</q-btn>
            <span>核查时间：2025-06-20 15:25:07</span>
            <span>核查策略：必选项检查</span>
            <span>探针厂商：无探针</span>
            <span>执行人：operator</span>
          </div>
          <div class="text-grey-5">已识别1台,未识别0台</div>
        </div>
      </q-card>

      <!-- Main Content Area: Conditionally Rendered -->

      <!-- V-IF: List View (The original two-column layout) -->
      <template v-if="!isDetailViewActive">
        <div class="row q-col-gutter-md">
          <!-- Left Column: Categories -->
          <div class="col-3">
            <q-card class="full-height column no-wrap">
              <q-tabs v-model="activeFilterTab" dense class="text-grey-7" active-color="primary" indicator-color="primary" align="justify">
                <q-tab name="all" :label="`全部 (${statusCounts.all})`" />
                <q-tab name="to_confirm" :label="`待确认 (${statusCounts.to_confirm})`" />
                <q-tab name="not_passed" :label="`未通过 (${statusCounts.not_passed})`" />
                <q-tab name="passed" :label="`已通过 (${statusCounts.passed})`" />
                <q-tab name="not_applicable" :label="`不适用 (${statusCounts.not_applicable})`" />
              </q-tabs>
              <q-separator/>
              <q-list class="col" separator>
                <q-item v-for="cat in categories" :key="cat.id" clickable v-ripple :active="activeCategory === cat.id" @click="activeCategory = cat.id" class="category-item" active-class="active-category-item">
                  <q-item-section>核查项</q-item-section>
                  <q-item-section>{{ cat.label }}</q-item-section>
                  <q-item-section side v-if="cat.status === 'error'">
                    <q-icon name="o_cancel" color="red"/>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-separator/>
              <q-card-actions class="q-pa-md">
                <q-btn label="确认核查结果" color="teal" unelevated class="full-width"/>
              </q-card-actions>
            </q-card>
          </div>

          <!-- Right Column: Check Items List -->
          <div class="col-9">
            <q-card class="full-height">
              <q-list separator>
                <q-item v-for="item in filteredItems" :key="item.id" class="check-item-header">
                  <q-item-section>
                    <div class="text-body1 text-weight-medium">{{ item.name }}</div>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center no-wrap">
                      <span class="q-mr-xl text-weight-medium" :class="`status-${item.status}`">核查结果: {{ getStatusInfo(item.status).text }}</span>
                      <q-btn
                        :label="item.status === 'to_confirm' ? '去确认' : '展开'"
                        :color="item.status === 'to_confirm' ? 'orange' : 'primary'"
                        unelevated dense
                        @click="showDetailView(item)"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
        </div>
      </template>

      <!-- V-ELSE: Detail View (The new single-pane layout) -->
      <template v-else>
        <q-card class="full-height">
          <template v-if="activeDetailItem">
            <!-- Detail View Header -->
            <div class="panel-header">
              <span class="text-h6">{{ activeDetailItem.name }}</span>
              <q-btn flat color="primary" label="返回列表" icon="arrow_back" @click="hideDetailView" />
            </div>

            <!-- Detail View Content -->
            <q-card-section class="detail-section-content">
              <!-- View for 'passed' status -->
              <div v-if="activeDetailItem.status === 'passed'">
                <div class="detail-row"><span class="detail-label">核查要求:</span><span>{{ activeDetailItem.requirement }}</span></div>
                <div class="detail-row"><span class="detail-label">核查结果:</span><span class="status-passed">{{ getStatusInfo(activeDetailItem.status).text }}</span></div>
                <div class="detail-row"><span class="detail-label">取证结果:</span><span>{{ activeDetailItem.evidence }}</span> <q-btn flat dense label="查看" color="primary" @click="openViewEvidenceDialog"/></div>
                <div class="detail-row"><span class="detail-label">备注补充:</span><span>{{ activeDetailItem.supplementaryNote }}</span> <q-btn flat dense label="添加备注" color="primary" class="q-ml-sm"/></div>
                <div class="detail-row"><span class="detail-label">核查依据:</span><span class="text-grey-7">{{ activeDetailItem.basis }}</span></div>
                <div class="row items-center justify-end q-mt-lg">
                  <q-btn color="teal" unelevated label="确认核查结果" @click="openViewEvidenceDialog"/>
                </div>
              </div>

              <!-- View for 'not_passed' status -->
              <div v-if="activeDetailItem.status === 'not_passed'">
                <div class="detail-row"><span class="detail-label">核查要求:</span><span>{{ activeDetailItem.requirement }}</span></div>
                <div class="detail-row"><span class="detail-label">核查结果:</span><span class="status-not_passed">{{ getStatusInfo(activeDetailItem.status).text }}</span></div>
                <div class="detail-row"><span class="detail-label">取证结果:</span><span>{{ activeDetailItem.evidence }}</span> <q-btn flat dense label="查看" color="primary" @click="openViewEvidenceDialog"/></div>
                <div class="detail-row"><span class="detail-label">备注补充:</span><span>{{ activeDetailItem.supplementaryNote }}</span> <q-btn flat dense label="添加备注" color="primary" class="q-ml-sm"/></div>
                <div class="detail-row"><span class="detail-label">加固建议:</span><span>(1) 建议启用...</span></div>
                <div class="row items-center justify-end q-mt-lg">
                  <q-btn color="orange" unelevated label="收起" @click="hideDetailView"/>
                </div>
              </div>

              <!-- View for 'to_confirm' status -->
              <div v-if="activeDetailItem.status === 'to_confirm'">
                <div class="detail-row"><span class="detail-label">核查要求:</span><span>{{ activeDetailItem.requirement }}</span></div>
                <div class="detail-row"><span class="detail-label">核查结果:</span><span class="status-to_confirm">{{ getStatusInfo(activeDetailItem.status).text }}</span></div>
                <div class="detail-row"><span class="detail-label">取证结果:</span><span>{{ activeDetailItem.evidence }}</span><q-btn flat dense label="查看" color="primary" class="q-ml-sm"/></div>
                <div class="detail-row"><span class="detail-label">备注补充:</span><span>--</span> <q-btn flat dense label="添加备注" color="primary" class="q-ml-sm"/></div>
                <div class="row items-center justify-end q-mt-lg">
                  <q-btn color="orange" unelevated label="结果补充"/>
                </div>
              </div>
            </q-card-section>
          </template>
        </q-card>
      </template>
    </q-page>

    <!-- === DIALOGS === -->
    <q-dialog v-model="dialogs.viewEvidence">
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center"><div class="text-h6">查看取证</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section class="q-pt-none">
          <q-card flat bordered class="q-pa-md bg-grey-2">
            <code>
              [root@localhost ~]# cat /etc/hosts<br>
              # This is a comment<br>
              127.0.0.1 localhost
            </code>
          </q-card>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="新增" color="primary" @click="openSelectEvidenceDialog"/>
          <q-btn unelevated label="确定" color="teal" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.selectEvidenceMethod">
      <q-card style="width: 500px;">
        <q-card-section class="row items-center"><div class="text-h6">请选择取证方式</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section class="row items-center justify-center q-gutter-xl q-py-xl">
          <q-card class="evidence-card" flat bordered clickable v-ripple>
            <q-card-section class="text-center">
              <q-icon name="o_photo_camera" size="4em" color="primary"/>
              <div class="text-subtitle1 q-mt-sm">拍照取证</div>
            </q-card-section>
          </q-card>
          <q-card class="evidence-card" flat bordered clickable v-ripple>
            <q-card-section class="text-center">
              <q-icon name="o_usb" size="4em" color="primary"/>
              <div class="text-subtitle1 q-mt-sm">查看U盘</div>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<style scoped>
.page-background { background-color: #313942; }
.top-bar, .main-header { color: white; padding: 8px 16px; }
.back-button { background-color: #00796b; color: white; border-radius: 6px; }
.main-content-area { padding: 10px 24px 24px; position: relative; top: -8px; }
.info-panel { background-color: #3d4a58; color: #e0e0e0; border-radius: 8px; }
.info-btn { color: white; background-color: rgba(255,255,255,0.1); border-radius: 16px; padding: 4px 16px; }

.category-item { font-size: 1rem; color: #333; }
.active-category-item {
  background-color: #00796b !important;
  color: white !important;
}

.check-item-header { padding: 16px; }
.status-passed { color: #2e7d32; }
.status-not_passed { color: #c62828; }
.status-to_confirm { color: #ef6c00; }

.detail-section-content { padding: 24px; }
.detail-row { display: flex; padding: 8px 0; font-size: 0.95rem;}
.detail-label { font-weight: 500; width: 120px; text-align: right; padding-right: 16px; color: #555; flex-shrink: 0; }
.detail-row span:last-child { flex-grow: 1; }

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #eef1f3;
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
  color: #333;
}

.evidence-card {
  width: 150px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.evidence-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
</style>
