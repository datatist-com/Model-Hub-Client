import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { hasAccessToken } from '../auth/token';
import ErrorPage from '../pages/ErrorPage';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const UsersPage = lazy(() => import('../pages/UsersPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const DataSourcesPage = lazy(() => import('../pages/DataSourcesPage'));
const FeatureManagementPage = lazy(() => import('../pages/FeatureManagementPage'));
const FeatureFieldDetailPage = lazy(() => import('../pages/FeatureFieldDetailPage'));
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
const SqlConsolePage = lazy(() => import('../pages/SqlConsolePage'));
const PortraitPeriodPage = lazy(() => import('../pages/PortraitPeriodPage'));
const TargetPeriodPage = lazy(() => import('../pages/TargetPeriodPage'));
const ModelDetailPage = lazy(() => import('../pages/ModelDetailPage'));
const ModelTrainPage = lazy(() => import('../pages/ModelTrainPage'));
const ModelListDetailPage = lazy(() => import('../pages/ModelListDetailPage'));
const ModelScoringListPage = lazy(() => import('../pages/ModelScoringListPage'));
const OperationListCreatePage = lazy(() => import('../pages/OperationListCreatePage'));
const OperationListDetailPage = lazy(() => import('../pages/OperationListDetailPage'));

const withLoading = (node: React.ReactNode) => <Suspense fallback={<Spin />}>{node}</Suspense>;

function RequireAuth({ children }: { children: React.ReactNode }) {
  return hasAccessToken() ? <>{children}</> : <Navigate to="/login" replace />;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  return hasAccessToken() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/login', element: withLoading(<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>), errorElement: <ErrorPage /> },
  {
    path: '/',
    element: <RequireAuth><AppLayout /></RequireAuth>,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: withLoading(<DashboardPage />) },
      { path: '/users', element: withLoading(<UsersPage />) },
      { path: '/profile', element: withLoading(<ProfilePage />) },
      { path: '/data-sources', element: withLoading(<DataSourcesPage />) },
      { path: '/feature-management', element: withLoading(<FeatureManagementPage />) },
      { path: '/feature-field-detail', element: withLoading(<FeatureFieldDetailPage />) },
      { path: '/user-portrait', element: withLoading(<UserPortraitPage />) },
      { path: '/portrait-periods', element: withLoading(<PortraitPeriodPage />) },
      { path: '/target-management', element: withLoading(<TargetManagementPage />) },
      { path: '/target-periods', element: withLoading(<TargetPeriodPage />) },
      { path: '/model-management', element: withLoading(<ModelManagementPage />) },
      { path: '/model-detail', element: withLoading(<ModelDetailPage />) },
      { path: '/model-train', element: withLoading(<ModelTrainPage />) },
      { path: '/scoring-generation', element: withLoading(<ScoringGenerationPage />) },
      { path: '/model-list-detail', element: withLoading(<ModelListDetailPage />) },
      { path: '/model-scoring-list', element: withLoading(<ModelScoringListPage />) },
      { path: '/operation-list-output', element: withLoading(<OperationListOutputPage />) },
      { path: '/operation-list-create', element: withLoading(<OperationListCreatePage />) },
      { path: '/operation-list-detail', element: withLoading(<OperationListDetailPage />) },
      { path: '/log-viewer', element: withLoading(<LogViewerPage />) },
      { path: '/hive-databases', element: withLoading(<HiveDatabasesPage />) },
      { path: '/hive-tables', element: withLoading(<HiveTablesPage />) },
      { path: '/duckdb-tables', element: withLoading(<DuckDBTablesPage />) },
      { path: '/ingest-jobs', element: withLoading(<IngestJobsPage />) },
      { path: '/sql-console', element: withLoading(<SqlConsolePage />) }
    ]
  }
]);
