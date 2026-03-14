import { useState } from 'react';
import { App, Button, Card, Col, Input, Modal, Row, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, FileSearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type CrowdRow = {
  id: string;
  name: string;
  modelName: string;
  scoreRule: string;
  conditionCount: number;
  abTest: boolean;
};

const data: CrowdRow[] = [
  { id: 'cp-001', name: '高价值资产提升人群', modelName: '新疆工行长尾客群资产提升模型', scoreRule: 'Top 10%', conditionCount: 2, abTest: true },
  { id: 'cp-002', name: '资产提升潜力客群', modelName: '新疆工行长尾客群资产提升模型', scoreRule: 'Top 10%~20%', conditionCount: 1, abTest: false },
  { id: 'cp-003', name: '信用卡促活人群', modelName: '新疆工行长尾客群资产提升模型', scoreRule: 'Top 1000 人', conditionCount: 0, abTest: false }
];

export default function OperationListOutputPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [deleteTarget, setDeleteTarget] = useState<CrowdRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const p = 'pages.operationListOutput';

  return (
    <Card
      className="page-card"
      title={t(`${p}.title`)}
      extra={
        <Button icon={<PlusOutlined />} onClick={() => navigate('/operation-list-create', { state: { sessionTabMode: 'replace' } })}>
          {t('common.create')}
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {data.map((item) => (
          <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              size="small"
              actions={[
                <Tooltip key="detail" title={t(`${p}.viewDetail`)}>
                  <FileSearchOutlined onClick={() => navigate(`/operation-list-detail?id=${encodeURIComponent(item.id)}`, { state: { sessionTabMode: 'replace' } })} />
                </Tooltip>,
                <Tooltip key="delete" title={t('common.delete')}>
                  <DeleteOutlined style={{ color: '#ff4d4f' }} onClick={() => { setDeleteTarget(item); setDeletePassword(''); setDeleteOpen(true); }} />
                </Tooltip>
              ]}
            >
              <Card.Meta
                title={
                  <Space size={4}>
                    <span>{item.name}</span>
                    {item.abTest && <Tag color="green">A/B Test</Tag>}
                  </Space>
                }
                description={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    <div><span style={{ opacity: 0.65 }}>{t(`${p}.columns.modelName`)}：</span>{item.modelName}</div>
                    <div><span style={{ opacity: 0.65 }}>{t(`${p}.columns.scoreRule`)}：</span><Tag color="blue">{item.scoreRule}</Tag></div>
                    <div><span style={{ opacity: 0.65 }}>{t(`${p}.columns.conditionCount`)}：</span>{item.conditionCount > 0 ? item.conditionCount : t(`${p}.noCondition`)}</div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={deleteOpen}
        title={<Space><ExclamationCircleOutlined style={{ color: '#faad14' }} />{t(`${p}.deleteConfirmTitle`)}</Space>}
        okText={t('common.delete')}
        okButtonProps={{ danger: true, disabled: !deletePassword.trim() }}
        cancelText={t('common.cancel')}
        onOk={() => {
          message.success(t(`${p}.deleteSuccess`));
          setDeleteOpen(false);
          setDeleteTarget(null);
          setDeletePassword('');
        }}
        onCancel={() => { setDeleteOpen(false); setDeleteTarget(null); setDeletePassword(''); }}
      >
        <p style={{ marginBottom: 16 }}>{t(`${p}.deleteConfirm`, { name: deleteTarget?.name })}</p>
        <Input.Password
          placeholder={t(`${p}.deletePasswordPlaceholder`)}
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
        />
      </Modal>
    </Card>
  );
}
