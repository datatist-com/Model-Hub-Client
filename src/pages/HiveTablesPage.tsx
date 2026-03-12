import { Button, Card, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Row = { id: string; databaseName: string; tableName: string; alias?: string };

const data: Row[] = [{ id: 'htb-001', databaseName: 'dwd', tableName: 'user_events_di', alias: '用户事件日表' }];

export default function HiveTablesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId') ?? 'src-001';
  const databaseName = searchParams.get('databaseName') ?? 'dwd';

  const columns: ColumnsType<Row> = [
    { title: t('pages.hiveTables.columns.id'), dataIndex: 'id' },
    { title: t('pages.hiveTables.columns.database'), dataIndex: 'databaseName' },
    { title: t('pages.hiveTables.columns.table'), dataIndex: 'tableName' },
    { title: t('pages.hiveTables.columns.alias'), dataIndex: 'alias' },
    {
      title: t('pages.hiveTables.columns.actions'),
      render: () => (
        <Space>
          <Button size="small" type="primary">{t('pages.hiveTables.viewFields')}</Button>
          <Button size="small">{t('common.edit')}</Button>
          <Button size="small" danger>{t('common.delete')}</Button>
        </Space>
      )
    }
  ];
  return (
    <Card
      className="page-card"
      title={t('pages.hiveTables.title')}
      extra={
        <Space>
          <Typography.Text type="secondary">
            {t('pages.hiveTables.sourceLabel')}: {sourceId} / {t('pages.hiveTables.databaseLabel')}: {databaseName}
          </Typography.Text>
          <Button
            onClick={() =>
              navigate(`/hive-databases?sourceId=${encodeURIComponent(sourceId)}`, {
                state: { sessionTabMode: 'replace' }
              })
            }
          >
            {t('pages.hiveTables.backToHiveDatabases')}
          </Button>
          <Button type="primary">{t('common.create')}</Button>
        </Space>
      }
    >
      <Table rowKey="id" columns={columns} dataSource={data.map((item) => ({ ...item, databaseName }))} />
    </Card>
  );
}
