import { Button, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const navigate = useNavigate();

  const isDynamicImportError =
    error instanceof TypeError && error.message.includes('dynamically imported module');

  const status = isRouteErrorResponse(error) ? (error.status === 404 ? '404' : '500') : '500';

  const subTitle = isDynamicImportError
    ? t('errorPage.dynamicImportHint')
    : isRouteErrorResponse(error)
      ? error.statusText
      : error instanceof Error
        ? error.message
        : t('errorPage.unknownError');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: 24 }}>
      <Result
        status={status as '404' | '500'}
        title={status}
        subTitle={subTitle}
        extra={[
          <Button key="back" type="primary" onClick={() => navigate('/')}>
            {t('errorPage.backHome')}
          </Button>,
          <Button key="reload" onClick={() => window.location.reload()}>
            {t('errorPage.reload')}
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', marginTop: 16, color: 'rgba(0,0,0,0.45)' }}>
          <p>{t('errorPage.contactHint')}</p>
          <a href="mailto:simon.lu@datatist.com">simon.lu@datatist.com</a>
        </div>
      </Result>
    </div>
  );
}
