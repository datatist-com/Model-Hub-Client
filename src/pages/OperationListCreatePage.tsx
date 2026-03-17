import { useRef, useState } from 'react';
import { App, Button, Card, Col, Divider, Form, Input, InputNumber, Radio, Row, Select, Space, Tooltip } from 'antd';
import { DeleteOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MOCK_MODELS } from '../constants/mockMaps';

type Condition = { id: number; name: string; source: string; database: string; table: string; field: string; operator: string; value: string };

const publishedModels = MOCK_MODELS
  .filter((m) => m.published)
  .map((m) => ({ value: m.id, label: m.modelName }));

const mockSources = [
  { value: 'src-001', label: 'hive-prod', type: 'hive' },
  { value: 'src-002', label: 'duckdb-local-a', type: 'duckdb' }
];

const isDuckDBSource = (sourceId: string) => mockSources.find((s) => s.value === sourceId)?.type === 'duckdb';

const mockDatabases: Record<string, { value: string; label: string }[]> = {
  'src-001': [
    { value: 'db_customer', label: 'db_customer' },
    { value: 'db_transaction', label: 'db_transaction' }
  ],
  'src-002': [
    { value: 'main', label: 'main' }
  ]
};

const mockTables: Record<string, { value: string; label: string }[]> = {
  'db_customer': [
    { value: 'customer_info', label: 'customer_info' },
    { value: 'account_summary', label: 'account_summary' }
  ],
  'db_transaction': [
    { value: 'transaction_agg', label: 'transaction_agg' }
  ],
  'main': [
    { value: 'user_profile', label: 'user_profile' }
  ]
};

const mockFields: Record<string, { value: string; label: string }[]> = {
  'customer_info': [
    { value: 'customer_level', label: 'customer_level (客户等级)' },
    { value: 'age', label: 'age (年龄)' },
    { value: 'gender', label: 'gender (性别)' }
  ],
  'account_summary': [
    { value: 'aum', label: 'aum (AUM)' },
    { value: 'deposit_balance', label: 'deposit_balance (存款余额)' }
  ],
  'user_profile': [
    { value: 'city', label: 'city (城市)' },
    { value: 'channel', label: 'channel (渠道)' }
  ],
  'transaction_agg': [
    { value: 'txn_count_3m', label: 'txn_count_3m (近3月交易笔数)' },
    { value: 'txn_amount_3m', label: 'txn_amount_3m (近3月交易金额)' }
  ]
};

const operatorOptions = [
  { value: '=', label: '=' },
  { value: '!=', label: '!=' },
  { value: '>', label: '>' },
  { value: '>=', label: '>=' },
  { value: '<', label: '<' },
  { value: '<=', label: '<=' }
];

