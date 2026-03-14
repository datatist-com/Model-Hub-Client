import { useState, useMemo } from 'react';
import { App, Button, Card, Descriptions, Form, Input, Modal, Select, Space, Table, Tag, Tooltip } from 'antd';
import { DownloadOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type CustomerRow = { key: string; customerId: string; score: number };

type MonthlyOutput = {
  id: string;
  month: string;
  recordCount: number;
  status: 'pending' | 'generated';
};

type ConditionItem = {
  name: string;
  sourceType: 'hive' | 'duckdb';
  database?: string;
  expression: string;
};

type ABTestConfig = {
  enabled: boolean;
  unit?: 'percent' | 'count';
  value?: number;
};

type CrowdInfo = {
  name: string;
  modelId: string;
  modelName: string;
  scoreRule: string;
  conditions: ConditionItem[];
  abTest: ABTestConfig;
  months: MonthlyOutput[];
  abTestMonths: MonthlyOutput[];
};

/* 模型已产出的评分月份（对应 ModelScoringListPage 中 status=generated 的月） */
const MODEL_GENERATED_MONTHS: Record<string, string[]> = {
  'mod-001': ['2026-02', '2026-01', '2025-12', '2025-11', '2025-10']
};

const CROWD_MAP: Record<string, CrowdInfo> = {
  'cp-001': {
    name: '高价值资产提升人群',
    modelId: 'mod-001',
    modelName: '新疆工行长尾客群资产提升模型',
    scoreRule: 'Top 10%',
    conditions: [
      { name: 'VIP客户', sourceType: 'hive', database: 'db_customer', expression: 'customer_info.customer_level = "VIP"' },
      { name: 'AUM过滤', sourceType: 'hive', database: 'db_customer', expression: 'account_summary.aum >= 500000' }
    ],
    abTest: { enabled: true, unit: 'percent', value: 20 },
    months: [
      { id: 'mo-001', month: '2026-02', recordCount: 5236, status: 'generated' },
      { id: 'mo-002', month: '2026-01', recordCount: 4812, status: 'generated' },
      { id: 'mo-003', month: '2025-12', recordCount: 0, status: 'pending' }
    ],
    abTestMonths: [
      { id: 'ab-001', month: '2026-02', recordCount: 1047, status: 'generated' },
      { id: 'ab-002', month: '2026-01', recordCount: 962, status: 'generated' },
      { id: 'ab-003', month: '2025-12', recordCount: 0, status: 'pending' }
    ]
  },
  'cp-002': {
    name: '资产提升潜力客群',
    modelId: 'mod-001',
    modelName: '新疆工行长尾客群资产提升模型',
    scoreRule: 'Top 10%~20%',
    conditions: [
      { name: '年龄限制', sourceType: 'duckdb', expression: 'customer_info.age >= 30' }
    ],
    abTest: { enabled: false },
    months: [
      { id: 'mo-004', month: '2026-02', recordCount: 5234, status: 'generated' }
    ],
    abTestMonths: []
  },
  'cp-003': {
    name: '信用卡促活人群',
    modelId: 'mod-001',
    modelName: '新疆工行长尾客群资产提升模型',
    scoreRule: 'Top 1000 人',
    conditions: [],
    abTest: { enabled: false },
    months: [],
    abTestMonths: []
  }
};

function generateMockCustomers(count: number): CustomerRow[] {
  return Array.from({ length: count }, (_, i) => ({
    key: `c-${i}`,
    customerId: `CUST${String(200000 + i).padStart(8, '0')}`,
    score: +(Math.random() * 100).toFixed(2)
  })).sort((a, b) => b.score - a.score);
}

const mockCustomers = generateMockCustomers(150);

export default function OperationListDetailPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const crowdId = searchParams.get('id') ?? '';
  const info = CROWD_MAP[crowdId];

  const [search, setSearch] = useState('');
  const [selectedMonthOutput, setSelectedMonthOutput] = useState<MonthlyOutput | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();

  const p = 'pages.operationListDetail';

  /* 可选产出月 = 模型已产出月 - 人群包已选月 */
  const availableMonths = useMemo(() => {
    if (!info) return [];
    const generated = MODEL_GENERATED_MONTHS[info.modelId] ?? [];
    const usedSet = new Set(info.months.map((m) => m.month));
    return generated.filter((m) => !usedSet.has(m));
  }, [info]);

  const filtered = useMemo(() => {
    if (!search.trim()) return mockCustomers;
    const kw = search.trim().toUpperCase();
    return mockCustomers.filter((c) => c.customerId.includes(kw));
  }, [search]);

  const customerColumns: ColumnsType<CustomerRow> = [
    { title: t(`${p}.columns.customerId`), dataIndex: 'customerId', width: 180 },
    {
      title: t(`${p}.columns.score`),
      dataIndex: 'score',
      width: 120,
      sorter: (a, b) => a.score - b.score,
      defaultSortOrder: 'descend',
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span>
    }
  ];

  const monthColumns: ColumnsType<MonthlyOutput> = [
    { title: t(`${p}.monthColumns.month`), dataIndex: 'month', width: 120 },
    {
      title: t(`${p}.monthColumns.recordCount`),
      dataIndex: 'recordCount',
      width: 120,
      render: (v: number) => v > 0 ? v.toLocaleString() : '-'
    },
    {
      title: t(`${p}.monthColumns.status`),
      dataIndex: 'status',
      width: 100,
      render: (s: string) => s === 'generated'
        ? <Tag color="green">{t(`${p}.statusGenerated`)}</Tag>
        : <Tag color="gold">{t(`${p}.statusPending`)}</Tag>
    },
    {
      title: t(`${p}.monthColumns.actions`),
      width: 160,
      render: (_: unknown, record: MonthlyOutput) => record.status === 'generated'
        ? (
          <Space size={0}>
            <Button size="small" type="link" onClick={() => { setSelectedMonthOutput(record); setSearch(''); setCustomerModalOpen(true); }}>{t(`${p}.viewCustomers`)}</Button>
            <Button size="small" type="link" icon={<DownloadOutlined />} onClick={() => message.success(t(`${p}.exportSuccess`, { month: record.month }))}>{t(`${p}.export`)}</Button>
          </Space>
        )
        : null
    }
  ];

  const handleCreateOutput = (values: { month: string }) => {
    message.success(t(`${p}.outputSuccess`, { month: values.month }));
    setCreateOpen(false);
  };

  if (!info) {
    return (
      <Card className="page-card" title={t(`${p}.notFound`)}>
        <a onClick={() => navigate(-1)}>{t(`${p}.back`)}</a>
      </Card>
    );
  }

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <LeftOutlined style={{ cursor: 'pointer', opacity: 0.45 }} onClick={() => navigate('/operation-list-output', { state: { sessionTabMode: 'replace' } })} />
          <span>{info.name}</span>
        </Space>
      }
    >
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 3 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label={t(`${p}.modelName`)}>{info.modelName}</Descriptions.Item>
        <Descriptions.Item label={t(`${p}.scoreRule`)}><Tag color="blue">{info.scoreRule}</Tag></Descriptions.Item>
        <Descriptions.Item label={t(`${p}.conditions`)}>
          {info.conditions.length > 0
            ? <Space size={4} wrap>{info.conditions.map((c, i) => (
                <Tooltip key={i} title={c.sourceType === 'hive' ? `[${c.database}] ${c.expression}` : c.expression}>
                  <Tag>{c.name}</Tag>
                </Tooltip>
              ))}</Space>
            : <span style={{ opacity: 0.45 }}>{t(`${p}.noCondition`)}</span>}
        </Descriptions.Item>
        <Descriptions.Item label="A/B Test">
          {info.abTest.enabled
            ? <Tag color="green">{info.abTest.unit === 'percent' ? `${t(`${p}.abTestRandom`)} ${info.abTest.value}%` : `${t(`${p}.abTestRandom`)} ${info.abTest.value} ${t(`${p}.abTestPerson`)}`}</Tag>
            : <span style={{ opacity: 0.45 }}>{t(`${p}.abTestOff`)}</span>}
        </Descriptions.Item>
      </Descriptions>

      <Card
        size="small"
        title={info.abTest.enabled ? t(`${p}.monthlyOutputExcludeAB`) : t(`${p}.monthlyOutput`)}
        style={{ marginBottom: 24 }}
        extra={
          <Button size="small" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateOpen(true); }}>
            {t(`${p}.newOutput`)}
          </Button>
        }
      >
        <Table rowKey="id" columns={monthColumns} dataSource={info.months} pagination={false} size="small" />
      </Card>

      {info.abTest.enabled && (
        <Card
          size="small"
          title={t(`${p}.abTestOutput`)}
          style={{ marginBottom: 24 }}
        >
          <Table rowKey="id" columns={monthColumns} dataSource={info.abTestMonths} pagination={false} size="small" />
        </Card>
      )}

      {/* 查看客户名单 Modal */}
      <Modal
        open={customerModalOpen}
        title={selectedMonthOutput ? `${t(`${p}.customerList`)} - ${selectedMonthOutput.month}` : ''}
        width={640}
        footer={null}
        onCancel={() => setCustomerModalOpen(false)}
      >
        <div style={{ marginBottom: 12 }}>
          <Input.Search
            placeholder={t(`${p}.searchPlaceholder`)}
            allowClear
            style={{ width: 300 }}
            onSearch={setSearch}
            onChange={(e) => { if (!e.target.value) setSearch(''); }}
          />
        </div>
        <Table
          rowKey="key"
          columns={customerColumns}
          dataSource={filtered}
          pagination={{ pageSize: 20, showTotal: (total) => t(`${p}.totalRecords`, { total }) }}
          size="small"
        />
      </Modal>

      {/* 新建产出 Modal */}
      <Modal open={createOpen} title={t(`${p}.newOutputTitle`)} footer={null} onCancel={() => setCreateOpen(false)}>
        <Form form={createForm} layout="vertical" onFinish={handleCreateOutput}>
          <Form.Item name="month" label={t(`${p}.outputMonth`)} rules={[{ required: true }]}>
            <Select
              placeholder={t(`${p}.selectMonth`)}
              options={availableMonths.map((m) => ({ value: m, label: m }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t(`${p}.startOutput`)}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
