import { Card, Col, Row, Tag, Tooltip } from 'antd';
import { FileSearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type ModelRow = {
  id: string;
  modelName: string;
  portrait: string;
  target: string;
  algorithm: string;
  auc?: number;
  liftTop10?: number;
};

const publishedModels: ModelRow[] = [
  { id: 'mod-001', modelName: '新疆工行长尾客群资产提升模型', portrait: 'AUM资产客群画像', target: '新疆工行长尾客群资产提升', algorithm: '画龙模型A (2026.01)', auc: 0.83, liftTop10: 3.2 }
];

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
