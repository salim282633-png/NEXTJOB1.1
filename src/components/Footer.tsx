import React from 'react';
import {
  Briefcase,
  ShieldCheck,
  Calculator,
  FileText,
  Share2,
  ShieldAlert,
  FileLock2,
  Settings
} from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'jobs' | 'candidates' | 'guide' | 'saved') => void;
  onOpenWageCalc?: () => void;
  onOpenCVGen?: () => void;
  onOpenCommunityJob?: () => void;
  onOpenReportFraud?: () => void;
  onOpenPrivacy?: () => void;
  onOpenAdminSEO?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenWageCalc,
  onOpenCVGen,
  onOpenCommunityJob,
  onOpenReportFraud,
  onOpenPrivacy,
  onOpenAdminSEO
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-10 border-t border-slate-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold"><Briefcase className="w-5 h-5" /></div>
              <span className="text-xl font-black text-white">NEXT<span className="text-emerald-400">JOB</span></span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              NEXT JOB منصة تقنية مستقلة لعرض إعلانات الفرص المهنية والملفات المهنية التي ينشرها المستخدمون، مع تواصل مباشر بين الأطراف دون عمولة من المنصة على التوظيف.
            </p>
            <div className="flex items-start gap-2 text-xs text-emerald-400 font-semibold pt-1 leading-relaxed">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>المنصة لا تنفذ الاستقدام أو الإسناد العمالي أو نقل الخدمات أو العقود نيابة عن الأطراف.</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">أقسام المنصة</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><button onClick={() => onNavigate('jobs')} className="hover:text-emerald-400 transition-colors">إعلانات الفرص المهنية</button></li>
              <li><button onClick={() => onNavigate('candidates')} className="hover:text-emerald-400 transition-colors">دليل الملفات المهنية</button></li>
              <li><button onClick={() => onNavigate('guide')} className="hover:text-emerald-400 transition-colors">دليل العمل والمصادر الرسمية</button></li>
              <li><button onClick={() => onNavigate('saved')} className="hover:text-emerald-400 transition-colors">الإعلانات المحفوظة</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">أدوات وخدمات</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              {onOpenCVGen && <li><button onClick={onOpenCVGen} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-emerald-500" /><span>صانع السيرة الذاتية</span></button></li>}
              {onOpenWageCalc && <li><button onClick={onOpenWageCalc} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5 text-emerald-500" /><span>حاسبة صافي الدخل والادخار</span></button></li>}
              {onOpenCommunityJob && <li><button onClick={onOpenCommunityJob} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-teal-400" /><span>شارك فرصة رأيتها للمراجعة</span></button></li>}
              {onOpenAdminSEO && <li><button onClick={onOpenAdminSEO} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-slate-400" /><span>لوحة الإدارة</span></button></li>}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">الأمان والامتثال</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              {onOpenPrivacy && <li><button onClick={onOpenPrivacy} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><FileLock2 className="w-3.5 h-3.5 text-sky-400" /><span>الخصوصية وشروط الاستخدام</span></button></li>}
              <li><a href="/compliance/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /><span>سياسة الامتثال ونشر الإعلانات</span></a></li>
              <li>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).googlefc?.callbackQueue?.push) {
                      (window as any).googlefc.callbackQueue.push({
                        CONSENT_DATA_READY: () => (window as any).googlefc.showRevocationMessage()
                      });
                    } else {
                      window.dispatchEvent(new CustomEvent('reopen_cookie_consent'));
                    }
                  }}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-slate-400"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" /><span>إعدادات الخصوصية والكوكيز</span>
                </button>
              </li>
              {onOpenReportFraud && <li><button onClick={onOpenReportFraud} className="hover:text-rose-400 transition-colors flex items-center gap-1.5 text-rose-300"><ShieldAlert className="w-3.5 h-3.5 text-rose-400" /><span>إبلاغ عن احتيال أو طلب رسوم</span></button></li>}
              <li className="text-[11px] text-amber-400/90 pt-2 leading-relaxed font-semibold">لا تدفع أي مبلغ مقابل وعد بالحصول على وظيفة، ولا تشارك رموز التحقق أو بيانات الدخول الحكومية.</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NEXT JOB — منصة تقنية مستقلة لعرض الإعلانات المهنية والتواصل المباشر.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-400 text-[11px]">
            <span>ليست جهة حكومية</span><span>•</span><span>ليست مكتب استقدام أو شركة توظيف أو إسناد عمالي</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
