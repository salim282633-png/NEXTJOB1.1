import React from 'react';
import { Ban, Banknote, BriefcaseBusiness, Building2, Info, MapPin, PlusCircle } from 'lucide-react';

interface SimulatedJob {
  id: string;
  title: string;
  company: string;
  city: string;
  salary: string;
  jobType: string;
  summary: string;
}

interface SimulatedJobsFallbackProps {
  onOpenPostJob: () => void;
}

const SIMULATED_JOBS: SimulatedJob[] = [
  {
    id: 'simulation-cook-riyadh',
    title: 'طباخ أكلات شعبية يمنية',
    company: 'منشأة تجريبية',
    city: 'الرياض',
    salary: 'يحدد لاحقًا',
    jobType: 'دوام كامل',
    summary: 'مثال توضيحي لشكل فرصة عمل في قطاع المطاعم وكيف تظهر معلومات الوظيفة للباحث.'
  },
  {
    id: 'simulation-sales-jeddah',
    title: 'بائع محلات تجزئة',
    company: 'متجر تجريبي',
    city: 'جدة',
    salary: '3,000 – 4,000 ريال',
    jobType: 'دوام كامل',
    summary: 'نموذج غير حقيقي يوضح طريقة عرض الراتب والمدينة ونوع الدوام داخل المنصة.'
  },
  {
    id: 'simulation-driver-dammam',
    title: 'سائق توصيل طلبات',
    company: 'منشأة تجريبية',
    city: 'الدمام',
    salary: 'يحدد لاحقًا',
    jobType: 'دوام كامل',
    summary: 'فرصة محاكاة لشرح شكل بطاقات وظائف التوصيل، ولا تمثل إعلان توظيف قائمًا.'
  },
  {
    id: 'simulation-warehouse-riyadh',
    title: 'أمين مستودع',
    company: 'شركة تجريبية',
    city: 'الرياض',
    salary: '3,500 – 4,500 ريال',
    jobType: 'دوام كامل',
    summary: 'بطاقة توضيحية فقط لعرض تجربة الاستخدام إلى أن تصل وظائف حقيقية إلى المنصة.'
  },
  {
    id: 'simulation-shawarma-jeddah',
    title: 'معلم شاورما',
    company: 'مطعم تجريبي',
    city: 'جدة',
    salary: 'يحدد لاحقًا',
    jobType: 'دوام كامل',
    summary: 'مثال تعليمي غير قابل للتقديم يوضح نوع المعلومات التي يمكن أن يحتويها إعلان المطاعم.'
  },
  {
    id: 'simulation-welder-khobar',
    title: 'فني لحام',
    company: 'ورشة تجريبية',
    city: 'الخبر',
    salary: '4,000 – 5,000 ريال',
    jobType: 'عقد مؤقت',
    summary: 'نموذج محاكاة لفرصة فنية؛ لا يوجد صاحب عمل أو جهة تواصل مرتبطة بهذه البطاقة.'
  }
];

export const SimulatedJobsFallback: React.FC<SimulatedJobsFallbackProps> = ({ onOpenPostJob }) => (
  <div className="space-y-5" data-simulated-jobs="true">
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-black text-amber-950">نماذج فرص توضيحية — ليست وظائف حقيقية</h3>
          <p className="text-xs sm:text-sm text-amber-900/80 mt-1 leading-relaxed">
            لا توجد وظائف حقيقية منشورة حاليًا، لذلك نعرض هذه البطاقات لشرح طريقة استخدام المنصة فقط. لا يمكن التقديم أو التواصل من خلالها، وستختفي تلقائيًا عند نشر أول وظيفة حقيقية.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenPostJob}
        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
      >
        <PlusCircle className="w-4 h-4" />
        أعلن عن وظيفة حقيقية
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" aria-label="نماذج وظائف غير حقيقية">
      {SIMULATED_JOBS.map(job => (
        <article key={job.id} className="bg-white rounded-2xl border border-dashed border-slate-300 p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[300px] opacity-95">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
                <Ban className="w-3.5 h-3.5" />
                وظيفة تجريبية — غير متاحة للتقديم
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2">{job.title}</h3>
            <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-medium mb-4">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{job.company}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold"><MapPin className="w-3.5 h-3.5 text-emerald-600" />{job.city}</div>
              <div className="flex items-center gap-1.5 font-bold"><Banknote className="w-3.5 h-3.5 text-emerald-600" /><span className="truncate">{job.salary}</span></div>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg mb-3">
              <BriefcaseBusiness className="w-3 h-3" />{job.jobType}
            </span>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{job.summary}</p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="هذه وظيفة محاكاة وغير متاحة للتقديم"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed"
            >
              <Ban className="w-4 h-4" />
              التقديم والتواصل غير متاحين — محاكاة
            </button>
          </div>
        </article>
      ))}
    </div>
  </div>
);
