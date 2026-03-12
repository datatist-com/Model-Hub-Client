export default {
  environmentGuard: {
    badge: 'Environment Restricted',
    productName: 'Datatist Model Hub',
    productDescription:
      'A unified workspace for data onboarding, feature engineering, model training, scoring, and operational list generation.',
    title: 'This device or browser does not meet the system requirements',
    description:
      'To keep layouts, tables, and complex interactions stable, please open this system on a desktop device with the latest Google Chrome.',
    recommendationTitle: 'Recommended Setup',
    recommendationDesc: 'Use the latest Google Chrome on a Windows or macOS desktop device.',
    detectedIssues: 'Detected issues',
    issueSmallViewport: 'The browser window is too small',
    issueMobileLayout: 'The current device or window looks like a mobile layout',
    issueNonChrome: 'The current browser is not Google Chrome',
    downloadChrome: 'Download Chrome',
    retry: 'Check Again',
    footnote:
      'If you have switched to desktop Chrome or enlarged the window, click <retry>“Check Again”</retry> first; if you understand this environment may still cause imperfect rendering or unstable interactions, you may choose <continue>Continue Anyway</continue>.'
  },
  layout: {
    copyright: '© Datatist. All rights reserved.',
    user: {
      name: 'Administrator',
      roleAdmin: 'System Administrator',
      changePassword: 'Change Password',
      logout: 'Sign Out',
      savePassword: 'Save Password',
      currentPassword: 'Current Password',
      currentPasswordPlaceholder: 'Enter current password',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'Enter new password',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter new password',
      currentPasswordValidation: 'Please enter your current password.',
      passwordValidation: 'Please enter a new password.',
      confirmPasswordValidation: 'Please confirm the new password.',
      passwordMismatch: 'The new password and confirmation do not match.',
      passwordSuccess: 'Password updated successfully.'
    },
    license: {
      entry: 'License & Activation',
      title: 'License Center',
      active: 'Active',
      expired: 'Expired',
      subtitleActive: 'Your workspace license is valid. You can update the key below when required.',
      subtitleExpired: 'The current license has expired. Please update with a new key to restore full access.',
      key: 'License Key',
      organization: 'Licensed Organization',
      validUntil: 'Valid Until',
      activatedAt: 'Activated At',
      inputHint: 'Need to update your license key?',
      placeholder: 'Enter your license key',
      activateButton: 'Activate License',
      validation: 'Please enter a valid license key.',
      activateSuccess: 'License activated successfully.'
    }
  },
  menu: {
    login: 'Login',
    dashboard: 'Dashboard',
    users: 'User Management',
    license: 'License',
    dataSources: 'Data Sources',
    featureManagement: 'Feature Management',
    userPortrait: 'User Portrait',
    targetManagement: 'Supervised Learning',
    modelManagement: 'Model Management',
    scoringGeneration: 'Model List Management',
    operationListOutput: 'Operation List Management',
    logViewer: 'Log Viewer',
    dataSourceOverview: 'Data Source Overview',
    hiveDatabases: 'Hive DB Management',
    hiveTables: 'Hive Table Management',
    duckdbTables: 'DuckDB Tables',
    ingestJobs: 'Upload & Ingest Jobs'
  },
  common: {
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    search: 'Search',
    reset: 'Reset'
  },
  pages: {
    dashboard: {
      title: 'Dashboard',
      metrics: {
        totalCustomers: 'Customers with Features',
        totalDataVolume: 'Total Records',
        modelCount: 'Available Models',
        featureCount: 'Feature Count'
      },
      auc: {
        title: 'Model AUC Monthly Curves',
        note: 'Note: AUC is for reference only, not the sole basis for decisions.',
        hubs: {
          asset: 'Asset Models',
          payment: 'Third-Party Payment Models',
          loan: 'Loan Models'
        },
        modelNames: {
          creditApplication: 'Credit Card Application Model',
          assetUpgrade: 'Asset Upgrade Model',
          thirdPartyPaymentRetention: 'Third-Party Payment Retention Model'
        }
      },
      modelList: {
        title: 'All Models',
        columns: {
          modelName: 'Model Name',
          featureCount: 'Feature Count',
          auc: 'AUC',
          top10Lift: 'Top10% Lift',
          builtAt: 'Built Date'
        }
      }
    },
    profile: {
      title: 'Personal Profile',
      personalInfo: 'Personal Information',
      preferencesSecurity: 'Preferences & Security',
      preferences: 'Personal Preferences',
      loginName: 'Login Name',
      realName: 'Real Name',
      identity: 'Identity',
      language: 'Language',
      languageDesc: 'Choose the default language for your workspace.',
      languageZh: '中文',
      languageEn: 'English',
      uiTheme: 'UI Theme',
      uiThemeDesc: 'Pick a light/dark appearance or follow the system.',
      themeDark: 'Dark',
      themeLight: 'Light',
      themeSystem: 'System',
      security: 'Security',
      password: 'Password',
      securityHint: 'For account protection, update your password regularly.',
      loginHistory: 'Login History',
      operationHistory: 'Operation History',
      loginTime: 'Login Time',
      actionTime: 'Action Time',
      location: 'Location',
      module: 'Module',
      action: 'Action',
      status: 'Status',
      success: 'Success',
      failed: 'Failed'
    },
    login: {
      title: 'Login',
      username: 'Username',
      password: 'Password',
      submit: 'Login (Mock)'
    },
    users: {
      title: 'User Management',
      columns: { id: 'ID', username: 'Username', role: 'Role', status: 'Status', actions: 'Actions' },
      statusActive: 'Active',
      statusFrozen: 'Frozen',
      createUser: 'Create User',
      form: { username: 'Username', role: 'Role' },
      roles: { systemAdmin: 'System Admin', modelEngineer: 'Model Engineer', businessOperator: 'Business Operator', member: 'Member' }
    },
    license: { title: 'License' },
    dataSources: {
      title: 'Data Sources',
      columns: { name: 'Source Name', type: 'Type', connectionStatus: 'Connection Status', objectCount: 'Objects', actions: 'Actions' },
      statusConnected: 'Connected',
      statusDisconnected: 'Disconnected',
      testConnection: 'Test Connection',
      containsDatabases: '{{count}} databases',
      containsTables: '{{count}} tables',
      createTitle: 'Create Data Source',
      form: { name: 'Name', type: 'Type', connectionAddress: 'Connection Address' },
      duckdbExists: 'A DuckDB source already exists. Only one is allowed.',
      duckdbAutoCreate: 'A DuckDB database will be created automatically.',
      editTitle: 'Edit Data Source',
      deleteConfirmTitle: 'Confirm Deletion',
      deleteConfirmContent: 'Are you sure you want to delete this data source? This cannot be undone.'
    },
    featureManagement: {
      title: 'Feature Management',
      columns: { id: 'ID', featureName: 'Feature Name', dataType: 'Data Type', sourceTable: 'Source Table', status: 'Status', createdAt: 'Created At' },
      statusEnabled: 'Enabled',
      statusDisabled: 'Disabled'
    },
    userPortrait: {
      title: 'User Portrait',
      columns: { id: 'ID', portraitName: 'Portrait Name', userCount: 'User Count', tagCount: 'Tag Count', status: 'Status', updatedAt: 'Updated At' },
      statusActive: 'Active',
      statusInactive: 'Inactive'
    },
    targetManagement: {
      title: 'Supervised Learning',
      columns: { id: 'ID', targetName: 'Target Name', type: 'Type', description: 'Description', createdAt: 'Created At' },
      typeBinary: 'Binary',
      typeContinuous: 'Continuous'
    },
    modelManagement: {
      title: 'Model Management',
      columns: { id: 'ID', modelName: 'Model Name', version: 'Version', auc: 'AUC', status: 'Status', updatedAt: 'Updated At' },
      statusDraft: 'Draft',
      statusPublished: 'Published',
      statusArchived: 'Archived'
    },
    scoringGeneration: {
      title: 'Model List Management',
      columns: { id: 'ID', model: 'Model', dataset: 'Dataset', scoreCount: 'Score Count', status: 'Status', createdAt: 'Created At' },
      statusPending: 'Pending',
      statusRunning: 'Running',
      statusCompleted: 'Completed',
      statusFailed: 'Failed'
    },
    operationListOutput: {
      title: 'Operation List Management',
      columns: { id: 'ID', listName: 'List Name', model: 'Model', recordCount: 'Record Count', status: 'Status', createdAt: 'Created At' },
      statusPending: 'Pending',
      statusGenerated: 'Generated',
      statusExported: 'Exported'
    },
    logViewer: {
      title: 'Log Viewer',
      columns: { timestamp: 'Time', level: 'Level', source: 'Source', message: 'Message' },
      allLevels: 'All',
      levelFilter: 'Level Filter'
    },
    hiveDatabases: {
      title: 'Hive DB Management',
      columns: { source: 'Source', database: 'DB Name', objectCount: 'Objects', actions: 'Actions' },
      containsTables: '{{count}} tables',
      executeSql: 'Run SQL',
      backToDataSources: 'Back to Data Sources',
      sourceLabel: 'Source',
      createTitle: 'Create Database',
      form: { databaseName: 'Database Name' },
      deleteConfirmTitle: 'Confirm Deletion',
      deleteConfirmContent: 'Are you sure you want to delete this database? This cannot be undone.',
      passwordRequired: 'Enter your login password to confirm',
      passwordPlaceholder: 'Enter login password'
    },
    hiveTables: {
      title: 'Hive Table Management',
      columns: { database: 'DB Name', table: 'Table', alias: 'Alias', objectCount: 'Objects', rowCount: 'Rows', actions: 'Actions' },
      containsFields: '{{count}} fields',
      executeSql: 'Run SQL',
      backToHiveDatabases: 'Back to Hive DB',
      sourceLabel: 'Source',
      databaseLabel: 'DB',
      createTitle: 'Create Table',
      createBySql: 'Create by SQL',
      createByFields: 'Create by Fields',
      form: { tableName: 'Table Name', alias: 'Alias', sql: 'Create Table SQL', fieldName: 'Field Name', fieldType: 'Field Type', addField: 'Add Field' },
      fieldDetailTitle: 'Field List',
      fieldDetailColumns: { name: 'Name', type: 'Type', comment: 'Comment' },
      deleteConfirmTitle: 'Confirm Deletion',
      deleteConfirmContent: 'Are you sure you want to delete this table? This cannot be undone.',
      passwordRequired: 'Enter your login password to confirm',
      passwordPlaceholder: 'Enter login password'
    },
    duckdbTables: {
      title: 'DuckDB Tables',
      columns: { id: 'ID', table: 'Table', objectCount: 'Objects', enabled: 'Enabled', actions: 'Actions' },
      containsRows: '{{count}} rows',
      uploadData: 'Upload Data',
      viewFields: 'View Fields',
      backToDataSources: 'Back to Data Sources',
      enabledTrue: 'Enabled',
      enabledFalse: 'Disabled',
      sourceLabel: 'Source'
    },
    ingestJobs: {
      title: 'Upload & Ingest Jobs',
      columns: { jobId: 'Job ID', targetTable: 'Target Table', status: 'Status', action: 'Actions' },
      view: 'View',
      backToDuckDBTables: 'Back to DuckDB Tables',
      sourceLabel: 'Source',
      tableLabel: 'Table',
      steps: { createSession: 'Create Upload Session', uploadFile: 'Upload File', completeUpload: 'Complete Upload', createJob: 'Create Ingest Job', trackJob: 'Track Job' },
      jobList: 'Job List',
      recentFiles: 'Recent Files'
    }
  }
} as const;
