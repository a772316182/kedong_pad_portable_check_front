import { reactive } from 'vue';

// 这将作为我们整个应用的唯一“数据源”
export const policies = reactive([
  {
    name: '主机设备-Linux',
    updated: '2025-07-03',
    items: 8,
    object: '主机设备-Linux',
    preset_strategy: true,
    owned: false,
    enabled: true,
    // 预制策略可以没有详细的 checkItems 或为空
    details: { checkItems: [] }
  },
  {
    name: '主机设备-Windows',
    updated: '2025-07-03',
    items: 8,
    object: '主机设备-Windows',
    preset_strategy: true,
    owned: false,
    enabled: true,
    details: { checkItems: [] }
  },
  {
    name: '网络设备',
    updated: '2025-07-03',
    items: 16,
    object: '网络设备',
    preset_strategy: true,
    owned: false,
    enabled: true,
    details: { checkItems: [] }
  },
  {
    name: '网络安全',
    updated: '2025-07-03',
    items: 15,
    object: '网络安全',
    preset_strategy: true,
    owned: false,
    enabled: true,
    details: { checkItems: [] }
  },
  {
    name: '网络安全告警检查',
    updated: '2025-07-03',
    items: 8,
    object: '网络安全告警点对点检查',
    preset_strategy: true,
    owned: false,
    enabled: true,
    details: { checkItems: [] }
  },
  {
    name: '弱密码核查',
    updated: '2025-04-18',
    items: 2,
    object: '主机设备-Linux',
    preset_strategy: false,
    owned: true,
    enabled: true,
    details: {
      checkItems: [
        { id: 1, label: '弱口令扫描', selected: true, details: { checkPoints: [{ id: 'wc-1', name: '系统账户弱口令', requirement: '...', selected: true, priority: '必选项', basis: [] }] } }
      ]
    }
  },
  {
    name: '主机设备-Linux-自定义',
    updated: '2025-04-18',
    items: 23, // 注意：这里的 items 应该与 checkItems 的长度匹配，或者是一个独立的元数据
    object: '主机设备-Linux',
    preset_strategy: false,
    owned: true,
    enabled: true,
    // 【关键】这里嵌入了完整的、包含所有层级和字段的核查项数据
    details: {
      checkItems: [
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
                basis: [{ id: 'b1', text: '《信息安全技术网络安全等级保护》' }],
                priority: '必选项',
                selected: true,
              },
              {
                id: 'cp1-2',
                name: '用户登录失败锁定',
                requirement: '连续登录失败5次后，账户锁定',
                minLength: null,
                isAuto: true,
                basis: [],
                priority: '必选项',
                selected: false,
              }
            ]
          },
        },
        { id: 2, label: '访问控制', selected: true, details: { checkPoints: [{ id: 'cp2-1', name: '访问控制策略', requirement: '...', minLength: null, isAuto: false, basis: [], priority: '必选项', selected: true }] } },
        { id: 3, label: '入侵防范', selected: false, details: { checkPoints: [{ id: 'cp3-1', name: '入侵防范策略', requirement: '...', minLength: null, isAuto: false, basis: [], priority: '可选项', selected: false }] } },
        { id: 4, label: '网络配置', selected: true, details: { checkPoints: [{ id: 'cp4-1', name: '网络配置策略', requirement: '...', minLength: null, isAuto: false, basis: [], priority: '必选项', selected: true }] } },
        { id: 5, label: '安全管理', selected: false, details: { checkPoints: [{ id: 'cp5-1', name: '安全管理策略', requirement: '...', minLength: null, isAuto: false, basis: [], priority: '可选项', selected: false }] } },
        { id: 6, label: '日志审计', selected: false, details: { checkPoints: [{ id: 'cp6-1', name: '日志审计策略', requirement: '...', minLength: null, isAuto: false, basis: [], priority: '随机项', selected: false }] } },
        { id: 7, label: '违规行为', selected: true, details: { checkPoints: [{ id: 'cp7-1', name: '违规行为策略', requirement: '...', minLength: null, isAuto: false, basis: [], priority: '必选项', selected: true }] } },
        { id: 8, label: '恶意代码检查', selected: true, details: { checkPoints: [{ id: 'cp8-1', name: '恶意代码检查策略', requirement: '...', minLength: null, isAuto: false, basis: [], priority: '必选项', selected: true }] } },
      ]
    }
  }
]);
