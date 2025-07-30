<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-page">
    <q-header elevated class="bg-dark-header text-white">
      <q-toolbar>
        <q-btn label="返回" color="primary" @click="navigateTo('/checkreports')" />
        <q-toolbar-title>
          省调1安全核查总报告
        </q-toolbar-title>
        <q-space />
        <q-btn flat dense label="范围" icon="fullscreen" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md flex flex-center">
        <!-- 使用卡片来模拟报告文档的样式 -->
        <q-card flat class="report-card">
          <q-card-section>
            <div class="text-h5 text-center q-mb-md">省调1安全检查总报告</div>

            <!-- 报告详情表格 -->
            <q-markup-table flat bordered wrap-cells>
              <tbody>
              <tr>
                <td class="text-bold">站点名称</td>
                <td>省调1</td>
                <td class="text-bold">所属公司</td>
                <td>--</td>
              </tr>
              <tr>
                <td class="text-bold">站点类型</td>
                <td>主站</td>
                <td class="text-bold">核查时间</td>
                <td>2025年06月20日 15:25:07</td>
              </tr>
              <tr>
                <td class="text-bold" rowspan="2">核查数量</td>
                <td colspan="3">
                  主机设备：1
                </td>
              </tr>
              <tr>
                <td colspan="3">
                  网络设备：0
                </td>
              </tr>
              </tbody>
            </q-markup-table>

            <div class="text-subtitle1 q-mt-lg q-mb-sm">核查概况</div>

            <q-markup-table flat bordered wrap-cells>
              <thead>
              <tr>
                <th>设备类型</th>
                <th>核查基线</th>
                <th>通过数</th>
                <th>未通过数</th>
                <th>通过率</th>
                <th>未通过设备</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>主机设备</td>
                <td>1</td>
                <td>1</td>
                <td>0</td>
                <td class="text-green">100%</td>
                <td>--</td>
              </tr>
              </tbody>
            </q-markup-table>

          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.bg-dark-page {
  background-color: #2e3c41;
}
.bg-dark-header {
  background-color: #2e3c41;
}
.report-card {
  width: 100%;
  max-width: 900px;
  /* A4 paper aspect ratio */
  aspect-ratio: 1 / 1.414;
}
.q-table td.text-bold {
  font-weight: bold;
  background-color: #f5f5f5;
}
</style>
