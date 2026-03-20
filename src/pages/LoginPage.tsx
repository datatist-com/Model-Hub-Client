import { lazy, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEventHandler } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Space, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n';
import { getUserLanguage, setAccessToken, setCurrentUsername, setUserLanguage } from '../auth/token';
import { setUserRole } from '../auth/roles';
import { applyUiTheme } from '../theme/uiTheme';
import { maskLicenseKey } from '../components/license/licenseUtils';
import LazyLoadGuard from '../components/lazy/LazyLoadGuard';
import LicenseCenterModalFallback from '../components/license/LicenseCenterModalFallback';
import { loadLicenseCenterModal, warmupAuthEntry } from '../router/preload';
import { activateLicense, getLicenseInfo, login } from '../api/endpoints';
import { getApiErrorMessage } from '../api/http';

const LicenseCenterModal = lazy(loadLicenseCenterModal);

type LicenseInfo = {
  licenseKeyMasked: string;
  licensee: string;
  activatedAt: string;
  expiresAt: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const pageRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);

  const toIsoNow = () => new Date().toISOString();
  const toIsoPlusOneYear = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
  };

  const now = Date.now();
  const hasLicense = Boolean(licenseInfo);
  const isExpired = hasLicense && licenseInfo ? new Date(licenseInfo.expiresAt).getTime() < now : false;
  const licenseState: 'missing' | 'expired' | 'active' = !hasLicense ? 'missing' : isExpired ? 'expired' : 'active';

  const footerTextByState = {
    missing: 'License is not activated. Some modules are unavailable. Click to view activation details.',
    expired: `License expired on ${licenseInfo?.expiresAt.slice(0, 10)}. Click to view renewal details.`,
    active: `Licensed to ${licenseInfo?.licensee}. Valid until ${licenseInfo?.expiresAt.slice(0, 10)}.`
  };

  const modalTitleByState = {
    missing: 'License Required',
    expired: 'License Expired',
    active: 'License'
  };
  const statusTextByState = {
    missing: 'Not Activated',
    expired: 'Expired',
    active: 'Active'
  };

  const activateActionText = licenseState === 'active' ? 'Update License' : 'Activate License';

  const handleActivateLicense = async () => {
    const value = licenseKeyInput.trim();
    if (!value) {
      message.warning('Please enter a valid license key.');
      return;
    }

    try {
      const next = await activateLicense(value);
      setLicenseInfo({
        licenseKeyMasked: next.licenseKeyMasked || maskLicenseKey(value),
        licensee: next.licensee || 'N/A',
        activatedAt: next.activatedAt || toIsoNow(),
        expiresAt: next.expiresAt || toIsoPlusOneYear()
      });
      setLicenseKeyInput('');
      message.success('License activated successfully.');
    } catch (error) {
      const msg = getApiErrorMessage(error, 'License activation failed.');
      message.error(msg);
    }
  };

  useEffect(() => {
    // Product requirement: Login page is always English + dark theme.
    i18n.changeLanguage('en-US');
    applyUiTheme('dark');

    const page = pageRef.current;
    if (!page) {
      return;
    }
    page.style.setProperty('--mx', `${window.innerWidth / 2}px`);
    page.style.setProperty('--my', `${window.innerHeight / 2}px`);
    page.style.setProperty('--rx', '0');
    page.style.setProperty('--ry', '0');

    const warmupTimer = window.setTimeout(() => {
      void warmupAuthEntry();
      void loadLicenseCenterModal();
    }, 180);

    void getLicenseInfo()
      .then((info) => {
        setLicenseInfo({
          licenseKeyMasked: info.licenseKeyMasked,
          licensee: info.licensee,
          activatedAt: info.activatedAt,
          expiresAt: info.expiresAt
        });
      })
      .catch(() => {
        // Keep null state when no license is returned.
      });

    return () => {
      window.clearTimeout(warmupTimer);
    };
  }, []);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const page = pageRef.current;
    if (!page) {
      return;
    }

    cancelAnimationFrame(rafRef.current);
    const x = event.clientX;
    const y = event.clientY;
    rafRef.current = requestAnimationFrame(() => {
      const rx = (x / window.innerWidth - 0.5) * 2;
      const ry = (y / window.innerHeight - 0.5) * 2;
      page.style.setProperty('--mx', `${x}px`);
      page.style.setProperty('--my', `${y}px`);
      page.style.setProperty('--rx', rx.toFixed(3));
      page.style.setProperty('--ry', ry.toFixed(3));
    });
  };

  const handleMouseLeave = () => {
    const page = pageRef.current;
    if (!page) {
      return;
    }
    page.style.setProperty('--rx', '0');
    page.style.setProperty('--ry', '0');
  };

  const handleSubmit = async (values: { username: string; password: string }) => {
    if (isTransitioning) {
      return;
    }

    const username = values.username.trim();
    if (!username) {
      message.warning('Please enter your account.');
      return;
    }

    setIsTransitioning(true);

    try {
      const res = await login(username, values.password);
      const resolvedUsername = res.user?.username?.trim() || username;

      setCurrentUsername(resolvedUsername);
      setAccessToken(res.accessToken);
      setUserRole(resolvedUsername, res.user.role);

      const language = res.user.language ?? getUserLanguage(resolvedUsername) ?? 'zh-CN';
      setUserLanguage(resolvedUsername, language);

      message.success('Login successful');
      void warmupAuthEntry();
      window.setTimeout(() => {
        navigate('/users', { replace: true });
      }, 280);
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Login failed.');
      message.error(msg);
      setIsTransitioning(false);
    }
  };

  return (
    <div
      ref={pageRef}
      className={`login-page ${isTransitioning ? 'login-page-leaving' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="login-bg-grid" />
      <div className="login-bg-noise" />
      <div className="login-bg-aurora" />
      <div className="login-bg-spotlight" />
      <div className="login-bg-orb login-bg-orb-a" />
      <div className="login-bg-orb login-bg-orb-b" />
      <div className="login-bg-particles" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, index) => {
          const left = `${(index * 7 + 9) % 100}%`;
          const top = `${(index * 13 + 17) % 100}%`;
          const size = `${index % 3 === 0 ? 4 : 3}px`;
          const delay = `${(index % 5) * 0.8}s`;
          const duration = `${5 + (index % 6)}s`;

          return (
            <span
              key={index}
              className="login-bg-particle"
              style={
                {
                  '--left': left,
                  '--top': top,
                  '--size': size,
                  '--delay': delay,
                  '--duration': duration
                } as CSSProperties
              }
            />
          );
        })}
      </div>

      <div className="login-shell">
        <div className="login-brand">
          <Typography.Text className="login-brand-chip">AI-DRIVEN MODELING PLATFORM</Typography.Text>
          <Typography.Title level={1} className="login-brand-title">
            Datatist Model Hub
          </Typography.Title>
          <Typography.Paragraph className="login-brand-subtitle">
            Build, train, and operate ML systems with a unified data + model workflow.
          </Typography.Paragraph>
        </div>

        <Card className="login-card" bordered={false}>
          <Typography.Title level={3} className="login-card-title">
            Sign In
          </Typography.Title>
          <Typography.Text className="login-card-desc">Access your AI workspace</Typography.Text>

          <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
            <Form.Item
              label="Account"
              name="username"
              rules={[{ required: true, message: 'Please enter your account.' }]}
            >
              <Input
                size="large"
                placeholder="admin / alice"
                autoComplete="username"
                prefix={<UserOutlined className="login-input-prefix" />}
                onPressEnter={() => form.submit()}
              />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter your password.' }]}
            >
              <Input.Password
                size="large"
                placeholder="••••••••"
                autoComplete="current-password"
                prefix={<LockOutlined className="login-input-prefix" />}
                onPressEnter={() => form.submit()}
              />
            </Form.Item>
            <Space style={{ width: '100%' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="login-submit-btn"
                block
                loading={isTransitioning}
              >
                Continue
              </Button>
            </Space>
          </Form>
        </Card>
      </div>

      {isTransitioning && (
        <>
          <div className="login-transition-overlay" aria-hidden="true" />
          <div className="login-transition-stream" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span
                key={index}
                className="login-transition-stream-line"
                style={
                  {
                    '--y': `${(index + 1) * 5.6}%`,
                    '--delay': `${(index % 6) * 0.04}s`,
                    '--duration': `${0.38 + (index % 4) * 0.08}s`
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </>
      )}

      <div className="login-page-footer">
        <Typography.Text
          className={`login-license-trigger login-license-trigger-${licenseState}`}
          onMouseEnter={() => { void loadLicenseCenterModal(); }}
          onClick={() => setLicenseOpen(true)}
        >
          {footerTextByState[licenseState]}
        </Typography.Text>
        <Typography.Text className="login-copyright">
          © Datatist. All rights reserved.
        </Typography.Text>
      </div>

      {licenseOpen && (
        <LazyLoadGuard
          featureName="license center"
          loadingFallback={(state) => (
            <LicenseCenterModalFallback
              open={licenseOpen}
              title={modalTitleByState[licenseState]}
              onCancel={() => setLicenseOpen(false)}
              state={state}
            />
          )}
        >
          <LicenseCenterModal
            open={licenseOpen}
            onCancel={() => setLicenseOpen(false)}
            className="login-license-modal"
            state={licenseState}
            stateText={statusTextByState[licenseState]}
            title={modalTitleByState[licenseState]}
            subtitle={
              licenseState === 'active'
                ? 'Your workspace is licensed and ready. If you receive a new key, you can update it below.'
                : 'Activate a valid license key to unlock full modeling, training, and operational capabilities.'
            }
            licenseInfo={licenseInfo}
            keyLabel="License Key"
            organizationLabel="Licensed Organization"
            validUntilLabel="Valid Until"
            activatedAtLabel="Activated At"
            inputHint={licenseState === 'active' ? 'Need to replace your current key?' : 'Have a valid key? Activate now.'}
            inputPlaceholder="Enter your license key"
            activateButtonText={activateActionText}
            licenseKeyInput={licenseKeyInput}
            onLicenseKeyInputChange={setLicenseKeyInput}
            onActivate={handleActivateLicense}
          />
        </LazyLoadGuard>
      )}
    </div>
  );
}
