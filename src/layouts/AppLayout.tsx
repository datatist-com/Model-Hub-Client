import { useEffect, useRef, useState } from 'react';
import {
  BarChartOutlined,
  CloudServerOutlined,
  CloseOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  FlagOutlined,
  FunctionOutlined,
  IdcardOutlined,
  RobotOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { App, Avatar, Input, Layout, Menu, Modal, Space, Typography, Dropdown } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  clearAccessToken,
  getCurrentUsername,
  getUserLanguage,
  getUserSessionTabs,
  getUserUiTheme,
  setUserSessionTabs
} from '../auth/token';
import { applyUiTheme } from '../theme/uiTheme';
import { maskLicenseKey } from '../components/license/utils';
import KeepAliveOutlet from '../router/KeepAliveOutlet';
import LicenseCenterModal from '../components/license/LicenseCenterModal';

const { Header, Sider, Content, Footer } = Layout;
const PROJECT_NAME = 'Datatist Model Hub';

const ROUTE_LABEL_KEY_MAP: Record<string, string> = {
  '/dashboard': 'menu.dashboard',
  '/profile': 'pages.profile.title',
  '/data-sources': 'menu.dataSources',
  '/feature-management': 'menu.featureManagement',
  '/user-portrait': 'menu.userPortrait',
  '/target-management': 'menu.targetManagement',
  '/model-management': 'menu.modelManagement',
  '/scoring-generation': 'menu.scoringGeneration',
  '/operation-list-output': 'menu.operationListOutput',
  '/users': 'menu.users',
  '/log-viewer': 'menu.logViewer',
  '/hive-databases': 'menu.hiveDatabases',
  '/hive-tables': 'menu.hiveTables',
  '/duckdb-tables': 'menu.duckdbTables',
  '/ingest-jobs': 'menu.ingestJobs',
  '/sql-console': 'menu.sqlConsole'
};

const TAB_IDENTITY_PARAMS_MAP: Record<string, string[]> = {
  '/hive-databases': ['sourceId'],
  '/hive-tables': ['sourceId', 'databaseName'],
  '/duckdb-tables': ['sourceId'],
  '/ingest-jobs': ['sourceId', 'tableName'],
  '/sql-console': ['sourceId'],
  '/users': ['id', 'username'],
  '/profile': [],
  '/dashboard': [],
  '/data-sources': [],
  '/feature-management': [],
  '/user-portrait': [],
  '/target-management': [],
  '/model-management': [],
  '/scoring-generation': [],
  '/operation-list-output': [],
  '/log-viewer': []
};

const SOURCE_ID_NAME_MAP: Record<string, string> = {
  'src-001': 'hive-prod',
  'src-002': 'duckdb-local-a'
};

const ROUTE_TO_MENU_KEY: Record<string, string> = {
  '/hive-databases': '/data-sources',
  '/hive-tables': '/data-sources',
  '/duckdb-tables': '/data-sources',
  '/ingest-jobs': '/data-sources',
  '/sql-console': '/data-sources',
  '/profile': '/dashboard'
};

function computeTabKey(pathname: string, search: string): string {
  const identityParams = TAB_IDENTITY_PARAMS_MAP[pathname] ?? [];
  if (!identityParams.length) {
    return pathname;
  }

  const params = new URLSearchParams(search);
  const parts: string[] = [];
  for (const p of identityParams) {
    const value = params.get(p);
    if (value) {
      parts.push(`${encodeURIComponent(p)}=${encodeURIComponent(value)}`);
    }
  }

  if (!parts.length) {
    return pathname;
  }

  return `${pathname}?${parts.join('&')}`;
}

type SessionTab = {
  key: string;
  href: string;
  labelKey?: string;
};

type SessionTabNavigationState = {
  sessionTabMode?: 'replace';
};

