<script setup>
// The <script> part remains unchanged as the request was purely about styling.
// All the logic from your original post is preserved here.
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const router = useRouter()

// #region --- 筛选器相关状态与函数 ---
const isFilterDrawerOpen = ref(false)
// #endregion

// #region --- 弹窗状态管理 ---
const dialogs = reactive({
  assetProbe: false,
  loginlessCheck: false,
  loginCheckWizard: false,
  assetMerge: false,
  assetDetail: false,
  editAsset: false,
  importAssets: false,
  exportAssets: false,
  confirmDelete: false,
  siteCheck: false
})
// #endregion

// #region --- Data Models & Configs ---
const assets = ref([
  {
    id: 1,
    name: '192.168.1.101',
    type: '主机设备',
    feature: 'Microsoft Windows 10 专业版',
    port: '无',
    status: '未核查',
    zone: '安全区I',
    selected: false,
    mac: '0C-9A-3C-FA-FA-D4',
    commissioningDate: '2024-01-15',
    vendor: 'Microsoft',
    model: 'Virtual Machine',
    discoveryStatus: '存活',
    systemVersion: '10.0.19042',
    assetName: 'DESKTOP-KMPG2RJ'
  },
  {
    id: 2,
    name: '10.1.1.10',
    type: '主机设备',
    feature: 'Linux 5.4',
    port: '无',
    status: '通过',
    zone: '安全区II',
    selected: false,
    mac: '00:0c:29:98:1e:cb',
    commissioningDate: '2023-11-20',
    vendor: 'Linux',
    model: 'Generic',
    discoveryStatus: '存活',
    systemVersion: '5.4',
    assetName: 'Linx'
  },
  {
    id: 3,
    name: '10.105.71.244',
    type: '未知',
    feature: '-',
    port: '无',
    status: '未核查',
    zone: '安全二区',
    selected: false,
    mac: '0A:1B:2C:3D:4E:03',
    commissioningDate: '2024-03-10',
    vendor: 'Dell',
    model: 'PowerEdge R740',
    discoveryStatus: '存活',
    systemVersion: '-',
    assetName: 'DELL-SERVER'
  }
])

const loginlessCheckConfig = reactive({
  localIp: '10.105.71.233',
  subnetMask: '255.255.255.0',
  gateway: '',
  highRiskPortScan: true,
  tcpPorts: '21,23,25,109,110,135,139,445,3389',
  udpPorts: '53,67,69,137,138,5353',
  fingerprintCollection: false,
  checkSpeed: 'medium',
  useRange: false,
  startIp: '',
  endIp: ''
})

const columns = [
  { name: 'name', label: '资产IP', field: 'name', align: 'left', sortable: true },
  { name: 'discoveryStatus', label: '探查状态', field: 'discoveryStatus', align: 'center' },
  { name: 'type', label: '设备类型', field: 'type', align: 'left', sortable: true },
  { name: 'feature', label: '资产特征识别', field: 'feature', align: 'left' },
  { name: 'port', label: '开启高危端口', field: 'port', align: 'left' },
  { name: 'status', label: '资产状态', field: 'status', align: 'left', sortable: true },
  { name: 'zone', label: '安全分区', field: 'zone', align: 'left', sortable: true },
  { name: 'actions', label: '操作', align: 'center', style: 'width: 350px' }
]

const pagination = ref({
  rowsPerPage: 0
})
// #endregion

// #region --- 登录检查相关状态与函数 (重构为向导模式) ---
const wizardStep = ref(1)
const connectionType = ref(null) // network, usb, serial
const networkProtocol = ref(null) // ssh, http
const loginCredentials = ref([])

const loginWizardCardStyle = computed(() => {
  if (wizardStep.value === 3 && networkProtocol.value === 'ssh') {
    return { width: '95vw', maxWidth: '2200px', height: '90vh' } // SSH style
  }
  if (wizardStep.value === 3 && networkProtocol.value === 'http') {
    return { width: '1000px' } // HTTP style
  }
  // Default style for steps 1 and 2
  return { width: '800px' }
})

const startLoginCheckWizard = () => {
  wizardStep.value = 1
  connectionType.value = null
  networkProtocol.value = null
  dialogs.loginCheckWizard = true
}

const wizardNext = () => {
  if (wizardStep.value === 1) {
    if (!connectionType.value) {
      $q.notify({ type: 'negative', message: '请选择一种连接方式！' })
      return
    }
    wizardStep.value++
  } else if (wizardStep.value === 2) {
    if (connectionType.value === 'network') {
      if (!networkProtocol.value) {
        $q.notify({ type: 'negative', message: '请选择网络协议！' })
        return
      }

      if (networkProtocol.value === 'ssh') {
        const selectedAssets = assets.value.filter((a) => a.selected)
        if (selectedAssets.length === 0) {
          $q.notify({ type: 'negative', message: '请在主列表中至少选择一个资产进行登录检查！' })
          return
        }
        const getDefaultPort = (protocol) => (protocol === 'ssh' ? '22' : '')
        loginCredentials.value = selectedAssets.map((asset) => ({
          id: asset.id,
          ip: asset.name,
          assetType: asset.type,
          port: getDefaultPort(networkProtocol.value),
          username: '',
          password: '',
          privilegeUsername: '',
          privilegePassword: ''
        }))
      }
      wizardStep.value++
    } else {
      $q.notify({ type: 'info', message: '该功能待实现' })
    }
  }
}

const wizardBack = () => {
  if (wizardStep.value > 1) {
    wizardStep.value--
  }
}

const removeCredentialRow = (index) => {
  loginCredentials.value.splice(index, 1)
}

const applySameAsAbove = (index) => {
  if (index > 0) {
    const prev = loginCredentials.value[index - 1]
    loginCredentials.value[index] = {
      ...loginCredentials.value[index],
      ...prev,
      id: loginCredentials.value[index].id,
      ip: loginCredentials.value[index].ip
    }
  }
}

const confirmCredentials = () => {
  console.log('最终凭据信息:', JSON.parse(JSON.stringify(loginCredentials.value)))
  $q.notify({ type: 'positive', message: '登录检查任务已开始' })
  dialogs.loginCheckWizard = false
  navigateTo('/logincheckinprogress')
}

const closeWizard = () => {
  dialogs.loginCheckWizard = false
}
// #endregion

