import { Button, Card, Tag, Typography } from 'antd';
import { DesktopOutlined, DownloadOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import { Trans, useTranslation } from 'react-i18next';
import type { EnvironmentIssue } from '../platform/environmentGuard';

const CHROME_DOWNLOAD_URL = 'https://www.google.com/chrome/';

type UnsupportedEnvironmentPageProps = {
  issues: EnvironmentIssue[];
  onRetry: () => void;
  onContinue: () => void;
};

export default function UnsupportedEnvironmentPage({ issues, onRetry, onContinue }: UnsupportedEnvironmentPageProps) {
  const { t } = useTranslation();

  const issueLabelMap: Record<EnvironmentIssue, string> = {
    'small-viewport': t('environmentGuard.issueSmallViewport'),
    'mobile-layout': t('environmentGuard.issueMobileLayout'),
    'non-chrome': t('environmentGuard.issueNonChrome')
  };

  return (
    <div className="environment-guard-page">
      <div className="environment-guard-grid" />
      <div className="environment-guard-orb environment-guard-orb-a" />
      <div className="environment-guard-orb environment-guard-orb-b" />

      <Card className="environment-guard-card" variant="borderless">
        <div className="environment-guard-shell">
          <div className="environment-guard-topbar">
            <div className="environment-guard-product">
              <div className="environment-guard-product-row">
                <Typography.Text className="environment-guard-product-name">
                  {t('environmentGuard.productName')}
                </Typography.Text>
                <div className="environment-guard-badge">
                  <WarningOutlined />
                  <span>{t('environmentGuard.badge')}</span>
                </div>
              </div>
              <Typography.Paragraph className="environment-guard-product-desc">
                {t('environmentGuard.productDescription')}
              </Typography.Paragraph>
            </div>
          </div>

          <div className="environment-guard-hero">
            <div className="environment-guard-hero-copy">
              <div className="environment-guard-hero-heading">
                <div className="environment-guard-icon-shell">
                  <DesktopOutlined />
                </div>
                <Typography.Title level={2} className="environment-guard-title">
                  {t('environmentGuard.title')}
                </Typography.Title>
              </div>
              <Typography.Paragraph className="environment-guard-desc">
                {t('environmentGuard.description')}
              </Typography.Paragraph>
            </div>
          </div>

          <div className="environment-guard-content">
            <div className="environment-guard-panels">
              <div className="environment-guard-panel environment-guard-panel-primary">
                <Typography.Text className="environment-guard-panel-title">
                  {t('environmentGuard.recommendationTitle')}
                </Typography.Text>
                <Typography.Paragraph className="environment-guard-panel-desc">
                  {t('environmentGuard.recommendationDesc')}
                </Typography.Paragraph>
              </div>

              <div className="environment-guard-panel environment-guard-panel-secondary">
                <Typography.Text className="environment-guard-panel-title">
                  {t('environmentGuard.detectedIssues')}
                </Typography.Text>
                <div className="environment-guard-tags">
                  {issues.map((issue) => (
                    <Tag key={issue} className="environment-guard-tag">
                      {issueLabelMap[issue]}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="environment-guard-footer">
            <div className="environment-guard-actions">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                href={CHROME_DOWNLOAD_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t('environmentGuard.downloadChrome')}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={onRetry}>
                {t('environmentGuard.retry')}
              </Button>
            </div>

            <div className="environment-guard-footnote-wrap">
              <Typography.Paragraph className="environment-guard-footnote">
                <Trans
                  i18nKey="environmentGuard.footnote"
                  components={{
                    retry: <span className="environment-guard-footnote-strong" />,
                    continue: (
                      <button type="button" className="environment-guard-inline-action" onClick={onContinue} />
                    )
                  }}
                />
              </Typography.Paragraph>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
