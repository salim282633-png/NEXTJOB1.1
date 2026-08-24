import React from 'react';
import { Search, MapPin, Briefcase, Sparkles, CheckCircle2, ShieldCheck, Zap, X } from 'lucide-react';
import { SAUDI_CITIES, JOB_CATEGORIES } from '../lib/data';
import { JobFilter } from '../types';

interface HeroSectionProps {
  filter: JobFilter;
  setFilter: React.Dispatch<React.SetStateAction<JobFilter>>;
  totalJobs: number;
  onOpenAICoverLetter: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  filter,
  setFilter,
  totalJobs,
  onOpenAICoverLetter
}) => {
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, keyword: e.target.value }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(prev => ({ ...prev, city: e.target.value }));
  };

  const handleCategoryClick = (catId: string) => {
    setFilter(prev => ({ ...prev, category: catId }));
  };

  const toggleSponsorship = () => {
    setFilter(prev => ({ ...prev, sponsorshipOnly: !prev.sponsorshipOnly }));
  };

  const toggleAccommodation = () => {
    setFilter(prev => ({ ...prev, withAccommodation: !prev.withAccommodation }));
  };

  const clearFilters = () => {
    setFilter({
      keyword: '',
      category: 'all',
      city: '',
      sponsorshipOnly: false,
      withAccommodation: false,
      withTransportation: false,
      jobType: '',
      salaryRange: ''
    });
  };

  const hasActiveFilters = filter.keyword || filter.city || filter.category !== 'all' || filter.sponsorshipOnly || filter.withAccommodation;

  return (
    <div className="relative bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-emerald-200 backdrop-blur-md">
          <Zap className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span>تواصل مباشر مع أصحاب العمل عبر الواتساب والمكالمات فوراً</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          فرص عمل مباشرة لليمنيين في السعودية <br className="hidden sm:inline" />
          <span className="text-emerald-400">تواصل مباشر دون عمولات توظيف</span>
        </h1>

        <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
          منصة NEXT JOB تربط الكفاءات وأصحاب المهن بأصحاب المنشآت والشركات في كافة مدن السعودية، مع خيارات نقل الخدمات والسكن وتفاصيل العمل بوضوح.
        </p>

        {/* Smart Search Box Container */}
        <div className="bg-white/10 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white/20 shadow-2xl max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
            
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="search-job-input"
                type="text"
                value={filter.keyword}
                onChange={handleKeywordChange}
                placeholder="ابحث بالمهنة (محاسب، معلم شاورما، سائق، كاشير...)"
                className="w-full pl-4 pr-11 py-3.5 bg-white text-slate-900 rounded-2xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>

            {/* City Select */}
            <div className="sm:col-span-4 relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-5 h-5" />
              </div>
              <select
                id="select-city-filter"
                value={filter.city}
                onChange={handleCityChange}
                className="w-full pl-4 pr-11 py-3.5 bg-white text-slate-900 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs appearance-none"
              >
                <option value="">جميع مدن المملكة</option>
                {SAUDI_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* AI Letter Generator Helper Trigger */}
            <div className="sm:col-span-2">
              <button
                id="btn-open-ai-generator"
                onClick={onOpenAICoverLetter}
                className="w-full h-full py-3.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                title="إنشاء رسالة تقديم احترافية للواتساب بالذكاء الاصطناعي"
              >
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>إنشاء رسالة تقديم</span>
              </button>
            </div>
          </div>

          {/* Quick Filters Toggles */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="filter-toggle-sponsorship"
                onClick={toggleSponsorship}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                  filter.sponsorshipOnly
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>نقل خدمات متاح</span>
              </button>

              <button
                id="filter-toggle-accommodation"
                onClick={toggleAccommodation}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                  filter.withAccommodation
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>سكن متوفر</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                id="btn-clear-hero-filters"
                onClick={clearFilters}
                className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors underline underline-offset-4"
              >
                <X className="w-3.5 h-3.5" />
                <span>مسح كل الفلاتر</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 max-w-4xl mx-auto">
          {JOB_CATEGORIES.map(cat => {
            const isSelected = filter.category === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                onClick={() => handleCategoryClick(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-400/20 scale-105'
                    : 'bg-white/10 text-emerald-100 hover:bg-white/20'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Highlights / Stats */}
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto pt-4 text-center border-t border-white/10">
          <div>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-display">{totalJobs}+</p>
            <p className="text-xs text-emerald-200/80">وظيفة متاحة الآن</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-display">100%</p>
            <p className="text-xs text-emerald-200/80">مجاني وبدون عمولة</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-display">تواصل مباشر</p>
            <p className="text-xs text-emerald-200/80">عبر واتساب</p>
          </div>
        </div>

      </div>
    </div>
  );
};