export default function OperationListCreatePage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [scoreUnit, setScoreUnit] = useState<'percent' | 'count'>('percent');
  const [scoreMode, setScoreMode] = useState<'top' | 'range'>('top');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [abTestUnit, setAbTestUnit] = useState<'percent' | 'count'>('percent');
  const conditionIdRef = useRef(0);

  const p = 'pages.operationListCreate';

  const addCondition = () => {
    const id = ++conditionIdRef.current;
    setConditions((prev) => [...prev, { id, name: '', source: '', database: '', table: '', field: '', operator: '=', value: '' }]);
  };

  const removeCondition = (id: number) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCondition = (id: number, key: keyof Condition, val: string) => {
    setConditions((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const updated = { ...c, [key]: val };
      if (key === 'source') {
        updated.database = '';
        updated.table = '';
        updated.field = '';
        if (isDuckDBSource(val)) { updated.database = 'main'; }
      }
      if (key === 'database') { updated.table = ''; updated.field = ''; }
      if (key === 'table') { updated.field = ''; }
      return updated;
    }));
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (conditions.some((c) => !c.name.trim())) {
        message.warning(t(`${p}.conditionNameRequired`));
        return;
      }
      const _v = values;
      void _v;
      message.success(t(`${p}.createSuccess`));
      navigate('/operation-list-output', { state: { sessionTabMode: 'replace' } });
    });
  };

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t(`${p}.back`)}>
            <LeftOutlined style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }} onClick={() => navigate('/operation-list-output', { state: { sessionTabMode: 'replace' } })} />
          </Tooltip>
          <span>{t(`${p}.title`)}</span>
        </Space>
      }
    >
      <Form form={form} layout="vertical" style={{ maxWidth: 720 }}>
        <Form.Item label={t(`${p}.name`)} name="name" rules={[{ required: true }]}>
          <Input placeholder={t(`${p}.namePlaceholder`)} />
        </Form.Item>

        <Form.Item label={t(`${p}.model`)} name="modelId" rules={[{ required: true }]}>
          <Select options={publishedModels} placeholder={t(`${p}.modelPlaceholder`)} />
        </Form.Item>

        <Divider>{t(`${p}.scoreRangeTitle`)}</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t(`${p}.scoreUnit`)}>
              <Radio.Group value={scoreUnit} onChange={(e) => setScoreUnit(e.target.value)}>
                <Radio.Button value="percent">{t(`${p}.unitPercent`)}</Radio.Button>
                <Radio.Button value="count">{t(`${p}.unitCount`)}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t(`${p}.scoreMode`)}>
              <Radio.Group value={scoreMode} onChange={(e) => setScoreMode(e.target.value)}>
                <Radio.Button value="top">{t(`${p}.modeTop`)}</Radio.Button>
                <Radio.Button value="range">{t(`${p}.modeRange`)}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        {scoreUnit === 'percent' && scoreMode === 'top' && (
          <Form.Item name="topPercent" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} step={0.1} addonBefore={t(`${p}.topPercentLabel`)} addonAfter="%" style={{ width: '100%' }} placeholder={t(`${p}.topPercentPlaceholder`)} />
          </Form.Item>
        )}

        {scoreUnit === 'percent' && scoreMode === 'range' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="percentFrom" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} step={0.1} addonBefore={t(`${p}.rangeFrom`)} addonAfter="%" style={{ width: '100%' }} placeholder={t(`${p}.rangeFromPlaceholder`)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="percentTo" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} step={0.1} addonBefore={t(`${p}.rangeTo`)} addonAfter="%" style={{ width: '100%' }} placeholder={t(`${p}.rangeToPlaceholder`)} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {scoreUnit === 'count' && scoreMode === 'top' && (
          <Form.Item name="topN" rules={[{ required: true }]}>
            <InputNumber min={1} addonBefore={t(`${p}.topCountLabel`)} addonAfter={t(`${p}.personUnit`)} style={{ width: '100%' }} placeholder={t(`${p}.topCountPlaceholder`)} />
          </Form.Item>
        )}

        {scoreUnit === 'count' && scoreMode === 'range' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nFrom" rules={[{ required: true }]}>
                <InputNumber min={1} addonBefore={t(`${p}.rangeFrom`)} addonAfter={t(`${p}.personUnit`)} style={{ width: '100%' }} placeholder={t(`${p}.rangeFromPlaceholder`)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nTo" rules={[{ required: true }]}>
                <InputNumber min={1} addonBefore={t(`${p}.rangeTo`)} addonAfter={t(`${p}.personUnit`)} style={{ width: '100%' }} placeholder={t(`${p}.rangeToPlaceholder`)} />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Divider>{t(`${p}.additionalConditions`)}</Divider>

        {conditions.map((cond) => {
          const isDuckDB = isDuckDBSource(cond.source);
          return (
          <Card
            key={cond.id}
            size="small"
            style={{ marginBottom: 12 }}
            title={
              <Input
                size="small"
                style={{ width: 160 }}
                placeholder={t(`${p}.conditionName`)}
                value={cond.name}
                onChange={(e) => updateCondition(cond.id, 'name', e.target.value)}
              />
            }
            extra={<DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer' }} onClick={() => removeCondition(cond.id)} />}
          >
            <Row gutter={8} style={{ marginBottom: 8 }}>
              <Col span={isDuckDB ? 12 : 8}>
                <Select
                  style={{ width: '100%' }}
                  placeholder={t(`${p}.selectSource`)}
                  options={mockSources}
                  value={cond.source || undefined}
                  onChange={(v: string) => updateCondition(cond.id, 'source', v)}
                />
              </Col>
              {!isDuckDB && (
              <Col span={8}>
                <Select
                  style={{ width: '100%' }}
                  placeholder={t(`${p}.selectDatabase`)}
                  options={cond.source ? (mockDatabases[cond.source] ?? []) : []}
                  value={cond.database || undefined}
                  disabled={!cond.source}
                  onChange={(v: string) => updateCondition(cond.id, 'database', v)}
                />
              </Col>
              )}
              <Col span={isDuckDB ? 12 : 8}>
                <Select
                  style={{ width: '100%' }}
                  placeholder={t(`${p}.selectTable`)}
                  options={cond.database ? (mockTables[cond.database] ?? []) : []}
                  value={cond.table || undefined}
                  disabled={!cond.database}
                  onChange={(v: string) => updateCondition(cond.id, 'table', v)}
                />
              </Col>
            </Row>
            <Row gutter={8}>
              <Col span={10}>
                <Select
                  style={{ width: '100%' }}
                  placeholder={t(`${p}.selectField`)}
                  options={cond.table ? (mockFields[cond.table] ?? []) : []}
                  value={cond.field || undefined}
                  disabled={!cond.table}
                  onChange={(v: string) => updateCondition(cond.id, 'field', v)}
                />
              </Col>
              <Col span={4}>
                <Select
                  style={{ width: '100%' }}
                  options={operatorOptions}
                  value={cond.operator}
                  onChange={(v: string) => updateCondition(cond.id, 'operator', v)}
                />
              </Col>
              <Col span={10}>
                <Input
                  placeholder={t(`${p}.conditionValue`)}
                  value={cond.value}
                  onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                />
              </Col>
            </Row>
          </Card>
          );
        })}

        <Button type="dashed" block icon={<PlusOutlined />} onClick={addCondition} style={{ marginBottom: 24 }}>
          {t(`${p}.addCondition`)}
        </Button>

        <Divider>A/B Test</Divider>

        <Form.Item>
          <Radio.Group value={abTestEnabled} onChange={(e) => setAbTestEnabled(e.target.value)}>
            <Radio.Button value={false}>{t(`${p}.abTestOff`)}</Radio.Button>
            <Radio.Button value={true}>{t(`${p}.abTestOn`)}</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {abTestEnabled && (
          <>
            <Form.Item>
              <Radio.Group value={abTestUnit} onChange={(e) => setAbTestUnit(e.target.value)}>
                <Radio.Button value="percent">{t(`${p}.unitPercent`)}</Radio.Button>
                <Radio.Button value="count">{t(`${p}.unitCount`)}</Radio.Button>
              </Radio.Group>
            </Form.Item>
            {abTestUnit === 'percent' ? (
              <Form.Item name="abTestPercent" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} step={0.1} addonBefore={t(`${p}.abTestRandom`)} addonAfter="%" style={{ width: '100%' }} placeholder={t(`${p}.abTestPercentPlaceholder`)} />
              </Form.Item>
            ) : (
              <Form.Item name="abTestCount" rules={[{ required: true }]}>
                <InputNumber min={1} addonBefore={t(`${p}.abTestRandom`)} addonAfter={t(`${p}.personUnit`)} style={{ width: '100%' }} placeholder={t(`${p}.abTestCountPlaceholder`)} />
              </Form.Item>
            )}
          </>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSubmit}>{t(`${p}.submit`)}</Button>
            <Button onClick={() => navigate('/operation-list-output', { state: { sessionTabMode: 'replace' } })}>{t('common.cancel')}</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
