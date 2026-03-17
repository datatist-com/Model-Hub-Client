import { Component, Suspense, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Result, Skeleton, Space, Typography } from 'antd';

export type LazyNetworkHint = 'offline' | 'slow' | 'normal' | 'unknown';

export type LazyLoadingState = {
  isSlow: boolean;
  isOnline: boolean;
  elapsedMs: number;
  networkHint: LazyNetworkHint;
};

type LazyLoadGuardProps = {
  children: ReactNode;
  featureName: string;
  loadingFallback?: ReactNode | ((state: LazyLoadingState) => ReactNode);
  delayMs?: number;
  slowThresholdMs?: number;
};

type LazyErrorBoundaryProps = {
  children: ReactNode;
  featureName: string;
  onRetry: () => void;
};

type LazyErrorBoundaryState = {
  error: Error | null;
};

function toError(input: unknown): Error {
  if (input instanceof Error) {
    return input;
  }
  return new Error(typeof input === 'string' ? input : 'Unknown lazy loading error');
}

function isLikelyChunkLoadError(error: Error): boolean {
  const text = `${error.name} ${error.message}`.toLowerCase();
  return (
    text.indexOf('chunkloaderror') !== -1 ||
    text.indexOf('loading chunk') !== -1 ||
    text.indexOf('failed to fetch dynamically imported module') !== -1 ||
    text.indexOf('importing a module script failed') !== -1 ||
    text.indexOf('dynamically imported module') !== -1
  );
}

function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const markOnline = () => setOnline(true);
    const markOffline = () => setOnline(false);
    window.addEventListener('online', markOnline);
    window.addEventListener('offline', markOffline);
    return () => {
      window.removeEventListener('online', markOnline);
      window.removeEventListener('offline', markOffline);
    };
  }, []);

  return online;
}

function getNetworkHint(online: boolean): LazyNetworkHint {
  if (!online) {
    return 'offline';
  }

  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number; saveData?: boolean };
  };
  const connection = nav.connection;

  if (!connection) {
    return 'unknown';
  }

  if (connection.saveData) {
    return 'slow';
  }

  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return 'slow';
  }

  if (typeof connection.downlink === 'number' && connection.downlink > 0 && connection.downlink <= 0.8) {
    return 'slow';
  }

  return 'normal';
}

function LoadingFallbackView({
  loadingFallback,
  delayMs,
  slowThresholdMs
}: {
  loadingFallback?: ReactNode | ((state: LazyLoadingState) => ReactNode);
  delayMs: number;
  slowThresholdMs: number;
}) {
  const isOnline = useOnlineStatus();
  const [showFallback, setShowFallback] = useState(delayMs <= 0);
  const [isSlow, setIsSlow] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const delayTimer = window.setTimeout(() => {
      setShowFallback(true);
      setElapsedMs(Date.now() - start);
    }, Math.max(delayMs, 0));

    const slowTimer = window.setTimeout(() => {
      setIsSlow(true);
      setElapsedMs(Date.now() - start);
    }, Math.max(slowThresholdMs, 0));

    const tickTimer = window.setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 250);

    return () => {
      window.clearTimeout(delayTimer);
      window.clearTimeout(slowTimer);
      window.clearInterval(tickTimer);
    };
  }, [delayMs, slowThresholdMs]);

  if (!showFallback) {
    return null;
  }

  const state: LazyLoadingState = {
    isSlow,
    isOnline,
    elapsedMs,
    networkHint: getNetworkHint(isOnline)
  };

  if (typeof loadingFallback === 'function') {
    return <>{loadingFallback(state)}</>;
  }

  if (loadingFallback) {
    return <>{loadingFallback}</>;
  }

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Skeleton active paragraph={{ rows: 3 }} />
        {isSlow && (
          <Typography.Text type="secondary">
            {isOnline ? 'Loading is taking longer than expected due to slow network.' : 'Offline detected. Waiting for network recovery...'}
          </Typography.Text>
        )}
      </Space>
    </div>
  );
}

function LazyLoadErrorFallback({ featureName, error, onRetry }: { featureName: string; error: Error; onRetry: () => void }) {
  const online = useOnlineStatus();
  const chunkError = useMemo(() => isLikelyChunkLoadError(error), [error]);

  return (
    <Result
      status={online ? 'warning' : 'error'}
      title={online ? `Unable to load ${featureName}` : `You are offline — ${featureName} is unavailable`}
      subTitle={
        chunkError
          ? 'The lazy-loaded chunk did not arrive in time or failed to load. You can retry now, or refresh after network recovers.'
          : error.message
      }
      extra={
        <Space>
          <Button type="primary" onClick={onRetry}>
            Retry
          </Button>
          <Button onClick={() => window.location.reload()}>
            Reload App
          </Button>
        </Space>
      }
    >
      {!online && (
        <Typography.Text type="secondary">
          Network is currently offline. Reconnect and click Retry.
        </Typography.Text>
      )}
    </Result>
  );
}

class LazyErrorBoundary extends Component<LazyErrorBoundaryProps, LazyErrorBoundaryState> {
  state: LazyErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): LazyErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown) {
    this.setState({ error: toError(error) });
  }

  private retry = () => {
    this.setState({ error: null });
    this.props.onRetry();
  };

  render() {
    if (this.state.error) {
      return <LazyLoadErrorFallback featureName={this.props.featureName} error={this.state.error} onRetry={this.retry} />;
    }

    return this.props.children;
  }
}

export default function LazyLoadGuard({ children, featureName, loadingFallback, delayMs = 120, slowThresholdMs = 1400 }: LazyLoadGuardProps) {
  const [retryToken, setRetryToken] = useState(0);

  return (
    <LazyErrorBoundary
      key={retryToken}
      featureName={featureName}
      onRetry={() => setRetryToken((prev) => prev + 1)}
    >
      <Suspense fallback={<LoadingFallbackView loadingFallback={loadingFallback} delayMs={delayMs} slowThresholdMs={slowThresholdMs} />}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
}
