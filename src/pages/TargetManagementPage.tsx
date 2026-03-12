import { Button, Card, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type TargetRow = { id: string; targetName: string; type: 'binary' | 'continuous'; description: string; createdAt: string };

const data: TargetRow[] = [
  { id: 't-001', targetName: 'is_credit_approved', type: 'binary', description: '信用卡审批是否通过', createdAt: '2026-01-10' },
  { id: 't-002', targetName: 'asset_growth_rate', type: 'continuous', description: '客户资产增长率', createdAt: '2026-02-01' },
  { id: 't-003', targetName: 'is_churned', type: 'binary', description: '客户是否流失', createdAt: '2026-02-18' }
];

export default function TargetManagementPage() {
  const { t } = useTranslation();

  const columns: ColumnsType<TargetRow> = [
    { title: t('pages.targetManagement.columns.id'), dataIndex: 'id' },
    { title: t('pages.targetManagement.columns.targetName'), dataIndex: 'targetName' },
    {
      title: t('pages.targetManagement.columns.type'),
      dataIndex: 'type',
      render: (v) =>
        v === 'binary'
          ? <Tag color="blue">{t('pages.targetManagement.typeBinary')}</Tag>
          : <Tag color="purple">{t('pages.targetManagement.typeContinuous')}</Tag>
    },
    { title: t('pages.targetManagement.columns.description'), dataIndex: 'description' },
    { title: t('pages.targetManagement.columns.createdAt'), dataIndex: 'createdAt' },
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
      title={t('pages.targetManagement.title')}
      extra={<Button icon={<PlusOutlined />}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
