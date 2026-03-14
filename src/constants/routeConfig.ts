/** Maps route pathname → i18n label key for session tab titles */
export const ROUTE_LABEL_KEY_MAP: Record<string, string> = {
  '/dashboard': 'menu.dashboard',
  '/profile': 'pages.profile.title',
  '/data-sources': 'menu.dataSources',
  '/feature-management': 'menu.featureManagement',
  '/user-portrait': 'menu.userPortrait',
  '/target-management': 'menu.targetManagement',
  '/model-management': 'menu.modelManagement',
  '/scoring-generation': 'menu.scoringGeneration',
  '/operation-list-output': 'menu.operationListOutput',
  '/users': 'menu.users',
  '/log-viewer': 'menu.logViewer',
  '/hive-databases': 'menu.hiveDatabases',
  '/hive-tables': 'menu.hiveTables',
  '/duckdb-tables': 'menu.duckdbTables',
  '/ingest-jobs': 'menu.ingestJobs',
  '/sql-console': 'menu.sqlConsole'
};

/** Maps route pathname → URL params that form a unique session tab identity */
export const TAB_IDENTITY_PARAMS_MAP: Record<string, string[]> = {
  '/hive-databases': ['sourceId'],
  '/hive-tables': ['sourceId', 'databaseName'],
  '/duckdb-tables': ['sourceId'],
  '/ingest-jobs': ['sourceId', 'tableName'],
  '/sql-console': ['sourceId'],
  '/users': ['id', 'username'],
  '/profile': [],
  '/dashboard': [],
  '/data-sources': [],
  '/feature-management': [],
  '/user-portrait': [],
  '/target-management': [],
  '/model-management': [],
  '/scoring-generation': [],
  '/model-list-detail': ['id'],
  '/model-scoring-list': ['id'],
  '/operation-list-output': [],
  '/operation-list-create': [],
  '/operation-list-detail': ['id'],
  '/log-viewer': []
};

/** Maps sub-routes to their parent menu key (for menu highlight) */
export const ROUTE_TO_MENU_KEY: Record<string, string> = {
  '/hive-databases': '/data-sources',
  '/hive-tables': '/data-sources',
  '/duckdb-tables': '/data-sources',
  '/ingest-jobs': '/data-sources',
  '/sql-console': '/data-sources',
  '/profile': '/dashboard'
};
