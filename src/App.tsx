import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index';
import UnsupportedEnvironmentPage from './pages/UnsupportedEnvironmentPage';
import {
  evaluateEnvironment,
  getEnvironmentGuardBypass,
  setEnvironmentGuardBypass,
  type EnvironmentCheckResult
} from './platform/environmentGuard';

export default function App() {
  const [environment, setEnvironment] = useState<EnvironmentCheckResult>(() => evaluateEnvironment());
  const [environmentGuardBypassed, setEnvironmentGuardBypassed] = useState<boolean>(() => getEnvironmentGuardBypass());
  const isEnvironmentGuardActive = !environmentGuardBypassed && !environment.supported;

  useEffect(() => {
    let resizeTimer: number | null = null;

    const syncEnvironment = () => {
      setEnvironment(evaluateEnvironment());
    };

    const handleResize = () => {
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(() => {
        syncEnvironment();
        resizeTimer = null;
      }, 100);
    };

    syncEnvironment();
    window.addEventListener('resize', handleResize);

    return () => {
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    if (isEnvironmentGuardActive) {
      html.classList.add('environment-guard-active');
      body.classList.add('environment-guard-active');
    } else {
      html.classList.remove('environment-guard-active');
      body.classList.remove('environment-guard-active');
    }

    return () => {
      html.classList.remove('environment-guard-active');
      body.classList.remove('environment-guard-active');
    };
  }, [isEnvironmentGuardActive]);

  if (isEnvironmentGuardActive) {
    return (
      <UnsupportedEnvironmentPage
        issues={environment.issues}
        onRetry={() => setEnvironment(evaluateEnvironment())}
        onContinue={() => {
          setEnvironmentGuardBypass(true);
          setEnvironmentGuardBypassed(true);
        }}
      />
    );
  }

  return <RouterProvider router={router} />;
}
