import { useState } from 'react';
import { Button, Card, Input, Space, Table, Tag, Tooltip, message } from 'antd';
import { ClearOutlined, LeftOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SOURCE_NAME_MAP: Record<string, string> = { 'src-001': 'hive-prod', 'src-002': 'duckdb-local-a' };

type HistoryRecord = {
  id: string;
  sql: string;
  status: 'success' | 'error';
  rows: number;
  duration: string;
  executedAt: string;
};

const mockHistory: HistoryRecord[] = [
  { id: 'h-001', sql: 'SELECT COUNT(*) FROM dwd.user_events_di', status: 'success', rows: 1, duration: '0.45s', executedAt: '2025-07-14 10:32:05' },
  { id: 'h-002', sql: 'SELECT * FROM dwd.user_profile LIMIT 10', status: 'success', rows: 10, duration: '1.23s', executedAt: '2025-07-14 10:28:41' },
  { id: 'h-003', sql: 'SELECT * FROM nonexistent_table', status: 'error', rows: 0, duration: '0.12s', executedAt: '2025-07-14 10:25:17' }
];

export default function SqlConsolePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId') ?? '';
  const sourceName = SOURCE_NAME_MAP[sourceId] ?? sourceId;
  const [sql, setSql] = useState('');
  const [history, setHistory] = useState<HistoryRecord[]>(mockHistory);

  const handleExecute = () => {
    if (!sql.trim()) {
      message.warning(t('pages.sqlConsole.emptySqlWarning'));
      return;
    }
    const record: HistoryRecord = {
      id: `h-${Date.now()}`,
      sql: sql.trim(),
      status: 'success',
      rows: Math.floor(Math.random() * 100),
      duration: `${(Math.random() * 3).toFixed(2)}s`,
      executedAt: new Date().toLocaleString('sv-SE').replace('T', ' ')
    };
    setHistory((prev) => [record, ...prev]);
    message.success(t('pages.sqlConsole.executeSuccess'));
  };

  const columns: ColumnsType<HistoryRecord> = [
    {
      title: t('pages.sqlConsole.columns.executedAt'),
      dataIndex: 'executedAt',
      width: 180
    },
    {
      title: t('pages.sqlConsole.columns.sql'),
      dataIndex: 'sql',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>
        </Tooltip>
      )
    },
    {
      title: t('pages.sqlConsole.columns.status'),
      dataIndex: 'status',
      width: 100,
      render: (status: string) =>
        status === 'success'
          ? <Tag color="green">{t('pages.sqlConsole.statusSuccess')}</Tag>
          : <Tag color="red">{t('pages.sqlConsole.statusError')}</Tag>
    },
    {
      title: t('pages.sqlConsole.columns.rows'),
      dataIndex: 'rows',
      width: 100,
      render: (v: number) => v.toLocaleString()
    },
    {
      title: t('pages.sqlConsole.columns.duration'),
      dataIndex: 'duration',
      width: 100
    }
  ];

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t('pages.sqlConsole.backToDataSources')}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate('/data-sources', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
          {t('pages.sqlConsole.title')}（{sourceName}）
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input.TextArea
          rows={6}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          placeholder={t('pages.sqlConsole.placeholder')}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
        <Space style={{ marginTop: 8 }}>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleExecute}>
            {t('pages.sqlConsole.execute')}
          </Button>
          <Button icon={<ClearOutlined />} onClick={() => setSql('')}>
            {t('pages.sqlConsole.clear')}
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={history}
        title={() => t('pages.sqlConsole.historyTitle')}
        size="small"
      />
    </Card>
  );
}
