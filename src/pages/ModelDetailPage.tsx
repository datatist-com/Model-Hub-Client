import { lazy, useMemo, useState } from 'react';
import { Alert, App, Button, Card, Descriptions, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateLiftData } from '../utils/liftData';
import { MOCK_MODELS } from '../constants/mockMaps';
import LazyLoadGuard from '../components/lazy/LazyLoadGuard';

const ModelLiftSection = lazy(() => import('./modelDetail/ModelLiftSection'));

type FeatureRow = { key: string; featureName: string; weight: number };

const MODEL_MAP = Object.fromEntries(MOCK_MODELS.map((m) => [m.id, m]));

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

  const p = 'pages.modelDetail';

  const mockLift10 = useMemo(() => generateLiftData(10, 3.2), []);
  const mockLift100 = useMemo(() => generateLiftData(100, 3.2), []);
  const mockLift1000 = useMemo(() => generateLiftData(1000, 3.2), []);

  const chartLiftData = useMemo(() => mockLift100.map((d) => ({ ...d, top: d.rank })), [mockLift100]);

  const featureColumns = useMemo<ColumnsType<FeatureRow>>(() => [
    { title: '#', dataIndex: 'key', width: 50, render: (_v: string, _r: FeatureRow, idx: number) => idx + 1 },
    { title: t(`${p}.featureColumns.featureName`), dataIndex: 'featureName' },
    { title: t(`${p}.featureColumns.weight`), dataIndex: 'weight', width: 120, render: (v: number) => `${v.toFixed(1)}%` }
  ], [t]);

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
            <LazyLoadGuard
              featureName="model lift analytics"
              loadingFallback={(state) => (
                <Card size="small" title={t(`${p}.liftDetail`)}>
                  {state.isSlow && (
                    <Alert
                      style={{ marginBottom: 12 }}
                      showIcon
                      type={state.isOnline ? 'info' : 'warning'}
                      message={state.isOnline ? 'Loading model lift analytics...' : 'Offline while loading model lift analytics'}
                    />
                  )}
                  <Card size="small" loading />
                  {state.isSlow && (
                    <Typography.Text type="secondary">
                      Chart module is loading under weak network. You can keep browsing other details.
                    </Typography.Text>
                  )}
                </Card>
              )}
            >
              <ModelLiftSection chartLiftData={chartLiftData} mockLift10={mockLift10} mockLift100={mockLift100} mockLift1000={mockLift1000} />
            </LazyLoadGuard>
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
