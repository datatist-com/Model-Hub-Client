import { Button, Card, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type PortraitRow = { id: string; portraitName: string; userCount: number; tagCount: number; status: 'active' | 'inactive'; updatedAt: string };

const data: PortraitRow[] = [
  { id: 'up-001', portraitName: '高净值客户画像', userCount: 12350, tagCount: 28, status: 'active', updatedAt: '2026-03-10' },
  { id: 'up-002', portraitName: '潜力信用卡客户画像', userCount: 45200, tagCount: 35, status: 'active', updatedAt: '2026-03-08' },
  { id: 'up-003', portraitName: '流失预警客户画像', userCount: 8720, tagCount: 19, status: 'inactive', updatedAt: '2026-02-25' }
];

export default function UserPortraitPage() {
  const { t } = useTranslation();

  const columns: ColumnsType<PortraitRow> = [
    { title: t('pages.userPortrait.columns.id'), dataIndex: 'id' },
    { title: t('pages.userPortrait.columns.portraitName'), dataIndex: 'portraitName' },
    { title: t('pages.userPortrait.columns.userCount'), dataIndex: 'userCount' },
    { title: t('pages.userPortrait.columns.tagCount'), dataIndex: 'tagCount' },
    {
      title: t('pages.userPortrait.columns.status'),
      dataIndex: 'status',
      render: (s) =>
        s === 'active' ? <Tag color="green">{t('pages.userPortrait.statusActive')}</Tag> : <Tag>{t('pages.userPortrait.statusInactive')}</Tag>
    },
    { title: t('pages.userPortrait.columns.updatedAt'), dataIndex: 'updatedAt' },
    {
      title: t('pages.users.columns.actions'),
      render: () => (
        <Space>
          <Button size="small">{t('common.edit')}</Button>
          <Button size="small" danger>{t('common.delete')}</Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      className="page-card"
      title={t('pages.userPortrait.title')}
      extra={<Button type="primary">{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  );
}
