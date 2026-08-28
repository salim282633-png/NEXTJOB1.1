import React, { useEffect, useState } from 'react';
import { Cookie, Settings, ShieldCheck } from 'lucide-react';

interface CookieConsentBannerProps { onOpenPrivacyModal: () => void; }

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
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}

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

const buildConsent = (analytics: boolean): GoogleConsentState => ({
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: analytics ? 'granted' : 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  timestamp: new Date().toISOString()
});

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacyModal }) => {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const reopen = () => { setVisible(true); setPreferences(true); };
    window.addEventListener('reopen_cookie_consent', reopen);
    const raw = localStorage.getItem('nj_google_cmp_consent');
    if (!raw) {
      const timer = window.setTimeout(() => setVisible(true), 500);
      return () => { window.clearTimeout(timer); window.removeEventListener('reopen_cookie_consent', reopen); };
    }
    try {
      const saved = JSON.parse(raw) as GoogleConsentState;
      setAnalytics(saved.analytics_storage === 'granted');
      updateGoogleConsentMode({ ...saved, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    } catch {
      setVisible(true);
    }
    return () => window.removeEventListener('reopen_cookie_consent', reopen);
  }, []);

  const save = (analyticsValue: boolean) => {
    const consent = buildConsent(analyticsValue);
    localStorage.setItem('nj_google_cmp_consent', JSON.stringify(consent));
    updateGoogleConsentMode(consent);
    setVisible(false);
    setPreferences(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 text-white shadow-2xl" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl"><Cookie className="w-5 h-5" /></div>
            <div className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              <p className="font-bold text-white">تفضيلات الخصوصية وملفات تعريف الارتباط</p>
              <p className="mt-1">نستخدم التخزين الضروري لتشغيل الموقع وحفظ تفضيلاتك. ويمكنك اختيار السماح بقياس الاستخدام للمساعدة في تحسين التجربة. <button onClick={onOpenPrivacyModal} className="text-emerald-400 font-bold hover:underline">سياسة الخصوصية</button></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button onClick={() => setPreferences(v=>!v)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"><Settings className="w-3.5 h-3.5" />تخصيص</button>
            <button onClick={() => save(false)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold">الضرورية فقط</button>
            <button onClick={() => save(true)} className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold">السماح بالقياس</button>
          </div>
        </div>

        {preferences && <div className="grid sm:grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex justify-between"><div><strong>الأمان والوظائف الأساسية</strong><p className="text-[10px] text-slate-400 mt-1">التفضيلات الأساسية وتشغيل الموقع بأمان</p></div><span className="text-emerald-400 font-bold">دائم</span></div>
          <label className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex justify-between gap-3"><div><strong>القياس</strong><p className="text-[10px] text-slate-400 mt-1">بيانات استخدام مجمعة لتحسين التجربة</p></div><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} /></label>
          <div className="sm:col-span-2 flex justify-end"><button onClick={()=>save(analytics)} className="px-5 py-2 bg-emerald-600 rounded-xl font-bold flex gap-1"><ShieldCheck className="w-4 h-4" />حفظ التفضيلات</button></div>
        </div>}
      </div>
    </div>
  );
};
