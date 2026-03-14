import { Card, Col, Row, Tag, Tooltip } from 'antd';
import { FileSearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { MOCK_MODELS } from '../constants/mockMaps';

const publishedModels = MOCK_MODELS.filter((m) => m.published);

export default function ScoringGenerationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const p = 'pages.scoringGeneration';

  return (
    <Card className="page-card" title={t(`${p}.title`)}>
      <Row gutter={[16, 16]}>
        {publishedModels.map((model) => (
          <Col key={model.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              size="small"
              actions={[
                <Tooltip key="detail" title={t(`${p}.detailTooltip`)}>
                  <FileSearchOutlined
                    onClick={() => navigate(`/model-detail?id=${encodeURIComponent(model.id)}&from=scoring`, { state: { sessionTabMode: 'replace' } })}
                  />
                </Tooltip>,
                <Tooltip key="list" title={t(`${p}.listOutputTooltip`)}>
                  <UnorderedListOutlined
                    onClick={() => navigate(`/model-scoring-list?id=${encodeURIComponent(model.id)}`, { state: { sessionTabMode: 'replace' } })}
                  />
                </Tooltip>
              ]}
            >
              <Card.Meta
                title={model.modelName}
                description={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    <div><span style={{ opacity: 0.65 }}>{t(`${p}.portrait`)}：</span>{model.portrait}</div>
                    <div><span style={{ opacity: 0.65 }}>{t(`${p}.target`)}：</span>{model.target}</div>
                    <div><span style={{ opacity: 0.65 }}>{t(`${p}.algorithm`)}：</span><Tag>{model.algorithm}</Tag></div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                      <span><span style={{ opacity: 0.65 }}>AUC：</span>{model.auc != null ? <span style={{ fontWeight: 600 }}>{model.auc.toFixed(2)}</span> : '-'}</span>
                      <span><span style={{ opacity: 0.65 }}>Lift Top10%：</span>{model.liftTop10 != null ? <span style={{ fontWeight: 600 }}>{model.liftTop10.toFixed(1)}</span> : '-'}</span>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
