import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { initializeGoogleConsentDefaults, loadConfiguredGoogleScripts } from './lib/googleProduction';

const App = lazy(() => import('./App'));
const AdminPage = lazy(() => import('./components/AdminPage').then(module => ({ default: module.AdminPage })));

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';

initializeGoogleConsentDefaults();

function scheduleNonCriticalGoogleScripts() {
  if (normalizedPath === '/admin') return;
  const load = () => loadConfiguredGoogleScripts();
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(load, { timeout: 3000 });
  } else {
    window.setTimeout(load, 1200);
  }
}

if (document.readyState === 'complete') {
  scheduleNonCriticalGoogleScripts();
} else {
  window.addEventListener('load', scheduleNonCriticalGoogleScripts, { once: true });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const RootComponent = normalizedPath === '/admin' ? AdminPage : App;

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Suspense fallback={<div className="min-h-screen bg-slate-50" aria-busy="true" aria-label="جارٍ تحميل الواجهة" />}>
        <RootComponent />
      </Suspense>
    </React.StrictMode>
  );
}
