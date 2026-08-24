export type ProductionGoogleStatus = 'READY' | 'NEEDS_PRODUCTION_CONFIGURATION';

export const googleProductionConfig = {
  adsEnabled: String(import.meta.env.VITE_ADS_ENABLED || '').toLowerCase() === 'true',
  adsenseClient: String(import.meta.env.VITE_ADSENSE_CLIENT || '').trim(),
  gtagId: String(import.meta.env.VITE_GTAG_ID || '').trim(),
  googleCmpEnabled: String(import.meta.env.VITE_GOOGLE_CMP_ENABLED || '').toLowerCase() === 'true',
  searchConsoleEndpoint: String(import.meta.env.VITE_SEARCH_CONSOLE_API_ENDPOINT || '').trim()
};

export const GOOGLE_PRODUCTION_STATUS: ProductionGoogleStatus =
  googleProductionConfig.adsEnabled &&
  /^ca-pub-\d+$/.test(googleProductionConfig.adsenseClient) &&
  /^G-[A-Z0-9]+$/.test(googleProductionConfig.gtagId) &&
  googleProductionConfig.googleCmpEnabled
    ? 'READY'
    : 'NEEDS_PRODUCTION_CONFIGURATION';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[];
  }
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function (...args: unknown[]) { window.dataLayer!.push(args); };
}

/** Consent Mode v2 defaults must run before Google measurement/ad tags. */
export function initializeGoogleConsentDefaults() {
  if (typeof window === 'undefined') return;
  ensureGtag();
  window.gtag!('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
}

function addScript(id: string, src: string, attrs: Record<string, string> = {}) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.appendChild(script);
}

export function loadConfiguredGoogleScripts() {
  if (typeof window === 'undefined') return;
  ensureGtag();

  // Analytics can load under Consent Mode defaults when a real Measurement ID
  // exists. Storage remains denied until the user updates consent.
  if (/^G-[A-Z0-9]+$/.test(googleProductionConfig.gtagId)) {
    addScript('nextjob-google-tag', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleProductionConfig.gtagId)}`);
    window.gtag!('js', new Date());
    window.gtag!('config', googleProductionConfig.gtagId, { anonymize_ip: true });
  }

  // Do not load AdSense merely because a ca-pub value exists. The whole
  // production configuration, including CMP readiness, must be explicitly READY.
  if (GOOGLE_PRODUCTION_STATUS === 'READY') {
    addScript(
      'nextjob-adsense',
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(googleProductionConfig.adsenseClient)}`,
      { crossorigin: 'anonymous' }
    );
  }
}
