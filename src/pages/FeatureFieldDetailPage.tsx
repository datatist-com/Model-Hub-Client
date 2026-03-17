import { useMemo, useState } from 'react';
import { Card, Space, Table, Tag, Tooltip } from 'antd';
import { DownOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type SourceTable = {
  id: string;
  sourceName: string;
  database: string;
  tableName: string;
  tableType: 'monthly' | 'flow';
  featureFields: string[];
};

const mockSourceTables: SourceTable[] = [
  { id: 'ft-001', sourceName: 'hive-prod', database: 'dwd', tableName: 'user_balance_m', tableType: 'monthly', featureFields: ['balance', 'avg_balance'] },
  { id: 'ft-002', sourceName: 'hive-prod', database: 'dwd', tableName: 'user_transactions', tableType: 'flow', featureFields: ['amount', 'channel'] },
  { id: 'ft-003', sourceName: 'hive-prod', database: 'dwd', tableName: 'user_events_di', tableType: 'flow', featureFields: ['event_type', 'amount', 'channel'] },
  { id: 'ft-004', sourceName: 'duckdb-local-a', database: '', tableName: 'features', tableType: 'monthly', featureFields: ['feature_name', 'feature_value'] }
];

/* ── Stat categories ── */
const BASIC_STATS = ['max', 'min', 'avg', 'median', 'p50', 'p75', 'p90', 'range', 'variance', 'stddev', 'cv'] as const;
const PERIODS_2Y = ['2y'] as const;
const YOY_PERIODS = ['yoy_1y', 'yoy_2y'] as const;
const MOM_PERIODS = ['mom_1m', 'mom_2m', 'mom_3m', 'mom_4m', 'mom_5m', 'mom_6m'] as const;

type DerivedFeature = {
  key: string;
  fieldName: string;
  category: 'source' | 'basic' | 'yoy' | 'mom';
  featureName: string;
  statLabel: string;
  periodLabel: string;
};

type FieldGroup = {
  fieldName: string;
  features: DerivedFeature[];
  sourceCount: number;
  basicCount: number;
  yoyCount: number;
  momCount: number;
};

function buildMonthlyFeatures(fieldName: string, t: (k: string) => string): DerivedFeature[] {
  const p = 'pages.featureFieldDetail';
  const rows: DerivedFeature[] = [];
  // Source value
  rows.push({ key: `${fieldName}_source`, fieldName, category: 'source', featureName: `${fieldName}`, statLabel: t(`${p}.stat.sourceValue`), periodLabel: '-' });
  // Basic stats over 2y
  for (const period of PERIODS_2Y) {
    for (const stat of BASIC_STATS) {
      rows.push({ key: `${fieldName}_${period}_${stat}`, fieldName, category: 'basic', featureName: `${fieldName}_${period}_${stat}`, statLabel: t(`${p}.stat.${stat}`), periodLabel: t(`${p}.period.${period}`) });
    }
  }
  // YoY
  for (const yoy of YOY_PERIODS) {
    rows.push({ key: `${fieldName}_${yoy}`, fieldName, category: 'yoy', featureName: `${fieldName}_${yoy}`, statLabel: t(`${p}.stat.yoy`), periodLabel: t(`${p}.period.${yoy}`) });
  }
  // MoM
  for (const mom of MOM_PERIODS) {
    rows.push({ key: `${fieldName}_${mom}`, fieldName, category: 'mom', featureName: `${fieldName}_${mom}`, statLabel: t(`${p}.stat.mom`), periodLabel: t(`${p}.period.${mom}`) });
  }
  return rows;
}

function buildFlowFeatures(fieldName: string, t: (k: string) => string): DerivedFeature[] {
  const p = 'pages.featureFieldDetail';
  const rows: DerivedFeature[] = [];
  for (const period of PERIODS_2Y) {
    for (const stat of BASIC_STATS) {
      rows.push({ key: `${fieldName}_${period}_${stat}`, fieldName, category: 'basic', featureName: `${fieldName}_${period}_${stat}`, statLabel: t(`${p}.stat.${stat}`), periodLabel: t(`${p}.period.${period}`) });
    }
  }
  return rows;
}

const CATEGORY_COLORS: Record<string, string> = { source: 'gold', basic: 'blue', yoy: 'purple', mom: 'cyan' };

export default function FeatureFieldDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const sourceTable = mockSourceTables.find((s) => s.id === id);
  const isMonthly = sourceTable?.tableType === 'monthly';
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const derivedFeatures = useMemo(() => {
    if (!sourceTable) return [];
    const builder = isMonthly ? buildMonthlyFeatures : buildFlowFeatures;
    return sourceTable.featureFields.flatMap((f) => builder(f, t));
  }, [sourceTable, isMonthly, t]);

  /* group by field for summary cards */
  const fieldGroups = useMemo<FieldGroup[]>(() => {
    const map = new Map<string, DerivedFeature[]>();
    for (const f of derivedFeatures) {
      if (!map.has(f.fieldName)) map.set(f.fieldName, []);
      map.get(f.fieldName)!.push(f);
    }

    return Array.from(map.entries()).map(([fieldName, features]) => {
      let sourceCount = 0;
      let basicCount = 0;
      let yoyCount = 0;
      let momCount = 0;

      for (const feature of features) {
        if (feature.category === 'source') {
          sourceCount += 1;
        } else if (feature.category === 'basic') {
          basicCount += 1;
        } else if (feature.category === 'yoy') {
          yoyCount += 1;
        } else {
          momCount += 1;
        }
      }

      return { fieldName, features, sourceCount, basicCount, yoyCount, momCount };
    });
  }, [derivedFeatures]);

  const p = 'pages.featureFieldDetail';

  const columns = useMemo(() => [
    {
      title: t(`${p}.columns.featureName`),
      dataIndex: 'featureName',
      width: 280,
      render: (v: string) => <span className="feature-field-detail-feature-name">{v}</span>
    },
    {
      title: t(`${p}.columns.category`),
      dataIndex: 'category',
      width: 120,
      render: (v: string) => <Tag color={CATEGORY_COLORS[v]}>{t(`${p}.category.${v}`)}</Tag>
    },
    { title: t(`${p}.columns.stat`), dataIndex: 'statLabel', width: 200 },
    { title: t(`${p}.columns.period`), dataIndex: 'periodLabel', width: 160 }
  ], [p, t]);

  const tableLabel = sourceTable
    ? (sourceTable.database ? `${sourceTable.database}.${sourceTable.tableName}` : sourceTable.tableName)
    : '';
  const typeTag = isMonthly
    ? <Tag color="blue">{t('pages.featureManagement.tableTypeMonthly')}</Tag>
    : <Tag color="cyan">{t('pages.featureManagement.tableTypeFlow')}</Tag>;

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t(`${p}.backToFeatureManagement`)}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate('/feature-management', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
          <span>{t(`${p}.title`)}</span>
        </Space>
      }
    >
      {/* Summary header */}
      <div className="feature-field-detail-header">
        <div className="feature-field-detail-header-item">
          <span className="feature-field-detail-header-label">{t(`${p}.headerSource`)}</span>
          <span className="feature-field-detail-header-value">{sourceTable?.sourceName ?? '-'}</span>
        </div>
        <div className="feature-field-detail-header-item">
          <span className="feature-field-detail-header-label">{t(`${p}.headerTable`)}</span>
          <span className="feature-field-detail-header-value">{tableLabel || '-'}</span>
        </div>
        <div className="feature-field-detail-header-item">
          <span className="feature-field-detail-header-label">{t(`${p}.headerType`)}</span>
          <span className="feature-field-detail-header-value">{typeTag}</span>
        </div>
        <div className="feature-field-detail-header-item">
          <span className="feature-field-detail-header-label">{t(`${p}.headerSourceFields`)}</span>
          <span className="feature-field-detail-header-value feature-field-detail-header-number">{sourceTable?.featureFields.length ?? 0}</span>
        </div>
        <div className="feature-field-detail-header-item">
          <span className="feature-field-detail-header-label">{t(`${p}.headerDerivedTotal`)}</span>
          <span className="feature-field-detail-header-value feature-field-detail-header-number">{derivedFeatures.length}</span>
        </div>
      </div>

      {/* Per-field cards */}
      {fieldGroups.map(({ fieldName, features, sourceCount, basicCount, yoyCount, momCount }) => {
        const isExpanded = expandedFields.has(fieldName);
        return (
          <div key={fieldName} className={`feature-field-detail-field-card${isExpanded ? ' expanded' : ''}`}>
            <div
              className="feature-field-detail-field-header"
              style={{ cursor: 'pointer' }}
              onClick={() => setExpandedFields((prev) => {
                const next = new Set(prev);
                if (next.has(fieldName)) next.delete(fieldName); else next.add(fieldName);
                return next;
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="feature-field-detail-expand-icon">{isExpanded ? <DownOutlined /> : <RightOutlined />}</span>
                <span className="feature-field-detail-field-name">{fieldName}</span>
              </div>
              <div className="feature-field-detail-field-badges">
                {sourceCount > 0 && <span className="feature-field-detail-badge badge-source">{t(`${p}.category.source`)} {sourceCount}</span>}
                {basicCount > 0 && <span className="feature-field-detail-badge badge-basic">{t(`${p}.category.basic`)} {basicCount}</span>}
                {yoyCount > 0 && <span className="feature-field-detail-badge badge-yoy">{t(`${p}.category.yoy`)} {yoyCount}</span>}
                {momCount > 0 && <span className="feature-field-detail-badge badge-mom">{t(`${p}.category.mom`)} {momCount}</span>}
                <span className="feature-field-detail-badge badge-total">{t(`${p}.totalFeatures`, { count: features.length })}</span>
              </div>
            </div>
            <div className={`feature-field-detail-collapse${isExpanded ? ' open' : ''}`}>
              <Table
                rowKey="key"
                columns={columns}
                dataSource={features}
                pagination={false}
                size="small"
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
