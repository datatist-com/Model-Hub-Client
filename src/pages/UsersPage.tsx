import { useState, useMemo } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { getCurrentUsername } from '../auth/token';
import { getUserRole, getManageableRoles } from '../auth/roles';
import type { Role } from '../auth/roles';

type UserRow = { id: string; username: string; realName: string; role: Role; status: 'active' | 'frozen' };

const ROLE_I18N_MAP: Record<Role, string> = {
  system_admin: 'systemAdmin',
  model_engineer: 'modelEngineer',
  data_engineer: 'dataEngineer',
  business_operator: 'businessOperator',
  project_admin: 'projectAdmin',
  project_member: 'projectMember'
};

const ROLE_COLOR_MAP: Record<Role, string> = {
  system_admin: 'red',
  model_engineer: 'blue',
  data_engineer: 'purple',
  business_operator: 'green',
  project_admin: 'orange',
  project_member: 'default'
};

const allUsers: UserRow[] = [
  { id: 'u-001', username: 'admin', realName: '张三', role: 'system_admin', status: 'active' },
  { id: 'u-002', username: 'alice', realName: '李四', role: 'model_engineer', status: 'active' },
  { id: 'u-003', username: 'bob', realName: '王五', role: 'data_engineer', status: 'active' },
  { id: 'u-004', username: 'carol', realName: '赵六', role: 'business_operator', status: 'active' },
  { id: 'u-005', username: 'dave', realName: '孙七', role: 'project_admin', status: 'active' },
  { id: 'u-006', username: 'eve', realName: '周八', role: 'project_member', status: 'active' },
  { id: 'u-007', username: 'frank', realName: '吴九', role: 'project_member', status: 'frozen' }
];

export default function UsersPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const currentUser = getCurrentUsername() ?? 'admin';
  const currentRole = getUserRole(currentUser);
  const manageableRoles = getManageableRoles(currentRole);

  const data = useMemo(() => {
    if (currentRole === 'system_admin') return allUsers;
    return allUsers.filter((u) => manageableRoles.includes(u.role));
  }, [currentRole, manageableRoles]);

  // 系统管理员仅有一个，不可新增
  const creatableRoles = manageableRoles.filter((r) => r !== 'system_admin');
  const roleOptions = creatableRoles.map((r) => ({
    value: r,
    label: t(`pages.users.roles.${ROLE_I18N_MAP[r]}`)
  }));

  const columns: ColumnsType<UserRow> = [
    { title: t('pages.users.columns.username'), dataIndex: 'username', width: 140 },
    { title: t('pages.users.columns.realName'), dataIndex: 'realName', width: 140 },
    {
      title: t('pages.users.columns.role'),
      dataIndex: 'role',
      width: 160,
      render: (role: Role) => <Tag color={ROLE_COLOR_MAP[role]}>{t(`pages.users.roles.${ROLE_I18N_MAP[role]}`)}</Tag>
    },
    {
      title: t('pages.users.columns.status'),
      dataIndex: 'status',
      width: 100,
      render: (s) => (s === 'active' ? <Tag color="green">{t('pages.users.statusActive')}</Tag> : <Tag color="orange">{t('pages.users.statusFrozen')}</Tag>)
    },
    {
      title: t('pages.users.columns.actions'),
      width: 160,
      render: (_, record) =>
        record.role === 'system_admin' ? (
          <span style={{ color: 'var(--ant-color-text-quaternary)' }}>—</span>
        ) : (
          <Space>
            <Button size="small" onClick={() => handleEdit(record)}>{t('common.edit')}</Button>
            <Button size="small" danger>
              {t('common.delete')}
            </Button>
          </Space>
        )
    }
  ];

  const handleEdit = (user: UserRow) => {
    setEditingUser(user);
    editForm.setFieldsValue({ username: user.username, realName: user.realName, role: user.role });
  };

  return (
    <Card
      className="page-card"
      title={t('pages.users.title')}
      extra={<Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>{t('common.create')}</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />

      {/* 新建用户 */}
      <Modal open={open} title={t('pages.users.createUser')} footer={null} onCancel={() => { setOpen(false); form.resetFields(); }} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={() => { setOpen(false); form.resetFields(); }}>
          <Form.Item name="username" label={t('pages.users.form.username')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="realName" label={t('pages.users.form.realName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label={t('pages.users.form.password')} rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label={t('pages.users.form.role')} rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {t('common.save')}
          </Button>
        </Form>
      </Modal>

      {/* 编辑用户 */}
      <Modal open={!!editingUser} title={t('pages.users.editUser')} footer={null} onCancel={() => setEditingUser(null)} destroyOnClose>
        <Form form={editForm} layout="vertical" onFinish={() => setEditingUser(null)}>
          <Form.Item name="username" label={t('pages.users.form.username')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="realName" label={t('pages.users.form.realName')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label={t('pages.users.form.password')}>
            <Input.Password placeholder={t('pages.users.form.passwordPlaceholder')} />
          </Form.Item>
          <Form.Item name="role" label={t('pages.users.form.role')} rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {t('common.save')}
          </Button>
        </Form>
      </Modal>
    </Card>
  );
}
