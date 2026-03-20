import { lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CloseOutlined,
  MenuOutlined,
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
import { getUserRole, getMenuKeysForRole, getRoleI18nKey } from '../auth/roles';
import type { MenuKey } from '../auth/roles';
import { applyUiTheme } from '../theme/uiTheme';
import { maskLicenseKey } from '../components/license/licenseUtils';
import { SOURCE_NAME_MAP } from '../constants/mockMaps';
import { ROUTE_LABEL_KEY_MAP, TAB_IDENTITY_PARAMS_MAP, ROUTE_TO_MENU_KEY } from '../constants/routeConfig';
import KeepAliveOutlet from '../router/KeepAliveOutlet';
import LazyLoadGuard from '../components/lazy/LazyLoadGuard';
import LicenseCenterModalFallback from '../components/license/LicenseCenterModalFallback';
import { loadLicenseCenterModal } from '../router/preload';
import { activateLicense, changePassword, logout } from '../api/endpoints';
import { getApiErrorMessage } from '../api/http';

const LicenseCenterModal = lazy(loadLicenseCenterModal);

const { Header, Sider, Content, Footer } = Layout;
const PROJECT_NAME = 'Datatist Model Hub';
const KEEP_ALIVE_EXCLUDE: string[] = ['/'];

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
  { key: '/users', labelKey: 'menu.users', icon: <TeamOutlined /> }
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
  const [siderOpen, setSiderOpen] = useState(false);
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
      const sourceName = sourceId ? SOURCE_NAME_MAP[sourceId] ?? sourceId : null;

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLicenseCenterModal();
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

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

  const handleActivateLicense = async () => {
    const value = licenseKeyInput.trim();
    if (!value) {
      message.warning(t('layout.license.validation'));
      return;
    }

    try {
      const info = await activateLicense(value);
      setLicenseInfo((prev) => ({
        ...prev,
        licenseKeyMasked: info.licenseKeyMasked || maskLicenseKey(value),
        licensee: info.licensee || prev.licensee,
        activatedAt: info.activatedAt || prev.activatedAt,
        expiresAt: info.expiresAt || prev.expiresAt
      }));
      setLicenseKeyInput('');
      message.success(t('layout.license.activateSuccess'));
    } catch (error) {
      const msg = getApiErrorMessage(error, t('layout.license.validation'));
      message.error(msg);
    }
  };

  const handleChangePassword = async () => {
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

    try {
      await changePassword(currentPassword, newPassword);
    } catch (error) {
      const msg = getApiErrorMessage(error, t('layout.user.passwordValidation'));
      message.error(msg);
      return;
    }

    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    message.success(t('layout.user.passwordSuccess'));
  };

  const currentUsername = getCurrentUsername() ?? 'admin';
  const currentRole = getUserRole(currentUsername);
  const allowedMenuKeys = getMenuKeysForRole(currentRole);

  const filteredMenuItems = useMemo(
    () => MENU_ITEMS.filter((item) => allowedMenuKeys.includes(item.key as MenuKey)),
    [allowedMenuKeys]
  );

  const menuItems = useMemo(
    () => filteredMenuItems.map((item) => ({ key: item.key, label: t(item.labelKey), icon: item.icon })),
    [filteredMenuItems, t]
  );

  const tabTitles = useMemo(
    () => new Map(sessionTabs.map((tab) => [tab.key, getTabTitle(tab)])),
    [sessionTabs, t]
  );

  const handleUserMenuClick = useCallback(async ({ key }: { key: string }) => {
    if (key === 'profile') {
      navigate('/profile');
      return;
    }

    if (key === 'changePassword') {
      setPasswordOpen(true);
      return;
    }

    if (key === 'logout') {
      try {
        await logout();
      } catch {
        // Fall through and clear local session even if backend logout fails.
      }
      clearAccessToken();
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const userDropdownMenu = useMemo(() => ({
    onClick: handleUserMenuClick,
    items: [
      {
        key: 'profile',
        label: (
          <div className="app-user-menu-profile">
            <div>陆星安</div>
            <Typography.Text type="secondary">{t(`pages.users.roles.${getRoleI18nKey(currentRole)}`)}</Typography.Text>
          </div>
        )
      },
      { type: 'divider' as const },
      { key: 'changePassword', label: t('layout.user.changePassword') },
      { key: 'logout', label: t('layout.user.logout'), danger: true }
    ]
  }), [handleUserMenuClick, t]);

  return (
    <div className="app-root">
      <div className="app-bg-grid" />
      <div className="app-bg-aurora" />
      <div className="app-bg-orb app-bg-orb-a" />
      <div className="app-bg-orb app-bg-orb-b" />

      <Layout className="app-shell" style={{ minHeight: '100%' }}>
        {siderOpen && <div className="app-sider-overlay" onClick={() => setSiderOpen(false)} />}
        <Sider width={250} theme="light" className={`app-sider${siderOpen ? ' app-sider-open' : ''}`}>
          <div className="app-sider-brand">
            <span className="app-sider-brand-text">{PROJECT_NAME}</span>
          </div>
          <Menu
            className="app-menu"
            mode="inline"
            tabIndex={-1}
            selectedKeys={[ROUTE_TO_MENU_KEY[location.pathname] ?? location.pathname]}
            items={menuItems}
            onClick={(e) => { setSiderOpen(false); navigate(e.key); }}
          />
          <div className="app-sider-footer">
            <Typography.Text
              className="app-license-entry"
              onMouseEnter={() => { void loadLicenseCenterModal(); }}
              onFocus={() => { void loadLicenseCenterModal(); }}
              onClick={() => setLicenseOpen(true)}
            >
              {t('layout.license.entry')}
            </Typography.Text>
          </div>
        </Sider>
        <Layout>
          <Header className="app-header" style={{ padding: '0 16px' }}>
            <div className="app-header-inner">
              <button
                type="button"
                className="app-sider-toggle"
                aria-label="toggle menu"
                onClick={() => setSiderOpen((v) => !v)}
              >
                <MenuOutlined />
              </button>
              <div className="app-header-sessions" aria-label="sessions">
                {sessionTabs.map((tab) => (
                  <div
                    key={tab.key}
                    className={`app-session-pill${tab.key === activeTabKey ? ' is-active' : ''}`}
                    onClick={() => navigate(tab.href)}
                    title={tabTitles.get(tab.key)}
                    ref={tab.key === activeTabKey ? activeSessionRef : undefined}
                  >
                    <span className="app-session-pill-title">
                      {tabTitles.get(tab.key)}
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
                  menu={userDropdownMenu}
                >
                  <span className="app-user-avatar-trigger">
                    <Avatar className="app-user-avatar">陆</Avatar>
                  </span>
                </Dropdown>
              </Space>
            </div>
          </Header>
          <Content className="app-content" style={{ padding: 16 }}>
            <KeepAliveOutlet max={6} excludePathnames={KEEP_ALIVE_EXCLUDE} activeKey={activeTabKey} evictKey={keepAliveEvictKey} />
          </Content>
          <Footer className="app-footer">
            <Typography.Text>{t('layout.copyright')}</Typography.Text>
          </Footer>
        </Layout>
      </Layout>

      {licenseOpen && (
        <LazyLoadGuard
          featureName="license center"
          loadingFallback={(state) => (
            <LicenseCenterModalFallback
              open={licenseOpen}
              title={t('layout.license.title')}
              onCancel={() => setLicenseOpen(false)}
              state={state}
            />
          )}
        >
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
        </LazyLoadGuard>
      )}

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
