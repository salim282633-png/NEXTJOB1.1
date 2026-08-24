import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { SAUDI_GUIDE_ARTICLES } from '../lib/data';

interface GeneratedArticleMeta {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  publishedDate: string;
  city?: string | null;
  profession?: string | null;
}

export const SaudiResidentGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedArticleId, setExpandedArticleId] = useState<string>(SAUDI_GUIDE_ARTICLES[0]?.id || '');
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedArticleMeta[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/guide/articles.json', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        if (!cancelled && Array.isArray(data)) setGeneratedArticles(data.slice(0, 12));
      })
      .catch(() => {
        if (!cancelled) setGeneratedArticles([]);
      });
    return () => { cancelled = true; };
  }, []);

  const categories = ['all', 'نقل الخدمات وقوى', 'الإقامة والأنظمة', 'عقود العمل والحقوق', 'نصائح التوظيف والمقابلات'];

  const filteredArticles = selectedCategory === 'all'
    ? SAUDI_GUIDE_ARTICLES
    : SAUDI_GUIDE_ARTICLES.filter(a => a.category === selectedCategory);

  return (
    <section className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>دليل العمل لليمنيين في السعودية</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          دليل البحث عن عمل ونقل الخدمات لليمنيين
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          محتوى إرشادي عملي يساعد الباحث اليمني داخل السعودية على تجهيز ملفه، البحث الآمن عن الوظائف، وفهم الأسئلة التي ينبغي مراجعتها مع صاحب العمل والجهات الرسمية.
        </p>
      </div>

      {generatedArticles.length > 0 && (
        <div className="bg-emerald-950 text-white rounded-3xl p-5 sm:p-7 space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black">أحدث مقالات وظائف اليمنيين في السعودية</h3>
            <p className="text-xs text-emerald-100/80 mt-1">مقالات SEO منشورة بصفحات مستقلة قابلة للفهرسة، ومخصصة لليمنيين فقط حسب المدن والمهن.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generatedArticles.map(article => (
              <a
                key={article.slug}
                href={`/guide/${article.slug}/`}
                className="block bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition-colors"
              >
                <div className="text-[10px] text-emerald-300 mb-1">{article.publishedDate} · {article.keyword}</div>
                <div className="font-bold text-sm leading-relaxed flex items-start gap-2">
                  <span className="flex-1">{article.title}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 mt-1" />
                </div>
                <p className="text-xs text-emerald-50/75 mt-2 line-clamp-2">{article.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            id={`guide-tab-${cat}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'جميع المواضيع' : cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredArticles.map(article => {
          const isExpanded = expandedArticleId === article.id;
          return (
            <div
              key={article.id}
              id={`guide-card-${article.id}`}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all"
            >
              <button
                onClick={() => setExpandedArticleId(isExpanded ? '' : article.id)}
                className="w-full text-right p-5 sm:p-6 flex items-start justify-between gap-4 focus:outline-none"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{article.readTime}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{article.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">{article.summary}</p>
                </div>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 text-slate-700 text-sm leading-relaxed">
                  <div className="space-y-2.5">
                    {article.content.map((p, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                        <p>{p}</p>
                      </div>
                    ))}
                  </div>

                  {article.importantNotes && article.importantNotes.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>تنبيه مهم:</span>
                      </div>
                      {article.importantNotes.map((note, nIdx) => (
                        <p key={nIdx} className="text-xs text-amber-800 font-medium pr-6 leading-relaxed">• {note}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold">تحقق من الإجراءات عبر المصادر الرسمية</h3>
        <p className="text-xs sm:text-sm text-slate-400">
          عند التعامل مع عقد أو نقل خدمات أو إجراء حكومي، ارجع دائمًا إلى المنصة والجهة الرسمية المختصة وتحقق من المعلومات السارية لحالتك.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1"><h4 className="text-sm font-bold text-emerald-400">قوى (Qiwa)</h4><p className="text-xs text-slate-300">خدمات العمل والعقود والمنشآت بحسب الخدمات المتاحة رسميًا.</p></div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1"><h4 className="text-sm font-bold text-emerald-400">أبشر (Absher)</h4><p className="text-xs text-slate-300">الخدمات الحكومية الفردية المتاحة للمستخدم بحسب حالته.</p></div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1"><h4 className="text-sm font-bold text-emerald-400">الجهة الرسمية المختصة</h4><p className="text-xs text-slate-300">تحقق من المصدر الحكومي قبل الاعتماد على أي معلومة نظامية أو إجراء.</p></div>
        </div>
      </div>
    </section>
  );
};
