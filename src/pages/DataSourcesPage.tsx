import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { ApiOutlined, ConsoleSqlOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type Source = { id: string; name: string; type: 'hive' | 'duckdb'; connected: boolean; objectCount: number };

const rows: Source[] = [
  { id: 'src-001', name: 'hive-prod', type: 'hive', connected: true, objectCount: 3 },
  { id: 'src-002', name: 'duckdb-local-a', type: 'duckdb', connected: false, objectCount: 8 }
];

export default function DataSourcesPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formType, setFormType] = useState<string>();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const duckdbExists = rows.some((r) => r.type === 'duckdb');
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Source | null>(null);
  const [editForm] = Form.useForm();

  const columns: ColumnsType<Source> = [
    {
      title: t('pages.dataSources.columns.name'),
      dataIndex: 'name',
      render: (name: string, row) => (
        <Space>
          <span>{name}</span>
          <Tooltip title="SQL">
            <Button size="small" type="text" icon={<ConsoleSqlOutlined />} onClick={() => navigate(`/sql-console?sourceId=${encodeURIComponent(row.id)}`, { state: { sessionTabMode: 'replace' } })} />
          </Tooltip>
        </Space>
      )
    },
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
      title: t('pages.dataSources.columns.objectCount'),
      render: (_, row) => (
        <a
          onClick={() => {
            if (row.type === 'hive') {
              navigate(`/hive-databases?sourceId=${encodeURIComponent(row.id)}`, { state: { sessionTabMode: 'replace' } });
            } else {
              navigate(`/duckdb-tables?sourceId=${encodeURIComponent(row.id)}`, { state: { sessionTabMode: 'replace' } });
            }
          }}
        >
          {row.type === 'hive'
            ? t('pages.dataSources.containsDatabases', { count: row.objectCount })
            : t('pages.dataSources.containsTables', { count: row.objectCount })}
        </a>
      )
    },
    {
      title: t('pages.dataSources.columns.actions'),
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => { setEditRecord(row); editForm.setFieldsValue({ name: row.name }); setEditOpen(true); }}>{t('common.edit')}</Button>
          <Button size="small" danger onClick={() => {
            Modal.confirm({
              title: t('pages.dataSources.deleteConfirmTitle'),
              icon: <ExclamationCircleOutlined />,
              content: t('pages.dataSources.deleteConfirmContent'),
              okText: t('common.delete'),
              okButtonProps: { danger: true },
              cancelText: t('common.cancel'),
              onOk: () => message.success('Deleted')
            });
          }}>{t('common.delete')}</Button>
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
      extra={<Button icon={<PlusOutlined />} onClick={handleOpenCreate}>{t('common.create')}</Button>}
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
      <Modal open={editOpen} title={t('pages.dataSources.editTitle')} footer={null} onCancel={() => setEditOpen(false)}>
        <Form form={editForm} layout="vertical" onFinish={() => setEditOpen(false)}>
          <Form.Item label={t('pages.dataSources.form.name')} name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {editRecord?.type === 'hive' && (
            <Form.Item label={t('pages.dataSources.form.connectionAddress')} name="connectionAddress">
              <Input placeholder="thrift://host:port" />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
