import { useState } from 'react';
import { App, Button, Card, Col, Modal, Row, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { InfoCircleOutlined, LeftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type LiftRow = { rank: number; liftValue: number; cumLiftValue: number };

type TrainRecord = {
  id: string;
  type: 'sample' | 'full';
  featureMonths: string;
  yTableMonth: string;
  auc?: number;
  liftTop10?: number;
  status: 'completed' | 'running';
};

const MODEL_MAP: Record<string, string> = {
  'mod-001': '新疆工行长尾客群资产提升模型',
  'mod-002': '信用卡激活预测模型',
  'mod-003': '客户流失预警模型'
};

function generateLiftData(count: number, baseLift: number): LiftRow[] {
  let cumSum = 0;
  return Array.from({ length: count }, (_, i) => {
    const rank = i + 1;
    const decay = Math.pow(0.92, i);
    const lift = +(baseLift * decay + (Math.random() - 0.5) * 0.1).toFixed(2);
    const liftValue = Math.max(lift, 0.5);
    cumSum += liftValue;
    const cumLiftValue = +(cumSum / rank).toFixed(2);
    return { rank, liftValue, cumLiftValue };
  });
}

const mockTrainRecords: TrainRecord[] = [
  { id: 'train-s-001', type: 'sample', featureMonths: '2023-10 ~ 2025-10', yTableMonth: '2025-11', auc: 0.85, liftTop10: 3.4, status: 'completed' },
  { id: 'train-f-001', type: 'full', featureMonths: '2023-10 ~ 2025-10', yTableMonth: '2025-11', auc: 0.88, liftTop10: 3.6, status: 'completed' }
];

const mockValRecords: TrainRecord[] = [
  { id: 'val-s-001', type: 'sample', featureMonths: '2023-11 ~ 2025-11', yTableMonth: '2025-12', auc: 0.81, liftTop10: 3.0, status: 'completed' },
  { id: 'val-f-001', type: 'full', featureMonths: '2023-11 ~ 2025-11', yTableMonth: '2025-12', auc: 0.83, liftTop10: 3.2, status: 'completed' }
];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const maxYear = currentMonth === 1 ? currentYear - 1 : currentYear;
const YEARS = Array.from({ length: maxYear - 2016 + 1 }, (_, i) => 2016 + i);
const defaultMonth = currentMonth === 1 ? 12 : currentMonth - 1;

export default function ModelTrainPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modelId = searchParams.get('id') ?? '';
  const modelName = MODEL_MAP[modelId] ?? modelId;

  const [selectedYear, setSelectedYear] = useState<number>(maxYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(defaultMonth);
  const [liftOpen, setLiftOpen] = useState(false);
  const [liftData, setLiftData] = useState<LiftRow[]>([]);
  const [liftLabel, setLiftLabel] = useState('');

  const p = 'pages.modelTrain';

  const maxMonth = selectedYear === currentYear ? currentMonth - 1 : 12;
  const MONTHS = Array.from({ length: maxMonth }, (_, i) => i + 1);
  const yearOptions = YEARS.map((y) => ({ value: y, label: String(y) }));
  const monthOptions = MONTHS.map((m) => ({ value: m, label: `${m}${t(`${p}.monthUnit`)}` }));

  const liftColumns: ColumnsType<LiftRow> = [
    { title: t(`${p}.liftColumns.rank`), dataIndex: 'rank', width: 80 },
    { title: t(`${p}.liftColumns.liftValue`), dataIndex: 'liftValue', width: 120, render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span> },
    { title: t(`${p}.liftColumns.cumLiftValue`), dataIndex: 'cumLiftValue', width: 120, render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span> }
  ];

  const handleLiftClick = (record: TrainRecord) => {
    const label = record.type === 'sample' ? t(`${p}.sampleLabel`) : t(`${p}.fullLabel`);
    setLiftLabel(label);
    setLiftData(generateLiftData(10, record.liftTop10 ?? 3));
    setLiftOpen(true);
  };

  const typeCol: ColumnsType<TrainRecord>[number] = {
    title: t(`${p}.colType`),
    dataIndex: 'type',
    width: 90,
    render: (v: string) => v === 'sample'
      ? <Tag color="orange">{t(`${p}.sampleLabel`)}</Tag>
      : <Tag color="blue">{t(`${p}.fullLabel`)}</Tag>
  };

  const statusCol: ColumnsType<TrainRecord>[number] = {
    title: t(`${p}.colStatus`),
    dataIndex: 'status',
    width: 90,
    render: (v: string) => v === 'completed'
      ? <Tag color="green">{t(`${p}.statusCompleted`)}</Tag>
      : <Tag color="processing">{t(`${p}.statusTraining`)}</Tag>
  };

  const buildColumns = (withWarning: boolean): ColumnsType<TrainRecord> => [
    { ...typeCol, width: 80 },
    {
      title: t(`${p}.featureMonths`),
      dataIndex: 'featureMonths',
      width: 90,
      render: (v: string) => {
        const parts = v.split(' ~ ');
        const endMonth = parts[1] ?? v;
        const toFullDate = (ym: string) => {
          const [y, m] = ym.split('-').map(Number);
          const lastDay = new Date(y, m, 0).getDate();
          return `${ym}-${String(lastDay).padStart(2, '0')}`;
        };
        const fullRange = parts.length === 2 ? `${toFullDate(parts[0])} ~ ${toFullDate(parts[1])}` : toFullDate(v);
        return <Tooltip title={fullRange}><span style={{ cursor: 'default' }}>{endMonth}</span></Tooltip>;
      }
    },
    { title: t(`${p}.yTableMonth`), dataIndex: 'yTableMonth', width: 90 },
    {
      title: withWarning
        ? <span>AUC <Tooltip title={t(`${p}.trainMetricTip`)}><InfoCircleOutlined style={{ fontSize: 12, opacity: 0.45 }} /></Tooltip></span>
        : 'AUC',
      dataIndex: 'auc',
      width: 80,
      render: (v: number | undefined) => v != null ? <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span> : '-'
    },
    {
      title: withWarning
        ? <span>Lift Top10% <Tooltip title={t(`${p}.trainMetricTip`)}><InfoCircleOutlined style={{ fontSize: 12, opacity: 0.45 }} /></Tooltip></span>
        : 'Lift Top10%',
      dataIndex: 'liftTop10',
      width: 100,
      render: (v: number | undefined, record: TrainRecord) => v != null
        ? <a style={{ fontWeight: 600 }} onClick={() => handleLiftClick(record)}>{v.toFixed(1)}</a>
        : '-'
    },
    { ...statusCol, width: 80 }
  ];

  const trainColumns = buildColumns(true);
  const valColumns = buildColumns(false);

  const yearMonthSelect = (
    <Space size={4}>
      <Select size="small" style={{ width: 88 }} placeholder={t(`${p}.selectYear`)} options={yearOptions} value={selectedYear} onChange={(v) => { setSelectedYear(v); setSelectedMonth(undefined); }} />
      <Select size="small" style={{ width: 88 }} placeholder={t(`${p}.selectMonth`)} options={monthOptions} value={selectedMonth} onChange={setSelectedMonth} />
    </Space>
  );

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t(`${p}.backToModels`)}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate('/model-management', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
          <span>{t(`${p}.title`)} ({modelName})</span>
        </Space>
      }
    >
      <Row gutter={[24, 24]}>
        {/* 训练 */}
        <Col span={12}>
          <Card
            type="inner"
            title={t(`${p}.trainCardTitle`)}
            extra={
              <Space size={8}>
                {yearMonthSelect}
                <Button size="small" icon={<ThunderboltOutlined />} disabled={!selectedMonth} onClick={() => message.success(t(`${p}.sampleTrainStarted`))}>{t(`${p}.sampleLabel`)}</Button>
                <Button size="small" type="primary" icon={<ThunderboltOutlined />} disabled={!selectedMonth} onClick={() => message.success(t(`${p}.fullTrainStarted`))}>{t(`${p}.fullLabel`)}</Button>
              </Space>
            }
          >
            <Table rowKey="id" columns={trainColumns} dataSource={mockTrainRecords} pagination={false} size="small" tableLayout="fixed" />
          </Card>
        </Col>

        {/* 验证 */}
        <Col span={12}>
          <Card
            type="inner"
            title={t(`${p}.valCardTitle`)}
            extra={
              <Space size={8}>
                {yearMonthSelect}
                <Button size="small" icon={<ThunderboltOutlined />} disabled={!selectedMonth} onClick={() => message.success(t(`${p}.sampleValStarted`))}>{t(`${p}.sampleLabel`)}</Button>
                <Button size="small" type="primary" icon={<ThunderboltOutlined />} disabled={!selectedMonth} onClick={() => message.success(t(`${p}.fullValStarted`))}>{t(`${p}.fullLabel`)}</Button>
              </Space>
            }
          >
            <Table rowKey="id" columns={valColumns} dataSource={mockValRecords} pagination={false} size="small" tableLayout="fixed" />
          </Card>
        </Col>
      </Row>

      <Modal
        title={`${liftLabel} — ${t(`${p}.liftDetail`)}`}
        open={liftOpen}
        onCancel={() => setLiftOpen(false)}
        footer={null}
        width={560}
      >
        <Table rowKey="rank" columns={liftColumns} dataSource={liftData} pagination={false} size="small" />
      </Modal>
    </Card>
  );
}
