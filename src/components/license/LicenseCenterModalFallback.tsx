import { Alert, Modal, Skeleton, Space, Typography } from 'antd';
import type { LazyLoadingState } from '../lazy/LazyLoadGuard';

type LicenseCenterModalFallbackProps = {
  open: boolean;
  title: string;
  onCancel: () => void;
  state: LazyLoadingState;
};

export default function LicenseCenterModalFallback({ open, title, onCancel, state }: LicenseCenterModalFallbackProps) {
  const { isSlow, isOnline, networkHint } = state;

  return (
    <Modal open={open} footer={null} title={title} onCancel={onCancel}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {isSlow && (
          <Alert
            showIcon
            type={isOnline ? 'info' : 'warning'}
            message={isOnline ? 'Preparing license center...' : 'Offline detected while loading license center'}
            description={
              networkHint === 'slow'
                ? 'Weak network detected. Modal content will load automatically once the chunk arrives.'
                : undefined
            }
          />
        )}

        <Skeleton active title={{ width: '40%' }} paragraph={{ rows: 2 }} />
        <Skeleton active title={false} paragraph={{ rows: 4 }} />

        {isSlow && (
          <Typography.Text type="secondary">
            You can keep this modal open; content will appear when loading completes.
          </Typography.Text>
        )}
      </Space>
    </Modal>
  );
}
