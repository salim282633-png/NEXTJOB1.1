import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  SearchCheck,
  ShieldCheck
} from 'lucide-react';
import { SAUDI_GUIDE_ARTICLES } from '../lib/data';

interface GeneratedArticleMeta {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  publishedDate: string;
  intent?: string;
  city?: string | null;
  profession?: string | null;
}

const guidanceTopics = [
  { title: 'البحث عن عمل بوعي', text: 'كيف تبحث، تقارن، وتتحقق من الإعلان والمصدر قبل التقديم.', icon: SearchCheck },
  { title: 'السيرة الذاتية', text: 'إرشادات عملية لبناء ملف مهني واضح ومناسب للتقديم.', icon: FileText },
  { title: 'المقابلات والمهارات', text: 'الاستعداد للمقابلات وتطوير المهارات المرتبطة بالمسار المهني.', icon: GraduationCap },
  { title: 'العقود ونقل الخدمات', text: 'أسئلة ونقاط تحقق مع الرجوع إلى قوى والجهات الرسمية المختصة.', icon: BriefcaseBusiness },
  { title: 'أدلة المدن والمهن', text: 'محتوى يساعدك على فهم الخيارات بحسب المدينة أو المجال المهني.', icon: MapPin },
  { title: 'الأمان وتجنب الاحتيال', text: 'علامات تحذيرية لحماية بياناتك ومالك أثناء البحث عن فرصة.', icon: ShieldCheck }
];

function articleLabel(article: GeneratedArticleMeta) {
  if (article.city) return `دليل ${article.city}`;
  if (article.profession) return article.profession;
  const labels: Record<string, string> = {
    'cv-guide': 'السيرة الذاتية',
    'interview-guide': 'المقابلات',
    'safety-guide': 'البحث الآمن',
    'city-guide': 'دليل المدن',
    'skills-guide': 'المهارات',
    'application-guide': 'التقديم',
    'contract-guide': 'العقود',
    'sponsorship-guide': 'نقل الخدمات',
    'application-message': 'رسائل التقديم'
  };
  return labels[article.intent || ''] || 'دليل مهني';
}

