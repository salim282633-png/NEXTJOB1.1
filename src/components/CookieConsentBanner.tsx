import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, Shield, Lock } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacyModal: () => void;
}

export interface GoogleConsentState {
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  functionality_storage: 'granted';
  security_storage: 'granted';
  timestamp: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Updates Google Consent Mode v2 via window.gtag if present
 */
export function updateGoogleConsentMode(consent: GoogleConsentState) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      ad_storage: consent.ad_storage,
      ad_user_data: consent.ad_user_data,
      ad_personalization: consent.ad_personalization,
      analytics_storage: consent.analytics_storage,
      functionality_storage: consent.functionality_storage,
      security_storage: consent.security_storage
    });
  }
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacyModal }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);
  const [adsConsent, setAdsConsent] = useState<boolean>(true);

  useEffect(() => {
    // Listen for custom open event
    const handleReopen = () => {
      setIsVisible(true);
      setShowPreferences(true);
    };

    window.addEventListener('reopen_cookie_consent', handleReopen);

    const savedConsent = localStorage.getItem('nj_google_cmp_consent');
    if (!savedConsent) {
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('reopen_cookie_consent', handleReopen);
      };
    } else {
      try {
        const parsed: GoogleConsentState = JSON.parse(savedConsent);
        updateGoogleConsentMode(parsed);
      } catch (e) {
        console.error(e);
      }
    }

    return () => window.removeEventListener('reopen_cookie_consent', handleReopen);
  }, []);

  const handleAcceptAll = () => {
    const consent: GoogleConsentState = {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted',
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('nj_google_cmp_consent', JSON.stringify(consent));
    updateGoogleConsentMode(consent);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptEssential = () => {
    const consent: GoogleConsentState = {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('nj_google_cmp_consent', JSON.stringify(consent));
    updateGoogleConsentMode(consent);
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSaveCustom = () => {
    const consent: GoogleConsentState = {
      ad_storage: adsConsent ? 'granted' : 'denied',
      ad_user_data: adsConsent ? 'granted' : 'denied',
      ad_personalization: adsConsent ? 'granted' : 'denied',
      analytics_storage: analyticsConsent ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('nj_google_cmp_consent', JSON.stringify(consent));
    updateGoogleConsentMode(consent);
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      id="google-cmp-consent-banner" 
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 text-white shadow-2xl animate-in slide-in-from-bottom duration-300"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-300 leading-relaxed">
            <p className="font-bold text-white mb-0.5">إدارة الخصوصية وملفات تعريف الارتباط:</p>
            <p>
              نستخدم ملفات تعريف الارتباط المعتمدة من Google لتحسين أمان المنصة، قياس الأداء المجمع (Zero-PII)، وعرض إعلانات غير مضللة لتغطية تكاليف التشغيل وإبقاء المنصة مجانية 100% للباحثين عن عمل.{' '}
              <button
                type="button"
                onClick={onOpenPrivacyModal}
                className="text-emerald-400 hover:underline font-bold"
              >
                سياسة الخصوصية واستخدام البيانات
              </button>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
          <button
            id="btn-cmp-customize"
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
          >
            تخصيص الخيارات
          </button>
          <button
            id="btn-cmp-essential-only"
            type="button"
            onClick={handleAcceptEssential}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
          >
            الضرورية فقط
          </button>
          <button
            id="btn-cmp-accept-all"
            type="button"
            onClick={handleAcceptAll}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            الموافقة على الكل
          </button>
        </div>
      </div>

      {/* Custom preferences modal / panel */}
      {showPreferences && (
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Mandatory Security & Functionality */}
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">الأمان والوظائف الأساسية</span>
              <span className="text-[11px] text-slate-400">حماية من الاحتيال وتخزين الجلسة (إلزامي)</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              دائم
            </span>
          </div>

          {/* Performance & Analytics */}
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">إحصاءات الأداء (Analytics Storage)</span>
              <span className="text-[11px] text-slate-400">قياس سرعة التصفح وطلبات الوظائف (Zero-PII)</span>
            </div>
            <input
              type="checkbox"
              checked={analyticsConsent}
              onChange={(e) => setAnalyticsConsent(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* Ad Personalization */}
          <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">تخصيص الإعلانات (Ad Storage)</span>
              <span className="text-[11px] text-slate-400">إعلانات ملائمة عبر شبكة Google AdSense</span>
            </div>
            <input
              type="checkbox"
              checked={adsConsent}
              onChange={(e) => setAdsConsent(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              يمكنك تعديل هذه الخيارات في أي وقت من خلال رابط "إعدادات ملفات تعريف الارتباط" في أسفل الموقع.
            </span>
            <button
              id="btn-cmp-save-custom"
              type="button"
              onClick={handleSaveCustom}
              className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
            >
              حفظ التفضيلات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
