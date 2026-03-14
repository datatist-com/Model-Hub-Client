import { useState } from 'react';
import { App, Button, Card, Form, Modal, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DownloadOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MODEL_NAME_MAP } from '../constants/mockMaps';
import { usePeriodOptions } from '../hooks/usePeriodOptions';

type ListRow = {
  id: string;
  predictionMonth: string;
  totalCount: number;
  status: 'generating' | 'generated';
};

const mockData: Record<string, ListRow[]> = {
  'mod-001': [
    { id: 'ml-001', predictionMonth: '2026-02', totalCount: 52360, status: 'generated' },
    { id: 'ml-002', predictionMonth: '2026-01', totalCount: 48712, status: 'generated' },
    { id: 'ml-003', predictionMonth: '2025-12', totalCount: 0, status: 'generating' }
  ]
};

export default function ModelScoringListPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modelId = searchParams.get('id') ?? '';
  const modelName = MODEL_NAME_MAP[modelId] ?? modelId;
  const rows = mockData[modelId] ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const { setSelectedYear, years, months, maxYear, defaultMonth } = usePeriodOptions();

  const p = 'pages.modelScoringList';

  const yearOptions = years.map((y) => ({ value: y, label: String(y) }));
  const monthOptions = months.map((m) => ({ value: m, label: `${m}${t(`${p}.monthUnit`)}` }));

  const columns: ColumnsType<ListRow> = [
    { title: t(`${p}.columns.predictionMonth`), dataIndex: 'predictionMonth', width: 120 },
    {
      title: t(`${p}.columns.totalCount`),
      dataIndex: 'totalCount',
      width: 120,
      render: (v: number) => v > 0 ? v.toLocaleString() : '-'
    },
    {
      title: t(`${p}.columns.status`),
      dataIndex: 'status',
      width: 100,
      render: (s: string) => s === 'generated'
        ? <Tag color="green">{t(`${p}.statusGenerated`)}</Tag>
        : <Tag color="blue">{t(`${p}.statusGenerating`)}</Tag>
    },
    {
      title: t(`${p}.columns.actions`),
      width: 160,
      render: (_: unknown, record: ListRow) => record.status === 'generated'
        ? (
          <Space size={0}>
            <Button size="small" type="link" onClick={() => navigate(`/model-list-detail?id=${encodeURIComponent(record.id)}`, { state: { sessionTabMode: 'replace' } })}>{t(`${p}.viewDetail`)}</Button>
            <Button size="small" type="link" icon={<DownloadOutlined />} onClick={() => message.success(t(`${p}.exportSuccess`, { month: record.predictionMonth }))}>{t(`${p}.export`)}</Button>
          </Space>
        )
        : null
    }
  ];

  const handleCreate = (values: { year: number; month: number }) => {
    message.success(t(`${p}.createSuccess`, { month: `${values.year}-${String(values.month).padStart(2, '0')}` }));
    setCreateOpen(false);
  };

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t(`${p}.backToList`)}>
            <LeftOutlined style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }} onClick={() => navigate('/scoring-generation', { state: { sessionTabMode: 'replace' } })} />
          </Tooltip>
          <span>{modelName}</span>
        </Space>
      }
      extra={
        <Button icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); createForm.setFieldsValue({ year: maxYear, month: defaultMonth }); setSelectedYear(maxYear); setCreateOpen(true); }}>
          {t(`${p}.createBtn`)}
        </Button>
      }
    >
      <Table rowKey="id" columns={columns} dataSource={rows} pagination={{ pageSize: 10 }} />

      <Modal open={createOpen} title={t(`${p}.createTitle`)} footer={null} onCancel={() => setCreateOpen(false)}>
        <Form form={createForm} layout="vertical" onFinish={handleCreate}>
          <Form.Item label={t(`${p}.predictionMonth`)} required style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Form.Item name="year" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 16 }}>
                <Select options={yearOptions} onChange={(v: number) => setSelectedYear(v)} />
              </Form.Item>
              <Form.Item name="month" rules={[{ required: true }]} style={{ flex: 1, marginBottom: 16 }}>
                <Select options={monthOptions} />
              </Form.Item>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t(`${p}.submitBtn`)}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
