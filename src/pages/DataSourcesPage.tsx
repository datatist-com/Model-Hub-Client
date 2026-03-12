import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type Source = { id: string; name: string; type: 'hive' | 'duckdb'; mode: 'external' | 'local' };

const rows: Source[] = [
  { id: 'src-001', name: 'hive-prod', type: 'hive', mode: 'external' },
  { id: 'src-002', name: 'duckdb-local-a', type: 'duckdb', mode: 'local' }
];

export default function DataSourcesPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const columns: ColumnsType<Source> = [
    { title: t('pages.dataSources.columns.id'), dataIndex: 'id' },
    { title: t('pages.dataSources.columns.name'), dataIndex: 'name' },
    { title: t('pages.dataSources.columns.type'), dataIndex: 'type' },
    { title: t('pages.dataSources.columns.connectionMode'), dataIndex: 'mode' },
    {
      title: t('pages.dataSources.columns.actions'),
      render: (_, row) => (
        <Space>
          <Button size="small">{t('pages.dataSources.testConnection')}</Button>
          {row.type === 'hive' ? (
            <Button
              size="small"
              type="primary"
              onClick={() =>
                navigate(`/hive-databases?sourceId=${encodeURIComponent(row.id)}`, {
                  state: { sessionTabMode: 'replace' }
                })
              }
            >
              {t('pages.dataSources.hiveDatabases')}
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              onClick={() =>
                navigate(`/duckdb-tables?sourceId=${encodeURIComponent(row.id)}`, {
                  state: { sessionTabMode: 'replace' }
                })
              }
            >
              {t('pages.dataSources.duckdbTables')}
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <Card className="page-card" title={t('pages.dataSources.title')} extra={<Button onClick={() => setOpen(true)}>{t('common.create')}</Button>}>
      <Table rowKey="id" columns={columns} dataSource={rows} />
      <Modal open={open} footer={null} onCancel={() => setOpen(false)} title={t('pages.dataSources.createTitle')}>
        <Form layout="vertical" onFinish={() => setOpen(false)}>
          <Form.Item label={t('pages.dataSources.form.name')} name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('pages.dataSources.form.type')} name="type" rules={[{ required: true }]}>
            <Select options={[{ value: 'hive' }, { value: 'duckdb' }]} />
          </Form.Item>
          <Form.Item label={t('pages.dataSources.form.connectionMode')} name="mode" rules={[{ required: true }]}>
            <Select options={[{ value: 'external' }, { value: 'local' }]} />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Space>
        </Form>
      </Modal>
    </Card>
  );
}
