import { Button, Card, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type ListRow = { id: string; listName: string; model: string; recordCount: number; status: 'pending' | 'generated' | 'exported'; createdAt: string };

const statusColorMap = { pending: 'gold', generated: 'green', exported: 'blue' } as const;

const data: ListRow[] = [
  { id: 'ol-001', listName: '信用卡营销名单_202603', model: '信用卡申请模型 v2.1', recordCount: 5200, status: 'exported', createdAt: '2026-03-08' },
  { id: 'ol-002', listName: '资产提升名单_202603', model: '资产提升模型 v1.4', recordCount: 3100, status: 'generated', createdAt: '2026-03-10' },
  { id: 'ol-003', listName: '流失挡拦名单_202603', model: '三方支付防流失模型 v3.0', recordCount: 0, status: 'pending', createdAt: '2026-03-12' }
];

export default function OperationListOutputPage() {
  const { t } = useTranslation();

  const statusTextMap: Record<string, string> = {
    pending: t('pages.operationListOutput.statusPending'),
    generated: t('pages.operationListOutput.statusGenerated'),
    exported: t('pages.operationListOutput.statusExported')
  };

  const columns: ColumnsType<ListRow> = [
    { title: t('pages.operationListOutput.columns.id'), dataIndex: 'id' },
    { title: t('pages.operationListOutput.columns.listName'), dataIndex: 'listName' },
    { title: t('pages.operationListOutput.columns.model'), dataIndex: 'model' },
    { title: t('pages.operationListOutput.columns.recordCount'), dataIndex: 'recordCount' },
    {
      title: t('pages.operationListOutput.columns.status'),
      dataIndex: 'status',
      render: (s) => <Tag color={statusColorMap[s as keyof typeof statusColorMap]}>{statusTextMap[s]}</Tag>
    },
    { title: t('pages.operationListOutput.columns.createdAt'), dataIndex: 'createdAt' },
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
      title={t('pages.operationListOutput.title')}
      extra={<Button type="primary">{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
