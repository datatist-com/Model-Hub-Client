import { lazy, useEffect, useState } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { hasAccessToken } from '../auth/token';
import ErrorPage from '../pages/ErrorPage';
import LazyLoadGuard from '../components/lazy/LazyLoadGuard';
import type { LazyLoadingState } from '../components/lazy/LazyLoadGuard';
import AppShellFallback from '../components/lazy/AppShellFallback';
import RoutePageFallback from '../components/lazy/RoutePageFallback';
import { loadAppLayout } from './preload';

const AppLayout = lazy(loadAppLayout);
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

const withLoading = (
  node: React.ReactNode,
  featureName: string,
  fallback?: React.ReactNode | ((state: LazyLoadingState) => React.ReactNode)
) => (
  <LazyLoadGuard featureName={featureName} loadingFallback={fallback}>
    {node}
  </LazyLoadGuard>
);

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => hasAccessToken());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === null) {
        setAuthed(hasAccessToken());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return authed ? <>{children}</> : <Navigate to="/login" replace />;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  return hasAccessToken() ? <Navigate to="/users" replace /> : <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/login', element: withLoading(<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>, 'login page'), errorElement: <ErrorPage /> },
  {
    path: '/',
    element: withLoading(<RequireAuth><AppLayout /></RequireAuth>, 'authenticated workspace', (state) => <AppShellFallback state={state} />),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/users" replace /> },
      { path: '/dashboard', element: withLoading(<DashboardPage />, 'dashboard', (state) => <RoutePageFallback state={state} />) },
      { path: '/users', element: withLoading(<UsersPage />, 'users page', (state) => <RoutePageFallback state={state} />) },
      { path: '/profile', element: withLoading(<ProfilePage />, 'profile page', (state) => <RoutePageFallback state={state} />) },
      { path: '/data-sources', element: withLoading(<DataSourcesPage />, 'data sources page', (state) => <RoutePageFallback state={state} />) },
      { path: '/feature-management', element: withLoading(<FeatureManagementPage />, 'feature management page', (state) => <RoutePageFallback state={state} />) },
      { path: '/feature-field-detail', element: withLoading(<FeatureFieldDetailPage />, 'feature field detail page', (state) => <RoutePageFallback state={state} />) },
      { path: '/user-portrait', element: withLoading(<UserPortraitPage />, 'user portrait page', (state) => <RoutePageFallback state={state} />) },
      { path: '/portrait-periods', element: withLoading(<PortraitPeriodPage />, 'portrait periods page', (state) => <RoutePageFallback state={state} />) },
      { path: '/target-management', element: withLoading(<TargetManagementPage />, 'target management page', (state) => <RoutePageFallback state={state} />) },
      { path: '/target-periods', element: withLoading(<TargetPeriodPage />, 'target periods page', (state) => <RoutePageFallback state={state} />) },
      { path: '/model-management', element: withLoading(<ModelManagementPage />, 'model management page', (state) => <RoutePageFallback state={state} />) },
      { path: '/model-detail', element: withLoading(<ModelDetailPage />, 'model detail page', (state) => <RoutePageFallback state={state} />) },
      { path: '/model-train', element: withLoading(<ModelTrainPage />, 'model train page', (state) => <RoutePageFallback state={state} />) },
      { path: '/scoring-generation', element: withLoading(<ScoringGenerationPage />, 'scoring generation page', (state) => <RoutePageFallback state={state} />) },
      { path: '/model-list-detail', element: withLoading(<ModelListDetailPage />, 'model list detail page', (state) => <RoutePageFallback state={state} />) },
      { path: '/model-scoring-list', element: withLoading(<ModelScoringListPage />, 'model scoring list page', (state) => <RoutePageFallback state={state} />) },
      { path: '/operation-list-output', element: withLoading(<OperationListOutputPage />, 'operation list output page', (state) => <RoutePageFallback state={state} />) },
      { path: '/operation-list-create', element: withLoading(<OperationListCreatePage />, 'operation list create page', (state) => <RoutePageFallback state={state} />) },
      { path: '/operation-list-detail', element: withLoading(<OperationListDetailPage />, 'operation list detail page', (state) => <RoutePageFallback state={state} />) },
      { path: '/log-viewer', element: withLoading(<LogViewerPage />, 'log viewer page', (state) => <RoutePageFallback state={state} />) },
      { path: '/hive-databases', element: withLoading(<HiveDatabasesPage />, 'hive databases page', (state) => <RoutePageFallback state={state} />) },
      { path: '/hive-tables', element: withLoading(<HiveTablesPage />, 'hive tables page', (state) => <RoutePageFallback state={state} />) },
      { path: '/duckdb-tables', element: withLoading(<DuckDBTablesPage />, 'duckdb tables page', (state) => <RoutePageFallback state={state} />) },
      { path: '/ingest-jobs', element: withLoading(<IngestJobsPage />, 'ingest jobs page', (state) => <RoutePageFallback state={state} />) },
      { path: '/sql-console', element: withLoading(<SqlConsolePage />, 'sql console page', (state) => <RoutePageFallback state={state} />) }
    ]
  }
]);
