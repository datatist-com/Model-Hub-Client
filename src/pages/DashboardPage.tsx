import { Card, Col, Row, Segmented, Space, Statistic, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ModelSummary = {
  key: string;
  modelNameZh: string;
  modelNameEn: string;
  featureCount: number;
  auc: number;
  top10Lift: number;
  builtAt: string;
};

type AucHub = 'asset' | 'payment' | 'loan';

type AucSeries = {
  nameKey: string;
  color: string;
  values: number[];
};

type AucHubMeta = {
  key: AucHub;
  labelKey: string;
};

type AucApiMockResponse = {
  hubs: AucHubMeta[];
  months: string[];
};

const modelRows: ModelSummary[] = [
  {
    key: 'm-001',
    modelNameZh: '信用卡申请模型',
    modelNameEn: 'Credit Card Application Model',
    featureCount: 42,
    auc: 0.83,
    top10Lift: 2.74,
    builtAt: '2026-01-12'
  },
  {
    key: 'm-002',
    modelNameZh: '资产提升模型',
    modelNameEn: 'Asset Upgrade Model',
    featureCount: 58,
    auc: 0.77,
    top10Lift: 2.26,
    builtAt: '2026-02-05'
  },
  {
    key: 'm-003',
    modelNameZh: '三方支付防流失模型',
    modelNameEn: 'Third-Party Payment Retention Model',
    featureCount: 37,
    auc: 0.86,
    top10Lift: 3.11,
    builtAt: '2026-02-21'
  },
  {
    key: 'm-004',
    modelNameZh: '贷款审批模型',
    modelNameEn: 'Loan Approval Model',
    featureCount: 31,
    auc: 0.73,
    top10Lift: 1.98,
    builtAt: '2026-03-01'
  },
  {
    key: 'm-005',
    modelNameZh: '高净值客户识别模型',
    modelNameEn: 'High-Value Customer Identification Model',
    featureCount: 46,
    auc: 0.8,
    top10Lift: 2.49,
    builtAt: '2026-03-08'
  },
  {
    key: 'm-006',
    modelNameZh: '小微经营贷授信模型',
    modelNameEn: 'SME Credit Granting Model',
    featureCount: 53,
    auc: 0.81,
    top10Lift: 2.63,
    builtAt: '2026-03-12'
  }
];

// Mocked API response shape: future backend can return the same bilingual structure directly.
const aucApiMock: AucApiMockResponse = {
  hubs: [
    { key: 'asset', labelKey: 'pages.dashboard.auc.hubs.asset' },
    { key: 'payment', labelKey: 'pages.dashboard.auc.hubs.payment' },
    { key: 'loan', labelKey: 'pages.dashboard.auc.hubs.loan' }
  ],
  months: ['2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02']
};

const months = aucApiMock.months;

const aucHubSeriesMap: Record<AucHub, AucSeries[]> = {
  asset: [
    { nameKey: 'pages.dashboard.auc.modelNames.creditApplication', color: '#22d3ee', values: [0.74, 0.76, 0.78, 0.79, 0.81, 0.82, 0.83] },
    { nameKey: 'pages.dashboard.auc.modelNames.assetUpgrade', color: '#a78bfa', values: [0.68, 0.7, 0.72, 0.73, 0.75, 0.76, 0.77] },
    {
      nameKey: 'pages.dashboard.auc.modelNames.thirdPartyPaymentRetention',
      color: '#34d399',
      values: [0.71, 0.72, 0.73, 0.75, 0.76, 0.77, 0.78]
    }
  ],
  payment: [
    {
      nameKey: 'pages.dashboard.auc.modelNames.thirdPartyPaymentRetention',
      color: '#f472b6',
      values: [0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.86]
    },
    { nameKey: 'pages.dashboard.auc.modelNames.creditApplication', color: '#60a5fa', values: [0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83] },
    { nameKey: 'pages.dashboard.auc.modelNames.assetUpgrade', color: '#2dd4bf', values: [0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82] }
  ],
  loan: [
    { nameKey: 'pages.dashboard.auc.modelNames.assetUpgrade', color: '#38bdf8', values: [0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77] },
    {
      nameKey: 'pages.dashboard.auc.modelNames.thirdPartyPaymentRetention',
      color: '#c084fc',
      values: [0.69, 0.7, 0.71, 0.72, 0.73, 0.74, 0.75]
    },
    { nameKey: 'pages.dashboard.auc.modelNames.creditApplication', color: '#4ade80', values: [0.67, 0.68, 0.69, 0.7, 0.71, 0.72, 0.73] }
  ]
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [selectedHub, setSelectedHub] = useState<AucHub>('asset');
  const isZh = i18n.language.toLowerCase().startsWith('zh');

  const series = aucHubSeriesMap[selectedHub];
  const hubOptions = aucApiMock.hubs.map((hub) => ({
    label: t(hub.labelKey),
    value: hub.key
  }));

  const chartData = useMemo(() => {
    const allValues = series.flatMap((item) => item.values);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = Math.max(0.01, maxValue - minValue);

    const chartWidth = 620;
    const chartHeight = 240;
    const paddingLeft = 42;
    const paddingRight = 14;
    const paddingTop = 20;
    const paddingBottom = 34;
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const stepX = months.length > 1 ? plotWidth / (months.length - 1) : plotWidth;
    const ticks = 5;

    const toY = (value: number) => {
      const normalized = (value - minValue) / range;
      return paddingTop + (1 - normalized) * plotHeight;
    };

    const lines = series.map((item) => {
      const points = item.values
        .map((value, index) => {
          const x = paddingLeft + index * stepX;
          const y = toY(value);
          return `${x},${y}`;
        })
        .join(' ');

      return {
        ...item,
        points,
        circles: item.values.map((value, index) => ({
          x: paddingLeft + index * stepX,
          y: toY(value)
        }))
      };
    });

    const yTicks = Array.from({ length: ticks }, (_, i) => {
      const ratio = i / (ticks - 1);
      const value = maxValue - ratio * range;
      return {
        value: value.toFixed(2),
        y: paddingTop + ratio * plotHeight
      };
    });

    const xTicks = months.map((label, index) => ({
      label,
      x: paddingLeft + index * stepX
    }));

    return {
      chartWidth,
      chartHeight,
      paddingLeft,
      paddingTop,
      paddingBottom,
      plotWidth,
      plotHeight,
      lines,
      xTicks,
      yTicks
    };
  }, [series]);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Typography.Title level={3} className="dashboard-page-title">
        {t('pages.dashboard.title')}
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="page-card">
            <Statistic title={t('pages.dashboard.metrics.totalCustomers')} value={286430} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="page-card">
            <Statistic title={t('pages.dashboard.metrics.totalDataVolume')} value={152084392} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="page-card">
            <Statistic title={t('pages.dashboard.metrics.modelCount')} value={16} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="page-card">
            <Statistic title={t('pages.dashboard.metrics.featureCount')} value={124} />
          </Card>
        </Col>
      </Row>

      <Row className="dashboard-secondary-row" gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="page-card dashboard-model-list-card" title={t('pages.dashboard.modelList.title')}>
            <div className="dashboard-model-list-grid" role="list" aria-label={t('pages.dashboard.modelList.title')}>
              {modelRows.map((model) => (
                <div className="dashboard-model-list-item" role="listitem" key={model.key}>
                  <div className="dashboard-model-list-item-head">
                    <Typography.Text className="dashboard-model-list-item-title">
                      {isZh ? model.modelNameZh : model.modelNameEn}
                    </Typography.Text>
                    <Typography.Text className="dashboard-model-list-item-date">{model.builtAt}</Typography.Text>
                  </div>

                  <div className="dashboard-model-list-kpis">
                    <div className="dashboard-model-list-kpi">
                      <span>{t('pages.dashboard.modelList.columns.featureCount')}</span>
                      <strong>{model.featureCount}</strong>
                    </div>
                    <div className="dashboard-model-list-kpi">
                      <span>{t('pages.dashboard.modelList.columns.auc')}</span>
                      <strong>{model.auc.toFixed(2)}</strong>
                    </div>
                    <div className="dashboard-model-list-kpi">
                      <span>{t('pages.dashboard.modelList.columns.top10Lift')}</span>
                      <strong>{model.top10Lift.toFixed(2)}x</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="page-card"
            title={t('pages.dashboard.auc.title')}
            extra={
              <Segmented
                className="dashboard-auc-hub"
                size="small"
                value={selectedHub}
                onChange={(value) => setSelectedHub(value as AucHub)}
                options={hubOptions}
              />
            }
          >
            <div className="dashboard-auc-legend">
              {series.map((item) => (
                <div key={`${selectedHub}-${item.nameKey}`} className="dashboard-auc-legend-item">
                  <span className="dashboard-auc-legend-dot" style={{ backgroundColor: item.color }} />
                  <Typography.Text>{t(item.nameKey)}</Typography.Text>
                </div>
              ))}
            </div>

            <svg
              className="dashboard-auc-chart"
              viewBox={`0 0 ${chartData.chartWidth} ${chartData.chartHeight}`}
              preserveAspectRatio="none"
              role="img"
              aria-label="AUC trend chart"
            >
              {chartData.yTicks.map((tick) => (
                <g key={`y-${tick.value}`}>
                  <line
                    x1={chartData.paddingLeft}
                    y1={tick.y}
                    x2={chartData.paddingLeft + chartData.plotWidth}
                    y2={tick.y}
                    className="dashboard-auc-grid-line"
                  />
                  <text x={chartData.paddingLeft - 8} y={tick.y + 4} textAnchor="end" className="dashboard-auc-axis-text">
                    {tick.value}
                  </text>
                </g>
              ))}

              {chartData.xTicks.map((tick) => (
                <text
                  key={`x-${tick.label}`}
                  x={tick.x}
                  y={chartData.chartHeight - 10}
                  textAnchor="middle"
                  className="dashboard-auc-axis-text"
                >
                  {tick.label}
                </text>
              ))}

              {chartData.lines.map((line) => (
                <g key={`${selectedHub}-${line.nameKey}`}>
                  <polyline points={line.points} fill="none" stroke={line.color} strokeWidth={2.8} strokeLinecap="round" />
                  {line.circles.map((circle, index) => (
                    <circle key={`${line.nameKey}-${index}`} cx={circle.x} cy={circle.y} r={3.4} fill={line.color} />
                  ))}
                </g>
              ))}
            </svg>

            <Typography.Text className="dashboard-auc-note">{t('pages.dashboard.auc.note')}</Typography.Text>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
