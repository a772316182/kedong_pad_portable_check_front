<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 顶部主工具栏 -->
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn unelevated color="primary" icon="arrow_back_ios" label="返回" @click="navigateTo('checkreports')"/>
        <q-toolbar-title class="q-ml-md">
          省调1安全核查总报告
        </q-toolbar-title>
        <q-space />
        <q-btn flat dense icon="fullscreen" />
      </q-toolbar>
    </q-header>

    <!-- 页面主要内容 -->
    <q-page-container>
      <q-page class="q-pa-xl bg-dark-page flex flex-center">
        <q-card flat bordered class="report-card">
          <q-card-section class="text-center">
            <div class="text-h5 q-mb-md">省调1安全核查总报告</div>
          </q-card-section>

          <q-card-section>
            <q-tabs v-model="tab" dense align="justify" class="text-grey-7" active-color="primary" indicator-color="primary">
              <q-tab name="summary" label="汇总报告" />
              <q-tab name="details" label="分项报告查看" />
            </q-tabs>
            <q-separator />
            <q-tab-panels v-model="tab" animated>
              <q-tab-panel name="summary">
                <!-- 汇总信息 -->
                <div class="row q-col-gutter-lg q-my-md">
                  <div class="col-6">
                    <q-list dense separator>
                      <q-item><q-item-section avatar><q-item-label>站点名称</q-item-label></q-item-section><q-item-section>省调1</q-item-section></q-item>
                      <q-item><q-item-section avatar><q-item-label>站点类型</q-item-label></q-item-section><q-item-section>主站</q-item-section></q-item>
                      <q-item><q-item-section avatar><q-item-label>核查数量</q-item-label></q-item-section><q-item-section>主机设备: 1<br/>网络设备: 0</q-item-section></q-item>
                    </q-list>
                  </div>
                  <div class="col-6">
                    <q-list dense separator>
                      <q-item><q-item-section avatar><q-item-label>所属公司</q-item-label></q-item-section><q-item-section>--</q-item-section></q-item>
                      <q-item><q-item-section avatar><q-item-label>概要时间</q-item-label></q-item-section><q-item-section>2025年06月20日 15:25:07</q-item-section></q-item>
                    </q-list>
                  </div>
                </div>
                <!-- 核查概况表格 -->
                <div class="text-subtitle1 q-mb-sm">核查概况</div>
                <q-table :rows="summaryData" :columns="summaryColumns" row-key="name" flat bordered hide-bottom />
              </q-tab-panel>

              <q-tab-panel name="details">
                <!-- 新增：分项报告选择下拉菜单 -->
                <q-select
                  v-model="selectedReport"
                  :options="reportOptions"
                  label="选择分项报告"
                  outlined
                  dense
                  class="q-mb-md"
                  style="max-width: 300px;"
                />
                <!-- 分项报告详情表格 -->
                <div class="text-subtitle1 q-mb-sm">{{ selectedReport }}</div>
                <q-table :rows="filteredAssetDetails" :columns="assetDetailsColumns" row-key="name" flat bordered hide-bottom />
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'

const tab = ref('summary');

const router = useRouter();

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  router.push(path)
}

// 汇总表格数据
const summaryColumns = [
  { name: 'type', label: '设备类型', field: 'type', align: 'left' },
  { name: 'total', label: '核查总数', field: 'total', align: 'center' },
  { name: 'passed', label: '通过数', field: 'passed', align: 'center' },
  { name: 'failed', label: '未通过数', field: 'failed', align: 'center' },
  { name: 'passRate', label: '通过率', field: 'passRate', align: 'center' },
  { name: 'unpassedItems', label: '未通过设备', field: 'unpassedItems', align: 'left' },
];
const summaryData = ref([
  { type: '主机设备', total: 1, passed: 1, failed: 0, passRate: '100%', unpassedItems: '--' }
]);

// --- 分项报告数据 ---

// 所有分项报告的数据源
const allAssetDetails = ref({
  '主机设备报告': [
    { name: '主机-01', ip: '192.168.1.10', type: '主机设备', status: '通过', details: '所有检查项均符合要求' },
    { name: '主机-02', ip: '192.168.1.12', type: '主机设备', status: '通过', details: '所有检查项均符合要求' },
  ],
  '网络设备报告': [
    { name: '交换机-A', ip: '192.168.1.1', type: '网络设备', status: '未通过', details: '端口8080对外开放' },
    { name: '路由器-Main', ip: '192.168.1.254', type: '网络设备', status: '通过', details: '所有检查项均符合要求' },
  ],
  '安全设备报告': [
    { name: '防火墙-FW01', ip: '10.0.0.1', type: '安全设备', status: '通过', details: '策略符合规范' },
  ]
});

// 分项报告表格列定义
const assetDetailsColumns = [
  { name: 'name', label: '资产名称', field: 'name', align: 'left' },
  { name: 'ip', label: 'IP地址', field: 'ip', align: 'left' },
  { name: 'type', label: '设备类型', field: 'type', align: 'left' },
  { name: 'status', label: '核查状态', field: 'status', align: 'center' },
  { name: 'details', label: '详情', field: 'details', align: 'left' },
];

// 下拉菜单的选项
const reportOptions = ref(Object.keys(allAssetDetails.value));
// 当前选中的报告
const selectedReport = ref(reportOptions.value[0]);

// 计算属性，根据下拉菜单的选择动态过滤表格数据
const filteredAssetDetails = computed(() => {
  return selectedReport.value ? allAssetDetails.value[selectedReport.value] : [];
});


</script>

<style lang="sass" scoped>
.bg-dark-header
  background: #272727

.bg-dark-page
  background: #363636

.report-card
  width: 100%
  max-width: 1200px

.q-item__section--avatar
  min-width: 80px
  color: $grey-7
</style>
