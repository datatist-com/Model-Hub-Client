import { useMemo, useState } from 'react';
import { App, Avatar, Button, Card, Input, Modal, Segmented, Select, Space, Table, Tag, Typography } from 'antd';
import {
  DesktopOutlined,
  LockOutlined,
  MoonFilled,
  SettingOutlined,
  SunOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { getCurrentUsername, getUserUiTheme, setUserLanguage, setUserUiTheme, type UiThemePreference } from '../auth/token';
import { getUserRole, getRoleI18nKey } from '../auth/roles';
import { applyUiTheme } from '../theme/uiTheme';

type LoginRecord = {
  id: string;
  time: string;
  ip: string;
  location: string;
  status: 'success' | 'failed';
};

type ActionRecord = {
  id: string;
  time: string;
  module: string;
  action: string;
  result: 'success' | 'failed';
};

const loginRecords: LoginRecord[] = [
  { id: 'lr-001', time: '2026-03-03 10:21:03', ip: '10.12.3.5', location: 'Ningbo', status: 'success' },
  { id: 'lr-002', time: '2026-03-02 21:07:11', ip: '10.12.3.5', location: 'Ningbo', status: 'success' },
  { id: 'lr-003', time: '2026-03-02 08:34:25', ip: '10.12.3.21', location: 'Shanghai', status: 'failed' }
];

const actionRecords: ActionRecord[] = [
  {
    id: 'ar-001',
    time: '2026-03-03 10:33:19',
    module: 'Data Sources',
    action: 'Create DuckDB table',
    result: 'success'
  },
  {
    id: 'ar-002',
    time: '2026-03-03 10:16:44',
    module: 'License Center',
    action: 'Activate license',
    result: 'success'
  },
  {
    id: 'ar-003',
    time: '2026-03-02 09:12:07',
    module: 'Users',
    action: 'Update role',
    result: 'failed'
  }
];

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uiTheme, setUiTheme] = useState<UiThemePreference>(() => {
    const username = getCurrentUsername();
    if (!username) {
      return 'system';
    }
    return getUserUiTheme(username) ?? 'system';
  });

  const loginColumns = useMemo<ColumnsType<LoginRecord>>(() => [
    { title: t('pages.profile.loginTime'), dataIndex: 'time', width: 180 },
    { title: 'IP', dataIndex: 'ip', width: 140 },
    { title: t('pages.profile.location'), dataIndex: 'location', width: 160 },
    {
      title: t('pages.profile.status'),
      dataIndex: 'status',
      width: 100,
      render: (status) =>
        status === 'success' ? <Tag color="green">{t('pages.profile.success')}</Tag> : <Tag color="red">{t('pages.profile.failed')}</Tag>
    }
  ], [t]);

  const actionColumns = useMemo<ColumnsType<ActionRecord>>(() => [
    { title: t('pages.profile.actionTime'), dataIndex: 'time', width: 180 },
    { title: t('pages.profile.module'), dataIndex: 'module', width: 140 },
    { title: t('pages.profile.action'), dataIndex: 'action', width: 200 },
    {
      title: t('pages.profile.status'),
      dataIndex: 'result',
      width: 100,
      render: (result) =>
        result === 'success' ? <Tag color="green">{t('pages.profile.success')}</Tag> : <Tag color="red">{t('pages.profile.failed')}</Tag>
    }
  ], [t]);

  const handleSavePassword = () => {
    if (!currentPassword.trim()) {
      message.warning(t('layout.user.currentPasswordValidation'));
      return;
    }

    if (!newPassword.trim()) {
      message.warning(t('layout.user.passwordValidation'));
      return;
    }

    if (!confirmPassword.trim()) {
      message.warning(t('layout.user.confirmPasswordValidation'));
      return;
    }

    if (newPassword !== confirmPassword) {
      message.warning(t('layout.user.passwordMismatch'));
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordOpen(false);
    message.success(t('layout.user.passwordSuccess'));
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    const username = getCurrentUsername();
    if (username) {
      setUserLanguage(username, language);
    }
  };

  const handleUiThemeChange = (nextTheme: UiThemePreference) => {
    setUiTheme(nextTheme);
    applyUiTheme(nextTheme);
    const username = getCurrentUsername();
    if (username) {
      setUserUiTheme(username, nextTheme);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div className="profile-top-grid">
        <Card className="page-card" title={t('pages.profile.personalInfo')}>
          <div className="profile-identity-panel">
            <div className="profile-identity-head">
              <Avatar className="profile-identity-avatar" size={56} icon={<UserOutlined />} />
              <div>
                <Typography.Title level={5} className="profile-identity-name">
                  陆星安
                </Typography.Title>
                <Typography.Text className="profile-identity-role">{t(`pages.users.roles.${getRoleI18nKey(getUserRole(getCurrentUsername() ?? 'admin'))}`)}</Typography.Text>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <span>{t('pages.profile.loginName')}</span>
                <strong>luxingan</strong>
              </div>
              <div className="profile-info-item">
                <span>{t('pages.profile.realName')}</span>
                <strong>陆星安</strong>
              </div>
              <div className="profile-info-item">
                <span>{t('pages.profile.identity')}</span>
                <strong>Administrator</strong>
              </div>
            </div>
          </div>
        </Card>

        <Card className="page-card" title={t('pages.profile.preferencesSecurity')}>
          <div className="profile-preference-panel">
            <Typography.Text className="profile-section-title">
              <SettingOutlined /> {t('pages.profile.preferences')}
            </Typography.Text>

            <div className="profile-pref-row">
              <div className="profile-pref-row-main">
                <Typography.Text className="profile-pref-row-title">{t('pages.profile.language')}</Typography.Text>
                <Typography.Text className="profile-pref-row-desc">{t('pages.profile.languageDesc')}</Typography.Text>
              </div>
              <Select
                className="profile-language-select"
                value={i18n.language}
                onChange={handleLanguageChange}
                classNames={{ popup: { root: 'app-select-dropdown' } }}
                options={[
                  { value: 'zh-CN', label: t('pages.profile.languageZh') },
                  { value: 'en-US', label: t('pages.profile.languageEn') }
                ]}
              />
            </div>

            <div className="profile-pref-row">
              <div className="profile-pref-row-main">
                <Typography.Text className="profile-pref-row-title">{t('pages.profile.uiTheme')}</Typography.Text>
                <Typography.Text className="profile-pref-row-desc">{t('pages.profile.uiThemeDesc')}</Typography.Text>
              </div>
              <Segmented
                className="profile-theme-segmented"
                value={uiTheme}
                onChange={(value) => handleUiThemeChange(value as UiThemePreference)}
                options={[
                  { label: t('pages.profile.themeDark'), value: 'dark', icon: <MoonFilled /> },
                  { label: t('pages.profile.themeLight'), value: 'light', icon: <SunOutlined /> },
                  { label: t('pages.profile.themeSystem'), value: 'system', icon: <DesktopOutlined /> }
                ]}
              />
            </div>

            <div className="profile-security-action">
              <Typography.Text className="profile-field-label">
                <LockOutlined /> {t('pages.profile.security')}
              </Typography.Text>
              <div className="profile-security-row">
                <div className="profile-security-row-main">
                  <Typography.Text className="profile-security-row-title">{t('pages.profile.password')}</Typography.Text>
                  <Typography.Text className="profile-security-row-desc">{t('pages.profile.securityHint')}</Typography.Text>
                </div>
                <Button type="default" icon={<LockOutlined />} onClick={() => setPasswordOpen(true)}>
                  {t('layout.user.changePassword')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="page-card" title={t('pages.profile.loginHistory')}>
        <Table rowKey="id" columns={loginColumns} dataSource={loginRecords} pagination={{ pageSize: 5 }} />
      </Card>

      <Card className="page-card" title={t('pages.profile.operationHistory')}>
        <Table rowKey="id" columns={actionColumns} dataSource={actionRecords} pagination={{ pageSize: 5 }} />
      </Card>

      <Modal
        open={passwordOpen}
        onCancel={() => {
          setPasswordOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
        onOk={handleSavePassword}
        okText={t('layout.user.savePassword')}
        title={t('layout.user.changePassword')}
        className="app-password-modal"
      >
        <Space direction="vertical" style={{ width: '100%' }} className="app-password-modal-form">
          <Typography.Text className="app-password-modal-label">{t('layout.user.currentPassword')}</Typography.Text>
          <Input.Password
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('layout.user.currentPasswordPlaceholder')}
          />

          <Typography.Text className="app-password-modal-label">{t('layout.user.newPassword')}</Typography.Text>
          <Input.Password
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('layout.user.newPasswordPlaceholder')}
          />

          <Typography.Text className="app-password-modal-label">{t('layout.user.confirmPassword')}</Typography.Text>
          <Input.Password
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('layout.user.confirmPasswordPlaceholder')}
          />
        </Space>
      </Modal>
    </Space>
  );
}
