import { useState } from 'react';
import { App, Button, Card, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, Tooltip, Upload } from 'antd';
import { InboxOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type PeriodRow = { id: string; year: number; month: number; customerCount: number; featureCount: number; status: 'ready' | 'computing' };

const PORTRAIT_MAP: Record<string, string> = {
  'up-001': 'AUM资产客群画像',
  'up-002': '三方支付客群画像',
  'up-003': '贷款客群画像'
};

const mockPeriods: PeriodRow[] = [
  { id: 'pp-001', year: 2026, month: 3, customerCount: 12350, featureCount: 28, status: 'ready' },
  { id: 'pp-002', year: 2026, month: 2, customerCount: 12100, featureCount: 28, status: 'ready' },
  { id: 'pp-003', year: 2026, month: 1, customerCount: 11800, featureCount: 28, status: 'ready' },
  { id: 'pp-004', year: 2025, month: 12, customerCount: 11500, featureCount: 26, status: 'ready' },
  { id: 'pp-005', year: 2025, month: 11, customerCount: 11200, featureCount: 26, status: 'ready' },
  { id: 'pp-006', year: 2025, month: 10, customerCount: 10900, featureCount: 26, status: 'ready' }
];

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const maxYear = currentMonth === 1 ? currentYear - 1 : currentYear;
const YEARS = Array.from({ length: maxYear - 2016 + 1 }, (_, i) => 2016 + i);

export default function PortraitPeriodPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portraitId = searchParams.get('id') ?? '';
  const portraitDataSource = searchParams.get('ds') ?? 'computed';
  const portraitName = PORTRAIT_MAP[portraitId] ?? portraitId;

  const [addOpen, setAddOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(maxYear);
  const [selectedMonth, setSelectedMonth] = useState<number>();
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  const handleRefresh = (id: string) => {
    setRefreshingIds((prev) => new Set(prev).add(id));
    setTimeout(() => setRefreshingIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 1500);
  };

  const p = 'pages.portraitPeriod';

  const columns: ColumnsType<PeriodRow> = [
    {
      title: t(`${p}.columns.period`),
      width: 140,
      render: (_, row) => `${row.year}-${String(row.month).padStart(2, '0')}`
    },
    {
      title: t(`${p}.columns.customerCount`),
      dataIndex: 'customerCount',
      width: 140,
      render: (v: number, row) => (
        <Space>
          <span>{refreshingIds.has(row.id) ? '-' : v.toLocaleString()}</span>
          <ReloadOutlined style={{ cursor: 'pointer', fontSize: 12, opacity: 0.45 }} onClick={() => handleRefresh(row.id)} />
        </Space>
      )
    },
    { title: t(`${p}.columns.featureCount`), dataIndex: 'featureCount', width: 100 },
    {
      title: t(`${p}.columns.status`),
      dataIndex: 'status',
      width: 100,
      render: (v) => v === 'ready'
        ? <Tag color="green">{t(`${p}.statusReady`)}</Tag>
        : <Tag color="processing">{t(`${p}.statusComputing`)}</Tag>
    },
    {
      title: t(`${p}.columns.actions`),
      width: 200,
      render: (_, row) => (
        <Space>
          {portraitDataSource === 'computed' && (
            <Button size="small" onClick={() => message.info(t(`${p}.recalculating`))}>{t(`${p}.recalculate`)}</Button>
          )}
          <Popconfirm
            title={t(`${p}.deleteConfirmTitle`)}
            description={t(`${p}.deleteConfirmContent`, { period: `${row.year}-${String(row.month).padStart(2, '0')}` })}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => message.success(t(`${p}.deleteSuccess`))}
          >
            <Button size="small" danger>{t('common.delete')}</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const maxMonth = selectedYear === currentYear ? currentMonth - 1 : 12;
  const MONTHS = Array.from({ length: maxMonth }, (_, i) => i + 1);

  const yearOptions = YEARS.map((y) => ({ value: y, label: String(y) }));
  const monthOptions = MONTHS.map((m) => ({ value: m, label: `${m}${t(`${p}.monthUnit`)}` }));

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t(`${p}.backToPortrait`)}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate('/user-portrait', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
          <span>{t(`${p}.title`)} ({portraitName})</span>
        </Space>
      }
      extra={<Button icon={<PlusOutlined />} onClick={() => { setSelectedYear(maxYear); setSelectedMonth(undefined); setAddOpen(true); }}>{t(`${p}.addPeriod`)}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={mockPeriods} pagination={{ pageSize: 10 }} />

      <Modal
        open={addOpen}
        title={t(`${p}.addPeriodTitle`)}
        footer={null}
        onCancel={() => setAddOpen(false)}
        width={560}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Select
              style={{ width: 120 }}
              placeholder={t(`${p}.selectYear`)}
              options={yearOptions}
              value={selectedYear}
              onChange={(v) => { setSelectedYear(v); setSelectedMonth(undefined); }}
            />
            <Select
              style={{ width: 120 }}
              placeholder={t(`${p}.selectMonth`)}
              options={monthOptions}
              value={selectedMonth}
              onChange={setSelectedMonth}
            />
          </Space>
        </div>
        <Tabs
          items={[
            ...(portraitDataSource === 'computed' ? [{
              key: 'compute',
              label: t(`${p}.computeTab`),
              children: (
                <div>
                  <p style={{ marginBottom: 12, opacity: 0.65 }}>{t(`${p}.computeDesc`)}</p>
                  <Button
                    type="primary"
                    block
                    disabled={!selectedYear || !selectedMonth}
                    onClick={() => { message.success(t(`${p}.computeStarted`)); setAddOpen(false); }}
                  >
                    {t(`${p}.computeButton`)}
                  </Button>
                </div>
              )
            }] : []),
            ...(portraitDataSource === 'imported' ? [{
              key: 'local',
              label: t(`${p}.localTab`),
              children: (
                <div>
                  <p style={{ marginBottom: 12, opacity: 0.65 }}>{t(`${p}.localDesc`)}</p>
                  <Button
                    type="primary"
                    block
                    disabled={!selectedYear || !selectedMonth}
                    onClick={() => { message.success(t(`${p}.localStarted`)); setAddOpen(false); }}
                  >
                    {t(`${p}.localButton`)}
                  </Button>
                </div>
              )
            },
            {
              key: 'remote',
              label: t(`${p}.remoteTab`),
              children: (
                <div>
                  <p style={{ marginBottom: 12, opacity: 0.65 }}>{t(`${p}.remoteDesc`)}</p>
                  <Upload.Dragger
                    accept=".csv,.parquet,.json,.xlsx"
                    multiple={false}
                    beforeUpload={() => false}
                    onChange={(info) => { if (info.fileList.length > 0) message.success(t(`${p}.remoteReady`)); }}
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">{t(`${p}.remoteDragText`)}</p>
                    <p className="ant-upload-hint">{t(`${p}.remoteDragHint`)}</p>
                  </Upload.Dragger>
                  <Button
                    type="primary"
                    block
                    icon={<UploadOutlined />}
                    style={{ marginTop: 16 }}
                    disabled={!selectedYear || !selectedMonth}
                    onClick={() => { message.success(t(`${p}.remoteStarted`)); setAddOpen(false); }}
                  >
                    {t(`${p}.remoteButton`)}
                  </Button>
                </div>
              )
            }] : [])
          ]}
        />
      </Modal>
    </Card>
  );
}
