import { Alert, Card, Layout, Skeleton, Space, Typography } from 'antd';
import type { LazyLoadingState } from './LazyLoadGuard';

const { Header, Content } = Layout;

type AppShellFallbackProps = {
  state: LazyLoadingState;
};

export default function AppShellFallback({ state }: AppShellFallbackProps) {
  const { isSlow, isOnline, networkHint } = state;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: 'transparent', padding: '12px 16px' }}>
        <Skeleton.Input active size="small" style={{ width: 220 }} />
      </Header>
      <Layout>
        <Content style={{ padding: 16 }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {isSlow && (
              <Alert
                showIcon
                type={isOnline ? 'info' : 'warning'}
                message={isOnline ? 'Loading workspace modules...' : 'Offline while loading workspace modules'}
                description={
                  networkHint === 'slow'
                    ? 'Weak network detected. Core workspace shell will appear automatically once required chunks download.'
                    : undefined
                }
              />
            )}
            <Card>
              <Skeleton active paragraph={{ rows: 3 }} />
            </Card>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Card>
            {isSlow && (
              <Typography.Text type="secondary">
                Still preparing the authenticated area. You can wait here without reloading.
              </Typography.Text>
            )}
          </Space>
        </Content>
      </Layout>
    </Layout>
  );
}
