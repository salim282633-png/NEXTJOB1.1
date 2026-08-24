import React, { useState } from 'react';
import { Users, Search, MapPin, UserPlus, ShieldCheck, Car, CheckCircle2, RefreshCw, X, FileText, Globe } from 'lucide-react';
import { Candidate, CandidateFilter } from '../types';
import { CandidateCard } from './CandidateCard';
import { SAUDI_CITIES, YEMENI_GOVERNORATES } from '../lib/data';

interface CandidatesDirectoryProps {
  candidates: Candidate[];
  onOpenPostCandidate: () => void;
  onQuickWhatsApp: (candidate: Candidate) => void;
  onViewCV?: (candidate: Candidate) => void;
  onReportCandidate?: (candidate: Candidate) => void;
  isLoading: boolean;
}

export const CandidatesDirectory: React.FC<CandidatesDirectoryProps> = ({
  candidates = [],
  onOpenPostCandidate,
  onQuickWhatsApp,
  onViewCV,
  onReportCandidate,
  isLoading
}) => {
  const [filter, setFilter] = useState<CandidateFilter>({
    keyword: '',
    profession: '',
    city: '',
    yemeniGovernorate: '',
    iqamaStatus: '',
    hasLicenseOnly: false,
    availableOnly: false
  });

  const filteredCandidates = (candidates || []).filter(cand => {
    if (!cand) return false;
    // Hide hidden profiles
    if (cand.isHidden) return false;

    if (filter.keyword) {
      const q = filter.keyword.toLowerCase();
      const matchName = (cand.fullName || '').toLowerCase().includes(q);
      const matchProf = (cand.profession || '').toLowerCase().includes(q);
      const matchBio = (cand.bio || '').toLowerCase().includes(q);
      const matchSkills = cand.skills?.some(s => (s || '').toLowerCase().includes(q));
      if (!matchName && !matchProf && !matchBio && !matchSkills) return false;
    }

    if (filter.city && cand.city !== filter.city) {
      return false;
    }

    if (filter.yemeniGovernorate && cand.yemeniGovernorate !== filter.yemeniGovernorate) {
      return false;
    }

    if (filter.iqamaStatus && cand.iqamaStatus !== filter.iqamaStatus) {
      return false;
    }

    if (filter.hasLicenseOnly && !cand.hasDriverLicense) {
      return false;
    }

    if (filter.availableOnly && !cand.availableImmediately) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilter({
      keyword: '',
      profession: '',
      city: '',
      yemeniGovernorate: '',
      iqamaStatus: '',
      hasLicenseOnly: false,
      availableOnly: false
    });
  };

  const hasActiveFilters = filter.keyword || filter.city || filter.yemeniGovernorate || filter.iqamaStatus || filter.hasLicenseOnly || filter.availableOnly;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>سير ذاتية ومهن جاهزة للعمل المباشر</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            دليل الكفاءات والباحثين عن عمل في السعودية
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            تصفح السير الذاتية لأصحاب المهن والكوادر اليمنية المقيمة بالمملكة وتواصل معهم مباشرة عبر الواتساب والمكالمات دون أي عمولات توظيف.
          </p>
        </div>

        <button
          id="btn-post-candidate-hero"
          onClick={onOpenPostCandidate}
          className="shrink-0 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>أضف سيرتك الذاتية مجاناً</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="search-candidate-input"
              type="text"
              value={filter.keyword}
              onChange={e => setFilter(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder="ابحث بالاسم، المهنة، المهارة (محاسب، باريستا، فني كهرباء...)"
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              id="select-candidate-city"
              value={filter.city}
              onChange={e => setFilter(prev => ({ ...prev, city: e.target.value }))}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">جميع مدن السعودية</option>
              {SAUDI_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 relative">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <Globe className="w-4 h-4" />
            </div>
            <select
              value={filter.yemeniGovernorate}
              onChange={e => setFilter(prev => ({ ...prev, yemeniGovernorate: e.target.value }))}
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">جميع المحافظات الأصلية</option>
              {YEMENI_GOVERNORATES.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-filter-cand-available"
              onClick={() => setFilter(prev => ({ ...prev, availableOnly: !prev.availableOnly }))}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                filter.availableOnly
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>متاح للمباشرة فوراً</span>
            </button>

            <button
              id="btn-filter-cand-license"
              onClick={() => setFilter(prev => ({ ...prev, hasLicenseOnly: !prev.hasLicenseOnly }))}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                filter.hasLicenseOnly
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>يحمل رخصة قيادة سعودية</span>
            </button>
          </div>

          {hasActiveFilters && (
            <button
              id="btn-clear-cand-filters"
              onClick={clearFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-emerald-700 transition-colors font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">جارٍ جلب الكفاءات والباحثين عن عمل...</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && filteredCandidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onQuickWhatsApp={onQuickWhatsApp}
              onViewCV={onViewCV}
              onReportCandidate={onReportCandidate}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCandidates.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">لم يتم العثور على باحثين عن عمل وفق الفلتر المحدد</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            كن أول من ينشر سيرته الذاتية في هذا التخصص أو المدينة ليتواصل معك أصحاب الشركات مباشرة وبشكل مجاني 100%.
          </p>
          <button
            id="btn-post-candidate-empty"
            onClick={onOpenPostCandidate}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>نشر سيرتي الذاتية الآن</span>
          </button>
        </div>
      )}

    </section>
  );
};
