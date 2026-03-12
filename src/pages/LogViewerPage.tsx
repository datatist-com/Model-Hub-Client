import { useState } from 'react';
import { Card, Segmented, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type LogRow = { id: string; timestamp: string; level: 'INFO' | 'WARN' | 'ERROR'; source: string; message: string };

const levelColorMap = { INFO: 'blue', WARN: 'gold', ERROR: 'red' } as const;

const allLogs: LogRow[] = [
  { id: 'log-001', timestamp: '2026-03-12 10:01:12', level: 'INFO', source: 'ModelService', message: 'Model mod-001 published successfully' },
  { id: 'log-002', timestamp: '2026-03-12 10:02:33', level: 'WARN', source: 'IngestWorker', message: 'File upload retry attempt 2/3 for job-duckdb-ingest-001' },
  { id: 'log-003', timestamp: '2026-03-12 10:03:45', level: 'ERROR', source: 'HiveConnector', message: 'Connection timeout to hive-prod (10.12.3.5:10000)' },
  { id: 'log-004', timestamp: '2026-03-12 10:05:01', level: 'INFO', source: 'ScoringEngine', message: 'Scoring job sc-001 completed, 18432 records scored' },
  { id: 'log-005', timestamp: '2026-03-12 10:06:18', level: 'INFO', source: 'AuthService', message: 'User luxingan logged in from 10.12.3.5' },
  { id: 'log-006', timestamp: '2026-03-12 10:07:55', level: 'WARN', source: 'FeatureStore', message: 'Feature last_login_days has null rate > 15%' },
  { id: 'log-007', timestamp: '2026-03-12 10:09:22', level: 'ERROR', source: 'DuckDBService', message: 'Table creation failed: disk space insufficient' }
];

export default function LogViewerPage() {
  const { t } = useTranslation();
  const [levelFilter, setLevelFilter] = useState<string>('ALL');

  const filteredLogs = levelFilter === 'ALL' ? allLogs : allLogs.filter((log) => log.level === levelFilter);

  const columns: ColumnsType<LogRow> = [
    { title: t('pages.logViewer.columns.timestamp'), dataIndex: 'timestamp', width: 180 },
    {
      title: t('pages.logViewer.columns.level'),
      dataIndex: 'level',
      width: 100,
      render: (level) => <Tag color={levelColorMap[level as keyof typeof levelColorMap]}>{level}</Tag>
    },
    { title: t('pages.logViewer.columns.source'), dataIndex: 'source', width: 140 },
    { title: t('pages.logViewer.columns.message'), dataIndex: 'message' }
  ];

  return (
    <Card
      className="page-card"
      title={t('pages.logViewer.title')}
      extra={
        <Segmented
          size="small"
          value={levelFilter}
          onChange={(v) => setLevelFilter(v as string)}
          options={[
            { label: t('pages.logViewer.allLevels'), value: 'ALL' },
            { label: 'INFO', value: 'INFO' },
            { label: 'WARN', value: 'WARN' },
            { label: 'ERROR', value: 'ERROR' }
          ]}
        />
      }
    >
      <Table rowKey="id" columns={columns} dataSource={filteredLogs} pagination={{ pageSize: 20 }} />
    </Card>
  );
}