// #region --- 资产添加与编辑 ---
const selectedAsset = ref(null)
const assetToDeleteId = ref(null)
const assetTypes = [
  '未知',
  '主机设备',
  '网络设备',
  '安防设备',
  '间隔层设备',
  '疑似间隔层设备',
  '其他'
]

const openAddAssetDialog = () => {
  selectedAsset.value = {
    name: '',
    type: '未知',
    commissioningDate: '',
    feature: '',
    vendor: '',
    model: '',
    assetName: ''
  }
  dialogs.editAsset = true
}

const openEditAssetDialog = (asset) => {
  selectedAsset.value = { ...asset }
  dialogs.editAsset = true
}

const saveAsset = () => {
  if (!selectedAsset.value.name) {
    $q.notify({ type: 'negative', message: '资产IP不能为空！' })
    return
  }
  if (selectedAsset.value.id) {
    const index = assets.value.findIndex((a) => a.id === selectedAsset.value.id)
    if (index !== -1) {
      assets.value[index] = { ...assets.value[index], ...selectedAsset.value }
      $q.notify({ type: 'positive', message: '资产更新成功' })
    }
  } else {
    const newAsset = {
      ...selectedAsset.value,
      id: Date.now(),
      port: '无',
      status: '未核查',
      zone: '未知',
      selected: false,
      discoveryStatus: '存活',
      mac: 'N/A'
    }
    assets.value.unshift(newAsset)
    $q.notify({ type: 'positive', message: '资产添加成功' })
  }
  dialogs.editAsset = false
}

const deleteAsset = (id) => {
  assetToDeleteId.value = id
  dialogs.confirmDelete = true
}

const confirmDeleteAsset = () => {
  if (assetToDeleteId.value) {
    const index = assets.value.findIndex((a) => a.id === assetToDeleteId.value)
    if (index !== -1) {
      assets.value.splice(index, 1)
      $q.notify({ type: 'positive', message: '账外资产已删除' })
    }
  }
  dialogs.confirmDelete = false
  assetToDeleteId.value = null
}
// #endregion

// #region --- 资产合并 ---
const assetsToMerge = ref([])
const mergedAsset = ref({})
const mergeConflictFields = [
  { label: '设备IP', key: 'name' },
  { label: '设备MAC', key: 'mac' },
  { label: '设备类型', key: 'type' },
  { label: '所属分区', key: 'zone' },
  { label: '操作系统', key: 'feature' },
  { label: '系统版本', key: 'systemVersion' },
  { label: '厂商信息', key: 'vendor' },
  { label: '设备型号', key: 'model' }
]

const openMergeDialog = () => {
  const selected = assets.value.filter((a) => a.selected)
  if (selected.length < 2) {
    $q.notify({ type: 'warning', message: '请至少选择两个资产进行合并！' })
    return
  }
  assetsToMerge.value = selected.map((a) => ({ ...a }))
  mergedAsset.value = { ...selected[0] }
  dialogs.assetMerge = true
}

const getUniqueValuesForField = (key) => {
  if (!assetsToMerge.value || assetsToMerge.value.length === 0) return []
  const values = new Set(
    assetsToMerge.value.map((asset) => asset[key]).filter((val) => val != null && val !== '')
  )
  return Array.from(values)
}

const confirmMerge = () => {
  const primaryId = mergedAsset.value.id
  const primaryIndex = assets.value.findIndex((a) => a.id === primaryId)

  if (primaryIndex === -1) {
    $q.notify({ type: 'negative', message: '合并失败：找不到基准资产。' })
    return
  }

  const allMergedIds = new Set(assetsToMerge.value.map((a) => a.id))
  const idsToDelete = [...allMergedIds].filter((id) => id !== primaryId)

  assets.value[primaryIndex] = { ...mergedAsset.value, selected: false }

  assets.value = assets.value.filter((asset) => !idsToDelete.includes(asset.id))

  dialogs.assetMerge = false
  assetsToMerge.value = []
  mergedAsset.value = {}
  $q.notify({ type: 'positive', message: '资产合并成功！' })
}
// #endregion

// #region --- 资产探查与标记 ---
const probeAndTagAssets = () => {
  $q.notify({ type: 'info', message: '正在模拟探查并标记资产...' })
  const liveScanResults = [
    { ip: '192.168.1.101', mac: '0C-9A-3C-FA-FA-D4' },
    { ip: '10.1.1.10', mac: '00:0c:29:98:1e:cb' },
    { ip: '10.105.71.99', mac: 'AA:BB:CC:DD:EE:FF' } // 账外资产
  ]

  const liveIps = new Set(liveScanResults.map((r) => r.ip))
  const assetIps = new Set(assets.value.map((a) => a.name))

  assets.value.forEach((asset) => {
    asset.discoveryStatus = liveIps.has(asset.name) ? '存活' : '不存活'
  })

  liveScanResults.forEach((scanResult) => {
    if (!assetIps.has(scanResult.ip)) {
      assets.value.push({
        id: Date.now() + Math.random(),
        name: scanResult.ip,
        type: '未知',
        feature: '探查发现',
        port: '待检测',
        status: '未核查',
        zone: '未知',
        selected: false,
        mac: scanResult.mac,
        commissioningDate: new Date().toISOString().slice(0, 10),
        vendor: '未知',
        model: '未知',
        discoveryStatus: '账外资产',
        assetName: '未知名称'
      })
    }
  })

  $q.notify({ type: 'positive', message: '资产标记完成！' })
}
// #endregion

// #region --- 资产导入 ---
const importFile = ref(null)
const importPreviewData = ref([])
const importPreviewColumns = ref([])
const templateHeaders = [
  '资产名称',
  '资产类型',
  '资产IP地址',
  '资产MAC地址',
  '资产投运日期',
  '操作系统发行版本',
  '设备品牌',
  '设备型号',
  '登录账号',
  '登录密码',
  '提权账号',
  '提权密码'
]
const importTemplateUrl = '/path-to-template/asset_import_template.xlsx'

const openImportDialog = () => {
  importFile.value = null
  importPreviewData.value = []
  importPreviewColumns.value = []
  dialogs.importAssets = true
}

