import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { hasAccessToken } from '../auth/token';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const UsersPage = lazy(() => import('../pages/UsersPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const DataSourcesPage = lazy(() => import('../pages/DataSourcesPage'));
const FeatureManagementPage = lazy(() => import('../pages/FeatureManagementPage'));
const UserPortraitPage = lazy(() => import('../pages/UserPortraitPage'));
const TargetManagementPage = lazy(() => import('../pages/TargetManagementPage'));
const ModelManagementPage = lazy(() => import('../pages/ModelManagementPage'));
const ScoringGenerationPage = lazy(() => import('../pages/ScoringGenerationPage'));
const OperationListOutputPage = lazy(() => import('../pages/OperationListOutputPage'));
const LogViewerPage = lazy(() => import('../pages/LogViewerPage'));
const HiveDatabasesPage = lazy(() => import('../pages/HiveDatabasesPage'));
const HiveTablesPage = lazy(() => import('../pages/HiveTablesPage'));
const DuckDBTablesPage = lazy(() => import('../pages/DuckDBTablesPage'));
const IngestJobsPage = lazy(() => import('../pages/IngestJobsPage'));

const withLoading = (node: React.ReactNode) => <Suspense fallback={<Spin />}>{node}</Suspense>;

function RequireAuth({ children }: { children: React.ReactNode }) {
  return hasAccessToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  return hasAccessToken() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/login', element: withLoading(<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>) },
  {
    path: '/',
    element: <RequireAuth><AppLayout /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: withLoading(<DashboardPage />) },
      { path: '/users', element: withLoading(<UsersPage />) },
      { path: '/profile', element: withLoading(<ProfilePage />) },
      { path: '/data-sources', element: withLoading(<DataSourcesPage />) },
      { path: '/feature-management', element: withLoading(<FeatureManagementPage />) },
      { path: '/user-portrait', element: withLoading(<UserPortraitPage />) },
      { path: '/target-management', element: withLoading(<TargetManagementPage />) },
      { path: '/model-management', element: withLoading(<ModelManagementPage />) },
      { path: '/scoring-generation', element: withLoading(<ScoringGenerationPage />) },
      { path: '/operation-list-output', element: withLoading(<OperationListOutputPage />) },
      { path: '/log-viewer', element: withLoading(<LogViewerPage />) },
      { path: '/hive-databases', element: withLoading(<HiveDatabasesPage />) },
      { path: '/hive-tables', element: withLoading(<HiveTablesPage />) },
      { path: '/duckdb-tables', element: withLoading(<DuckDBTablesPage />) },
      { path: '/ingest-jobs', element: withLoading(<IngestJobsPage />) }
    ]
  }
]);
