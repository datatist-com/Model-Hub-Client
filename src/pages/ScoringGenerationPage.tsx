import { Button, Card, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type ScoringRow = { id: string; model: string; dataset: string; scoreCount: number; status: 'pending' | 'running' | 'completed' | 'failed'; createdAt: string };

const statusColorMap = { pending: 'gold', running: 'blue', completed: 'green', failed: 'red' } as const;

const data: ScoringRow[] = [
  { id: 'sc-001', model: '信用卡申请模型 v2.1', dataset: 'user_credit_202603', scoreCount: 18432, status: 'completed', createdAt: '2026-03-10' },
  { id: 'sc-002', model: '资产提升模型 v1.4', dataset: 'user_asset_202603', scoreCount: 0, status: 'running', createdAt: '2026-03-11' },
  { id: 'sc-003', model: '三方支付防流失模型 v3.0', dataset: 'payment_churn_202603', scoreCount: 0, status: 'pending', createdAt: '2026-03-12' }
];

export default function ScoringGenerationPage() {
  const { t } = useTranslation();

  const statusTextMap: Record<string, string> = {
    pending: t('pages.scoringGeneration.statusPending'),
    running: t('pages.scoringGeneration.statusRunning'),
    completed: t('pages.scoringGeneration.statusCompleted'),
    failed: t('pages.scoringGeneration.statusFailed')
  };

  const columns: ColumnsType<ScoringRow> = [
    { title: t('pages.scoringGeneration.columns.id'), dataIndex: 'id' },
    { title: t('pages.scoringGeneration.columns.model'), dataIndex: 'model' },
    { title: t('pages.scoringGeneration.columns.dataset'), dataIndex: 'dataset' },
    { title: t('pages.scoringGeneration.columns.scoreCount'), dataIndex: 'scoreCount' },
    {
      title: t('pages.scoringGeneration.columns.status'),
      dataIndex: 'status',
      render: (s) => <Tag color={statusColorMap[s as keyof typeof statusColorMap]}>{statusTextMap[s]}</Tag>
    },
    { title: t('pages.scoringGeneration.columns.createdAt'), dataIndex: 'createdAt' },
    {
      title: t('pages.users.columns.actions'),
      render: () => <Button size="small">{t('common.edit')}</Button>
    }
  ];

  return (
    <Card
      className="page-card"
      title={t('pages.scoringGeneration.title')}
      extra={<Button type="primary">{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