const handleFileSelect = (file) => {
  if (!file) {
    importPreviewData.value = []
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length < 2) {
        throw new Error('Excel文件为空或没有数据行。')
      }

      const headers = jsonData[0].map((h) => h.trim())
      if (headers.indexOf('资产IP地址') === -1) {
        throw new Error('模板格式错误，未找到“资产IP地址”列。请下载标准模板。')
      }

      importPreviewColumns.value = templateHeaders.map((h) => ({
        name: h,
        label: h,
        field: h,
        align: 'left'
      }))

      const parsedData = jsonData.slice(1).map((row, rowIndex) => {
        const rowData = {}
        headers.forEach((header, colIndex) => {
          if (templateHeaders.includes(header)) {
            rowData[header] = row[colIndex]
          }
        })
        if (!rowData['资产IP地址']) {
          throw new Error(`数据错误：第 ${rowIndex + 2} 行的“资产IP地址”不能为空。`)
        }
        return rowData
      })
      importPreviewData.value = parsedData
      $q.notify({
        type: 'positive',
        message: `文件解析成功，预览 ${parsedData.length} 条待导入数据。`
      })
    } catch (error) {
      $q.notify({ type: 'negative', message: `导入失败：${error.message}`, position: 'top' })
      importFile.value = null
      importPreviewData.value = []
      importPreviewColumns.value = []
    }
  }
  reader.onerror = () => {
    $q.notify({ type: 'negative', message: '文件读取失败，请检查文件是否损坏或浏览器权限。' })
  }
  reader.readAsArrayBuffer(file)
}

const confirmImport = () => {
  if (importPreviewData.value.length === 0) {
    $q.notify({ type: 'warning', message: '没有可导入的数据' })
    return
  }

  const existingAssetsMap = new Map(assets.value.map((asset) => [asset.name, asset]))
  let newCount = 0
  let updatedCount = 0
  const newAssets = []

  importPreviewData.value.forEach((item) => {
    const ip = item['资产IP地址']
    const existingAsset = existingAssetsMap.get(ip)

    if (existingAsset) {
      existingAsset.type = item['资产类型'] || existingAsset.type
      existingAsset.feature = item['操作系统发行版本'] || existingAsset.feature
      existingAsset.mac = item['资产MAC地址'] || existingAsset.mac
      existingAsset.commissioningDate = item['资产投运日期'] || existingAsset.commissioningDate
      existingAsset.vendor = item['设备品牌'] || existingAsset.vendor
      existingAsset.model = item['设备型号'] || existingAsset.model
      updatedCount++
    } else {
      newAssets.push({
        id: Date.now() + Math.random(),
        name: ip,
        type: item['资产类型'] || '未知',
        feature: item['操作系统发行版本'] || '-',
        port: '无',
        status: '未核查',
        zone: item['安全分区情况'] || '未知',
        selected: false,
        mac: item['资产MAC地址'] || 'N/A',
        commissioningDate: item['资产投运日期'] || 'N/A',
        vendor: item['设备品牌'] || 'N/A',
        model: item['设备型号'] || 'N/A',
        discoveryStatus: '存活'
      })
      newCount++
    }
  })

  if (newAssets.length > 0) {
    assets.value.unshift(...newAssets)
  }

  $q.notify({
    type: 'positive',
    message: `导入完成！新增 ${newCount} 条资产，更新 ${updatedCount} 条资产。`,
    position: 'top'
  })

  dialogs.importAssets = false
}
// #endregion

// #region --- 资产导出 ---
const exportableAssets = computed(() => {
  const selected = assets.value.filter((a) => a.selected)
  return selected.length > 0 ? selected : assets.value
})

const exportPreviewDisplayColumns = computed(() => columns.filter((c) => c.name !== 'actions'))

const exportFileColumns = [
  { label: '资产名称', field: 'assetName' },
  { label: '资产IP', field: 'name' },
  { label: '资产类型', field: 'type' },
  { label: '资产MAC地址', field: 'mac' },
  { label: '安全分区情况', field: 'zone' },
  { label: '资产投运日期', field: 'commissioningDate' },
  { label: '操作系统发行版本', field: 'feature' },
  { label: '设备品牌', field: 'vendor' },
  { label: '设备型号', field: 'model' },
  { label: '探查状态', field: 'discoveryStatus' }
]

const openExportDialog = () => {
  dialogs.exportAssets = true
}

