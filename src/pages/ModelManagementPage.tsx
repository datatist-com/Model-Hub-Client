import { useState } from 'react';
import { App, Button, Card, Col, Form, Input, Modal, Row, Select, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined, FileSearchOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { MOCK_MODELS } from '../constants/mockMaps';
import type { MockModel } from '../constants/mockMaps';

type ModelRow = MockModel;

const mockPortraits = [
  { value: 'up-001', label: 'AUM资产客群画像' },
  { value: 'up-002', label: '三方支付客群画像' },
  { value: 'up-003', label: '贷款客群画像' }
];

const mockTargets = [
  { value: 'tgt-001', label: '新疆工行长尾客群资产提升' },
  { value: 'tgt-002', label: '信用卡激活预测' },
  { value: 'tgt-003', label: '客户流失预警' }
];

const mockAlgorithms = [
  { value: 'hualong-a-202601', label: '画龙模型A (2026.01)' }
];

const data: ModelRow[] = MOCK_MODELS;

export default function ModelManagementPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ModelRow | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  const p = 'pages.modelManagement';

  return (
    <Card
      className="page-card"
      title={t(`${p}.title`)}
      extra={<Button icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setCreateOpen(true); }}>{t('common.create')}</Button>}
    >
      <Row gutter={[16, 16]}>
        {data.map((model) => (
          <Col key={model.id} xs={24} sm={12} lg={8} xl={6}>
            <Card
              size="small"
              actions={[
                <Tooltip key="detail" title={t(`${p}.detailTooltip`)}>
                  <FileSearchOutlined
                    onClick={() => navigate(`/model-detail?id=${encodeURIComponent(model.id)}`, { state: { sessionTabMode: 'replace' } })}
                  />
                </Tooltip>,
                <Tooltip key="train" title={t(`${p}.trainTooltip`)}>
                  <ThunderboltOutlined
                    onClick={() => navigate(`/model-train?id=${encodeURIComponent(model.id)}`, { state: { sessionTabMode: 'replace' } })}
                  />
                </Tooltip>,
                <Tooltip key="delete" title={t('common.delete')}>
                  <DeleteOutlined
                    style={{ color: '#ff4d4f' }}
                    onClick={() => {
                      setDeleteTarget(model);
                      setDeletePassword('');
                      setDeleteOpen(true);
                    }}
                  />
                </Tooltip>
              ]}
            >
              <Card.Meta
                title={
                  <span>
                    {model.modelName}
                    {model.published
                      ? <Tag color="green" style={{ marginLeft: 8 }}>{t(`${p}.published`)}</Tag>
                      : <Tag style={{ marginLeft: 8 }}>{t(`${p}.unpublished`)}</Tag>}
                  </span>
                }
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

      <Modal open={createOpen} title={t(`${p}.createTitle`)} footer={null} onCancel={() => setCreateOpen(false)}>
        <Form form={createForm} layout="vertical" onFinish={() => { message.success(t(`${p}.createSuccess`)); setCreateOpen(false); }}>
          <Form.Item label={t(`${p}.form.modelName`)} name="modelName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={t(`${p}.form.portrait`)} name="portrait" rules={[{ required: true }]}>
            <Select options={mockPortraits} />
          </Form.Item>
          <Form.Item label={t(`${p}.form.target`)} name="target" rules={[{ required: true }]}>
            <Select options={mockTargets} />
          </Form.Item>
          <Form.Item label={t(`${p}.form.algorithm`)} name="algorithm" rules={[{ required: true }]}>
            <Select options={mockAlgorithms} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">{t('common.save')}</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={deleteOpen}
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            {t(`${p}.deleteConfirmTitle`)}
          </Space>
        }
        okText={t('common.delete')}
        okButtonProps={{ danger: true, disabled: !deletePassword.trim() }}
        cancelText={t('common.cancel')}
        onOk={() => {
          message.success(t(`${p}.deleteSuccess`, { name: deleteTarget?.modelName }));
          setDeleteOpen(false);
          setDeleteTarget(null);
          setDeletePassword('');
        }}
        onCancel={() => { setDeleteOpen(false); setDeleteTarget(null); setDeletePassword(''); }}
      >
        <p style={{ marginBottom: 16 }}>{t(`${p}.deleteConfirmContent`, { name: deleteTarget?.modelName })}</p>
        <Input.Password
          placeholder={t(`${p}.deletePasswordPlaceholder`)}
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
        />
      </Modal>
    </Card>
  );
}
