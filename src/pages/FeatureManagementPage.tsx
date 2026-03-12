import { Button, Card, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type FeatureRow = { id: string; featureName: string; dataType: string; sourceTable: string; status: 'enabled' | 'disabled'; createdAt: string };

const data: FeatureRow[] = [
  { id: 'f-001', featureName: 'avg_monthly_balance', dataType: 'float', sourceTable: 'dwd.user_balance_m', status: 'enabled', createdAt: '2026-01-15' },
  { id: 'f-002', featureName: 'txn_count_30d', dataType: 'int', sourceTable: 'dwd.user_transactions', status: 'enabled', createdAt: '2026-02-03' },
  { id: 'f-003', featureName: 'last_login_days', dataType: 'int', sourceTable: 'dwd.user_events_di', status: 'disabled', createdAt: '2026-02-20' },
  { id: 'f-004', featureName: 'credit_utilization', dataType: 'float', sourceTable: 'dwd.user_credit', status: 'enabled', createdAt: '2026-03-01' }
];

export default function FeatureManagementPage() {
  const { t } = useTranslation();

  const columns: ColumnsType<FeatureRow> = [
    { title: t('pages.featureManagement.columns.id'), dataIndex: 'id' },
    { title: t('pages.featureManagement.columns.featureName'), dataIndex: 'featureName' },
    { title: t('pages.featureManagement.columns.dataType'), dataIndex: 'dataType' },
    { title: t('pages.featureManagement.columns.sourceTable'), dataIndex: 'sourceTable' },
    {
      title: t('pages.featureManagement.columns.status'),
      dataIndex: 'status',
      render: (s) =>
        s === 'enabled' ? <Tag color="green">{t('pages.featureManagement.statusEnabled')}</Tag> : <Tag>{t('pages.featureManagement.statusDisabled')}</Tag>
    },
    { title: t('pages.featureManagement.columns.createdAt'), dataIndex: 'createdAt' },
    {
      title: t('pages.users.columns.actions'),
      render: () => (
        <Space>
          <Button size="small">{t('common.edit')}</Button>
          <Button size="small" danger>{t('common.delete')}</Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      className="page-card"
      title={t('pages.featureManagement.title')}
      extra={<Button icon={<PlusOutlined />}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
