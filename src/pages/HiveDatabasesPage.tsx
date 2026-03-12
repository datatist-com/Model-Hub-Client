import { Button, Card, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Row = { id: string; sourceId: string; databaseName: string };

const data: Row[] = [{ id: 'hdb-001', sourceId: 'src-001', databaseName: 'dwd' }];

export default function HiveDatabasesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId') ?? 'src-001';

  const columns: ColumnsType<Row> = [
    { title: t('pages.hiveDatabases.columns.id'), dataIndex: 'id' },
    { title: t('pages.hiveDatabases.columns.source'), dataIndex: 'sourceId' },
    { title: t('pages.hiveDatabases.columns.database'), dataIndex: 'databaseName' },
    {
      title: t('pages.hiveDatabases.columns.actions'),
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() =>
              navigate(
                `/hive-tables?sourceId=${encodeURIComponent(sourceId)}&databaseName=${encodeURIComponent(row.databaseName)}`,
                { state: { sessionTabMode: 'replace' } }
              )
            }
          >
            {t('pages.hiveDatabases.tableManagement')}
          </Button>
          <Button size="small">{t('common.edit')}</Button>
          <Button size="small" danger>{t('common.delete')}</Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      className="page-card"
      title={t('pages.hiveDatabases.title')}
      extra={
        <Space>
          <Typography.Text type="secondary">{t('pages.hiveDatabases.sourceLabel')}: {sourceId}</Typography.Text>
          <Button onClick={() => navigate('/data-sources', { state: { sessionTabMode: 'replace' } })}>
            {t('pages.hiveDatabases.backToDataSources')}
          </Button>
          <Button type="primary">{t('common.create')}</Button>
        </Space>
      }
    >
      <Table rowKey="id" columns={columns} dataSource={data.map((item) => ({ ...item, sourceId }))} />
    </Card>
  );
}
