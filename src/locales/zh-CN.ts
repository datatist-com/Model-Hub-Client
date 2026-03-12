export default {
  environmentGuard: {
    badge: '访问环境受限',
    productName: 'Datatist Model Hub',
    productDescription: '面向建模全流程的数据接入、特征工程、模型训练、推理评分与运营名单生成平台。',
    title: '当前设备或浏览器暂不满足系统使用要求',
    description:
      '为保证页面布局、表格展示和复杂交互稳定，请在桌面端使用最新版 Google Chrome 打开本系统。',
    recommendationTitle: '推荐使用方式',
    recommendationDesc: '请在 Windows 或 macOS 电脑上，使用最新版 Google Chrome 访问。',
    detectedIssues: '检测到的问题',
    issueSmallViewport: '当前浏览器窗口尺寸不足',
    issueMobileLayout: '当前设备或窗口呈移动端布局',
    issueNonChrome: '当前浏览器不是 Google Chrome',
    downloadChrome: '下载 Chrome',
    retry: '重新检测',
    footnote:
      '如果你已切换到桌面端 Chrome 或放大窗口，请先点击<retry>“重新检测”</retry>；若你已知晓当前访问环境可能导致页面显示不完整或交互异常，可选择<continue>仍要继续访问</continue>。'
  },
  layout: {
    copyright: '© 上海画龙信息科技有限公司 版权所有。',
    user: {
      name: '管理员',
      roleAdmin: '系统管理员',
      changePassword: '修改密码',
      logout: '登出',
      savePassword: '保存密码',
      currentPassword: '当前密码',
      currentPasswordPlaceholder: '请输入当前密码',
      newPassword: '新密码',
      newPasswordPlaceholder: '请输入新密码',
      confirmPassword: '确认密码',
      confirmPasswordPlaceholder: '请再次输入新密码',
      currentPasswordValidation: '请输入当前密码。',
      passwordValidation: '请输入新密码。',
      confirmPasswordValidation: '请确认新密码。',
      passwordMismatch: '两次输入的新密码不一致。',
      passwordSuccess: '密码修改成功。'
    },
    license: {
      entry: '许可证与激活',
      title: '许可证中心',
      active: '有效',
      expired: '已过期',
      subtitleActive: '当前工作空间许可证有效。如需更换激活码，可在下方更新。',
      subtitleExpired: '当前许可证已过期，请更新新的激活码以恢复完整能力。',
      key: '许可证密钥',
      organization: '授权机构',
      validUntil: '有效期至',
      activatedAt: '激活时间',
      inputHint: '需要更新许可证密钥？',
      placeholder: '请输入许可证密钥',
      activateButton: '激活许可证',
      validation: '请输入有效的许可证密钥。',
      activateSuccess: '许可证激活成功。'
    }
  },
  menu: {
    login: '登录',
    dashboard: '仪表盘',
    users: '用户管理',
    license: '许可证管理',
    dataSources: '数据源管理',
    featureManagement: '特征管理',
    userPortrait: '用户画像管理',
    targetManagement: '监督学习管理',
    modelManagement: '模型管理',
    scoringGeneration: '模型名单管理',
    operationListOutput: '运营名单管理',
    logViewer: '日志查看',
    dataSourceOverview: '数据源总览',
    hiveDatabases: 'Hive库管理',
    hiveTables: 'Hive表管理',
    duckdbTables: 'DuckDB表管理',
    ingestJobs: '上传与入表任务',
    sqlConsole: 'SQL 控制台'
  },
  common: {
    create: '新建',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    submit: '提交',
    search: '搜索',
    reset: '重置'
  },
  pages: {
    dashboard: {
      title: '仪表盘',
      metrics: {
        totalCustomers: '特征客户总数',
        totalDataVolume: '总数据条数',
        modelCount: '可用模型数量',
        featureCount: '特征数量'
      },
      auc: {
        title: '模型 AUC 月度曲线',
        note: '注：AUC 指标仅供模型效果参考，不作为业务决策的唯一依据。',
        hubs: {
          asset: '资产模型',
          payment: '三方支付模型',
          loan: '贷款模型'
        },
        modelNames: {
          creditApplication: '信用卡申请模型',
          assetUpgrade: '资产提升模型',
          thirdPartyPaymentRetention: '三方支付防流失模型'
        }
      },
      modelList: {
        title: '所有模型列表',
        columns: {
          modelName: '模型名称',
          featureCount: '使用特征数量',
          auc: 'AUC',
          top10Lift: 'Top10% Lift',
          builtAt: '模型建立日期'
        }
      }
    },
    profile: {
      title: '个人信息',
      personalInfo: '个人信息',
      preferencesSecurity: '偏好与安全',
      preferences: '个人偏好',
      loginName: '登录名',
      realName: '真实姓名',
      identity: '身份',
      language: '常用语言',
      languageDesc: '选择你在系统内默认使用的语言。',
      languageZh: '中文',
      languageEn: 'English',
      uiTheme: '界面主题',
      uiThemeDesc: '选择界面明暗风格，可随系统自动切换。',
      themeDark: '暗色',
      themeLight: '亮色',
      themeSystem: '跟随系统',
      security: '账号安全',
      password: '密码',
      securityHint: '建议定期更新密码以保障账号安全。',
      loginHistory: '历史登录记录',
      operationHistory: '历史操作记录',
      loginTime: '登录时间',
      actionTime: '操作时间',
      location: '登录地点',
      module: '模块',
      action: '操作',
      status: '状态',
      success: '成功',
      failed: '失败'
    },
    login: {
      title: '登录',
      username: '用户名',
      password: '密码',
      submit: '登录（Mock）'
    },
    users: {
      title: '用户管理',
      columns: { id: 'ID', username: '用户名', role: '角色', status: '状态', actions: '操作' },
      statusActive: '正常',
      statusFrozen: '冻结',
      createUser: '新建用户',
      form: { username: '用户名', role: '角色' },
      roles: { systemAdmin: '系统管理员', modelEngineer: '建模工程师', businessOperator: '业务运营', member: '普通成员' }
    },
    license: { title: '许可证管理' },
    dataSources: {
      title: '数据源管理',
      columns: { name: '数据源名称', type: '类型', connectionStatus: '连接状态', objectCount: '对象数量', actions: '操作' },
      statusConnected: '已连接',
      statusDisconnected: '未连接',
      testConnection: '测试连接',
      containsDatabases: '包含 {{count}} 个库',
      containsTables: '包含 {{count}} 个表',
      createTitle: '新建数据源',
      form: { name: '名称', type: '类型', connectionAddress: '连接地址' },
      duckdbExists: 'DuckDB 数据源已存在，不可重复创建。',
      duckdbAutoCreate: '选择后将自动创建 DuckDB 数据库。',
      editTitle: '编辑数据源',
      deleteConfirmTitle: '确认删除',
      deleteConfirmContent: '确定要删除该数据源吗？此操作不可恢复。'
    },
    featureManagement: {
      title: '特征管理',
      columns: { id: 'ID', featureName: '特征名称', dataType: '数据类型', sourceTable: '来源表', status: '状态', createdAt: '创建时间' },
      statusEnabled: '启用',
      statusDisabled: '停用'
    },
    userPortrait: {
      title: '用户画像管理',
      columns: { id: 'ID', portraitName: '画像名称', userCount: '覆盖用户数', tagCount: '标签数', status: '状态', updatedAt: '更新时间' },
      statusActive: '生效中',
      statusInactive: '未生效'
    },
    targetManagement: {
      title: '监督学习管理',
      columns: { id: 'ID', targetName: '目标名称', type: '类型', description: '描述', createdAt: '创建时间' },
      typeBinary: '二分类',
      typeContinuous: '连续值'
    },
    modelManagement: {
      title: '模型管理',
      columns: { id: 'ID', modelName: '模型名称', version: '版本', auc: 'AUC', status: '状态', updatedAt: '更新时间' },
      statusDraft: '草稿',
      statusPublished: '已发布',
      statusArchived: '已归档'
    },
    scoringGeneration: {
      title: '模型名单管理',
      columns: { id: 'ID', model: '模型', dataset: '数据集', scoreCount: '评分数量', status: '状态', createdAt: '创建时间' },
      statusPending: '待处理',
      statusRunning: '运行中',
      statusCompleted: '已完成',
      statusFailed: '失败'
    },
    operationListOutput: {
      title: '运营名单管理',
      columns: { id: 'ID', listName: '名单名称', model: '关联模型', recordCount: '记录数', status: '状态', createdAt: '创建时间' },
      statusPending: '待生成',
      statusGenerated: '已生成',
      statusExported: '已导出'
    },
    logViewer: {
      title: '日志查看',
      columns: { timestamp: '时间', level: '级别', source: '来源', message: '日志内容' },
      allLevels: '全部',
      levelFilter: '级别筛选'
    },
    hiveDatabases: {
      title: 'Hive库管理',
      columns: { source: '数据源', database: '库名', objectCount: '对象数量', actions: '操作' },
      containsTables: '包含 {{count}} 个表',
      executeSql: '执行 SQL',
      backToDataSources: '返回数据源',
      sourceLabel: '数据源',
      createTitle: '新建数据库',
      form: { databaseName: '数据库名' },
      deleteConfirmTitle: '确认删除',
      deleteConfirmContent: '确定要删除该数据库吗？此操作不可恢复。',
      passwordRequired: '请输入登录密码以确认删除',
      passwordPlaceholder: '请输入登录密码'
    },
    hiveTables: {
      title: 'Hive表管理',
      columns: { database: '库名', table: '表名', alias: '别名', objectCount: '对象数量', rowCount: '数据量', actions: '操作' },
      containsFields: '包含 {{count}} 个字段',
      executeSql: '执行 SQL',
      backToHiveDatabases: '返回 Hive库',
      sourceLabel: '数据源',
      databaseLabel: '数据库',
      createTitle: '新建表',
      createBySql: 'SQL 建表',
      createByFields: '字段定义建表',
      form: { tableName: '表名', alias: '别名', sql: '建表 SQL', fieldName: '字段名', fieldType: '字段类型', addField: '添加字段' },
      fieldDetailTitle: '字段列表',
      fieldDetailColumns: { name: '字段名', type: '字段类型', comment: '备注' },
      deleteConfirmTitle: '确认删除',
      deleteConfirmContent: '确定要删除该表吗？此操作不可恢复。',
      passwordRequired: '请输入登录密码以确认删除',
      passwordPlaceholder: '请输入登录密码'
    },
    duckdbTables: {
      title: 'DuckDB表管理',
      columns: { id: 'ID', table: '表名', objectCount: '数据量', enabled: '启用状态', actions: '操作' },
      containsRows: '包含 {{count}} 行',
      uploadData: '上传数据',
      viewFields: '查看字段',
      backToDataSources: '返回数据源',
      enabledTrue: '已启用',
      enabledFalse: '未启用',
      sourceLabel: '数据源'
    },
    sqlConsole: {
      title: 'SQL 控制台',
      backToDataSources: '返回数据源',
      placeholder: '请输入 SQL 语句...',
      execute: '执行',
      clear: '清空',
      emptySqlWarning: '请先输入 SQL 语句',
      executeSuccess: 'SQL 执行成功',
      historyTitle: '历史执行记录',
      columns: { executedAt: '执行时间', sql: 'SQL 语句', status: '状态', rows: '结果行数', duration: '耗时' },
      statusSuccess: '成功',
      statusError: '失败'
    },
    ingestJobs: {
      title: '上传与入表任务',
      columns: { jobId: '任务 ID', targetTable: '目标表', status: '状态', action: '操作' },
      view: '查看',
      backToDuckDBTables: '返回 DuckDB 表',
      sourceLabel: '数据源',
      tableLabel: '表',
      steps: { createSession: '创建上传会话', uploadFile: '上传文件', completeUpload: '完成上传', createJob: '创建入表任务', trackJob: '跟踪任务' },
      jobList: '任务列表',
      recentFiles: '最近上传文件'
    }
  }
} as const;
