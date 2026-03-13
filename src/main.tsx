import '@ant-design/v5-patch-for-react-19';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import i18n from './i18n/index';
import 'antd/dist/reset.css';
import './styles.css';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-ui-theme-effective') !== 'light');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-ui-theme-effective') !== 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-ui-theme-effective'] });
    return () => observer.disconnect();
  }, []);

  return (
    <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nextProvider>
  </React.StrictMode>
);
