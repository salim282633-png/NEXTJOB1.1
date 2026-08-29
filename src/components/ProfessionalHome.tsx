import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  SearchCheck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Job } from '../types';

interface GeneratedArticleMeta {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  publishedDate: string;
}

interface ProfessionalHomeProps {
  jobs: Job[];
  onNavigate: (tab: 'home' | 'jobs' | 'guide' | 'saved') => void;
}

// Temporary visibility switch. Set to true when دليل الفرص is ready to return.
const SHOW_OPPORTUNITIES = false;

const topics = [
  { title: 'البحث عن عمل', text: 'خطوات البحث والتقديم وتقييم الفرص والوصول إلى المصدر الأصلي.', icon: SearchCheck, href: '/guide/job-search/' },
  { title: 'السيرة الذاتية', text: 'إرشادات لعرض الخبرات وبناء ملف مهني واضح ومقنع.', icon: GraduationCap, href: '/guide/cv/' },
  { title: 'المقابلات', text: 'الاستعداد للمقابلات والأسئلة وعرض الخبرات بصورة مهنية.', icon: Sparkles, href: '/guide/interviews/' },
  { title: 'العقود', text: 'ما ينبغي مراجعته قبل توقيع عقد عمل والرجوع للمصدر الرسمي.', icon: Building2, href: '/guide/contracts/' },
  { title: 'نقل الخدمات', text: 'أسئلة وإجراءات تحتاج للتحقق عبر قوى والجهات الرسمية المختصة.', icon: BriefcaseBusiness, href: '/guide/sponsorship/' },
  { title: 'الأمان وتجنب الاحتيال', text: 'علامات التحذير وحماية البيانات وتجنب الوعود الوهمية.', icon: ShieldCheck, href: '/guide/safety/' },
  { title: 'أدلة المدن', text: 'محتوى يساعد الباحث اليمني على فهم البحث حسب مدن السعودية.', icon: MapPin, href: '/guide/cities/' },
  { title: 'المهن والقطاعات', text: 'أدلة حسب المهنة والقطاع والمهارات والمسارات المهنية.', icon: BriefcaseBusiness, href: '/guide/professions/' }
];

export const ProfessionalHome: React.FC<ProfessionalHomeProps> = ({ jobs, onNavigate }) => {
  const [articles, setArticles] = useState<GeneratedArticleMeta[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/guide/articles.json', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        if (!cancelled && Array.isArray(data)) setArticles(data.slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      });
    return () => { cancelled = true; };
  }, []);

  const latestJobs = jobs.slice(0, 6);

  return (
    <main className="bg-[#f8f7f3]">
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#f3f8f5] via-[#fbfaf7] to-[#f8f7f3] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(20,113,84,0.09),transparent_28rem)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/90 px-4 py-2 text-xs font-black text-emerald-800">
            <BookOpen className="h-4 w-4" />
            مدونة إرشادية للعمل والمسار المهني
          </div>
          <h1 className="mt-5 text-3xl font-black leading-[1.35] text-slate-950 sm:text-5xl font-display">
            دليلك للعمل والمسار المهني
            <span className="block text-emerald-700">لليمنيين في السعودية</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
            NEXT JOB مدونة إرشادية مستقلة تقدم مقالات وأدلة عملية للباحث اليمني داخل السعودية حول البحث عن عمل، السيرة الذاتية، المقابلات، العقود، نقل الخدمات، والأمان المهني.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/guide/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white shadow-[0_8px_22px_rgba(20,113,84,0.14)] transition hover:-translate-y-0.5 hover:bg-emerald-800">
              تصفح المدونة <ArrowLeft className="h-4 w-4" />
            </a>
            {SHOW_OPPORTUNITIES && (
              <button onClick={() => onNavigate('jobs')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 hover:border-emerald-300 hover:text-emerald-800">
                تصفح فرصًا من مصادرها <BriefcaseBusiness className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 font-bold">مقالات عملية ومباشرة</div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 font-bold">مصادر رسمية عند الحاجة</div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 font-bold">لا وعود ولا وساطة توظيف</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black text-emerald-700">أقسام المدونة</span>
            <h2 className="mt-1 text-2xl font-black text-slate-950">ابدأ بالموضوع الذي تحتاجه</h2>
          </div>
          <a href="/guide/" className="hidden items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 transition hover:bg-emerald-100 sm:inline-flex">تصفح المدونة <ArrowLeft className="h-4 w-4" /></a>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map(topic => {
            const Icon = topic.icon;
            return (
              <a key={topic.title} href={topic.href} className="group rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-[0_5px_18px_rgba(15,23,42,0.025)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_26px_rgba(20,71,54,0.06)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100"><Icon className="h-[18px] w-[18px]" /></div>
                <h3 className="font-black text-slate-900">{topic.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{topic.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">استكشف القسم <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" /></span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-7">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-black text-emerald-700">من المدونة</span>
              <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">أحدث المقالات</h2>
            </div>
            <a href="/guide/" className="inline-flex items-center gap-2 text-xs font-black text-emerald-700">عرض جميع المقالات <ExternalLink className="h-4 w-4" /></a>
          </div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(article => (
                <a key={article.slug} href={`/guide/${article.slug}/`} className="group rounded-2xl border border-slate-200 bg-[#fcfcfa] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:shadow-[0_9px_24px_rgba(20,71,54,0.05)]">
                  <div className="text-[10px] font-semibold text-emerald-700">{article.publishedDate} · {article.keyword}</div>
                  <h3 className="mt-2 line-clamp-2 text-sm font-black leading-6 text-slate-900 transition group-hover:text-emerald-800">{article.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">{article.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">قراءة المقال <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" /></span>
                </a>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-[#fcfcfa] p-4 text-sm text-slate-500">ستظهر أحدث المقالات هنا عند نشر محتوى جديد في المدونة.</p>
          )}
        </div>
      </section>

      {SHOW_OPPORTUNITIES && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black text-emerald-700">دليل الفرص</span>
              <h2 className="mt-1 text-2xl font-black text-slate-950">فرص منشورة لدى مصادر خارجية</h2>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-500">هذا القسم مكمل للمحتوى الإرشادي: نعرض المعلومات الأساسية والمصدر، ثم نوجهك إلى الموقع الأصلي للتفاصيل والتقديم.</p>
            </div>
            <button onClick={() => onNavigate('jobs')} className="hidden text-xs font-black text-emerald-700 sm:inline-flex items-center gap-1">كل الفرص <ArrowLeft className="h-4 w-4" /></button>
          </div>

          {latestJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {latestJobs.map(job => (
                <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black leading-6 text-slate-950">{job.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{job.company} · {job.city}</p>
                    </div>
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-[11px] text-slate-600">
                    المصدر: <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-black text-emerald-700 hover:underline">{job.sourceName}</a>
                  </div>
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white hover:bg-emerald-700">
                    الانتقال للمصدر للتقديم <ExternalLink className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-400" />
              <h3 className="mt-3 font-black text-slate-900">لا توجد فرص خارجية موثقة معروضة حاليًا</h3>
              <p className="mt-2 text-xs leading-6 text-slate-500">لن نعرض فرصة قبل توفر مصدر أصلي ورابط تقديم واضح يمكن التحقق منه.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
};
