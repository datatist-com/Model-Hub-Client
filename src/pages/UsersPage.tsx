import { useState } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

type UserRow = { id: string; username: string; role: string; status: 'active' | 'frozen' };

const initialData: UserRow[] = [
  { id: 'u-001', username: 'admin', role: 'system_admin', status: 'active' },
  { id: 'u-002', username: 'alice', role: 'model_engineer', status: 'frozen' }
];

export default function UsersPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const columns: ColumnsType<UserRow> = [
    { title: t('pages.users.columns.id'), dataIndex: 'id', width: 100 },
    { title: t('pages.users.columns.username'), dataIndex: 'username', width: 160 },
    { title: t('pages.users.columns.role'), dataIndex: 'role', width: 160 },
    {
      title: t('pages.users.columns.status'),
      dataIndex: 'status',
      width: 100,
      render: (s) => (s === 'active' ? <Tag color="green">{t('pages.users.statusActive')}</Tag> : <Tag color="orange">{t('pages.users.statusFrozen')}</Tag>)
    },
    {
      title: t('pages.users.columns.actions'),
      width: 160,
      render: () => (
        <Space>
          <Button size="small">{t('common.edit')}</Button>
          <Button size="small" danger>
            {t('common.delete')}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card
      className="page-card"
      title={t('pages.users.title')}
      extra={<Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={initialData} pagination={{ pageSize: 10 }} />
      <Modal open={open} title={t('pages.users.createUser')} footer={null} onCancel={() => setOpen(false)}>
        <Form layout="vertical" onFinish={() => setOpen(false)}>
          <Form.Item name="username" label={t('pages.users.form.username')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label={t('pages.users.form.role')} rules={[{ required: true }]}>
            <Select
              options={[
                { label: t('pages.users.roles.systemAdmin'), value: 'system_admin' },
                { label: t('pages.users.roles.modelEngineer'), value: 'model_engineer' },
                { label: t('pages.users.roles.businessOperator'), value: 'business_operator' },
                { label: t('pages.users.roles.member'), value: 'member' }
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {t('common.save')}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}
