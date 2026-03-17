import { memo, useCallback, useMemo } from 'react';
import { Card, Col, Row, Tag, Tooltip } from 'antd';
import { FileSearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { MOCK_MODELS } from '../constants/mockMaps';

type ScoringCardLabels = {
  detailTooltip: string;
  listTooltip: string;
  portraitText: string;
  targetText: string;
  algorithmText: string;
};

type ScoringCardItemProps = {
  model: (typeof MOCK_MODELS)[number];
  labels: ScoringCardLabels;
  onDetail: (modelId: string) => void;
  onList: (modelId: string) => void;
};

const ScoringCardItem = memo(function ScoringCardItem({ model, labels, onDetail, onList }: ScoringCardItemProps) {
  const actions = useMemo(
    () => [
      <Tooltip key="detail" title={labels.detailTooltip}>
        <FileSearchOutlined onClick={() => onDetail(model.id)} />
      </Tooltip>,
      <Tooltip key="list" title={labels.listTooltip}>
        <UnorderedListOutlined onClick={() => onList(model.id)} />
      </Tooltip>
    ],
    [labels, model.id, onDetail, onList]
  );

  return (
    <Card size="small" actions={actions}>
      <Card.Meta
        title={model.modelName}
        description={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <div><span style={{ opacity: 0.65 }}>{labels.portraitText}：</span>{model.portrait}</div>
            <div><span style={{ opacity: 0.65 }}>{labels.targetText}：</span>{model.target}</div>
            <div><span style={{ opacity: 0.65 }}>{labels.algorithmText}：</span><Tag>{model.algorithm}</Tag></div>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span><span style={{ opacity: 0.65 }}>AUC：</span>{model.auc != null ? <span style={{ fontWeight: 600 }}>{model.auc.toFixed(2)}</span> : '-'}</span>
              <span><span style={{ opacity: 0.65 }}>Lift Top10%：</span>{model.liftTop10 != null ? <span style={{ fontWeight: 600 }}>{model.liftTop10.toFixed(1)}</span> : '-'}</span>
            </div>
          </div>
        }
      />
    </Card>
  );
});

export default function ScoringGenerationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const p = 'pages.scoringGeneration';
  const publishedModels = useMemo(() => MOCK_MODELS.filter((m) => m.published), []);
  const labels = useMemo<ScoringCardLabels>(() => ({
    detailTooltip: t(`${p}.detailTooltip`),
    listTooltip: t(`${p}.listOutputTooltip`),
    portraitText: t(`${p}.portrait`),
    targetText: t(`${p}.target`),
    algorithmText: t(`${p}.algorithm`)
  }), [t]);

  const handleDetail = useCallback((modelId: string) => {
    navigate(`/model-detail?id=${encodeURIComponent(modelId)}&from=scoring`, { state: { sessionTabMode: 'replace' } });
  }, [navigate]);

  const handleList = useCallback((modelId: string) => {
    navigate(`/model-scoring-list?id=${encodeURIComponent(modelId)}`, { state: { sessionTabMode: 'replace' } });
  }, [navigate]);

  return (
    <Card className="page-card" title={t(`${p}.title`)}>
      <Row gutter={[16, 16]}>
        {publishedModels.map((model) => (
          <Col key={model.id} xs={24} sm={12} lg={8} xl={6}>
            <ScoringCardItem model={model} labels={labels} onDetail={handleDetail} onList={handleList} />
          </Col>
        ))}
      </Row>
    </Card>
  );
}
