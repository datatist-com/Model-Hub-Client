import { useState } from 'react';
import { Card, Input, Segmented, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type LogRow = { id: string; timestamp: string; type: 'login' | 'operation'; user: string; ip: string; action: string; detail: string };

const allLogs: LogRow[] = [
  { id: 'log-001', timestamp: '2026-03-14 09:01:12', type: 'login', user: 'luxingan', ip: '10.12.3.5', action: '登录', detail: '登录成功' },
  { id: 'log-002', timestamp: '2026-03-14 09:05:33', type: 'operation', user: 'luxingan', ip: '10.12.3.5', action: '发布模型', detail: '发布「新疆工行长尾客群资产提升模型」' },
  { id: 'log-003', timestamp: '2026-03-14 09:15:45', type: 'operation', user: 'luxingan', ip: '10.12.3.5', action: '名单产出', detail: '发起 2026-02 名单产出' },
  { id: 'log-004', timestamp: '2026-03-14 09:30:01', type: 'operation', user: 'luxingan', ip: '10.12.3.5', action: '新建人群包', detail: '创建人群包「高价值资产提升人群」' },
  { id: 'log-005', timestamp: '2026-03-14 10:02:18', type: 'operation', user: 'wangming', ip: '10.12.3.8', action: '新建模型', detail: '创建模型「信用卡激活预测模型」' },
  { id: 'log-006', timestamp: '2026-03-14 10:10:55', type: 'login', user: 'wangming', ip: '10.12.3.8', action: '登录', detail: '登录成功' },
  { id: 'log-007', timestamp: '2026-03-14 10:20:22', type: 'operation', user: 'wangming', ip: '10.12.3.8', action: '删除模型', detail: '删除模型「客户流失预警模型」' },
  { id: 'log-008', timestamp: '2026-03-14 10:35:10', type: 'operation', user: 'luxingan', ip: '10.12.3.5', action: '下线模型', detail: '下线「信用卡激活预测模型」' },
  { id: 'log-009', timestamp: '2026-03-14 11:00:00', type: 'login', user: 'zhangsan', ip: '10.12.3.12', action: '登录', detail: '登录失败，密码错误' },
  { id: 'log-010', timestamp: '2026-03-14 11:01:30', type: 'login', user: 'zhangsan', ip: '10.12.3.12', action: '登录', detail: '登录成功' },
  { id: 'log-011', timestamp: '2026-03-14 11:15:42', type: 'operation', user: 'zhangsan', ip: '10.12.3.12', action: '训练模型', detail: '发起小样本训练，模型 mod-001' },
  { id: 'log-012', timestamp: '2026-03-14 14:20:08', type: 'operation', user: 'luxingan', ip: '10.12.3.5', action: '导出名单', detail: '导出人群包「高价值资产提升人群」' }
];

export default function LogViewerPage() {
  const { t } = useTranslation();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');

  const p = 'pages.logViewer';

  const filteredLogs = allLogs.filter((log) => {
    if (typeFilter !== 'ALL' && log.type !== typeFilter) return false;
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      return log.user.toLowerCase().includes(kw) || log.action.toLowerCase().includes(kw) || log.detail.toLowerCase().includes(kw);
    }
    return true;
  });

  const columns: ColumnsType<LogRow> = [
    { title: t(`${p}.columns.timestamp`), dataIndex: 'timestamp', width: 180 },
    {
      title: t(`${p}.columns.type`),
      dataIndex: 'type',
      width: 100,
      render: (type: string) => type === 'login'
        ? <Tag color="blue">{t(`${p}.typeLogin`)}</Tag>
        : <Tag color="green">{t(`${p}.typeOperation`)}</Tag>
    },
    { title: t(`${p}.columns.user`), dataIndex: 'user', width: 120 },
    { title: t(`${p}.columns.ip`), dataIndex: 'ip', width: 140 },
    { title: t(`${p}.columns.action`), dataIndex: 'action', width: 120 },
    { title: t(`${p}.columns.detail`), dataIndex: 'detail' }
  ];

  return (
    <Card
      className="page-card"
      title={t(`${p}.title`)}
      extra={
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Input.Search
            placeholder={t(`${p}.searchPlaceholder`)}
            allowClear
            style={{ width: 220 }}
            onSearch={setSearchText}
            onChange={(e) => { if (!e.target.value) setSearchText(''); }}
          />
          <Segmented
            size="small"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as string)}
            options={[
              { label: t(`${p}.allTypes`), value: 'ALL' },
              { label: t(`${p}.typeLogin`), value: 'login' },
              { label: t(`${p}.typeOperation`), value: 'operation' }
            ]}
          />
        </div>
      }
    >
      <Table rowKey="id" columns={columns} dataSource={filteredLogs} pagination={{ pageSize: 20 }} />
    </Card>
  );
}
