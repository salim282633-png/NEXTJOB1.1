import React from 'react';
import { CheckCircle2, ExternalLink, MapPin, Search, ShieldCheck, X } from 'lucide-react';
import { SAUDI_CITIES, JOB_CATEGORIES } from '../lib/data';
import { JobFilter } from '../types';

interface HeroSectionProps {
  filter: JobFilter;
  setFilter: React.Dispatch<React.SetStateAction<JobFilter>>;
  totalJobs: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ filter, setFilter, totalJobs }) => {
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => setFilter(prev => ({ ...prev, keyword: e.target.value }));
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => setFilter(prev => ({ ...prev, city: e.target.value }));
  const handleCategoryClick = (catId: string) => setFilter(prev => ({ ...prev, category: catId }));
  const toggleSponsorship = () => setFilter(prev => ({ ...prev, sponsorshipOnly: !prev.sponsorshipOnly }));
  const toggleAccommodation = () => setFilter(prev => ({ ...prev, withAccommodation: !prev.withAccommodation }));
  const clearFilters = () => setFilter({ keyword: '', category: 'all', city: '', sponsorshipOnly: false, withAccommodation: false, withTransportation: false, jobType: '', salaryRange: '' });
  const hasActiveFilters = filter.keyword || filter.city || filter.category !== 'all' || filter.sponsorshipOnly || filter.withAccommodation;

  return (
    <section className="relative overflow-hidden border-b border-emerald-100/80 bg-gradient-to-b from-emerald-50 via-white to-slate-50 px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30rem)] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>فهرس فرص وظيفية من مصادر خارجية موثوقة</span>
          </div>
          <h1 className="mt-4 text-[30px] sm:text-4xl md:text-[46px] font-black text-slate-950 leading-[1.3] font-display">
            ابحث عن الفرصة المناسبة
            <span className="block mt-1 text-emerald-700">ثم قدّم عبر المصدر الأصلي</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-7 sm:leading-8">
            NEXT JOB لا يستقبل طلبات التوظيف داخل المنصة. نعرض ملخصًا ومصدر الإعلان ورابط التقديم الأصلي لتتمكن من التحقق والتقديم لدى الجهة الناشرة.
          </p>
        </div>

        <div className="mt-7 sm:mt-8 max-w-5xl mx-auto rounded-[26px] border border-slate-200/80 bg-white p-3 sm:p-4 shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 sm:grid-cols-10 gap-2.5 sm:gap-3">
            <div className="sm:col-span-6 relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400"><Search className="w-5 h-5" /></div>
              <input id="search-job-input" type="text" value={filter.keyword} onChange={handleKeywordChange} placeholder="ابحث بالمهنة أو الكلمة المفتاحية" className="ui-control w-full pl-4 pr-11 py-3.5 bg-slate-50/70 text-sm font-semibold placeholder:font-normal" />
            </div>
            <div className="sm:col-span-4 relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400"><MapPin className="w-5 h-5" /></div>
              <select id="select-city-filter" value={filter.city} onChange={handleCityChange} className="ui-control w-full pl-4 pr-11 py-3.5 bg-slate-50/70 text-sm font-semibold appearance-none">
                <option value="">جميع مدن المملكة</option>
                {SAUDI_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button id="filter-toggle-sponsorship" onClick={toggleSponsorship} className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${filter.sponsorshipOnly ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}><CheckCircle2 className="w-3.5 h-3.5" /><span>المصدر يذكر نقل الخدمات</span></button>
              <button id="filter-toggle-accommodation" onClick={toggleAccommodation} className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${filter.withAccommodation ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}><CheckCircle2 className="w-3.5 h-3.5" /><span>المصدر يذكر السكن</span></button>
            </div>
            {hasActiveFilters && <button id="btn-clear-hero-filters" onClick={clearFilters} className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 transition-colors font-bold self-start sm:self-auto"><X className="w-3.5 h-3.5" /><span>مسح الفلاتر</span></button>}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 max-w-5xl mx-auto scrollbar-none">
          {JOB_CATEGORIES.map(cat => {
            const isSelected = filter.category === cat.id;
            return <button key={cat.id} id={`cat-pill-${cat.id}`} onClick={() => handleCategoryClick(cat.id)} className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all border ${isSelected ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}>{cat.name}</button>;
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-emerald-100 bg-white/90 px-2 py-3 sm:px-4 sm:py-4 shadow-sm"><p className="text-lg sm:text-2xl font-black text-emerald-700 font-display leading-none">{totalJobs}</p><p className="mt-1.5 text-[10px] sm:text-xs font-semibold text-slate-500">فرصة مفهرسة</p></div>
          <div className="rounded-2xl border border-emerald-100 bg-white/90 px-2 py-3 sm:px-4 sm:py-4 shadow-sm"><p className="text-sm sm:text-lg font-black text-emerald-700 font-display leading-tight">موثّق</p><p className="mt-1.5 text-[10px] sm:text-xs font-semibold text-slate-500">اسم المصدر ظاهر</p></div>
          <div className="rounded-2xl border border-emerald-100 bg-white/90 px-2 py-3 sm:px-4 sm:py-4 shadow-sm"><p className="text-sm sm:text-lg font-black text-emerald-700 font-display leading-tight"><ExternalLink className="w-5 h-5 mx-auto" /></p><p className="mt-1.5 text-[10px] sm:text-xs font-semibold text-slate-500">التقديم خارجي</p></div>
        </div>
      </div>
    </section>
  );
};
