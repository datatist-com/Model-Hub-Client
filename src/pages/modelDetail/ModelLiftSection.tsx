import { useMemo, useState } from 'react';
import { Button, Card, Modal, Table, Tabs } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import type { LiftRow } from '../../utils/liftData';

type ChartLiftRow = LiftRow & { top: number };

type ModelLiftSectionProps = {
  chartLiftData: ChartLiftRow[];
  mockLift10: LiftRow[];
  mockLift100: LiftRow[];
  mockLift1000: LiftRow[];
};

export default function ModelLiftSection({ chartLiftData, mockLift10, mockLift100, mockLift1000 }: ModelLiftSectionProps) {
  const { t } = useTranslation();
  const [liftTableOpen, setLiftTableOpen] = useState(false);
  const p = 'pages.modelDetail';

  const liftColumns = useMemo<ColumnsType<LiftRow>>(() => [
    { title: t(`${p}.liftColumns.rank`), dataIndex: 'rank', width: 80 },
    { title: t(`${p}.liftColumns.liftValue`), dataIndex: 'liftValue', width: 120, render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span> },
    { title: t(`${p}.liftColumns.cumLiftValue`), dataIndex: 'cumLiftValue', width: 120, render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span> }
  ], [t]);

  return (
    <Card
      size="small"
      title={t(`${p}.liftDetail`)}
      extra={
        <Button size="small" icon={<TableOutlined />} onClick={() => setLiftTableOpen(true)}>
          {t(`${p}.viewLiftTable`)}
        </Button>
      }
    >
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={chartLiftData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="top" type="number" domain={[0, 100]} ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]} tickFormatter={(v: number) => `${v}%`} fontSize={12} />
          <YAxis fontSize={12} />
          <RTooltip labelFormatter={(v) => `${v}%`} />
          <Legend />
          <Line type="monotone" dataKey="liftValue" name={t(`${p}.liftColumns.liftValue`)} stroke="#1677ff" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="cumLiftValue" name={t(`${p}.liftColumns.cumLiftValue`)} stroke="#52c41a" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <Modal
        open={liftTableOpen}
        title={t(`${p}.liftDetail`)}
        footer={null}
        width={560}
        onCancel={() => setLiftTableOpen(false)}
      >
        <Tabs
          items={[
            {
              key: 'decile',
              label: t(`${p}.liftDecile`),
              children: <Table rowKey="rank" columns={liftColumns} dataSource={mockLift10} pagination={false} size="small" />
            },
            {
              key: 'percentile',
              label: t(`${p}.liftPercentile`),
              children: <Table rowKey="rank" columns={liftColumns} dataSource={mockLift100} pagination={{ pageSize: 20, size: 'small' }} size="small" />
            },
            {
              key: 'permille',
              label: t(`${p}.liftPermille`),
              children: <Table rowKey="rank" columns={liftColumns} dataSource={mockLift1000} pagination={{ pageSize: 20, size: 'small' }} size="small" />
            }
          ]}
        />
      </Modal>
    </Card>
  );
}
