import { useState, useMemo } from 'react';
import { Card, Input, Space, Table, Tag } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

type CustomerRow = { key: string; customerId: string; score: number };

const LIST_MAP: Record<string, { modelName: string; predictionMonth: string; totalCount: number }> = {
  'ml-001': { modelName: '新疆工行长尾客群资产提升模型', predictionMonth: '2026-02', totalCount: 52360 },
  'ml-002': { modelName: '新疆工行长尾客群资产提升模型', predictionMonth: '2026-01', totalCount: 48712 }
};

function generateMockCustomers(count: number): CustomerRow[] {
  return Array.from({ length: count }, (_, i) => ({
    key: `c-${i}`,
    customerId: `CUST${String(100000 + i).padStart(8, '0')}`,
    score: +(Math.random() * 100).toFixed(2)
  })).sort((a, b) => b.score - a.score);
}

const mockCustomers = generateMockCustomers(200);

export default function ModelListDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listId = searchParams.get('id') ?? '';
  const info = LIST_MAP[listId];

  const [search, setSearch] = useState('');

  const p = 'pages.modelListDetail';

  const filtered = useMemo(() => {
    if (!search.trim()) return mockCustomers;
    const kw = search.trim().toUpperCase();
    return mockCustomers.filter((c) => c.customerId.includes(kw));
  }, [search]);

  const columns: ColumnsType<CustomerRow> = [
    { title: t(`${p}.columns.customerId`), dataIndex: 'customerId', width: 180 },
    {
      title: t(`${p}.columns.score`),
      dataIndex: 'score',
      width: 120,
      sorter: (a, b) => a.score - b.score,
      defaultSortOrder: 'descend',
      render: (v: number) => <span style={{ fontWeight: 600 }}>{v.toFixed(2)}</span>
    }
  ];

  if (!info) {
    return (
      <Card className="page-card" title={t(`${p}.notFound`)}>
        <a onClick={() => navigate(-1)}>{t(`${p}.back`)}</a>
      </Card>
    );
  }

  return (
    <Card
      className="page-card"
      title={
        <Space>
          <LeftOutlined style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
          <span>{info.modelName}</span>
          <Tag>{info.predictionMonth}</Tag>
          <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.65 }}>
            {t(`${p}.totalCount`, { count: info.totalCount })}
          </span>
        </Space>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={t(`${p}.searchPlaceholder`)}
          allowClear
          style={{ width: 300 }}
          onSearch={setSearch}
          onChange={(e) => { if (!e.target.value) setSearch(''); }}
        />
      </div>
      <Table rowKey="key" columns={columns} dataSource={filtered} pagination={{ pageSize: 20, showTotal: (total) => t(`${p}.totalRecords`, { total }) }} />
    </Card>
  );
}
