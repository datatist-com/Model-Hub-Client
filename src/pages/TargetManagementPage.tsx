import { useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type TargetRow = { id: string; targetName: string; dataSource: 'computed' | 'imported'; sourceTables?: string[]; targetType: 'binary' | 'continuous'; description: string; periodCount: number };

const mockSourceTables = [
  { value: 'dwd.user_balance_m', label: 'dwd.user_balance_m' },
  { value: 'dwd.user_transactions', label: 'dwd.user_transactions' },
  { value: 'dwd.user_events_di', label: 'dwd.user_events_di' },
  { value: 'features', label: 'features' }
];

const data: TargetRow[] = [
  { id: 'tgt-001', targetName: '新疆工行长尾客群资产提升', dataSource: 'computed', sourceTables: ['dwd.user_balance_m'], targetType: 'binary', description: '长尾客群次月比当月提升1500元', periodCount: 6 },
  { id: 'tgt-002', targetName: '信用卡激活预测', dataSource: 'computed', sourceTables: ['dwd.user_transactions', 'dwd.user_events_di'], targetType: 'binary', description: '新卡客户3个月内是否激活信用卡', periodCount: 12 },
  { id: 'tgt-003', targetName: '客户流失预警', dataSource: 'imported', targetType: 'binary', description: '客户未来60天内是否流失', periodCount: 3 }
];

export default function TargetManagementPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createDataSource, setCreateDataSource] = useState<string>();
  const [editDataSource, setEditDataSource] = useState<string>();

  const p = 'pages.targetManagement';

  const dataSourceOptions = [
    { value: 'computed', label: t(`${p}.dataSourceComputed`) },
    { value: 'imported', label: t(`${p}.dataSourceImported`) }
  ];
  const targetTypeOptions = [
    { value: 'binary', label: t(`${p}.typeBinary`) },
    { value: 'continuous', label: t(`${p}.typeContinuous`) }
  ];

  const columns: ColumnsType<TargetRow> = [
    { title: t(`${p}.columns.targetName`), dataIndex: 'targetName', width: 220 },
    {
      title: t(`${p}.columns.dataSource`),
      dataIndex: 'dataSource',
      width: 140,
      render: (v) => v === 'computed'
        ? <Tag color="blue">{t(`${p}.dataSourceComputed`)}</Tag>
        : <Tag color="orange">{t(`${p}.dataSourceImported`)}</Tag>
    },
    {
      title: t(`${p}.columns.targetType`),
      dataIndex: 'targetType',
      width: 120,
      render: (v) => v === 'binary'
        ? <Tag color="cyan">{t(`${p}.typeBinary`)}</Tag>
        : <Tag color="purple">{t(`${p}.typeContinuous`)}</Tag>
    },
    { title: t(`${p}.columns.description`), dataIndex: 'description' },
    {
      title: t(`${p}.columns.periodCount`),
      dataIndex: 'periodCount',
      width: 180,
      render: (v: number, row) => (
        <a onClick={() => navigate(`/target-periods?id=${encodeURIComponent(row.id)}&ds=${encodeURIComponent(row.dataSource)}`, { state: { sessionTabMode: 'replace' } })}>
          {t(`${p}.containsPeriods`, { count: v })}
        </a>
      )
    },
    {
      title: t(`${p}.columns.actions`),
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => {
            setEditDataSource(row.dataSource);
            editForm.setFieldsValue({ targetName: row.targetName, dataSource: row.dataSource, sourceTables: row.sourceTables, targetType: row.targetType, description: row.description });
            setEditOpen(true);
          }}>{t('common.edit')}</Button>
          <Popconfirm
            title={t(`${p}.deleteConfirmTitle`)}
            description={t(`${p}.deleteConfirmContent`, { name: row.targetName })}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => message.success(t(`${p}.deleteSuccess`, { name: row.targetName }))}
          >
            <Button size="small" danger>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const renderFormFields = (mode: 'create' | 'edit') => {
    const ds = mode === 'create' ? createDataSource : editDataSource;
    const form = mode === 'create' ? createForm : editForm;
    const setDs = mode === 'create' ? setCreateDataSource : setEditDataSource;
    return (
      <>
        <Form.Item label={t(`${p}.form.targetName`)} name="targetName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t(`${p}.form.dataSource`)} name="dataSource" rules={[{ required: true }]}>
          <Select options={dataSourceOptions} onChange={(v) => { setDs(v); form.setFieldsValue({ sourceTables: undefined }); }} />
        </Form.Item>
        {ds === 'computed' && (
          <Form.Item label={t(`${p}.form.sourceTables`)} name="sourceTables" rules={[{ required: true }]}>
            <Select mode="multiple" showSearch optionFilterProp="label" options={mockSourceTables} />
          </Form.Item>
        )}
        <Form.Item label={t(`${p}.form.targetType`)} name="targetType" rules={[{ required: true }]}>
          <Select options={targetTypeOptions} />
        </Form.Item>
        <Form.Item label={t(`${p}.form.description`)} name="description">
          <Input.TextArea rows={3} />
        </Form.Item>
      </>
    );
  };

  return (
    <Card
      className="page-card"
      title={t(`${p}.title`)}
      extra={<Button icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateDataSource(undefined); setCreateOpen(true); }}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />

      <Modal open={createOpen} title={t(`${p}.createTitle`)} footer={null} onCancel={() => setCreateOpen(false)}>
        <Form form={createForm} layout="vertical" onFinish={() => { message.success(t(`${p}.createSuccess`)); setCreateOpen(false); }}>
          {renderFormFields('create')}
          <Form.Item>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={editOpen} title={t(`${p}.editTitle`)} footer={null} onCancel={() => { setEditOpen(false); }}>
        <Form form={editForm} layout="vertical" onFinish={() => { message.success(t(`${p}.editSuccess`)); setEditOpen(false); }}>
          {renderFormFields('edit')}
          <Form.Item>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
