import React, { useState } from 'react';
import { BookOpen, ShieldCheck, FileText, Sparkles, Building2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SAUDI_GUIDE_ARTICLES } from '../lib/data';

export const SaudiResidentGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedArticleId, setExpandedArticleId] = useState<string>(SAUDI_GUIDE_ARTICLES[0].id);

  const categories = ['all', 'نقل الخدمات وقوى', 'الإقامة والأنظمة', 'عقود العمل والحقوق', 'نصائح التوظيف والمقابلات'];

  const filteredArticles = selectedCategory === 'all'
    ? SAUDI_GUIDE_ARTICLES
    : SAUDI_GUIDE_ARTICLES.filter(a => a.category === selectedCategory);

  return (
    <section className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>الدليل الشامل للعمل والأنظمة في السعودية</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          دليل وأنظمة العمل والإقامة ونقل الخدمات لليمنيين
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          معلومات قانونية وعملية موثوقة لمساعدتك على فهم حقوقك، خطوات نقل الكفالة عبر منصة قوى، وتوثيق العقود الرسمية.
        </p>
      </div>

      {/* Category Tabs */}
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

      {/* Articles List */}
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
                    <span className="text-xs text-slate-400 font-medium">
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-1">
                    {article.summary}
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Collapsible Content */}
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
                        <span>ملاحظة هامة ومفصلية:</span>
                      </div>
                      {article.importantNotes.map((note, nIdx) => (
                        <p key={nIdx} className="text-xs text-amber-800 font-medium pr-6 leading-relaxed">
                          • {note}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Official Government Portals Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold">المنصات الرسمية الحكومية المعتمدة</h3>
        <p className="text-xs sm:text-sm text-slate-400">
          تأكد دائماً من إتمام جميع إجراءاتك العمالية والرسمية عبر البوابات المعتمدة من وزارة الموارد البشرية والتنمية الاجتماعية بالمملكة.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
            <h4 className="text-sm font-bold text-emerald-400">منصة قوى (Qiwa)</h4>
            <p className="text-xs text-slate-300">توثيق عقود العمل، نقل الخدمات، وإدارة رخص العمل للمنشآت.</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
            <h4 className="text-sm font-bold text-emerald-400">منصة أبشر (Absher)</h4>
            <p className="text-xs text-slate-300">الخدمات الفردية، تجديد الإقامة، رخص القيادة، وتحديث الجوال.</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
            <h4 className="text-sm font-bold text-emerald-400">منصة مساند (Musaned)</h4>
            <p className="text-xs text-slate-300">توثيق عقود ونقل خدمات العمالة المنزلية والمهن الفردية.</p>
          </div>
        </div>
      </div>

    </section>
  );
};
