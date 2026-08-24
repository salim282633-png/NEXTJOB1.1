import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeGoogleConsentDefaults, loadConfiguredGoogleScripts } from './lib/googleProduction';

initializeGoogleConsentDefaults();
loadConfiguredGoogleScripts();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode><App /></React.StrictMode>
  );
}
