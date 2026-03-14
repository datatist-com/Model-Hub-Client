import { useState } from 'react';
import { App, Button, Card, Input, Modal, Space, Table, Tabs, Tag, Tooltip, Upload } from 'antd';
import { ExclamationCircleOutlined, InboxOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Row = { id: string; tableName: string; fieldCount: number; rowCount: number; enabled: boolean };

const mockFields = [
  { name: 'user_id', type: 'BIGINT', comment: '用户ID' },
  { name: 'event_type', type: 'VARCHAR', comment: '事件类型' },
  { name: 'event_time', type: 'TIMESTAMP', comment: '事件时间' },
  { name: 'amount', type: 'DOUBLE', comment: '金额' }
];

const data: Row[] = [{ id: 'dtb-001', tableName: 'user_events', fieldCount: 4, rowCount: 120345, enabled: true }];

export default function DuckDBTablesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId') ?? 'src-002';
  const SOURCE_NAME_MAP: Record<string, string> = { 'src-001': 'hive-prod', 'src-002': 'duckdb-local-a' };
  const sourceName = SOURCE_NAME_MAP[sourceId] ?? sourceId;
  const [refreshingFieldIds, setRefreshingFieldIds] = useState<Set<string>>(new Set());
  const [refreshingRowIds, setRefreshingRowIds] = useState<Set<string>>(new Set());
  const [fieldDetailOpen, setFieldDetailOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const handleRefreshField = (id: string) => {
    setRefreshingFieldIds((prev) => new Set(prev).add(id));
    setTimeout(() => setRefreshingFieldIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 1500);
  };
  const handleRefreshRow = (id: string) => {
    setRefreshingRowIds((prev) => new Set(prev).add(id));
    setTimeout(() => setRefreshingRowIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 1500);
  };

  const fieldColumns = [
    { title: t('pages.duckdbTables.fieldDetailColumns.name'), dataIndex: 'name', width: 160 },
    { title: t('pages.duckdbTables.fieldDetailColumns.type'), dataIndex: 'type', width: 120 },
    { title: t('pages.duckdbTables.fieldDetailColumns.comment'), dataIndex: 'comment' }
  ];

  const columns: ColumnsType<Row> = [
    { title: t('pages.duckdbTables.columns.id'), dataIndex: 'id', width: 100 },
    { title: t('pages.duckdbTables.columns.table'), dataIndex: 'tableName', width: 200 },
    {
      title: t('pages.duckdbTables.columns.fieldCount'),
      dataIndex: 'fieldCount',
      width: 180,
      render: (count: number, row) => (
        <Space>
          <a onClick={() => setFieldDetailOpen(true)}>{refreshingFieldIds.has(row.id) ? '-' : t('pages.duckdbTables.containsFields', { count })}</a>
          <ReloadOutlined style={{ cursor: 'pointer', fontSize: 12, opacity: 0.45 }} onClick={() => handleRefreshField(row.id)} />
        </Space>
      )
    },
    {
      title: t('pages.duckdbTables.columns.dataVolume'),
      dataIndex: 'rowCount',
      width: 200,
      render: (count: number, row) => (
        <Space>
          <span>{refreshingRowIds.has(row.id) ? '-' : String(t('pages.duckdbTables.containsRecords', { count }))}</span>
          <ReloadOutlined style={{ cursor: 'pointer', fontSize: 12, opacity: 0.45 }} onClick={() => handleRefreshRow(row.id)} />
        </Space>
      )
    },
    {
      title: t('pages.duckdbTables.columns.enabled'),
      dataIndex: 'enabled',
      width: 100,
      render: (v) => (v ? <Tag color="green">{t('pages.duckdbTables.enabledTrue')}</Tag> : <Tag>{t('pages.duckdbTables.enabledFalse')}</Tag>)
    },
    {
      title: t('pages.duckdbTables.columns.actions'),
      width: 220,
      render: (_, row) => (
        <Space>
          <Button size="small" type="primary" onClick={() => setUploadOpen(true)}>
            {t('pages.duckdbTables.uploadData')}
          </Button>
          <Button size="small">{t('common.edit')}</Button>
          <Button size="small" danger onClick={() => { setDeleteTarget(row); setDeletePassword(''); setDeleteOpen(true); }}>{t('common.delete')}</Button>
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

      <Modal
        open={fieldDetailOpen}
        title={t('pages.duckdbTables.fieldDetailTitle')}
        footer={null}
        onCancel={() => setFieldDetailOpen(false)}
      >
        <Table rowKey="name" columns={fieldColumns} dataSource={mockFields} pagination={false} />
      </Modal>

      <Modal
        open={uploadOpen}
        title={t('pages.duckdbTables.uploadTitle')}
        footer={null}
        onCancel={() => setUploadOpen(false)}
        width={560}
      >
        <Tabs
          items={[
            {
              key: 'local',
              label: t('pages.duckdbTables.upload.localTab'),
              children: (
                <div>
                  <p style={{ marginBottom: 12, opacity: 0.65 }}>{t('pages.duckdbTables.upload.localDesc')}</p>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      block
                      onClick={() => { message.success(t('pages.duckdbTables.upload.localStarted')); setUploadOpen(false); }}
                    >
                      {t('pages.duckdbTables.upload.localButton')}
                    </Button>
                  </Space>
                </div>
              )
            },
            {
              key: 'remote',
              label: t('pages.duckdbTables.upload.remoteTab'),
              children: (
                <div>
                  <p style={{ marginBottom: 12, opacity: 0.65 }}>{t('pages.duckdbTables.upload.remoteDesc')}</p>
                  <Upload.Dragger
                    accept=".csv,.parquet,.json,.xlsx"
                    multiple={false}
                    beforeUpload={() => false}
                    onChange={(info) => {
                      if (info.fileList.length > 0) {
                        message.success(t('pages.duckdbTables.upload.remoteReady'));
                      }
                    }}
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">{t('pages.duckdbTables.upload.remoteDragText')}</p>
                    <p className="ant-upload-hint">{t('pages.duckdbTables.upload.remoteDragHint')}</p>
                  </Upload.Dragger>
                  <Button
                    type="primary"
                    block
                    icon={<UploadOutlined />}
                    style={{ marginTop: 16 }}
                    onClick={() => { message.success(t('pages.duckdbTables.upload.remoteStarted')); setUploadOpen(false); }}
                  >
                    {t('pages.duckdbTables.upload.remoteButton')}
                  </Button>
                </div>
              )
            }
          ]}
        />
      </Modal>
      <Modal
        open={deleteOpen}
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            {t('pages.duckdbTables.deleteConfirmTitle')}
          </Space>
        }
        okText={t('common.delete')}
        okButtonProps={{ danger: true, disabled: !deletePassword.trim() }}
        cancelText={t('common.cancel')}
        onOk={() => {
          message.success(t('pages.duckdbTables.deleteSuccess', { name: deleteTarget?.tableName }));
          setDeleteOpen(false);
          setDeleteTarget(null);
          setDeletePassword('');
        }}
        onCancel={() => { setDeleteOpen(false); setDeleteTarget(null); setDeletePassword(''); }}
      >
        <p style={{ marginBottom: 16 }}>{t('pages.duckdbTables.deleteConfirmContent', { name: deleteTarget?.tableName })}</p>
        <Input.Password
          placeholder={t('pages.duckdbTables.deletePasswordPlaceholder')}
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
        />
      </Modal>
    </Card>
  );
}
