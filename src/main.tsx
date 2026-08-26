import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AdminPage } from './components/AdminPage';
import './index.css';
import { initializeGoogleConsentDefaults, loadConfiguredGoogleScripts } from './lib/googleProduction';
import { installFirestoreContentBridge } from './lib/firestoreContentBridge';

initializeGoogleConsentDefaults();
loadConfiguredGoogleScripts();
installFirestoreContentBridge();

const rootElement = document.getElementById('root');
if (rootElement) {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const RootComponent = normalizedPath === '/admin' ? AdminPage : App;

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode><RootComponent /></React.StrictMode>
  );
}
