import { useState } from 'react';
import { App, Button, Card, Descriptions, Modal, Space, Table, Tabs, Tag, Tooltip } from 'antd';
import { LeftOutlined, TableOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from 'recharts';

type LiftRow = { rank: number; liftValue: number; cumLiftValue: number };
type FeatureRow = { key: string; featureName: string; weight: number };

const MODEL_MAP: Record<string, { modelName: string; portrait: string; target: string; algorithm: string; auc?: number; liftTop10?: number; published?: boolean }> = {
  'mod-001': { modelName: '新疆工行长尾客群资产提升模型', portrait: 'AUM资产客群画像', target: '新疆工行长尾客群资产提升', algorithm: '画龙模型A (2026.01)', auc: 0.83, liftTop10: 3.2, published: true },
  'mod-002': { modelName: '信用卡激活预测模型', portrait: '三方支付客群画像', target: '信用卡激活预测', algorithm: '画龙模型A (2026.01)', auc: 0.77, liftTop10: 2.8, published: false },
  'mod-003': { modelName: '客户流失预警模型', portrait: '贷款客群画像', target: '客户流失预警', algorithm: '画龙模型A (2026.01)' }
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

const mockLift10 = generateLiftData(10, 3.2);
const mockLift100 = generateLiftData(100, 3.2);
const mockLift1000 = generateLiftData(1000, 3.2);

const mockFeatures: FeatureRow[] = [
  { key: 'f1', featureName: '近 3 月平均 AUM', weight: 18.5 },
  { key: 'f2', featureName: '月均交易笔数', weight: 12.3 },
  { key: 'f3', featureName: '账户开户时长（月）', weight: 9.7 },
  { key: 'f4', featureName: '贷款余额占比', weight: 8.2 },
  { key: 'f5', featureName: '信用卡消费额月均', weight: 7.6 },
  { key: 'f6', featureName: '近 6 月登录频次', weight: 6.9 },
  { key: 'f7', featureName: '理财产品持有数', weight: 6.1 },
  { key: 'f8', featureName: '工资代发标记', weight: 5.8 },
  { key: 'f9', featureName: '年龄段', weight: 5.4 },
  { key: 'f10', featureName: '近 12 月转账流水', weight: 4.9 },
  { key: 'f11', featureName: '手机银行活跃度', weight: 4.2 },
  { key: 'f12', featureName: '定期存款占比', weight: 3.8 },
  { key: 'f13', featureName: '账户余额波动率', weight: 3.5 },
  { key: 'f14', featureName: '贷款还款准时率', weight: 3.1 }
];

export default function ModelDetailPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modelId = searchParams.get('id') ?? '';
  const fromScoring = searchParams.get('from') === 'scoring';
  const model = MODEL_MAP[modelId];

  const [published, setPublished] = useState(model?.published ?? false);
  const [liftTableOpen, setLiftTableOpen] = useState(false);

  const p = 'pages.modelDetail';

  const liftColumns: ColumnsType<LiftRow> = [
    { title: t(`${p}.liftColumns.rank`), dataIndex: 'rank', width: 80 },
    { title: t(`${p}.liftColumns.liftValue`), dataIndex: 'liftValue', width: 120, render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span> },
    { title: t(`${p}.liftColumns.cumLiftValue`), dataIndex: 'cumLiftValue', width: 120, render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span> }
  ];

  const featureColumns: ColumnsType<FeatureRow> = [
    { title: '#', dataIndex: 'key', width: 50, render: (_v: string, _r: FeatureRow, idx: number) => idx + 1 },
    { title: t(`${p}.featureColumns.featureName`), dataIndex: 'featureName' },
    { title: t(`${p}.featureColumns.weight`), dataIndex: 'weight', width: 120, render: (v: number) => `${v.toFixed(1)}%` }
  ];

  const handlePublishToggle = () => {
    setPublished((prev) => {
      const next = !prev;
      message.success(next ? t(`${p}.publishSuccess`) : t(`${p}.unpublishSuccess`));
      return next;
    });
  };

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t(`${p}.backToModels`)}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate(fromScoring ? '/scoring-generation' : '/model-management', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
          <span>{model?.modelName ?? modelId}</span>
        </Space>
      }
    >
      {model && (
        <>
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2, lg: 4 }} style={{ marginBottom: 24 }}>
            <Descriptions.Item label={t(`${p}.portrait`)}>{model.portrait}</Descriptions.Item>
            <Descriptions.Item label={t(`${p}.target`)}>{model.target}</Descriptions.Item>
            <Descriptions.Item label={t(`${p}.algorithm`)}><Tag>{model.algorithm}</Tag></Descriptions.Item>
            <Descriptions.Item label="AUC">{model.auc != null ? model.auc.toFixed(2) : '-'}</Descriptions.Item>
            <Descriptions.Item label="Lift Top10%">{model.liftTop10 != null ? model.liftTop10.toFixed(1) : '-'}</Descriptions.Item>
            <Descriptions.Item label={t(`${p}.statusLabel`)}>
              {published ? <Tag color="green">{t(`${p}.published`)}</Tag> : <Tag>{t(`${p}.unpublished`)}</Tag>}
              {!fromScoring && (
                <Button size="small" type={published ? 'default' : 'primary'} danger={published} style={{ marginLeft: 8 }} onClick={handlePublishToggle}>
                  {published ? t(`${p}.unpublishBtn`) : t(`${p}.publishBtn`)}
                </Button>
              )}
            </Descriptions.Item>
          </Descriptions>

          {model.auc != null && (
            <Card
              size="small"
              title={t(`${p}.liftDetail`)}
              extra={
                <Button size="small" icon={<TableOutlined />} onClick={() => setLiftTableOpen(true)}>
                  {t(`${p}.viewLiftTable`)}
                </Button>
              }
            >
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={mockLift100.map((d) => ({ ...d, top: d.rank }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="top" type="number" domain={[0, 100]} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} tickFormatter={(v: number) => `${v}%`} fontSize={12} />
                  <YAxis fontSize={12} />
                  <RTooltip labelFormatter={(v) => `${v}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="liftValue" name={t(`${p}.liftColumns.liftValue`)} stroke="#1677ff" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="cumLiftValue" name={t(`${p}.liftColumns.cumLiftValue`)} stroke="#52c41a" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>

              <Modal
                open={liftTableOpen}
                title={t(`${p}.liftDetail`)}
                footer={null}
                width={560}
                onCancel={() => setLiftTableOpen(false)}
              >
                <Tabs
                  items={[
                    {
                      key: 'decile',
                      label: t(`${p}.liftDecile`),
                      children: <Table rowKey="rank" columns={liftColumns} dataSource={mockLift10} pagination={false} size="small" />
                    },
                    {
                      key: 'percentile',
                      label: t(`${p}.liftPercentile`),
                      children: <Table rowKey="rank" columns={liftColumns} dataSource={mockLift100} pagination={{ pageSize: 20, size: 'small' }} size="small" />
                    },
                    {
                      key: 'permille',
                      label: t(`${p}.liftPermille`),
                      children: <Table rowKey="rank" columns={liftColumns} dataSource={mockLift1000} pagination={{ pageSize: 20, size: 'small' }} size="small" />
                    }
                  ]}
                />
              </Modal>
            </Card>
          )}

          {!fromScoring && (
            <Card size="small" title={t(`${p}.featureRanking`)} style={{ marginTop: 24 }}>
              <Table rowKey="key" columns={featureColumns} dataSource={mockFeatures} pagination={false} size="small" />
            </Card>
          )}
        </>
      )}
    </Card>
  );
}
