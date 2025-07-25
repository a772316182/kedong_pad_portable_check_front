<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// --- Dialogs & State Control ---
const dialogs = reactive({
  assetProbe: false,
  loginlessCheck: false,
  protocolSelection: false,
  httpsConfig: false,
  sshInfo: false,
  loginCheck: false,
  mentionCheck: false,
});

// --- Data Models ---
// Main table data
const assets = ref([
  { id: 1, name: '10.105.71.240', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 2, name: '10.105.71.242', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 3, name: '10.105.71.244', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 4, name: '10.105.71.243', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 5, name: '10.105.71.254', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 6, name: '10.105.71.245', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 7, name: '10.105.71.234', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
  { id: 8, name: '10.105.71.249', type: '未知', feature: '-', port: '无', status: '未核查', zone: '安全二区', selected: false },
]);

// Table columns definition
const columns = [
  { name: 'name', label: '资产名称', field: 'name', align: 'left' },
  { name: 'type', label: '设备类型', field: 'type', align: 'left' },
  { name: 'feature', label: '资产特征识别', field: 'feature', align: 'left' },
  { name: 'port', label: '开启高危端口', field: 'port', align: 'left' },
  { name: 'status', label: '资产状态', field: 'status', align: 'left' },
  { name: 'zone', label: '安全分区', field: 'zone', align: 'left' },
  { name: 'actions', label: '查看详情', align: 'center' },
];

// Dialog form data models
const assetProbeConfig = ref({ ip: '10.105.71.233', subnet: '255.255.255.0', gateway: '', zone: '安全区', rate: '高', range: '' });
const loginlessCheckConfig = ref({ ip: '10.105.71.233', subnet: '255.255.255.0', gateway: '', highRiskScan: true, rate: '高', range: '' });
const loginCheckCredentials = ref([
  { id: 1, ip: '10.105.71.97', port: '', username: '', password: '', authUser: '', authPass: '' }
]);
const httpsConfig = ref({ ip: '10.105.71.233', subnet: '255.255.255.0', gateway: '', port: '28081' });
const sshInfo = ref({ ip: '10.105.71.233', subnet: '255.255.255.0', gateway: '10.105.71.1' });
const deviceType = ref('主机设备');
const goBack = () => router.go(-1);

// --- Methods ---

const toggleSelection = (row) => { row.selected = !row.selected; };
const addNewCredential = () => {
  loginCheckCredentials.value.push({ id: Date.now(), ip: '', port: '', username: '', password: '', authUser: '', authPass: '' });
};

const selectProtocol = (protocol) => {
  dialogs.protocolSelection = false; // 首先关闭协议选择弹窗
  if (protocol === 'https') {
    // 如果选择 https，打开 Https 配置弹窗
    dialogs.httpsConfig = true;
  } else if (protocol === 'ssh') {
    // 如果选择 ssh，打开登录检查（凭据配置）弹窗
    dialogs.loginCheck = true;
  }
};

const confirmLoginCredentials = () => {
  dialogs.loginCheck = false; // 关闭登录检查弹窗
  dialogs.sshInfo = true;     // 打开最终的 IP 信息弹窗
};

const navigateTo = (path) => {
  console.log(`正在跳转到: ${path}`)
  // 使用 router.push 进行页面跳转
  router.push(path)
}

</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <!-- Top Bar -->
    <div class="top-bar row items-center justify-between q-px-md">
      <span>2025-06-20 15:50:24</span>
      <div>
        <q-btn flat dense no-caps class="header-action-btn" icon="o_sync_alt" label="切换"/>
        <q-btn flat dense no-caps class="header-action-btn" icon="o_filter_alt" label="筛选"/>
        <q-btn flat dense no-caps class="header-action-btn" icon="o_bar_chart" label="查看统计图"/>
        <span class="q-ml-md">当前电量: 14% <q-icon name="o_battery_1_bar"/></span>
      </div>
    </div>

    <!-- Main Header -->
    <div class="main-header row items-center q-px-md">
      <div>
        <q-btn class="back-button" unelevated label="上一步" @click="navigateTo('/executeCheck')" />
      </div>
      <div class="text-h4 text-weight-bolder q-ml-lg">正在核查</div>
      <q-space/>
      <span class="text-body1">连接方式: 网络连接</span>
      <q-btn color="primary" label="切换连接" unelevated class="q-ml-md"/>
    </div>

    <q-page class="main-content-area">
      <!-- Info & Main Actions Panel -->
      <q-card class="info-panel q-pa-sm q-mb-md" flat>
        <div class="row items-center justify-between">
          <div>
            <span class="text-body1">当前站点：省调1</span>
            <span class="text-body1 q-ml-lg">资产总数：114</span>
          </div>
          <div class="row items-center q-gutter-x-sm">
            <q-btn class="main-action-btn" unelevated label="资产导出"/>
            <q-btn class="main-action-btn" unelevated label="资产导入"/>
            <q-btn class="main-action-btn" unelevated label="查看拓扑"/>
            <q-btn class="main-action-btn" unelevated label="报告导出"/>
          </div>
        </div>
      </q-card>

      <!-- Sub Actions & Table -->
      <q-card class="table-container" flat>
        <!-- Sub Action Buttons -->
        <div class="sub-actions-bar row items-center q-gutter-x-sm q-pa-md">
          <q-btn class="sub-action-btn" unelevated label="资产探查" @click="dialogs.assetProbe = true"/>
          <q-btn class="sub-action-btn" unelevated label="免登录检查" @click="dialogs.loginlessCheck = true"/>
          <q-btn class="sub-action-btn" unelevated label="登录检查" @click="dialogs.protocolSelection = true"/>
          <q-btn class="sub-action-btn" unelevated label="登录异常"/>
        </div>
        <!-- Assets Table -->
        <q-table
          :rows="assets"
          :columns="columns"
          row-key="id"
          flat
          hide-bottom
          class="assets-table"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn
                :color="props.row.selected ? 'grey-6' : 'primary'"
                :label="props.row.selected ? '取消选定' : '选定'"
                dense unelevated @click="toggleSelection(props.row)"
              />
              <q-btn color="teal" label="资产详情" dense unelevated/>
              <q-btn color="teal" label="核查记录" class="sub-action-btn" unelevated @click="dialogs.mentionCheck=true;"/>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </q-page>

    <!-- === DIALOGS === -->

    <!-- 1. 资产探查配置 Dialog -->
    <q-dialog v-model="dialogs.assetProbe">
      <q-card class="form-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">资产探查配置</div><q-space/><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="form-row"><span class="form-label">本机IP地址:</span><div>{{ assetProbeConfig.ip }}</div><q-space/><q-btn size="sm" color="primary" outline label="历史记录"/></div>
          <div class="form-row"><span class="form-label">子网掩码:</span><div>{{ assetProbeConfig.subnet }}</div></div>
          <div class="form-row"><span class="form-label">网关:</span><q-input dense outlined v-model="assetProbeConfig.gateway" placeholder="请输入网关"/></div>
          <div class="form-row"><span class="form-label">安全分区:</span><q-radio v-model="assetProbeConfig.zone" val="安全区" label="安全区"/><q-radio v-model="assetProbeConfig.zone" val="安全II区" label="安全II区"/></div>
          <div class="form-row"><span class="form-label">资产探查速率:</span><q-radio v-model="assetProbeConfig.rate" val="高" label="高"/><q-radio v-model="assetProbeConfig.rate" val="中" label="中"/><q-radio v-model="assetProbeConfig.rate" val="低" label="低"/></div>
          <div class="form-row"><span class="form-label">起止范围:</span><q-toggle v-model="assetProbeConfig.rangeEnabled" label="启用"/></div>
          <div class="form-row" v-if="assetProbeConfig.rangeEnabled"><span class="form-label">IP范围:</span><q-input class="col" type="textarea" outlined v-model="assetProbeConfig.range" hint="多个分段: 192.168.1.1-192.168.1.254"/></div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md"><q-btn label="确定" color="teal" unelevated style="width:100px"/></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 2. 免登录检查配置 Dialog -->
    <q-dialog v-model="dialogs.loginlessCheck">
      <q-card class="form-dialog">
        <q-card-section class="row items-center"><div class="text-h6">免登录检查配置</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section class="q-pt-none">
          <div class="form-row"><span class="form-label">本机IP地址:</span><div>{{ loginlessCheckConfig.ip }}</div><q-space/><q-btn size="sm" color="primary" outline label="历史记录"/></div>
          <div class="form-row"><span class="form-label">子网掩码:</span><div>{{ loginlessCheckConfig.subnet }}</div></div>
          <div class="form-row"><span class="form-label">网关:</span><q-input dense outlined v-model="loginlessCheckConfig.gateway" placeholder="请输入网关"/></div>
          <div class="form-row"><span class="form-label">高危端口扫描:</span><q-toggle v-model="loginlessCheckConfig.highRiskScan" color="teal"/></div>
          <div class="form-row"><span class="form-label">端口号TCP:</span><div class="text-grey-7 text-caption">21,23,25,109,110,135,139,445,3389</div></div>
          <div class="form-row"><span class="form-label">端口号UDP:</span><div class="text-grey-7 text-caption">67,69,137,138,5353</div></div>
          <div class="form-row"><span class="form-label">指纹特征采集:</span><q-toggle v-model="loginlessCheckConfig.fingerprint" color="teal"/></div>
          <div class="form-row"><span class="form-label">免登录检查速率:</span><q-radio v-model="loginlessCheckConfig.rate" val="高" label="高"/><q-radio v-model="loginlessCheckConfig.rate" val="中" label="中"/><q-radio v-model="loginlessCheckConfig.rate" val="低" label="低"/></div>
          <div class="form-row"><span class="form-label">起止范围:</span><q-toggle v-model="loginlessCheckConfig.rangeEnabled" label="启用"/></div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md"><q-btn label="确定" color="teal" unelevated style="width:100px"/></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 3. 登录检查配置 Dialog -->
    <q-dialog v-model="dialogs.loginCheck" full-width>
      <q-card class="login-check-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">登录账号与密码配置</div><q-space/><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row items-center q-gutter-x-md q-mb-md">
            <q-btn label="批量填充" color="primary" outline/>
            <q-btn label="添加" color="primary" @click="addNewCredential"/>
            <q-select dense outlined v-model="deviceType" :options="['主机设备', '网络设备']" label="设备类型" style="width: 200px" />
          </div>
          <!-- Credentials Table -->
          <div class="cred-table-header row">
            <div class="col-2">资产IP</div><div class="col">端口号</div><div class="col">登录账号</div><div class="col">登录密码</div><div class="col">授权账号</div><div class="col">授权密码</div><div class="col-1">操作</div>
          </div>
          <div v-for="(cred, index) in loginCheckCredentials" :key="cred.id" class="cred-table-row row">
            <div class="col-2">{{ cred.ip }}</div>
            <div class="col"><q-input dense outlined v-model="cred.port" placeholder="请输入..."/></div>
            <div class="col"><q-input dense outlined v-model="cred.username" placeholder="请输入..."/></div>
            <div class="col"><q-input dense outlined type="password" v-model="cred.password" placeholder="请输入..."/></div>
            <div class="col"><q-input dense outlined v-model="cred.authUser" placeholder="请输入..."/></div>
            <div class="col"><q-input dense outlined type="password" v-model="cred.authPass" placeholder="请输入..."/></div>
            <div class="col-1 text-center"><q-btn flat round color="negative" icon="delete" @click="loginCheckCredentials.splice(index, 1)"/></div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md"><q-btn label="确定" color="teal" unelevated style="width:100px" @click="confirmLoginCredentials"/></q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 4. 选定网络协议 Dialog -->
    <q-dialog v-model="dialogs.protocolSelection">
      <q-card style="width: 500px">
        <q-card-section class="row items-center"><div class="text-h6">选定网络协议</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section class="text-center">
          <div class="text-grey-8">已选定：【网络模式】</div>
          <p>请结合待查资产的特征识别结果，选定合适的网络协议开展后续核查。</p>
          <div class="row q-gutter-xl justify-center q-py-md">
            <q-card class="protocol-card" flat bordered clickable @click="selectProtocol('ssh')">
              <q-card-section class="text-center">
                <q-icon name="o_terminal" size="4em" color="blue-8"/>
                <div class="text-subtitle1 text-weight-medium q-mt-sm">ssh协议</div>
              </q-card-section>
            </q-card>
            <q-card class="protocol-card" flat bordered clickable @click="selectProtocol('https')">
              <q-card-section class="text-center">
                <q-icon name="o_https" size="4em" color="green-8"/>
                <div class="text-subtitle1 text-weight-medium q-mt-sm">https协议</div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 5. Https连接配置 Dialog -->
    <q-dialog v-model="dialogs.httpsConfig">
      <q-card class="form-dialog" style="width: 600px">
        <q-card-section class="row items-center"><div class="text-h6">Https连接配置</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section class="q-pt-none">
          <div class="form-row"><span class="form-label">本机IP地址:</span><div>{{ httpsConfig.ip }}</div><q-space/><q-btn size="sm" color="primary" outline label="历史记录"/></div>
          <div class="form-row"><span class="form-label">子网掩码:</span><div>{{ httpsConfig.subnet }}</div></div>
          <div class="form-row"><span class="form-label">网关:</span><q-input dense outlined v-model="httpsConfig.gateway"/></div>
          <div class="form-row"><span class="form-label">Https端口:</span><q-input dense outlined v-model="httpsConfig.port"/></div>
          <div class="q-mt-md text-caption text-grey-7"><q-icon name="info" /> 本机Https服务开启后，待核查设备上通过访问 https://10.105.71.233:28081 下载核查脚本</div>
        </q-card-section>
        <q-card-actions align="center" class="q-gutter-x-lg q-pa-md">
          <q-btn label="关闭" color="grey" style="width: 150px"/>
          <q-btn label="开启HTTPS连接" color="teal" unelevated style="width: 150px" @click="navigateTo('/logincheckinprogress')"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 6. SSH IP信息 Dialog -->
    <q-dialog v-model="dialogs.sshInfo">
      <q-card class="form-dialog" style="width: 500px">
        <q-card-section class="row items-center"><div class="text-h6">IP信息</div><q-space/><q-btn icon="close" flat round dense v-close-popup /></q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-center text-grey-8 q-mb-md">连接方式: ssh协议</div>
          <div class="form-row"><span class="form-label">本地IP:</span><div>{{ sshInfo.ip }}</div></div>
          <div class="form-row"><span class="form-label">子网掩码:</span><div>{{ sshInfo.subnet }}</div></div>
          <div class="form-row"><span class="form-label">网关:</span><q-input dense outlined v-model="sshInfo.gateway"/></div>
        </q-card-section>
        <q-card-actions align="center" class="q-gutter-x-lg q-pa-md">
          <q-btn label="上一步" color="grey" @click="dialogs.sshInfo = false; dialogs.loginCheck = true;"/>
          <q-btn label="确定" color="teal" unelevated @click="navigateTo('/logincheckinprogress')"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.mentionCheck">
      <q-card class="form-dialog">
        <q-card-section class="row items-center">
          <div class="text-h6">提示</div><q-space/><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <p>本设备未在最近一次核查时核查，仅支持查看历史核查记录</p>
        </q-card-section>
        <q-btn  label="退出" color="grey" @click="dialogs.mentionCheck = false;"padding="12px 151px"/>
        <q-btn  label="历史记录" color="green" unelevated @click="navigateTo('/historylog')"padding="12px 151px"/>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<style scoped>
/* Main Layout & Theme */
.page-background { background-color: #2c3a45; }
.top-bar, .main-header { color: white; padding-top: 8px; padding-bottom: 8px; }
.back-button { background-color: #00796b; color: white; border-radius: 6px; }
.header-action-btn { font-size: 0.9rem; }
.main-content-area { padding: 10px 24px 24px; position: relative; top: -8px; }
.info-panel { background-color: #3d4a58; color: #e0e0e0; border-radius: 8px; }
.table-container { border-radius: 8px; overflow: hidden; }

/* Action Buttons */
.main-action-btn, .sub-action-btn {
  background-color: #00796b;
  color: white;
  font-weight: 500;
}
.sub-actions-bar { background-color: #eef1f3; }

/* Table Style */
.assets-table { border-top: 1px solid #e0e0e0; }
:deep(.assets-table thead tr) { background-color: #f5f5f5; }
:deep(.assets-table th) { font-weight: bold; color: #333; }
:deep(.assets-table tbody tr:nth-child(even)) { background-color: #f9f9f9; }

/* Dialog Styles */
.form-dialog { width: 700px; max-width: 90vw; }
.form-row { display: flex; align-items: center; margin-bottom: 16px; min-height: 40px; }
.form-label { width: 150px; font-weight: 500; text-align: right; padding-right: 16px; }

.protocol-card {
  width: 150px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.protocol-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.login-check-dialog { min-width: 80vw; }
.cred-table-header, .cred-table-row {
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 8px;
}
.cred-table-header { font-weight: bold; background-color: #f5f5f5; border-radius: 4px; }
.cred-table-row { border-bottom: 1px solid #eee; }
</style>
