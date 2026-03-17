import { Alert, Card, Skeleton, Space, Typography } from 'antd';
import type { LazyLoadingState } from './LazyLoadGuard';

type RoutePageFallbackProps = {
  state: LazyLoadingState;
};

export default function RoutePageFallback({ state }: RoutePageFallbackProps) {
  const { isSlow, isOnline, networkHint } = state;

  return (
    <div style={{ padding: 16 }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {isSlow && (
          <Alert
            showIcon
            type={isOnline ? 'info' : 'warning'}
            message={isOnline ? 'Network is slow, loading content...' : 'You appear offline. Waiting for connection...'}
            description={
              networkHint === 'slow'
                ? 'Detected weak network conditions. Content will appear as soon as chunks finish downloading.'
                : undefined
            }
          />
        )}
        <Card>
          <Skeleton active title={{ width: '35%' }} paragraph={{ rows: 3 }} />
        </Card>
        <Card>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
        {isSlow && (
          <Typography.Text type="secondary">
            Still loading. The page is usable as soon as the current module finishes downloading.
          </Typography.Text>
        )}
      </Space>
    </div>
  );
}
