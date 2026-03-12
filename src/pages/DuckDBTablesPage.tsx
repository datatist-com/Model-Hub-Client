import { Button, Card, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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

  const columns: ColumnsType<Row> = [
    { title: t('pages.duckdbTables.columns.id'), dataIndex: 'id' },
    { title: t('pages.duckdbTables.columns.table'), dataIndex: 'tableName' },
    { title: t('pages.duckdbTables.columns.rowCount'), dataIndex: 'rowCount' },
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
      title={t('pages.duckdbTables.title')}
      extra={
        <Space>
          <Typography.Text type="secondary">{t('pages.duckdbTables.sourceLabel')}: {sourceId}</Typography.Text>
          <Button onClick={() => navigate('/data-sources', { state: { sessionTabMode: 'replace' } })}>
            {t('pages.duckdbTables.backToDataSources')}
          </Button>
          <Button icon={<PlusOutlined />}>{t('common.create')}</Button>
        </Space>
      }
    >
      <Table rowKey="id" columns={columns} dataSource={data} />
    </Card>
  );
}
