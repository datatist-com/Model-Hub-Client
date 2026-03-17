import { useCallback, useMemo, useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type PortraitRow = { id: string; portraitName: string; dataSource: 'computed' | 'imported'; sourceTables?: string[]; userCount: number; featureCount: number; periodCount: number };

const mockSourceTables = [
  { value: 'dwd.user_balance_m', label: 'dwd.user_balance_m' },
  { value: 'dwd.user_transactions', label: 'dwd.user_transactions' },
  { value: 'dwd.user_events_di', label: 'dwd.user_events_di' },
  { value: 'features', label: 'features' }
];

const data: PortraitRow[] = [
  { id: 'up-001', portraitName: 'AUM资产客群画像', dataSource: 'computed', sourceTables: ['dwd.user_balance_m'], userCount: 12350, featureCount: 28, periodCount: 6 },
  { id: 'up-002', portraitName: '三方支付客群画像', dataSource: 'computed', sourceTables: ['dwd.user_transactions', 'dwd.user_events_di'], userCount: 45200, featureCount: 35, periodCount: 12 },
  { id: 'up-003', portraitName: '贷款客群画像', dataSource: 'imported', userCount: 8720, featureCount: 19, periodCount: 3 }
];

export default function UserPortraitPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createDataSource, setCreateDataSource] = useState<string>();
  const [editDataSource, setEditDataSource] = useState<string>();

  const dataSourceOptions = useMemo(() => [
    { value: 'computed', label: t('pages.userPortrait.dataSourceComputed') },
    { value: 'imported', label: t('pages.userPortrait.dataSourceImported') }
  ], [t]);

  const handleNavigatePeriods = useCallback((row: PortraitRow) => {
    navigate(`/portrait-periods?id=${encodeURIComponent(row.id)}&ds=${encodeURIComponent(row.dataSource)}`, { state: { sessionTabMode: 'replace' } });
  }, [navigate]);

  const handleOpenEdit = useCallback((row: PortraitRow) => {
    setEditDataSource(row.dataSource);
    editForm.setFieldsValue({ portraitName: row.portraitName, dataSource: row.dataSource, sourceTables: row.sourceTables });
    setEditOpen(true);
  }, [editForm]);

  const handleDelete = useCallback((row: PortraitRow) => {
    message.success(t('pages.userPortrait.deleteSuccess', { name: row.portraitName }));
  }, [message, t]);

  const columns = useMemo<ColumnsType<PortraitRow>>(() => [
    { title: t('pages.userPortrait.columns.portraitName'), dataIndex: 'portraitName', width: 200 },
    {
      title: t('pages.userPortrait.columns.dataSource'),
      dataIndex: 'dataSource',
      width: 140,
      render: (v) => v === 'computed'
        ? <Tag color="blue">{t('pages.userPortrait.dataSourceComputed')}</Tag>
        : <Tag color="orange">{t('pages.userPortrait.dataSourceImported')}</Tag>
    },
    { title: t('pages.userPortrait.columns.userCount'), dataIndex: 'userCount', width: 120, render: (v: number) => v.toLocaleString() },
    { title: t('pages.userPortrait.columns.featureCount'), dataIndex: 'featureCount', width: 100 },
    {
      title: t('pages.userPortrait.columns.periodCount'),
      dataIndex: 'periodCount',
      width: 180,
      render: (v: number, row) => (
        <a onClick={() => handleNavigatePeriods(row)}>
          {t('pages.userPortrait.containsPeriods', { count: v })}
        </a>
      )
    },
    {
      title: t('pages.userPortrait.columns.actions'),
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => handleOpenEdit(row)}>{t('common.edit')}</Button>
          <Popconfirm
            title={t('pages.userPortrait.deleteConfirmTitle')}
            description={t('pages.userPortrait.deleteConfirmContent', { name: row.portraitName })}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(row)}
          >
            <Button size="small" danger>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [handleDelete, handleNavigatePeriods, handleOpenEdit, t]);

  return (
    <Card
      className="page-card"
      title={t('pages.userPortrait.title')}
      extra={<Button icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateDataSource(undefined); setCreateOpen(true); }}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />

      <Modal open={createOpen} title={t('pages.userPortrait.createTitle')} footer={null} onCancel={() => setCreateOpen(false)}>
        <Form form={createForm} layout="vertical" onFinish={() => { message.success(t('pages.userPortrait.createSuccess')); setCreateOpen(false); }}>
          <Form.Item label={t('pages.userPortrait.form.portraitName')} name="portraitName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('pages.userPortrait.form.dataSource')} name="dataSource" rules={[{ required: true }]}>
            <Select options={dataSourceOptions} onChange={(v) => { setCreateDataSource(v); createForm.setFieldsValue({ sourceTables: undefined }); }} />
          </Form.Item>
          {createDataSource === 'computed' && (
            <Form.Item label={t('pages.userPortrait.form.sourceTable')} name="sourceTables" rules={[{ required: true }]}>
              <Select mode="multiple" showSearch optionFilterProp="label" options={mockSourceTables} />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={editOpen} title={t('pages.userPortrait.editTitle')} footer={null} onCancel={() => { setEditOpen(false); }}>
        <Form form={editForm} layout="vertical" onFinish={() => { message.success(t('pages.userPortrait.editSuccess')); setEditOpen(false); }}>
          <Form.Item label={t('pages.userPortrait.form.portraitName')} name="portraitName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t('pages.userPortrait.form.dataSource')} name="dataSource" rules={[{ required: true }]}>
            <Select options={dataSourceOptions} onChange={(v) => { setEditDataSource(v); editForm.setFieldsValue({ sourceTables: undefined }); }} />
          </Form.Item>
          {editDataSource === 'computed' && (
            <Form.Item label={t('pages.userPortrait.form.sourceTable')} name="sourceTables" rules={[{ required: true }]}>
              <Select mode="multiple" showSearch optionFilterProp="label" options={mockSourceTables} />
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
