import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Table, Tooltip } from 'antd';
import { LeftOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SOURCE_NAME_MAP } from '../constants/mockMaps';
import { useRefreshingSet } from '../hooks/useRefreshingSet';

type Row = { id: string; sourceId: string; databaseName: string; tableCount: number };

const data: Row[] = [
  { id: 'hdb-001', sourceId: 'src-001', databaseName: 'dwd', tableCount: 12 },
  { id: 'hdb-002', sourceId: 'src-001', databaseName: 'ods', tableCount: 5 }
];

export default function HiveDatabasesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId') ?? 'src-001';
  const sourceName = SOURCE_NAME_MAP[sourceId] ?? sourceId;
  const [createOpen, setCreateOpen] = useState(false);
  const { refreshingIds, refresh: handleRefreshCount } = useRefreshingSet();

  const columns: ColumnsType<Row> = [
    { title: t('pages.hiveDatabases.columns.source'), dataIndex: 'sourceId', width: 160, render: () => sourceName },
    { title: t('pages.hiveDatabases.columns.database'), dataIndex: 'databaseName', width: 200 },
    {
      title: t('pages.hiveDatabases.columns.objectCount'),
      dataIndex: 'tableCount',
      width: 200,
      render: (count: number, row) => (
        <Space>
          <a
            onClick={() =>
              navigate(
                `/hive-tables?sourceId=${encodeURIComponent(sourceId)}&databaseName=${encodeURIComponent(row.databaseName)}`,
                { state: { sessionTabMode: 'replace' } }
              )
            }
          >
            {refreshingIds.has(row.id) ? '-' : t('pages.hiveDatabases.containsTables', { count })}
          </a>
          <ReloadOutlined style={{ cursor: 'pointer', fontSize: 12, opacity: 0.45 }} onClick={() => handleRefreshCount(row.id)} />
        </Space>
      )
    }
  ];

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t('pages.hiveDatabases.backToDataSources')}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate('/data-sources', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
          <span>{t('pages.hiveDatabases.title')} ({t('pages.hiveDatabases.sourceLabel')}: {sourceName})</span>
        </Space>
      }
      extra={
        <Button icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('common.create')}</Button>
      }
    >
      <Table rowKey="id" columns={columns} dataSource={data.map((item) => ({ ...item, sourceId }))} />

      <Modal open={createOpen} title={t('pages.hiveDatabases.createTitle')} footer={null} onCancel={() => setCreateOpen(false)}>
        <Form layout="vertical" onFinish={() => setCreateOpen(false)}>
          <Form.Item label={t('pages.hiveDatabases.form.databaseName')} name="databaseName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