const confirmExport = () => {
  const dataToExport = exportableAssets.value.map((asset) => {
    const row = {}
    exportFileColumns.forEach((col) => {
      row[col.label] = asset[col.field] || 'N/A'
    })
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(dataToExport)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '资产台账')

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')
  XLSX.writeFile(workbook, `资产导出台账_${timestamp}.xlsx`)

  dialogs.exportAssets = false
  $q.notify({ type: 'positive', message: '资产台账已开始导出...' })
}
// #endregion

// #region --- 其他函数 ---
const autoCheckTasks = ref(null)
const manualCheckTasks = ref([])
onMounted(() => {
  const storedData = sessionStorage.getItem('selectedQualifications')
  if (storedData) {
    try {
      const qualifications = JSON.parse(storedData)
      autoCheckTasks.value = qualifications.auto || []
      manualCheckTasks.value = qualifications.manual || []
    } catch (e) {
      console.error('解析 sessionStorage 数据失败:', e)
      autoCheckTasks.value = []
      manualCheckTasks.value = []
    }
  } else {
    autoCheckTasks.value = ['免登录检查', '登录检查', '告警对点', '安防策略检查']
    console.warn('未在 sessionStorage 中找到审查方式，显示所有默认按钮用于演示。')
  }
})

const openSiteCheckDialog = () => {
  dialogs.siteCheck = true
}

const toggleSelection = (row) => {
  row.selected = !row.selected
}

const navigateTo = (path) => {
  router.push(path)
}

const startLoginlessCheck = () => {
  $q.notify({
    type: 'positive',
    message: '免登录检查任务已开始',
    caption: '配置已保存'
  })
  dialogs.loginlessCheck = false
}
// #endregion
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="page-background">
    <div class="main-header row items-center q-px-md">
      <div>
        <q-btn
          color="primary"
          unelevated
          label="上一步"
          class="back-button"
          @click="navigateTo('/executeCheck')"
        />
      </div>
      <q-space />
      <div class="text-h3 text-weight-bolder">正在核查</div>
      <q-space />
    </div>

    <q-page class="main-content-area">
      <q-card class="info-panel q-pa-md q-mb-md" flat>
        <div class="row items-center justify-between">
          <div class="row items-center q-gutter-x-md">
            <q-btn
              color="primary"
              unelevated
              label="资产添加"
              class="main-action-btn"
              @click="openAddAssetDialog"
            />
            <q-btn
              color="primary"
              unelevated
              label="资产导入"
              class="main-action-btn"
              @click="openImportDialog"
            />
            <q-btn
              color="primary"
              unelevated
              label="资产导出"
              class="main-action-btn"
              @click="openExportDialog"
            />
            <q-btn
              color="primary"
              unelevated
              label="探查并标记资产"
              class="sub-action-btn"
              @click="probeAndTagAssets"
            />
            <q-btn
              color="primary"
              unelevated
              label="资产合并"
              class="main-action-btn"
              @click="openMergeDialog"
            />
          </div>
          <div class="info-panel-text">
            <span>当前站点：省调1</span>
            <span class="q-ml-xl">资产总数：{{ assets.length }}</span>
          </div>
        </div>
      </q-card>

      <q-card class="table-container" flat>
        <div class="sub-actions-bar row items-center q-gutter-x-md q-pa-md">
          <q-btn
            v-if="autoCheckTasks && autoCheckTasks.includes('免登录检查')"
            color="primary"
            unelevated
            label="免登录检查"
            class="sub-action-btn"
            @click="dialogs.loginlessCheck = true"
          />
          <q-btn
            v-if="autoCheckTasks && autoCheckTasks.includes('登录检查')"
            color="primary"
            unelevated
            label="登录检查"
            class="sub-action-btn"
            @click="startLoginCheckWizard"
          />
          <q-btn
            v-if="manualCheckTasks && manualCheckTasks.length > 0"
            color="primary"
            unelevated
            label="站点检查"
            class="sub-action-btn"
            @click="openSiteCheckDialog"
          />
          <q-btn
            v-if="autoCheckTasks && autoCheckTasks.includes('告警对点')"
            color="primary"
            unelevated
            label="告警对点"
            class="sub-action-btn"
            @click="startLoginCheckWizard"
          />
          <q-btn
            v-if="autoCheckTasks && autoCheckTasks.includes('安防策略检查')"
            color="primary"
            unelevated
            label="安防策略检查"
            class="sub-action-btn"
            @click="startLoginCheckWizard"
          />

          <div
            v-if="manualCheckTasks.length > 0"
            class="manual-check-info text-white q-ml-md row items-center"
          >
            <q-icon name="person_search" size="md" class="q-mr-sm" />
            <span class="text-weight-medium">待人工核查: {{ manualCheckTasks.join('、') }}</span>
          </div>

          <q-space />

          <q-btn color="primary" unelevated label="查看拓扑" class="main-action-btn" />
          <q-btn
            color="primary"
            unelevated
            label="报告生成"
            class="main-action-btn"
            @click="navigateTo('/checkreports')"
          />
        </div>

        <q-table
          :rows="assets"
          :columns="columns"
          row-key="id"
          flat
          hide-bottom
          class="assets-table"
          :pagination="pagination"
        >
          <template #body-cell-discoveryStatus="props">
            <q-td :props="props">
              <q-badge
                :color="
                  {
                    存活: 'positive',
                    不存活: 'grey-7',
                    账外资产: 'warning'
                  }[props.value]
                "
              >
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn
                :color="props.row.selected ? 'red-4' : 'primary'"
                :label="props.row.selected ? '取消选定' : '选定'"
                dense
                unelevated
                @click="toggleSelection(props.row)"
              />
              <q-btn
                color="primary"
                label="编辑"
                dense
                unelevated
                @click="openEditAssetDialog(props.row)"
              />
              <q-btn
                v-if="props.row.discoveryStatus === '账外资产'"
                color="negative"
                label="删除"
                dense
                unelevated
                @click="deleteAsset(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </q-page>

    <q-drawer
      v-model="isFilterDrawerOpen"
      side="right"
      bordered
      :width="400"
      class="filter-drawer"
    ></q-drawer>

    <!-- Dialogs -->
    <q-dialog v-model="dialogs.siteCheck">
      <q-card class="dialog-card" style="width: 600px; max-width: 90vw">
        <q-card-section class="row items-center dialog-header">
          <div class="text-h6">人工核查项目</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <p class="text-grey-5">根据您的选择，需要执行以下人工核查：</p>
          <q-list bordered separator dark>
            <q-item v-for="(task, index) in manualCheckTasks" :key="index">
              <q-item-section avatar>
                <q-icon color="primary" name="checklist" />
              </q-item-section>
              <q-item-section class="text-h6">{{ task }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right" class="dialog-header q-pa-md">
          <q-btn
            v-close-popup
            label="确定"
            color="primary"
            flat
            @click="navigateTo('/manchecking')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.assetMerge" persistent>
      <q-card class="dialog-card" style="width: 1000px; max-width: 90vw">
        <q-card-section class="row items-center dialog-header">
          <div class="text-h5">资产合并</div>
          <q-space /><q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>
        <q-card-section v-if="assetsToMerge.length >= 2 && mergedAsset" class="q-pa-xl">
          <div class="q-mb-lg">
            <div class="text-grey-5 q-mb-xs">1. 从待合并资产中选择一个作为合并的基础。</div>
            <q-select
              dark
              dense
              filled
              :model-value="mergedAsset.id"
              :options="assetsToMerge"
              :option-label="(opt) => `${opt.assetName || '未命名资产'} (${opt.name})`"
              option-value="id"
              label="合并基准资产"
              emit-value
              map-options
              @update:model-value="
                (newId) => (mergedAsset = { ...assetsToMerge.find((a) => a.id === newId) })
              "
            />
          </div>
          <q-separator dark class="q-my-xl" />
          <div class="text-grey-5 q-mb-lg">2. 审核并选择每个属性的最终值。</div>
          <div
            v-for="field in mergeConflictFields"
            :key="field.key"
            class="row items-center q-mb-md merge-row"
          >
            <div class="col-3 text-grey-3 text-right q-pr-md" style="font-size: 1.2rem">
              {{ field.label }}:
            </div>
            <div class="col-9">
              <q-select
                v-model="mergedAsset[field.key]"
                dark
                dense
                filled
                :options="getUniqueValuesForField(field.key)"
                label="选择最终值"
                clearable
              >
                <template
                  v-if="
                    !getUniqueValuesForField(field.key) ||
                    getUniqueValuesForField(field.key).length === 0
                  "
                  #no-option
                  ><q-item
                    ><q-item-section class="text-grey">无可用选项或数据为空</q-item-section></q-item
                  ></template
                >
              </q-select>
            </div>
          </div>
        </q-card-section>
        <q-separator dark /><q-card-actions
          align="center"
          class="dialog-header q-pa-md q-gutter-md"
        >
          <q-btn v-close-popup label="取消合并" flat color="white" style="min-width: 120px" /><q-btn
            label="确认合并"
            color="primary"
            unelevated
            style="min-width: 120px"
            @click="confirmMerge"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.confirmDelete" persistent>
      <q-card class="dialog-card">
        <q-card-section class="row items-center"
          ><div class="text-h6">确认删除</div>
          <q-space /><q-btn v-close-popup icon="close" flat round dense
        /></q-card-section>
        <q-card-section>您确定要删除此账外资产吗？此操作不可撤销。</q-card-section>
        <q-card-actions align="right" class="dialog-header q-pa-md">
          <q-btn v-close-popup label="取消" flat color="white" /><q-btn
            label="确认删除"
            color="negative"
            unelevated
            @click="confirmDeleteAsset"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.editAsset" persistent>
      <q-card class="form-dialog dialog-card" style="width: 800px; max-width: 90vw">
        <q-card-section class="row items-center"
          ><div class="text-h5">
            {{ selectedAsset && selectedAsset.id ? '编辑资产' : '添加资产' }}
          </div>
          <q-space /><q-btn v-close-popup icon="close" flat round dense
        /></q-card-section>
        <q-card-section v-if="selectedAsset" class="q-pt-none">
          <div class="form-row">
            <span class="form-label">资产IP:</span
            ><q-input
              v-model="selectedAsset.name"
              dark
              color="primary"
              dense
              outlined
              placeholder="请输入IP地址"
              class="col"
            />
          </div>
          <div class="form-row">
            <span class="form-label">资产名称:</span
            ><q-input
              v-model="selectedAsset.assetName"
              dark
              color="primary"
              dense
              outlined
              placeholder="例如：DESKTOP-KMPG2RJ"
              class="col"
            />
          </div>
          <div class="form-row">
            <span class="form-label">资产类型:</span
            ><q-select
              v-model="selectedAsset.type"
              dark
              color="primary"
              dense
              outlined
              :options="assetTypes"
              class="col"
            />
          </div>
          <div class="form-row">
            <span class="form-label">资产投运日期:</span
            ><q-input
              v-model="selectedAsset.commissioningDate"
              dark
              color="primary"
              dense
              outlined
              placeholder="YYYY-MM-DD"
              class="col"
            >
              <template #append
                ><q-icon name="event" class="cursor-pointer"
                  ><q-popup-proxy cover transition-show="scale" transition-hide="scale"
                    ><q-date v-model="selectedAsset.commissioningDate" mask="YYYY-MM-DD" dark
                      ><div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="关闭"
                          color="primary"
                          flat
                        /></div></q-date></q-popup-proxy></q-icon
              ></template>
            </q-input>
          </div>
          <div class="form-row">
            <span class="form-label">操作系统版本:</span
            ><q-input
              v-model="selectedAsset.feature"
              dark
              color="primary"
              dense
              outlined
              placeholder="例如：Windows Server 2019"
              class="col"
            />
          </div>
          <div class="form-row">
            <span class="form-label">设备品牌:</span
            ><q-input
              v-model="selectedAsset.vendor"
              dark
              color="primary"
              dense
              outlined
              class="col"
            />
          </div>
          <div class="form-row">
            <span class="form-label">设备型号:</span
            ><q-input
              v-model="selectedAsset.model"
              dark
              color="primary"
              dense
              outlined
              class="col"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="dialog-header q-pa-md"
          ><q-btn v-close-popup label="取消" flat color="white" /><q-btn
            label="保存"
            color="primary"
            unelevated
            style="min-width: 120px"
            @click="saveAsset"
        /></q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.importAssets" persistent @hide="importFile = null">
      <q-card
        class="dialog-card"
        style="width: 90vw; max-width: 1200px; height: 90vh; display: flex; flex-direction: column"
      >
        <q-card-section class="row items-center dialog-header"
          ><div class="text-h5">资产导入</div>
          <q-space /><q-btn v-close-popup icon="close" flat round dense
        /></q-card-section>
        <q-card-section class="col-auto">
          <div class="row items-center q-gutter-md">
            <q-file
              v-model="importFile"
              label="点击选择 Excel 文件"
              dark
              outlined
              dense
              accept=".xlsx, .xls"
              class="text-h5 col-auto"
              style="min-width: 300px"
              @update:model-value="handleFileSelect"
            >
              <template #prepend><q-icon name="attach_file" /></template
              ><template v-if="importFile" #after
                ><q-btn
                  round
                  dense
                  flat
                  icon="cancel"
                  @click.stop.prevent="
                    () => {
                      importFile = null
                      importPreviewData = []
                    }
                  "
              /></template>
            </q-file>
            <q-btn
              color="primary"
              unelevated
              no-caps
              icon="download"
              label="下载导入模板"
              :disable="true"
              title="模板功能待实现"
              @click="navigateTo(importTemplateUrl)"
            />
            <q-space />
            <div class="text-grey-5 text-h5">
              * 请确保使用模板文件进行导入，且“资产IP地址”为必填项。
            </div>
          </div>
        </q-card-section>
        <q-card-section class="col" style="overflow: auto">
          <div v-if="importPreviewData.length > 0" class="text-h6 q-mb-sm text-weight-regular">
            导入数据预览 ({{ importPreviewData.length }} 条)
          </div>
          <q-table
            v-if="importPreviewData.length > 0"
            :rows="importPreviewData"
            :columns="importPreviewColumns"
            row-key="资产IP地址"
            dark
            dense
            flat
            bordered
            class="preview-table"
            style="height: 100%"
          ></q-table>
          <div v-else class="text-center text-grey-6 full-height flex flex-center">
            <q-icon name="cloud_upload" size="xl" /><span class="q-ml-md text-h5"
              >请先选择文件以预览</span
            >
          </div>
        </q-card-section>
        <q-separator dark /><q-card-actions align="right" class="q-pa-md dialog-header"
          ><q-btn v-close-popup label="取消" flat color="white" /><q-btn
            label="确认导入"
            color="primary"
            unelevated
            :disable="importPreviewData.length === 0"
            style="min-width: 120px"
            @click="confirmImport"
        /></q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.exportAssets" persistent>
      <q-card
        class="dialog-card"
        style="width: 90vw; max-width: 1600px; height: 90vh; display: flex; flex-direction: column"
      >
        <q-card-section class="row items-center dialog-header"
          ><div class="text-h5">资产导出</div>
          <q-space /><q-btn v-close-popup icon="close" flat round dense
        /></q-card-section>
        <q-card-section class="col-auto">
          <div class="text-h6 text-weight-regular">
            导出数据预览 ({{ exportableAssets.length }} 条)
          </div>
          <div class="text-h5 text-grey-5">
            以下是待导出的资产预览。如果已在主列表选定资产，将只导出选定项；否则将导出全部资产。
          </div>
        </q-card-section>
        <q-card-section class="col" style="overflow: auto">
          <q-table
            :rows="exportableAssets"
            :columns="exportPreviewDisplayColumns"
            row-key="id"
            dark
            bordered
            class="preview-table"
            style="height: 100%"
            :pagination="{ rowsPerPage: 0 }"
          ></q-table>
        </q-card-section>
        <q-separator dark /><q-card-actions align="right" class="q-pa-md dialog-header"
          ><q-btn v-close-popup label="取消" flat color="white" /><q-btn
            label="确认并下载"
            color="primary"
            unelevated
            icon="file_download"
            style="min-width: 150px"
            @click="confirmExport"
        /></q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.loginlessCheck" persistent>
      <q-card
        class="form-dialog loginless-check-dialog dialog-card"
        style="width: 1100px; max-width: 90vw"
      >
        <q-card-section class="row items-center dialog-header"
          ><div class="text-h6">免登录检查配置</div>
          <q-space /><q-btn v-close-popup icon="close" flat round dense
        /></q-card-section>
        <q-card-section class="q-pa-xl">
          <div class="form-row">
            <span class="form-label">本机IP地址:</span>
            <div class="col row items-center no-wrap">
              <q-input
                v-model="loginlessCheckConfig.localIp"
                dark
                color="primary"
                dense
                outlined
                class="text-h5 col"
              /><q-btn flat color="primary" label="历史记录" class="q-ml-md" no-caps />
            </div>
          </div>
          <div class="form-row">
            <span class="form-label">子网掩码:</span
            ><q-input
              v-model="loginlessCheckConfig.subnetMask"
              dark
              color="primary"
              dense
              outlined
              class="text-h5 col"
            />
          </div>
          <div class="form-row">
            <span class="form-label">网关:</span
            ><q-input
              v-model="loginlessCheckConfig.gateway"
              dark
              color="primary"
              dense
              outlined
              placeholder="请输入网关"
              class="text-h5 col"
            />
          </div>
          <div class="form-row">
            <span class="form-label">高危端口扫描:</span>
            <div class="col">
              <q-toggle
                v-model="loginlessCheckConfig.highRiskPortScan"
                color="primary"
                :label="loginlessCheckConfig.highRiskPortScan ? '开启' : '关闭'"
              />
            </div>
          </div>
          <template v-if="loginlessCheckConfig.highRiskPortScan">
            <div class="form-row">
              <span class="form-label">端口号TCP:</span
              ><q-input
                v-model="loginlessCheckConfig.tcpPorts"
                dark
                color="primary"
                dense
                outlined
                type="textarea"
                autogrow
                class="text-h5 col"
              />
            </div>
            <div class="form-row">
              <span class="form-label">端口号UDP:</span
              ><q-input
                v-model="loginlessCheckConfig.udpPorts"
                dark
                color="primary"
                dense
                outlined
                type="textarea"
                autogrow
                class="text-h5 col"
              />
            </div>
          </template>
          <div class="form-row">
            <span class="form-label">指纹特征采集:</span>
            <div class="col">
              <q-toggle
                v-model="loginlessCheckConfig.fingerprintCollection"
                color="primary"
                :label="loginlessCheckConfig.fingerprintCollection ? '开启' : '关闭'"
              />
            </div>
          </div>
          <div class="form-row">
            <span class="form-label">免登录检查速率:</span>
            <div class="col row q-gutter-xl">
              <q-radio
                v-model="loginlessCheckConfig.checkSpeed"
                dark
                val="high"
                label="高"
                color="primary"
              /><q-radio
                v-model="loginlessCheckConfig.checkSpeed"
                dark
                val="medium"
                label="中"
                color="primary"
              /><q-radio
                v-model="loginlessCheckConfig.checkSpeed"
                dark
                val="low"
                label="低"
                color="primary"
              />
            </div>
          </div>
          <div class="form-row">
            <span class="form-label">起止范围:</span>
            <div class="col">
              <q-toggle
                v-model="loginlessCheckConfig.useRange"
                color="primary"
                :label="loginlessCheckConfig.useRange ? '开启' : '关闭'"
              />
            </div>
          </div>
          <template v-if="loginlessCheckConfig.useRange">
            <div class="form-row">
              <span class="form-label">起始IP:</span
              ><q-input
                v-model="loginlessCheckConfig.startIp"
                dark
                color="primary"
                dense
                outlined
                placeholder="请输入起始IP地址"
                class="text-h5 col"
              />
            </div>
            <div class="form-row">
              <span class="form-label">结束IP:</span
              ><q-input
                v-model="loginlessCheckConfig.endIp"
                dark
                color="primary"
                dense
                outlined
                placeholder="请输入结束IP地址"
                class="text-h5 col"
              />
            </div>
          </template>
        </q-card-section>
        <q-separator dark /><q-card-actions align="right" class="dialog-header q-pa-md"
          ><q-btn v-close-popup label="取消" flat color="white" /><q-btn
            label="确定"
            color="primary"
            unelevated
            style="min-width: 120px"
            @click="startLoginlessCheck"
        /></q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogs.loginCheckWizard" persistent>
      <q-card class="dialog-card" :style="loginWizardCardStyle">
        <template v-if="wizardStep === 1">
          <q-card-section class="row items-center dialog-header"
            ><div class="text-h6">登录检查：选择连接方式</div>
            <q-space /><q-btn icon="close" flat round dense @click="closeWizard"
          /></q-card-section>
          <q-card-section class="q-pa-xl text-center">
            <div class="text-grey-5 q-mb-xl">请选择本次检查使用的连接方式。</div>
            <div class="row justify-center q-gutter-xl">
              <div
                class="protocol-card column items-center justify-center q-pa-lg cursor-pointer"
                :class="{ active: connectionType === 'network' }"
                @click="connectionType = 'network'"
              >
                <q-icon name="wifi" size="4rem" class="q-mb-md" />
                <div class="text-h6">网络连接</div>
              </div>
              <div
                class="protocol-card column items-center justify-center q-pa-lg cursor-pointer"
                :class="{ active: connectionType === 'usb' }"
                @click="connectionType = 'usb'"
              >
                <q-icon name="usb" size="4rem" class="q-mb-md" />
                <div class="text-h6">USB连接</div>
              </div>
              <div
                class="protocol-card column items-center justify-center q-pa-lg cursor-pointer"
                :class="{ active: connectionType === 'serial' }"
                @click="connectionType = 'serial'"
              >
                <q-icon name="power_input" size="4rem" class="q-mb-md" />
                <div class="text-h6">串口连接</div>
              </div>
            </div>
          </q-card-section>
          <q-separator dark /><q-card-actions align="right" class="dialog-header q-pa-md"
            ><q-btn label="取消" flat color="white" @click="closeWizard" /><q-btn
              label="下一步"
              color="primary"
              unelevated
              style="min-width: 120px"
              @click="wizardNext"
          /></q-card-actions>
        </template>

        <template v-if="wizardStep === 2">
          <div v-if="connectionType === 'network'">
            <q-card-section class="row items-center dialog-header"
              ><div class="text-h6">选定网络协议</div>
              <q-space /><q-btn icon="close" flat round dense @click="closeWizard"
            /></q-card-section>
            <q-card-section class="q-pa-xl text-center">
              <div class="text-grey-5 q-mb-xl">请选择需要使用的网络协议。</div>
              <div class="row justify-center q-gutter-xl">
                <div
                  class="protocol-card column items-center justify-center q-pa-lg cursor-pointer"
                  :class="{ active: networkProtocol === 'ssh' }"
                  @click="networkProtocol = 'ssh'"
                >
                  <q-icon name="terminal" size="4rem" class="q-mb-md" />
                  <div class="text-h6">SSH连接</div>
                </div>
                <div
                  class="protocol-card column items-center justify-center q-pa-lg cursor-pointer"
                  :class="{ active: networkProtocol === 'http' }"
                  @click="networkProtocol = 'http'"
                >
                  <q-icon name="http" size="4rem" class="q-mb-md" />
                  <div class="text-h6">HTTP连接</div>
                </div>
              </div>
            </q-card-section>
            <q-separator dark /><q-card-actions align="right" class="dialog-header q-pa-md"
              ><q-btn label="上一步" flat color="white" @click="wizardBack" /><q-btn
                label="下一步"
                color="primary"
                unelevated
                style="min-width: 120px"
                @click="wizardNext"
            /></q-card-actions>
          </div>
          <div v-if="connectionType === 'usb' || connectionType === 'serial'">
            <q-card-section class="row items-center dialog-header"
              ><div class="text-h6">配置{{ connectionType === 'usb' ? 'USB' : '串口' }}连接</div>
              <q-space /><q-btn icon="close" flat round dense @click="closeWizard"
            /></q-card-section>
            <q-card-section class="q-pa-xl text-center"
              ><div class="text-h5 text-grey-6">此功能正在开发中...</div></q-card-section
            >
            <q-separator dark /><q-card-actions align="right" class="dialog-header q-pa-md"
              ><q-btn label="上一步" flat color="white" @click="wizardBack"
            /></q-card-actions>
          </div>
        </template>

        <template v-if="wizardStep === 3">
          <div v-if="networkProtocol === 'ssh'" class="credential-dialog-step3">
            <q-card-section class="row items-center dialog-header"
              ><div class="text-h6">登录账号及密码配置</div>
              <q-space /><q-btn icon="close" flat round dense @click="closeWizard"
            /></q-card-section>
            <q-card-section class="q-pa-md" style="flex: 1; overflow-y: auto">
              <div class="row items-center q-gutter-md q-mb-md">
                <q-btn color="primary" unelevated label="批量填充" /><q-btn
                  color="primary"
                  unelevated
                  label="添加"
                /><q-space />
                <div class="text-grey-5">当前站点：省调1</div>
              </div>
              <div class="credential-table-container">
                <div class="row credential-table-header text-center text-weight-bold">
                  <div class="col-2">资产IP</div>
                  <div class="col">端口号</div>
                  <div class="col-2">登录账号</div>
                  <div class="col-2">登录密码</div>
                  <div class="col-2">提权账号</div>
                  <div class="col-2">提权密码</div>
                  <div class="col-1">操作</div>
                </div>
                <div
                  v-for="(cred, index) in loginCredentials"
                  :key="cred.id"
                  class="row credential-table-row items-center"
                >
                  <div class="col-2 text-center">{{ cred.ip }}</div>
                  <div class="col">
                    <q-input v-model="cred.port" dark dense outlined placeholder="端口..." />
                  </div>
                  <div class="col-2">
                    <q-input v-model="cred.username" dark dense outlined placeholder="账号..." />
                  </div>
                  <div class="col-2">
                    <q-input
                      v-model="cred.password"
                      dark
                      dense
                      outlined
                      type="password"
                      placeholder="密码..."
                      ><template #append
                        ><q-icon name="visibility" class="cursor-pointer" /></template
                    ></q-input>
                  </div>
                  <div class="col-2">
                    <q-input
                      v-model="cred.privilegeUsername"
                      dark
                      dense
                      outlined
                      placeholder="提权账号..."
                    />
                  </div>
                  <div class="col-2">
                    <q-input
                      v-model="cred.privilegePassword"
                      dark
                      dense
                      outlined
                      type="password"
                      placeholder="提权密码..."
                      ><template #append
                        ><q-icon name="visibility" class="cursor-pointer" /></template
                    ></q-input>
                  </div>
                  <div class="col-1 row justify-center q-gutter-x-sm">
                    <q-btn
                      dense
                      flat
                      round
                      icon="delete"
                      color="negative"
                      @click="removeCredentialRow(index)"
                    /><q-btn
                      dense
                      flat
                      round
                      icon="arrow_upward"
                      color="primary"
                      @click="applySameAsAbove(index)"
                      ><q-tooltip>同上一笔</q-tooltip></q-btn
                    >
                  </div>
                </div>
              </div>
            </q-card-section>
            <q-separator dark /><q-card-actions align="right" class="dialog-header q-pa-md"
              ><q-btn label="上一步" flat color="white" @click="wizardBack" /><q-btn
                label="确定"
                color="primary"
                unelevated
                style="min-width: 120px"
                @click="confirmCredentials"
            /></q-card-actions>
          </div>
          <div v-if="networkProtocol === 'http'">
            <q-card-section class="row items-center dialog-header"
              ><div class="text-h6">HTTP连接操作</div>
              <q-space /><q-btn icon="close" flat round dense @click="closeWizard"
            /></q-card-section>
            <q-card-section class="q-pa-xl text-center">
              <div class="text-grey-5 q-mb-xl">请选择需要对已选资产执行的操作。</div>
              <div class="row q-gutter-xl justify-center">
                <q-btn
                  icon="download"
                  label="下载检测软件"
                  color="primary"
                  unelevated
                  size="xl"
                  class="q-px-xl q-py-lg"
                /><q-btn
                  icon="visibility"
                  label="查看报告"
                  color="primary"
                  unelevated
                  size="xl"
                  class="q-px-xl q-py-lg"
                />
              </div>
            </q-card-section>
            <q-separator dark /><q-card-actions align="right" class="dialog-header q-pa-md"
              ><q-btn label="上一步" flat color="white" @click="wizardBack" /><q-btn
                label="完成"
                color="primary"
                unelevated
                style="min-width: 120px"
                @click="closeWizard"
            /></q-card-actions>
          </div>
        </template>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<style lang="scss" scoped>
// --- Color Palette ---
$primary-darker: #2f48d6; // A darker shade for secondary actions
$panel-bg: #3a3b3f; // Lighter background for panels, cards
$panel-bg-darker: #333438; // Slightly darker for headers, etc.
$border-color: #4f5b68;
$text-light: #e0e0e0;
$text-white: #ffffff;

// --- Main Layout & Theme ---
.page-background {
  background-color: $secondary;
  font-size: 24px;
}
.main-header {
  color: $text-white;
  padding: 12px 24px;
}
.back-button {
  border-radius: 6px;
  font-size: 1.1rem;
}
.main-content-area {
  padding: 10px 24px 24px;
  position: relative;
  top: -8px;
}
.info-panel {
  background-color: $panel-bg;
  color: $text-light;
  border-radius: 8px;
}
.info-panel-text {
  font-size: 2rem;
}
.table-container {
  border-radius: 8px;
  overflow: hidden;
}

// --- Action Buttons ---
.main-action-btn,
.sub-action-btn,
.back-button {
  color: $text-white;
  font-weight: 500;
  font-size: 1.3rem;
  padding: 10px 20px;
}

// --- Sub-Actions Bar ---
.sub-actions-bar {
  background-color: $panel-bg;
  border-bottom: 1px solid $border-color;
}

// --- Table Style ---
.assets-table {
  border-top: 1px solid $border-color;
  background: $panel-bg;
  color: $text-light;
  :deep(thead tr) {
    background-color: lighten($panel-bg, 5%);
  }
  :deep(th) {
    font-weight: bold;
    color: $text-white;
    font-size: 1.4rem;
  }
  :deep(tbody td) {
    font-size: 1.5rem;
    padding-top: 24px;
    padding-bottom: 24px;
  }
  :deep(.q-btn) {
    font-size: 1.3rem;
  }
  :deep(.q-badge) {
    font-size: 1.2rem;
    padding: 8px 12px;
  }
}

// --- Dialog Styles ---
.dialog-card {
  background-color: $secondary;
  color: $text-white;
}
.dialog-header {
  background-color: $panel-bg-darker;
}
.form-dialog {
  width: 700px;
  max-width: 90vw;
}
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
  min-height: 40px;
}
.form-label {
  width: 200px;
  font-weight: 500;
  text-align: right;
  padding-right: 20px;
  flex-shrink: 0;
  font-size: 1.6rem;
}
:deep(.q-dialog) {
  .text-h5 {
    font-size: 1.85rem;
  }
  .text-h6 {
    font-size: 1.75rem;
  }
  .q-field__native,
  .q-field__label {
    font-size: 1.4rem;
  }
}

// --- Specific Dialogs & Components ---
.loginless-check-dialog {
  .form-label {
    font-size: 1.7rem;
  }
  :deep(.q-field__native),
  :deep(.q-field__label),
  :deep(.q-radio__label),
  :deep(.q-toggle__label) {
    font-size: 1.5rem;
  }
}
.protocol-card {
  border: 2px solid $border-color;
  border-radius: 8px;
  background-color: $panel-bg;
  transition: all 0.3s ease;
  min-width: 180px;
  &:hover {
    border-color: $primary;
    background-color: lighten($panel-bg, 5%);
  }
  &.active {
    border-color: $primary;
    background-color: $primary;
    color: $text-white;
  }
}
.credential-dialog-step3 {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.credential-table-container {
  border: 1px solid $border-color;
  border-radius: 4px;
  font-size: 1.4rem;
}
.credential-table-header {
  background-color: lighten($panel-bg, 5%);
  padding: 12px 6px;
  border-bottom: 1px solid $border-color;
}
.credential-table-row {
  border-bottom: 1px solid $border-color;
  padding: 12px 6px;
  &:last-child {
    border-bottom: none;
  }
  .col,
  .col-2 {
    padding: 0 6px;
  }
  :deep(.q-field) {
    font-size: 1.4rem;
  }
}
.preview-table {
  :deep(.q-table__top),
  :deep(.q-table__bottom) {
    background-color: $panel-bg-darker;
  }
  :deep(th) {
    font-size: 1.6rem;
  }
  :deep(td) {
    font-size: 1.5rem;
    padding: 24px;
  }
}
.filter-drawer {
  background-color: $panel-bg-darker;
  color: $text-light;
}
.manual-check-info {
  background-color: transparent;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid darken($primary, 10%);
  font-size: 1.2rem;
}
.merge-row {
  border-bottom: 1px solid $border-color;
  padding-bottom: 1rem;
  &:last-child {
    border-bottom: none;
  }
  :deep(.q-field--filled .q-field__control) {
    background-color: $panel-bg;
  }
}
</style>
