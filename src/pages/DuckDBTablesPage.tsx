import { Button, Card, Space, Table, Tag, Tooltip } from 'antd';
import { LeftOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Row = { id: string; tableName: string; rowCount: number; enabled: boolean };

const data: Row[] = [{ id: 'dtb-001', tableName: 'user_events', rowCount: 120345, enabled: true }];

export default function DuckDBTablesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId') ?? 'src-002';
  const SOURCE_NAME_MAP: Record<string, string> = { 'src-001': 'hive-prod', 'src-002': 'duckdb-local-a' };
  const sourceName = SOURCE_NAME_MAP[sourceId] ?? sourceId;

  const columns: ColumnsType<Row> = [
    { title: t('pages.duckdbTables.columns.id'), dataIndex: 'id' },
    { title: t('pages.duckdbTables.columns.table'), dataIndex: 'tableName' },
    {
      title: t('pages.duckdbTables.columns.objectCount'),
      dataIndex: 'rowCount',
      render: (count: number) => t('pages.duckdbTables.containsRows', { count: count.toLocaleString() })
    },
    {
      title: t('pages.duckdbTables.columns.enabled'),
      dataIndex: 'enabled',
      render: (v) => (v ? <Tag color="green">{t('pages.duckdbTables.enabledTrue')}</Tag> : <Tag>{t('pages.duckdbTables.enabledFalse')}</Tag>)
    },
    {
      title: t('pages.duckdbTables.columns.actions'),
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() =>
              navigate(
                `/ingest-jobs?sourceId=${encodeURIComponent(sourceId)}&tableName=${encodeURIComponent(row.tableName)}`,
                { state: { sessionTabMode: 'replace' } }
              )
            }
          >
            {t('pages.duckdbTables.uploadData')}
          </Button>
          <Button size="small" type="primary">{t('pages.duckdbTables.viewFields')}</Button>
          <Button size="small">{t('common.edit')}</Button>
          <Button size="small" danger>{t('common.delete')}</Button>
        </Space>
      )
    }
  ];
  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t('pages.duckdbTables.backToDataSources')}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate('/data-sources', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
          <span>{t('pages.duckdbTables.title')} ({t('pages.duckdbTables.sourceLabel')}: {sourceName})</span>
        </Space>
      }
      extra={<Button icon={<PlusOutlined />}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} />
    </Card>
  );
}
