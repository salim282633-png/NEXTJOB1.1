import React from 'react';
import { BookOpen, Briefcase, Calculator, FileLock2, Settings, ShieldCheck } from 'lucide-react';
import type { PublicTab } from './Navbar';

interface FooterProps {
  onNavigate: (tab: PublicTab) => void;
  onOpenWageCalc?: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenWageCalc, onOpenPrivacy }) => {
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
              دليل مهني عربي يقدم محتوى أصليًا ويفهرس فرصًا وظيفية منشورة لدى مصادر خارجية موثوقة، مع إحالة المستخدم إلى المصدر الأصلي للتفاصيل والتقديم.
            </p>
            <div className="flex items-start gap-2 text-xs text-emerald-400 font-semibold pt-1 leading-relaxed">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>لا نستقبل طلبات التوظيف نيابة عن أصحاب العمل، ولا نختار المرشحين، ولا ننفذ الاستقدام أو الإسناد أو نقل الخدمات.</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">أقسام NEXT JOB</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">الرئيسية</button></li>
              <li><button onClick={() => onNavigate('jobs')} className="hover:text-emerald-400 transition-colors">فرص وظيفية</button></li>
              <li><button onClick={() => onNavigate('guide')} className="hover:text-emerald-400 transition-colors">الدليل المهني</button></li>
              <li><button onClick={() => onNavigate('saved')} className="hover:text-emerald-400 transition-colors">الفرص المحفوظة</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">المحتوى والأدوات</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="/guide/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-emerald-500" /><span>أرشيف المقالات والأدلة</span></a></li>
              {onOpenWageCalc && <li><button onClick={onOpenWageCalc} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5 text-emerald-500" /><span>حاسبة دخل استرشادية</span></button></li>}
              <li className="text-[11px] text-slate-500 leading-relaxed pt-2">خدمات إعداد أو بيع السير الذاتية والإعلانات التجارية المدفوعة متوقفة حاليًا.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">الخصوصية والامتثال</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              {onOpenPrivacy && <li><button onClick={onOpenPrivacy} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><FileLock2 className="w-3.5 h-3.5 text-sky-400" /><span>الخصوصية وشروط الاستخدام</span></button></li>}
              <li><a href="/compliance/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /><span>سياسة الامتثال والمصادر</span></a></li>
              <li><a href="/admin/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-slate-400" /><span>دخول الإدارة</span></a></li>
              <li className="text-[11px] text-amber-400/90 pt-2 leading-relaxed font-semibold">تحقق من الجهة الناشرة قبل التقديم، ولا تدفع أي مبلغ مقابل وعد بالحصول على وظيفة.</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NEXT JOB — دليل مهني وفهرس فرص من مصادرها الأصلية.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-400 text-[11px]">
            <span>ليست جهة حكومية</span><span>•</span><span>ليست مكتب توظيف أو استقدام أو إسناد عمالي</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
