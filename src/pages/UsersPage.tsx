import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { getCurrentUsername } from '../auth/token';
import { getUserRole, getManageableRoles, getRoleI18nKey } from '../auth/roles';
import type { Role } from '../auth/roles';
import { createUser, deleteUser, listUsers, updateUser, type UserStatus, type UserView } from '../api/endpoints';
import { getApiErrorMessage } from '../api/http';

type UserRow = { id: string; username: string; realName: string; role: Role; status: UserStatus };

const ROLE_COLOR_MAP: Record<Role, string> = {
  model_developer: 'blue',
  model_operator: 'green',
  platform_admin: 'red'
};

export default function UsersPage() {
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const currentUser = getCurrentUsername() ?? 'admin';
  const currentRole = getUserRole(currentUser);
  const manageableRoles = getManageableRoles(currentRole);

  const mapUser = (user: UserView): UserRow => ({
    id: user.id,
    username: user.username,
    realName: user.realName || user.username,
    role: user.role,
    status: user.status
  });

  const fetchUsers = useCallback(async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const res = await listUsers({ page: nextPage, pageSize: nextPageSize });
      setUsers((res.items ?? []).map(mapUser));
      setTotal(res.total ?? 0);
      setPage(res.page ?? nextPage);
      setPageSize(res.pageSize ?? nextPageSize);
    } catch (error) {
      message.error(getApiErrorMessage(error, t('errorPage.unknownError')));
    } finally {
      setLoading(false);
    }
  }, [message, page, pageSize, t]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const data = useMemo(() => {
    if (currentRole === 'platform_admin') return users;
    return users.filter((u) => manageableRoles.includes(u.role));
  }, [currentRole, manageableRoles, users]);

  const roleOptions = manageableRoles.map((r) => ({
    value: r,
    label: t(`pages.users.roles.${getRoleI18nKey(r)}`)
  }));

  const handleEdit = (user: UserRow) => {
    setEditingUser(user);
    editForm.setFieldsValue({ username: user.username, realName: user.realName, role: user.role });
  };

  const handleCreate = async (values: { username: string; realName: string; password: string; role: Role }) => {
    try {
      await createUser({
        username: values.username,
        password: values.password,
        realName: values.realName,
        role: values.role
      });
      setOpen(false);
      form.resetFields();
      message.success(t('common.save'));
      void fetchUsers(1, pageSize);
    } catch (error) {
      message.error(getApiErrorMessage(error, t('errorPage.unknownError')));
    }
  };

  const handleUpdate = async (values: { username: string; realName: string; role: Role }) => {
    if (!editingUser) {
      return;
    }

    try {
      await updateUser(editingUser.id, {
        realName: values.realName,
        role: values.role
      });
      setEditingUser(null);
      editForm.resetFields();
      message.success(t('common.save'));
      void fetchUsers(page, pageSize);
    } catch (error) {
      message.error(getApiErrorMessage(error, t('errorPage.unknownError')));
    }
  };

  const handleDelete = (record: UserRow) => {
    modal.confirm({
      title: t('common.delete'),
      content: `${record.username}`,
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteUser(record.id);
          message.success(t('common.delete'));
          void fetchUsers(page, pageSize);
        } catch (error) {
          message.error(getApiErrorMessage(error, t('errorPage.unknownError')));
        }
      }
    });
  };

  const columns = useMemo<ColumnsType<UserRow>>(() => [
    { title: t('pages.users.columns.username'), dataIndex: 'username', width: 140 },
    { title: t('pages.users.columns.realName'), dataIndex: 'realName', width: 140 },
    {
      title: t('pages.users.columns.role'),
      dataIndex: 'role',
      width: 160,
      render: (role: Role) => <Tag color={ROLE_COLOR_MAP[role]}>{t(`pages.users.roles.${getRoleI18nKey(role)}`)}</Tag>
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
        record.username === currentUser ? (
          <span style={{ color: 'var(--ant-color-text-quaternary)' }}>—</span>
        ) : (
          <Space>
            <Button size="small" onClick={() => handleEdit(record)}>{t('common.edit')}</Button>
            <Button size="small" danger onClick={() => handleDelete(record)}>
              {t('common.delete')}
            </Button>
          </Space>
        )
    }
  ], [currentUser, t]);

  return (
    <Card
      className="page-card"
      title={t('pages.users.title')}
      extra={<Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>{t('common.create')}</Button>}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (nextPage, nextPageSize) => {
            void fetchUsers(nextPage, nextPageSize);
          }
        }}
      />

      <Modal open={open} title={t('pages.users.createUser')} footer={null} onCancel={() => { setOpen(false); form.resetFields(); }} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
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

      <Modal open={!!editingUser} title={t('pages.users.editUser')} footer={null} onCancel={() => setEditingUser(null)} destroyOnClose>
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="username" label={t('pages.users.form.username')} rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item name="realName" label={t('pages.users.form.realName')} rules={[{ required: true }]}>
            <Input />
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
