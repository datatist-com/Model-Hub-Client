import { Button, Card, List, Space, Steps, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type JobRow = { jobId: string; tableName: string; status: 'queued' | 'running' | 'succeeded' | 'failed' };

const jobs: JobRow[] = [
  { jobId: 'job-duckdb-ingest-001', tableName: 'user_events', status: 'running' },
  { jobId: 'job-duckdb-ingest-002', tableName: 'user_profile', status: 'succeeded' }
];

export default function IngestJobsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId') ?? 'src-002';
  const tableName = searchParams.get('tableName') ?? 'user_events';

  const columns: ColumnsType<JobRow> = [
    { title: t('pages.ingestJobs.columns.jobId'), dataIndex: 'jobId', width: 140 },
    { title: t('pages.ingestJobs.columns.targetTable'), dataIndex: 'tableName', width: 200 },
    {
      title: t('pages.ingestJobs.columns.status'),
      dataIndex: 'status',
      width: 120,
      render: (s) => {
        const color = s === 'succeeded' ? 'green' : s === 'failed' ? 'red' : s === 'running' ? 'blue' : 'gold';
        return <Tag color={color}>{s}</Tag>;
      }
    },
    { title: t('pages.ingestJobs.columns.action'), width: 100, render: () => <Button size="small">{t('pages.ingestJobs.view')}</Button> }
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card
        className="page-card"
        title={t('pages.ingestJobs.title')}
        extra={
          <Space>
            <Typography.Text type="secondary">
              {t('pages.ingestJobs.sourceLabel')}: {sourceId} / {t('pages.ingestJobs.tableLabel')}: {tableName}
            </Typography.Text>
            <Button
              onClick={() =>
                navigate(`/duckdb-tables?sourceId=${encodeURIComponent(sourceId)}`, {
                  state: { sessionTabMode: 'replace' }
                })
              }
            >
              {t('pages.ingestJobs.backToDuckDBTables')}
            </Button>
          </Space>
        }
      >
        <Steps
          items={[
            { title: t('pages.ingestJobs.steps.createSession') },
            { title: t('pages.ingestJobs.steps.uploadFile') },
            { title: t('pages.ingestJobs.steps.completeUpload') },
            { title: t('pages.ingestJobs.steps.createJob') },
            { title: t('pages.ingestJobs.steps.trackJob') }
          ]}
        />
      </Card>
      <Card className="page-card" title={t('pages.ingestJobs.jobList')}>
        <Table rowKey="jobId" columns={columns} dataSource={jobs} />
      </Card>
      <Card className="page-card" title={t('pages.ingestJobs.recentFiles')}>
        <List
          dataSource={['events_20260301.csv', 'profile_20260301.parquet']}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Card>
    </Space>
  );
}
