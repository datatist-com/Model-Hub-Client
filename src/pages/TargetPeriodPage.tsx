import { useMemo, useState } from 'react';
import { App, Button, Card, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, Tooltip, Upload } from 'antd';
import { InboxOutlined, LeftOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRefreshingSet } from '../hooks/useRefreshingSet';
import { usePeriodOptions } from '../hooks/usePeriodOptions';

type TargetPeriodRow = { id: string; year: number; month: number; totalSamples: number; positiveSamples: number; negativeSamples: number; status: 'ready' | 'computing' };

const TARGET_MAP: Record<string, string> = {
  'tgt-001': '新疆工行长尾客群资产提升',
  'tgt-002': '信用卡激活预测',
  'tgt-003': '客户流失预警'
};

const mockPeriods: TargetPeriodRow[] = [
  { id: 'tp-001', year: 2026, month: 2, totalSamples: 12350, positiveSamples: 1820, negativeSamples: 10530, status: 'ready' },
  { id: 'tp-002', year: 2026, month: 1, totalSamples: 12100, positiveSamples: 1750, negativeSamples: 10350, status: 'ready' },
  { id: 'tp-003', year: 2025, month: 12, totalSamples: 11800, positiveSamples: 1690, negativeSamples: 10110, status: 'ready' },
  { id: 'tp-004', year: 2025, month: 11, totalSamples: 11500, positiveSamples: 1620, negativeSamples: 9880, status: 'ready' },
  { id: 'tp-005', year: 2025, month: 10, totalSamples: 11200, positiveSamples: 1580, negativeSamples: 9620, status: 'ready' },
  { id: 'tp-006', year: 2025, month: 9, totalSamples: 10900, positiveSamples: 1530, negativeSamples: 9370, status: 'ready' }
];

export default function TargetPeriodPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('id') ?? '';
  const targetDataSource = searchParams.get('ds') ?? 'computed';
  const targetName = TARGET_MAP[targetId] ?? targetId;

  const [addOpen, setAddOpen] = useState(false);
  const { selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, years, months, maxYear } = usePeriodOptions();
  const { refreshingIds, refresh: handleRefresh } = useRefreshingSet();

  const p = 'pages.targetPeriod';

  const columns = useMemo<ColumnsType<TargetPeriodRow>>(() => [
    {
      title: t(`${p}.columns.period`),
      width: 140,
      render: (_, row) => `${row.year}-${String(row.month).padStart(2, '0')}`
    },
    {
      title: t(`${p}.columns.totalSamples`),
      dataIndex: 'totalSamples',
      width: 130,
      render: (v: number, row) => (
        <Space>
          <span>{refreshingIds.has(row.id) ? '-' : v.toLocaleString()}</span>
          <ReloadOutlined style={{ cursor: 'pointer', fontSize: 12, opacity: 0.45 }} onClick={() => handleRefresh(row.id)} />
        </Space>
      )
    },
    {
      title: t(`${p}.columns.positiveSamples`),
      dataIndex: 'positiveSamples',
      width: 120,
      render: (v: number) => <span style={{ color: '#52c41a' }}>{v.toLocaleString()}</span>
    },
    {
      title: t(`${p}.columns.negativeSamples`),
      dataIndex: 'negativeSamples',
      width: 120,
      render: (v: number) => <span style={{ color: '#ff4d4f' }}>{v.toLocaleString()}</span>
    },
    {
      title: t(`${p}.columns.positiveRate`),
      width: 100,
      render: (_, row) => `${(row.positiveSamples / row.totalSamples * 100).toFixed(1)}%`
    },
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
          {targetDataSource === 'computed' && (
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
  ], [handleRefresh, message, p, refreshingIds, t, targetDataSource]);

  const yearOptions = useMemo(() => years.map((y) => ({ value: y, label: String(y) })), [years]);
  const monthOptions = useMemo(() => months.map((m) => ({ value: m, label: `${m}${t(`${p}.monthUnit`)}` })), [months, p, t]);

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <Tooltip title={t(`${p}.backToTarget`)}>
            <LeftOutlined
              style={{ fontSize: 14, cursor: 'pointer', opacity: 0.45 }}
              onClick={() => navigate('/target-management', { state: { sessionTabMode: 'replace' } })}
            />
          </Tooltip>
          <span>{t(`${p}.title`)} ({targetName})</span>
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
            ...(targetDataSource === 'computed' ? [{
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
            ...(targetDataSource === 'imported' ? [{
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
