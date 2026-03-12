import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { ApiOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type Source = { id: string; name: string; type: 'hive' | 'duckdb'; connected: boolean };

const rows: Source[] = [
  { id: 'src-001', name: 'hive-prod', type: 'hive', connected: true },
  { id: 'src-002', name: 'duckdb-local-a', type: 'duckdb', connected: false }
];

export default function DataSourcesPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formType, setFormType] = useState<string>();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const duckdbExists = rows.some((r) => r.type === 'duckdb');

  const columns: ColumnsType<Source> = [
    { title: t('pages.dataSources.columns.name'), dataIndex: 'name' },
    { title: t('pages.dataSources.columns.type'), dataIndex: 'type' },
    {
      title: t('pages.dataSources.columns.connectionStatus'),
      render: (_, row) => (
        <Space>
          {row.connected
            ? <Tag color="green">{t('pages.dataSources.statusConnected')}</Tag>
            : <Tag color="red">{t('pages.dataSources.statusDisconnected')}</Tag>}
          <Tooltip title={t('pages.dataSources.testConnection')}>
            <Button size="small" icon={<ApiOutlined />} onClick={() => message.info(t('pages.dataSources.testConnection'))} />
          </Tooltip>
        </Space>
      )
    },
    {
      title: t('pages.dataSources.columns.actions'),
      render: (_, row) => (
        <Space>
          {row.type === 'hive' ? (
            <Button
              size="small"
              onClick={() =>
                navigate(`/hive-databases?sourceId=${encodeURIComponent(row.id)}`, {
                  state: { sessionTabMode: 'replace' }
                })
              }
            >
              {t('pages.dataSources.viewHiveDatabases')}
            </Button>
          ) : (
            <Button
              size="small"
              onClick={() =>
                navigate(`/duckdb-tables?sourceId=${encodeURIComponent(row.id)}`, {
                  state: { sessionTabMode: 'replace' }
                })
              }
            >
              {t('pages.dataSources.viewDuckdbTables')}
            </Button>
          )}
          <Button size="small">{t('common.edit')}</Button>
          <Button size="small" danger>{t('common.delete')}</Button>
        </Space>
      )
    }
  ];

  const handleOpenCreate = () => {
    form.resetFields();
    setFormType(undefined);
    setOpen(true);
  };

  return (
    <Card
      className="page-card"
      title={t('pages.dataSources.title')}
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={rows} />
      <Modal open={open} footer={null} onCancel={() => setOpen(false)} title={t('pages.dataSources.createTitle')}>
        <Form form={form} layout="vertical" onFinish={() => setOpen(false)}>
          <Form.Item label={t('pages.dataSources.form.name')} name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('pages.dataSources.form.type')} name="type" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'hive', label: 'Hive' },
                { value: 'duckdb', label: 'DuckDB', disabled: duckdbExists }
              ]}
              onChange={(v) => setFormType(v)}
            />
          </Form.Item>
          {formType === 'hive' && (
            <Form.Item label={t('pages.dataSources.form.connectionAddress')} name="connectionAddress" rules={[{ required: true }]}>
              <Input placeholder="thrift://host:port" />
            </Form.Item>
          )}
          {formType === 'duckdb' && duckdbExists && (
            <Typography.Text type="warning" style={{ display: 'block', marginBottom: 16 }}>{t('pages.dataSources.duckdbExists')}</Typography.Text>
          )}
          {formType === 'duckdb' && !duckdbExists && (
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>{t('pages.dataSources.duckdbAutoCreate')}</Typography.Text>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={formType === 'duckdb' && duckdbExists}>{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
