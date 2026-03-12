import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { I18nextProvider } from 'react-i18next';
import App from './App';
import i18n from './i18n/index';
import 'antd/dist/reset.css';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </I18nextProvider>
  </React.StrictMode>
);