const MENU_ITEMS = [
  { key: '/dashboard', labelKey: 'menu.dashboard', icon: <DashboardOutlined /> },
  { key: '/data-sources', labelKey: 'menu.dataSources', icon: <CloudServerOutlined /> },
  { key: '/feature-management', labelKey: 'menu.featureManagement', icon: <FunctionOutlined /> },
  { key: '/user-portrait', labelKey: 'menu.userPortrait', icon: <IdcardOutlined /> },
  { key: '/target-management', labelKey: 'menu.targetManagement', icon: <FlagOutlined /> },
  { key: '/model-management', labelKey: 'menu.modelManagement', icon: <RobotOutlined /> },
  { key: '/scoring-generation', labelKey: 'menu.scoringGeneration', icon: <BarChartOutlined /> },
  { key: '/operation-list-output', labelKey: 'menu.operationListOutput', icon: <FileDoneOutlined /> },
  { key: '/users', labelKey: 'menu.users', icon: <TeamOutlined /> },
  { key: '/log-viewer', labelKey: 'menu.logViewer', icon: <FileSearchOutlined /> }
];

export default function AppLayout() {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionTabs, setSessionTabs] = useState<SessionTab[]>([]);
  const [keepAliveEvictKey, setKeepAliveEvictKey] = useState<string | null>(null);
  const activeSessionRef = useRef<HTMLDivElement | null>(null);
  const activeTabKey = computeTabKey(location.pathname, location.search ?? '');
  const prevPathRef = useRef<string>(activeTabKey);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseInfo, setLicenseInfo] = useState({
    licenseKeyMasked: 'AB12********WXYZ',
    licensee: '宁波建行',
    activatedAt: '2026-03-03T09:30:00Z',
    expiresAt: '2027-03-03T23:59:59Z'
  });

  const getSessionLabelKey = (pathname: string): string | undefined => {
    return ROUTE_LABEL_KEY_MAP[pathname];
  };

  const getTabTitle = (tab: SessionTab): string => {
    const base = tab.labelKey ? t(tab.labelKey) : tab.key.split('?')[0].replace('/', '');
    try {
      const url = new URL(tab.href, window.location.origin);
      const pathname = url.pathname;
      const sourceId = url.searchParams.get('sourceId');
      const sourceName = sourceId ? SOURCE_ID_NAME_MAP[sourceId] ?? sourceId : null;

      const identityParams = TAB_IDENTITY_PARAMS_MAP[pathname] ?? [];
      const params = url.searchParams;

      const specificParams = identityParams.filter((p) => p !== 'sourceId');
      const mostSpecificParam = specificParams.length ? specificParams[specificParams.length - 1] : null;
      const mostSpecificValue = mostSpecificParam ? params.get(mostSpecificParam) : null;

      const contextValue = mostSpecificValue || sourceName;
      const contextSuffix = contextValue ? ` (${contextValue})` : '';

      return `${base}${contextSuffix}`;
    } catch {
      return base;
    }
  };

  useEffect(() => {
    const username = getCurrentUsername();
    if (!username) {
      return;
    }

    const storedTabs = getUserSessionTabs(username);
    if (storedTabs && storedTabs.length) {
      setSessionTabs(
        storedTabs.map((item) => ({
          key: (() => {
            try {
              const url = new URL(item.href, window.location.origin);
              return computeTabKey(url.pathname, url.search);
            } catch {
              return item.key;
            }
          })(),
          href: item.href,
          labelKey: (() => {
            if (item.labelKey) {
              return item.labelKey;
            }
            try {
              const url = new URL(item.href, window.location.origin);
              return getSessionLabelKey(url.pathname);
            } catch {
              return getSessionLabelKey(item.key.split('?')[0]);
            }
          })()
        }))
      );
    }

    const language = getUserLanguage(username);
    if (language && language !== i18n.language) {
      i18n.changeLanguage(language);
    }

    const uiTheme = getUserUiTheme(username) ?? 'system';
    applyUiTheme(uiTheme);
  }, [i18n]);

  useEffect(() => {
    if (location.pathname === '/') {
      return;
    }

    const navigationState = (location.state ?? null) as SessionTabNavigationState | null;
    const isReplaceTab = navigationState?.sessionTabMode === 'replace';
    const replaceFromKey = prevPathRef.current;

    const href = `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
    const labelKey = getSessionLabelKey(location.pathname);

    const nextKey = computeTabKey(location.pathname, location.search ?? '');

    if (isReplaceTab && replaceFromKey !== nextKey) {
      setKeepAliveEvictKey(replaceFromKey);
      setTimeout(() => setKeepAliveEvictKey(null), 0);
    }

    setSessionTabs((prev) => {
      const MAX_TABS = 6;

      const upsertStable = (tabs: SessionTab[], key: string, nextHref: string, nextLabelKey?: string) => {
        const idx = tabs.findIndex((tab) => tab.key === key);
        if (idx >= 0) {
          const copy = [...tabs];
          copy[idx] = { ...copy[idx], href: nextHref, labelKey: nextLabelKey ?? copy[idx].labelKey };
          return copy;
        }
        return [...tabs, { key, href: nextHref, labelKey: nextLabelKey }];
      };

      if (isReplaceTab) {
        const fromIdx = prev.findIndex((tab) => tab.key === replaceFromKey);
        const toIdx = prev.findIndex((tab) => tab.key === nextKey);

        if (toIdx >= 0) {
          let next = prev;
          if (fromIdx >= 0 && replaceFromKey !== nextKey) {
            next = prev.filter((tab) => tab.key !== replaceFromKey);
          }
          return upsertStable(next, nextKey, href, labelKey);
        }

        if (fromIdx >= 0) {
          const next = [...prev];
          next[fromIdx] = { key: nextKey, href, labelKey };
          return next;
        }
      }

      let next = upsertStable(prev, nextKey, href, labelKey);
      while (next.length > MAX_TABS) {
        next = next.slice(1);
      }
      return next;
    });

    prevPathRef.current = nextKey;
  }, [i18n.language, location.hash, location.pathname, location.search, t]);

  useEffect(() => {
    const username = getCurrentUsername();
    if (!username) {
      return;
    }
    setUserSessionTabs(
      username,
      sessionTabs.map((tab) => ({ key: tab.key, href: tab.href, labelKey: tab.labelKey }))
    );
  }, [sessionTabs]);

  useEffect(() => {
    if (!activeSessionRef.current) {
      return;
    }
    activeSessionRef.current.scrollIntoView({ behavior: 'smooth', inline: 'end', block: 'nearest' });
  }, [activeTabKey]);

  const handleCloseSessionTab = (key: string) => {
    setKeepAliveEvictKey(key);
    setTimeout(() => setKeepAliveEvictKey(null), 0);

    const currentTabs = sessionTabs;
    const index = currentTabs.findIndex((tab) => tab.key === key);
    const nextTabs = currentTabs.filter((tab) => tab.key !== key);

    const username = getCurrentUsername();
    if (username) {
      setUserSessionTabs(
        username,
        nextTabs.map((tab) => ({ key: tab.key, href: tab.href, labelKey: tab.labelKey }))
      );
    }

    setSessionTabs(nextTabs);

    if (activeTabKey === key) {
      const fallback = nextTabs[index - 1] ?? nextTabs[index] ?? nextTabs[nextTabs.length - 1];
      navigate(fallback?.href ?? '/dashboard');
    }
  };

  const now = Date.now();
  const isExpired = new Date(licenseInfo.expiresAt).getTime() < now;
  const licenseState: 'expired' | 'active' = isExpired ? 'expired' : 'active';

  const handleActivateLicense = () => {
    const value = licenseKeyInput.trim();
    if (!value) {
      message.warning(t('layout.license.validation'));
      return;
    }

    const activatedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    setLicenseInfo((prev) => ({
      ...prev,
      licenseKeyMasked: maskLicenseKey(value),
      activatedAt: activatedAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    }));
    setLicenseKeyInput('');
    message.success(t('layout.license.activateSuccess'));
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'profile') {
      navigate('/profile');
      return;
    }

    if (key === 'changePassword') {
      setPasswordOpen(true);
      return;
    }

    if (key === 'logout') {
      clearAccessToken();
      navigate('/login', { replace: true });
    }
  };

  const handleChangePassword = () => {
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

    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    message.success(t('layout.user.passwordSuccess'));
  };

  return (
    <div className="app-root">
      <div className="app-bg-grid" />
      <div className="app-bg-aurora" />
      <div className="app-bg-orb app-bg-orb-a" />
      <div className="app-bg-orb app-bg-orb-b" />

      <Layout className="app-shell" style={{ minHeight: '100%' }}>
        <Sider width={250} theme="light" className="app-sider">
          <div className="app-sider-brand">
            <span className="app-sider-brand-text">{PROJECT_NAME}</span>
          </div>
          <Menu
            className="app-menu"
            mode="inline"
            tabIndex={-1}
            selectedKeys={[ROUTE_TO_MENU_KEY[location.pathname] ?? location.pathname]}
            items={MENU_ITEMS.map((item) => ({ key: item.key, label: t(item.labelKey), icon: item.icon }))}
            onClick={(e) => navigate(e.key)}
          />
          <div className="app-sider-footer">
            <Typography.Text className="app-license-entry" onClick={() => setLicenseOpen(true)}>
              {t('layout.license.entry')}
            </Typography.Text>
          </div>
        </Sider>
        <Layout>
          <Header className="app-header" style={{ padding: '0 16px' }}>
            <div className="app-header-inner">
              <div className="app-header-sessions" aria-label="sessions">
                {sessionTabs.map((tab) => (
                  <div
                    key={tab.key}
                    className={`app-session-pill${tab.key === activeTabKey ? ' is-active' : ''}`}
                    onClick={() => navigate(tab.href)}
                    title={getTabTitle(tab)}
                    ref={tab.key === activeTabKey ? activeSessionRef : undefined}
                  >
                    <span className="app-session-pill-title">
                      {getTabTitle(tab)}
                    </span>
                    <button
                      type="button"
                      className="app-session-pill-close"
                      aria-label="close"
                      tabIndex={-1}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseSessionTab(tab.key);
                      }}
                    >
                      <CloseOutlined />
                    </button>
                  </div>
                ))}
              </div>

              <Space>
                <Dropdown
                  trigger={['hover']}
                  menu={{
                    onClick: handleUserMenuClick,
                    items: [
                      {
                        key: 'profile',
                        label: (
                          <div className="app-user-menu-profile">
                            <div>陆星安</div>
                            <Typography.Text type="secondary">{t('layout.user.roleAdmin')}</Typography.Text>
                          </div>
                        )
                      },
                      { type: 'divider' },
                      { key: 'changePassword', label: t('layout.user.changePassword') },
                      { key: 'logout', label: t('layout.user.logout'), danger: true }
                    ]
                  }}
                >
                  <span className="app-user-avatar-trigger">
                    <Avatar className="app-user-avatar">陆</Avatar>
                  </span>
                </Dropdown>
              </Space>
            </div>
          </Header>
          <Content className="app-content" style={{ padding: 16 }}>
            <KeepAliveOutlet max={6} excludePathnames={['/']} activeKey={activeTabKey} evictKey={keepAliveEvictKey} />
          </Content>
          <Footer className="app-footer">
            <Typography.Text>{t('layout.copyright')}</Typography.Text>
          </Footer>
        </Layout>
      </Layout>

      <LicenseCenterModal
        open={licenseOpen}
        onCancel={() => setLicenseOpen(false)}
        className="app-license-modal"
        state={licenseState}
        stateText={licenseState === 'active' ? t('layout.license.active') : t('layout.license.expired')}
        title={t('layout.license.title')}
        subtitle={licenseState === 'active' ? t('layout.license.subtitleActive') : t('layout.license.subtitleExpired')}
        licenseInfo={licenseInfo}
        keyLabel={t('layout.license.key')}
        organizationLabel={t('layout.license.organization')}
        validUntilLabel={t('layout.license.validUntil')}
        activatedAtLabel={t('layout.license.activatedAt')}
        inputHint={t('layout.license.inputHint')}
        inputPlaceholder={t('layout.license.placeholder')}
        activateButtonText={t('layout.license.activateButton')}
        licenseKeyInput={licenseKeyInput}
        onLicenseKeyInputChange={setLicenseKeyInput}
        onActivate={handleActivateLicense}
      />

      <Modal
        open={passwordOpen}
        onCancel={() => {
          setPasswordOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
        onOk={handleChangePassword}
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
    </div>
  );
}
