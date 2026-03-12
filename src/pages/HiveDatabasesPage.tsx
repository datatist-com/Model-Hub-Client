import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Table, Tooltip, Typography, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const columns: ColumnsType<Row> = [
    { title: t('pages.hiveDatabases.columns.source'), dataIndex: 'sourceId' },
    { title: t('pages.hiveDatabases.columns.database'), dataIndex: 'databaseName' },
    {
      title: t('pages.hiveDatabases.columns.tableCount'),
      dataIndex: 'tableCount',
      render: (count: number, row) => (
        <a
          onClick={() =>
            navigate(
              `/hive-tables?sourceId=${encodeURIComponent(sourceId)}&databaseName=${encodeURIComponent(row.databaseName)}`,
              { state: { sessionTabMode: 'replace' } }
            )
          }
        >
          {count}
        </a>
      )
    },
    {
      title: t('pages.hiveDatabases.columns.actions'),
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            danger
            onClick={() => {
              setDeleteTarget(row);
              setDeletePassword('');
            }}
          >
            {t('common.delete')}
          </Button>
        </Space>
      )
    }
  ];

  const handleDelete = () => {
    if (!deletePassword) {
      message.warning(t('pages.hiveDatabases.passwordRequired'));
      return;
    }
    message.success('Deleted');
    setDeleteTarget(null);
    setDeletePassword('');
  };

  return (
    <Card
      className="page-card"
      title={
        <Space>
          {t('pages.hiveDatabases.title')}
          <Tooltip title={t('pages.hiveDatabases.backToDataSources')}>
            <ArrowLeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate('/data-sources', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
        </Space>
      }
      extra={
        <Space>
          <Typography.Text type="secondary">{t('pages.hiveDatabases.sourceLabel')}: {sourceId}</Typography.Text>
          <Button icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>{t('common.create')}</Button>
        </Space>
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

      <Modal
        open={!!deleteTarget}
        title={t('pages.hiveDatabases.deleteConfirmTitle')}
        onCancel={() => setDeleteTarget(null)}
        onOk={handleDelete}
        okButtonProps={{ danger: true }}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
      >
        <p>{t('pages.hiveDatabases.deleteConfirmContent')}</p>
        <Input.Password
          placeholder={t('pages.hiveDatabases.passwordPlaceholder')}
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
        />
      </Modal>
    </Card>
  );
}
