import { useMemo, useState } from 'react';
import { App, Button, Card, Form, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type FeatureRow = { id: string; sourceName: string; sourceType: 'hive' | 'duckdb'; database: string; tableName: string; tableType: 'monthly' | 'flow'; customerIdField: string; timeField: string; featureFields: string[] };

const mockSources = [
  { id: 'src-001', name: 'hive-prod', type: 'hive' as const },
  { id: 'src-002', name: 'duckdb-local-a', type: 'duckdb' as const }
];

const mockDatabases: Record<string, string[]> = {
  'src-001': ['dwd', 'ods', 'dim'],
  'src-002': []
};

const mockTables: Record<string, string[]> = {
  dwd: ['user_balance_m', 'user_transactions', 'user_events_di', 'user_credit'],
  ods: ['ods_order', 'ods_payment'],
  dim: ['dim_user', 'dim_product'],
  'src-002': ['events', 'scores', 'features']
};

const mockFields: Record<string, string[]> = {
  user_balance_m: ['user_id', 'balance', 'month_end_date', 'avg_balance', 'update_time'],
  user_transactions: ['user_id', 'txn_id', 'txn_time', 'amount', 'channel'],
  user_events_di: ['user_id', 'event_type', 'event_time', 'amount', 'channel'],
  user_credit: ['user_id', 'credit_limit', 'stat_month', 'utilization', 'update_time'],
  ods_order: ['customer_id', 'order_id', 'order_time', 'amount'],
  ods_payment: ['customer_id', 'payment_id', 'pay_time', 'amount'],
  dim_user: ['user_id', 'user_name', 'create_time', 'status'],
  dim_product: ['product_id', 'product_name', 'create_time', 'category'],
  events: ['user_id', 'event_type', 'event_time', 'payload'],
  scores: ['user_id', 'score', 'score_time', 'model_id'],
  features: ['user_id', 'feature_name', 'feature_value', 'stat_date']
};

const data: FeatureRow[] = [
  { id: 'ft-001', sourceName: 'hive-prod', sourceType: 'hive', database: 'dwd', tableName: 'user_balance_m', tableType: 'monthly', customerIdField: 'user_id', timeField: 'month_end_date', featureFields: ['balance', 'avg_balance'] },
  { id: 'ft-002', sourceName: 'hive-prod', sourceType: 'hive', database: 'dwd', tableName: 'user_transactions', tableType: 'flow', customerIdField: 'user_id', timeField: 'txn_time', featureFields: ['amount', 'channel'] },
  { id: 'ft-003', sourceName: 'hive-prod', sourceType: 'hive', database: 'dwd', tableName: 'user_events_di', tableType: 'flow', customerIdField: 'user_id', timeField: 'event_time', featureFields: ['event_type', 'amount', 'channel'] },
  { id: 'ft-004', sourceName: 'duckdb-local-a', sourceType: 'duckdb', database: '', tableName: 'features', tableType: 'monthly', customerIdField: 'user_id', timeField: 'stat_date', featureFields: ['feature_name', 'feature_value'] }
];

export default function FeatureManagementPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createSourceType, setCreateSourceType] = useState<string>();
  const [editSourceType, setEditSourceType] = useState<string>();
  const [createDatabases, setCreateDatabases] = useState<string[]>([]);
  const [editDatabases, setEditDatabases] = useState<string[]>([]);
  const [createTables, setCreateTables] = useState<string[]>([]);
  const [editTables, setEditTables] = useState<string[]>([]);
  const [createFields, setCreateFields] = useState<string[]>([]);
  const [editFields, setEditFields] = useState<string[]>([]);

  const tableTypeOptions = [
    { value: 'monthly', label: t('pages.featureManagement.tableTypeMonthly') },
    { value: 'flow', label: t('pages.featureManagement.tableTypeFlow') }
  ];

  const sourceOptions = mockSources.map((s) => ({ value: s.id, label: s.name }));

  const handleSourceChange = (sourceId: string, mode: 'create' | 'edit') => {
    const source = mockSources.find((s) => s.id === sourceId);
    const form = mode === 'create' ? createForm : editForm;
    const setType = mode === 'create' ? setCreateSourceType : setEditSourceType;
    const setDbs = mode === 'create' ? setCreateDatabases : setEditDatabases;
    const setTbls = mode === 'create' ? setCreateTables : setEditTables;
    setType(source?.type);
    form.setFieldsValue({ database: undefined, tableName: undefined, customerIdField: undefined, timeField: undefined, featureFields: undefined });
    const setFlds = mode === 'create' ? setCreateFields : setEditFields;
    setFlds([]);
    if (source?.type === 'duckdb') {
      setDbs([]);
      setTbls((mockTables[sourceId] ?? []).map((t) => t));
    } else {
      setDbs(mockDatabases[sourceId] ?? []);
      setTbls([]);
    }
  };

  const handleDatabaseChange = (db: string, mode: 'create' | 'edit') => {
    const form = mode === 'create' ? createForm : editForm;
    const setTbls = mode === 'create' ? setCreateTables : setEditTables;
    const setFlds = mode === 'create' ? setCreateFields : setEditFields;
    form.setFieldsValue({ tableName: undefined, customerIdField: undefined, timeField: undefined, featureFields: undefined });
    setTbls(mockTables[db] ?? []);
    setFlds([]);
  };

  const handleTableChange = (tbl: string, mode: 'create' | 'edit') => {
    const form = mode === 'create' ? createForm : editForm;
    const setFlds = mode === 'create' ? setCreateFields : setEditFields;
    form.setFieldsValue({ customerIdField: undefined, timeField: undefined, featureFields: undefined });
    setFlds(mockFields[tbl] ?? []);
  };

  const columns = useMemo<ColumnsType<FeatureRow>>(() => [
    { title: t('pages.featureManagement.columns.sourceName'), dataIndex: 'sourceName', width: 140 },
    { title: t('pages.featureManagement.columns.sourceTable'), width: 240, render: (_, row) => row.database ? `${row.database}.${row.tableName}` : row.tableName },
    {
      title: t('pages.featureManagement.columns.tableType'),
      dataIndex: 'tableType',
      width: 120,
      render: (v) => (
        v === 'monthly'
          ? <Tag color="blue">{t('pages.featureManagement.tableTypeMonthly')}</Tag>
          : <Tag color="cyan">{t('pages.featureManagement.tableTypeFlow')}</Tag>
      )
    },
    { title: t('pages.featureManagement.columns.sourceFieldCount'), dataIndex: 'featureFields', width: 160, render: (v: string[], row) => <a onClick={() => navigate(`/feature-field-detail?id=${encodeURIComponent(row.id)}`, { state: { sessionTabMode: 'replace' } })}>{t('pages.featureManagement.containsSourceFields', { count: v.length })}</a> },
    { title: t('pages.featureManagement.columns.customerIdField'), dataIndex: 'customerIdField', width: 120 },
    { title: t('pages.featureManagement.columns.timeField'), dataIndex: 'timeField', width: 120 },
    {
      title: t('pages.featureManagement.columns.actions'),
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => {
            const source = mockSources.find((s) => s.name === row.sourceName);
            setEditSourceType(source?.type);
            if (source?.type === 'duckdb') {
              setEditDatabases([]);
              setEditTables(mockTables[source.id] ?? []);
            } else if (source) {
              setEditDatabases(mockDatabases[source.id] ?? []);
              setEditTables(mockTables[row.database] ?? []);
            }
            setEditFields(mockFields[row.tableName] ?? []);
            editForm.setFieldsValue({ sourceId: source?.id, database: row.database || undefined, tableName: row.tableName, tableType: row.tableType, customerIdField: row.customerIdField, timeField: row.timeField, featureFields: row.featureFields });
            setEditOpen(true);
          }}>{t('common.edit')}</Button>
          <Popconfirm
            title={t('pages.featureManagement.deleteConfirmTitle')}
            description={t('pages.featureManagement.deleteConfirmContent', { name: row.tableName })}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => message.success(t('pages.featureManagement.deleteSuccess', { name: row.tableName }))}
          >
            <Button size="small" danger>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [t, navigate, editForm, message]);

  const renderFormFields = (mode: 'create' | 'edit') => {
    const sourceType = mode === 'create' ? createSourceType : editSourceType;
    const databases = mode === 'create' ? createDatabases : editDatabases;
    const tables = mode === 'create' ? createTables : editTables;
    const fields = mode === 'create' ? createFields : editFields;
    return (
      <>
        <Form.Item label={t('pages.featureManagement.form.source')} name="sourceId" rules={[{ required: true }]}>
          <Select options={sourceOptions} onChange={(v) => handleSourceChange(v, mode)} />
        </Form.Item>
        {sourceType !== 'duckdb' && (
          <Form.Item label={t('pages.featureManagement.form.database')} name="database" rules={[{ required: true }]}>
            <Select options={databases.map((d) => ({ value: d, label: d }))} onChange={(v) => handleDatabaseChange(v, mode)} />
          </Form.Item>
        )}
        <Form.Item label={t('pages.featureManagement.form.tableName')} name="tableName" rules={[{ required: true }]}>
          <Select options={tables.map((t) => ({ value: t, label: t }))} onChange={(v) => handleTableChange(v, mode)} />
        </Form.Item>
        <Form.Item label={t('pages.featureManagement.form.tableType')} name="tableType" rules={[{ required: true }]}>
          <Select options={tableTypeOptions} />
        </Form.Item>
        <Form.Item label={t('pages.featureManagement.form.customerIdField')} name="customerIdField" rules={[{ required: true }]}>
          <Select options={fields.map((f) => ({ value: f, label: f }))} />
        </Form.Item>
        <Form.Item label={t('pages.featureManagement.form.timeField')} name="timeField" rules={[{ required: true }]}>
          <Select options={fields.map((f) => ({ value: f, label: f }))} />
        </Form.Item>
        <Form.Item label={t('pages.featureManagement.form.featureFields')} name="featureFields" rules={[{ required: true }]}>
          <Select mode="multiple" showSearch optionFilterProp="label" options={fields.map((f) => ({ value: f, label: f }))} />
        </Form.Item>
      </>
    );
  };

  return (
    <Card
      className="page-card"
      title={t('pages.featureManagement.title')}
      extra={<Button icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateSourceType(undefined); setCreateDatabases([]); setCreateTables([]); setCreateFields([]); setCreateOpen(true); }}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />

      <Modal open={createOpen} title={t('pages.featureManagement.createTitle')} footer={null} onCancel={() => setCreateOpen(false)}>
        <Form form={createForm} layout="vertical" onFinish={() => { message.success(t('pages.featureManagement.createSuccess')); setCreateOpen(false); }}>
          {renderFormFields('create')}
          <Form.Item>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={editOpen} title={t('pages.featureManagement.editTitle')} footer={null} onCancel={() => { setEditOpen(false); }}>
        <Form form={editForm} layout="vertical" onFinish={() => { message.success(t('pages.featureManagement.editSuccess')); setEditOpen(false); }}>
          {renderFormFields('edit')}
          <Form.Item>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