export const SaudiResidentGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedArticleId, setExpandedArticleId] = useState<string>(SAUDI_GUIDE_ARTICLES[0]?.id || '');
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedArticleMeta[]>([]);
  const [generatedArticlesLoading, setGeneratedArticlesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setGeneratedArticlesLoading(true);

    fetch('/guide/articles.json', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        if (!cancelled && Array.isArray(data)) setGeneratedArticles(data.slice(0, 18));
      })
      .catch(() => {
        if (!cancelled) setGeneratedArticles([]);
      })
      .finally(() => {
        if (!cancelled) setGeneratedArticlesLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const categories = ['all', 'نقل الخدمات وقوى', 'الإقامة والأنظمة', 'عقود العمل والحقوق', 'نصائح التوظيف والمقابلات'];
  const filteredArticles = selectedCategory === 'all'
    ? SAUDI_GUIDE_ARTICLES
    : SAUDI_GUIDE_ARTICLES.filter(article => article.category === selectedCategory);

  return (
    <main className="bg-slate-50/60">
      <section className="border-b border-emerald-100 bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black text-emerald-800 shadow-sm">
            <BookOpen className="h-4 w-4" />
            مركز NEXT JOB الإرشادي
          </div>
          <h1 className="mt-5 text-3xl font-black leading-[1.4] text-slate-950 sm:text-4xl">
            معلومات عملية تساعدك في خطوتك المهنية القادمة
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-slate-600">
            أدلة ومقالات للباحث اليمني داخل السعودية عن البحث عن عمل، السيرة الذاتية، المقابلات، العقود، نقل الخدمات، المدن والمهن، والأمان أثناء التقديم. عند أي موضوع تنظيمي نوصي بالتحقق من المصدر الرسمي الساري لحالتك.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-xs font-black text-emerald-700">اختر مسارك</span>
          <h2 className="mt-1 text-2xl font-black text-slate-950">موضوعات الدليل</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guidanceTopics.map(topic => {
            const Icon = topic.icon;
            return (
              <article key={topic.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-black text-slate-900">{topic.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{topic.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-[30px] bg-slate-950 p-5 text-white sm:p-8">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-black text-emerald-300">أحدث ما نشرناه</span>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">المقالات والأدلة الحديثة</h2>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-300">نركز على محتوى عملي ومحدد بدل النشر الكثيف، مع بقاء الأرشيف متاحًا للقراءة والفهرسة.</p>
            </div>
            <a href="/guide/" className="inline-flex items-center gap-2 text-xs font-black text-emerald-300">
              عرض الأرشيف <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {generatedArticlesLoading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map(item => <div key={item} className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/10" />)}
            </div>
          ) : generatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {generatedArticles.map(article => (
                <a key={article.slug} href={`/guide/${article.slug}/`} className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                  <div className="flex items-center justify-between gap-2 text-[10px] text-emerald-300">
                    <span>{articleLabel(article)}</span>
                    <span>{article.publishedDate}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-black leading-6">{article.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-300">{article.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-emerald-300">قراءة المقال <ExternalLink className="h-3.5 w-3.5" /></span>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-sm text-slate-300">لا توجد مقالات في الفهرس حاليًا.</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <span className="text-xs font-black text-emerald-700">أدلة أساسية</span>
          <h2 className="mt-1 text-2xl font-black text-slate-950">معلومات مختصرة تحتاجها أثناء العمل والبحث</h2>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {categories.map(category => (
            <button
              key={category}
              id={`guide-tab-${category}`}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                selectedCategory === category
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {category === 'all' ? 'جميع مواضيع الدليل' : category}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredArticles.map(article => {
            const isExpanded = expandedArticleId === article.id;
            return (
              <article key={article.id} id={`guide-card-${article.id}`} className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
                <button onClick={() => setExpandedArticleId(isExpanded ? '' : article.id)} className="flex w-full items-start justify-between gap-4 p-5 text-right sm:p-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">{article.category}</span>
                      <span className="text-xs font-medium text-slate-400">{article.readTime}</span>
                    </div>
                    <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">{article.title}</h3>
                    <p className="line-clamp-1 text-xs text-slate-500 sm:text-sm">{article.summary}</p>
                  </div>
                  <div className="mt-1 shrink-0 rounded-xl bg-slate-100 p-2 text-slate-600">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-slate-100 px-5 pb-6 pt-4 text-sm leading-relaxed text-slate-700 sm:px-6">
                    <div className="space-y-2.5">
                      {article.content.map((paragraph, index) => (
                        <div key={index} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                          <p>{paragraph}</p>
                        </div>
                      ))}
                    </div>
                    {article.importantNotes && article.importantNotes.length > 0 && (
                      <div className="space-y-2 rounded-2xl border border-amber-200/80 bg-amber-50 p-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                          <span>تنبيه مهم:</span>
                        </div>
                        {article.importantNotes.map((note, index) => <p key={index} className="pr-6 text-xs font-medium leading-relaxed text-amber-800">• {note}</p>)}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
          <h2 className="text-lg font-bold">المصدر الرسمي هو المرجع النهائي</h2>
          <p className="mt-3 text-xs leading-6 text-slate-400 sm:text-sm">
            عند التعامل مع عقد أو نقل خدمات أو إجراء حكومي، تحقق من المعلومات السارية عبر المنصة أو الجهة الرسمية المختصة قبل اتخاذ أي إجراء. NEXT JOB يقدم محتوى إرشاديًا عامًا ولا ينفذ هذه الإجراءات نيابة عن المستخدم.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4"><h3 className="text-sm font-bold text-emerald-400">قوى (Qiwa)</h3><p className="mt-1 text-xs leading-5 text-slate-300">خدمات العمل والعقود والمنشآت بحسب الخدمات المتاحة رسميًا.</p></div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4"><h3 className="text-sm font-bold text-emerald-400">وزارة الموارد البشرية</h3><p className="mt-1 text-xs leading-5 text-slate-300">المصدر الحكومي الأساسي للأنظمة والخدمات المرتبطة بسوق العمل.</p></div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4"><h3 className="text-sm font-bold text-emerald-400">الجهة المختصة</h3><p className="mt-1 text-xs leading-5 text-slate-300">راجع الجهة الحكومية المناسبة لكل إجراء أو خدمة بحسب حالتك.</p></div>
          </div>
        </div>
      </section>
    </main>
  );
};
