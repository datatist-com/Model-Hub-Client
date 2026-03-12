import { Button, Card, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type ModelRow = { id: string; modelName: string; version: string; auc: number; status: 'draft' | 'published' | 'archived'; updatedAt: string };

const statusColorMap = { draft: 'gold', published: 'green', archived: 'default' } as const;

const data: ModelRow[] = [
  { id: 'mod-001', modelName: '信用卡申请模型', version: 'v2.1', auc: 0.83, status: 'published', updatedAt: '2026-03-08' },
  { id: 'mod-002', modelName: '资产提升模型', version: 'v1.4', auc: 0.77, status: 'published', updatedAt: '2026-02-21' },
  { id: 'mod-003', modelName: '三方支付防流失模型', version: 'v3.0', auc: 0.86, status: 'draft', updatedAt: '2026-03-10' },
  { id: 'mod-004', modelName: '贷款审批模型', version: 'v1.0', auc: 0.73, status: 'archived', updatedAt: '2025-12-15' }
];

export default function ModelManagementPage() {
  const { t } = useTranslation();

  const statusTextMap: Record<string, string> = {
    draft: t('pages.modelManagement.statusDraft'),
    published: t('pages.modelManagement.statusPublished'),
    archived: t('pages.modelManagement.statusArchived')
  };

  const columns: ColumnsType<ModelRow> = [
    { title: t('pages.modelManagement.columns.id'), dataIndex: 'id' },
    { title: t('pages.modelManagement.columns.modelName'), dataIndex: 'modelName' },
    { title: t('pages.modelManagement.columns.version'), dataIndex: 'version' },
    { title: t('pages.modelManagement.columns.auc'), dataIndex: 'auc', render: (v) => v.toFixed(2) },
    {
      title: t('pages.modelManagement.columns.status'),
      dataIndex: 'status',
      render: (s) => <Tag color={statusColorMap[s as keyof typeof statusColorMap]}>{statusTextMap[s]}</Tag>
    },
    { title: t('pages.modelManagement.columns.updatedAt'), dataIndex: 'updatedAt' },
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
      title={t('pages.modelManagement.title')}
      extra={<Button type="primary">{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
