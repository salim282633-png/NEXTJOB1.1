export type ProductionGoogleStatus = 'READY' | 'NEEDS_PRODUCTION_CONFIGURATION';

export const googleProductionConfig = {
  // Commercial advertising is intentionally disabled while NEXT JOB operates
  // as a professional content hub and external-opportunity directory.
  adsEnabled: false,
  adsenseClient: '',
  gtagId: String(import.meta.env.VITE_GTAG_ID || '').trim(),
  googleCmpEnabled: String(import.meta.env.VITE_GOOGLE_CMP_ENABLED || '').toLowerCase() === 'true',
  searchConsoleEndpoint: String(import.meta.env.VITE_SEARCH_CONSOLE_API_ENDPOINT || '').trim()
};

export const GOOGLE_PRODUCTION_STATUS: ProductionGoogleStatus = 'NEEDS_PRODUCTION_CONFIGURATION';

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

/** Consent Mode v2 defaults run before optional analytics tags. */
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

function addScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function loadConfiguredGoogleScripts() {
  if (typeof window === 'undefined') return;
  ensureGtag();

  // Measurement can remain available under consent mode. No AdSense or other
  // commercial advertising script is loaded in the current compliance mode.
  if (/^G-[A-Z0-9]+$/.test(googleProductionConfig.gtagId)) {
    addScript('nextjob-google-tag', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleProductionConfig.gtagId)}`);
    window.gtag!('js', new Date());
    window.gtag!('config', googleProductionConfig.gtagId, { anonymize_ip: true });
  }
}
