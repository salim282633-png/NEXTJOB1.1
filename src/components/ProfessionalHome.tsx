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
    <main className="bg-slate-50/60">
      <section className="relative overflow-hidden border-b border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30rem)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black text-emerald-800 shadow-sm">
            <BookOpen className="h-4 w-4" />
            مركز إرشادي للعمل والمسار المهني
          </div>
          <h1 className="mt-5 text-3xl font-black leading-[1.35] text-slate-950 sm:text-5xl font-display">
            دليلك للعمل والمسار المهني
            <span className="block text-emerald-700">لليمنيين في السعودية</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
            NEXT JOB مركز إرشادي مستقل يقدم مقالات وأدلة عملية للباحث اليمني داخل السعودية، مع روابط فرص منشورة لدى مصادر خارجية موثوقة. لا نتوسط في التوظيف، والتقديم يتم مباشرة لدى المصدر الأصلي.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/guide/" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
              ابدأ من الدليل المهني <ArrowLeft className="h-4 w-4" />
            </a>
            <button onClick={() => onNavigate('jobs')} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-800 hover:border-emerald-300 hover:text-emerald-800">
              تصفح فرصًا من مصادرها <BriefcaseBusiness className="h-4 w-4" />
            </button>
          </div>
          <div className="mx-auto mt-7 grid max-w-3xl grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold">محتوى إرشادي عملي</div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold">مصادر رسمية عند الحاجة</div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold">لا وعود ولا وساطة توظيف</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black text-emerald-700">مركز المعرفة</span>
            <h2 className="mt-1 text-2xl font-black text-slate-950">ابدأ بالموضوع الذي تحتاجه</h2>
          </div>
          <a href="/guide/" className="hidden text-xs font-black text-emerald-700 sm:inline-flex items-center gap-1">كل الأدلة <ArrowLeft className="h-4 w-4" /></a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map(topic => {
            const Icon = topic.icon;
            return (
              <a key={topic.title} href={topic.href} className="rounded-3xl border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></div>
                <h3 className="font-black text-slate-900">{topic.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{topic.text}</p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] bg-slate-950 p-5 text-white sm:p-8">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-black text-emerald-300">أحدث المحتوى</span>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">مقالات وأدلة مهنية</h2>
            </div>
            <a href="/guide/" className="inline-flex items-center gap-2 text-xs font-black text-emerald-300">عرض الأرشيف <ExternalLink className="h-4 w-4" /></a>
          </div>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(article => (
                <a key={article.slug} href={`/guide/${article.slug}/`} className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                  <div className="text-[10px] text-emerald-300">{article.publishedDate} · {article.keyword}</div>
                  <h3 className="mt-2 text-sm font-black leading-6">{article.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-300">{article.description}</p>
                </a>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-300">سيظهر أحدث المحتوى المهني هنا عند نشره في الدليل.</p>
          )}
        </div>
      </section>

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
    </main>
  );
};