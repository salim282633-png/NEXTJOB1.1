import React, { useState } from 'react';
import { Users, Search, MapPin, UserPlus, Car, CheckCircle2, RefreshCw, X, Globe } from 'lucide-react';
import { Candidate, CandidateFilter } from '../types';
import { CandidateCard } from './CandidateCard';
import { SAUDI_CITIES, YEMENI_GOVERNORATES } from '../lib/data';
import { useOwnedCandidate } from '../hooks/useOwnedCandidate';

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
  const { candidate: ownedCandidate } = useOwnedCandidate();
  const [filter, setFilter] = useState<CandidateFilter>({
    keyword: '', profession: '', city: '', yemeniGovernorate: '', iqamaStatus: '', hasLicenseOnly: false, availableOnly: false
  });

  const filteredCandidates = (candidates || []).filter(cand => {
    if (!cand || cand.isHidden) return false;
    if (filter.keyword) {
      const q = filter.keyword.toLowerCase();
      const matchName = (cand.fullName || '').toLowerCase().includes(q);
      const matchProf = (cand.profession || '').toLowerCase().includes(q);
      const matchBio = (cand.bio || '').toLowerCase().includes(q);
      const matchSkills = cand.skills?.some(s => (s || '').toLowerCase().includes(q));
      if (!matchName && !matchProf && !matchBio && !matchSkills) return false;
    }
    if (filter.city && cand.city !== filter.city) return false;
    if (filter.yemeniGovernorate && cand.yemeniGovernorate !== filter.yemeniGovernorate) return false;
    if (filter.iqamaStatus && cand.iqamaStatus !== filter.iqamaStatus) return false;
    if (filter.hasLicenseOnly && !cand.hasDriverLicense) return false;
    if (filter.availableOnly && !cand.availableImmediately) return false;
    return true;
  });

  const clearFilters = () => setFilter({ keyword: '', profession: '', city: '', yemeniGovernorate: '', iqamaStatus: '', hasLicenseOnly: false, availableOnly: false });
  const hasActiveFilters = filter.keyword || filter.city || filter.yemeniGovernorate || filter.iqamaStatus || filter.hasLicenseOnly || filter.availableOnly;

  return (
    <section className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 sm:p-8 shadow-[0_18px_50px_rgba(15,23,42,0.055)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -left-16 -top-20 w-64 h-64 rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
        <div className="relative space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white text-emerald-800 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border border-emerald-100 shadow-sm">
            <Users className="w-3.5 h-3.5" /><span>ملفات مهنية ينشرها المستخدمون داخل السعودية</span>
          </div>
          <h2 className="text-2xl sm:text-[32px] font-black text-slate-950 font-display leading-[1.35]">دليل الملفات المهنية</h2>
          <p className="text-sm text-slate-600 leading-7 sm:leading-8 max-w-xl">تصفح الملفات التي اختار أصحابها نشرها، واطلع على الخبرات والمهارات ثم تواصل معهم مباشرة. NEXT JOB لا تختار أو ترشح الأشخاص نيابة عن المعلنين.</p>
        </div>
        <button id="btn-post-candidate-hero" onClick={onOpenPostCandidate} className="relative shrink-0 w-full md:w-auto px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
          <UserPlus className="w-4 h-4" /><span>أضف ملفك المهني</span>
        </button>
      </div>

      <div className="ui-card p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
          <div className="sm:col-span-6 relative"><div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400"><Search className="w-4 h-4" /></div><input id="search-candidate-input" type="text" value={filter.keyword} onChange={e => setFilter(prev => ({ ...prev, keyword: e.target.value }))} placeholder="ابحث بالاسم أو المهنة أو المهارة" className="ui-control w-full pl-4 pr-10 py-3 bg-slate-50/70 text-sm font-semibold placeholder:font-normal" /></div>
          <div className="sm:col-span-3 relative"><div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400"><MapPin className="w-4 h-4" /></div><select id="select-candidate-city" value={filter.city} onChange={e => setFilter(prev => ({ ...prev, city: e.target.value }))} className="ui-control w-full pl-4 pr-10 py-3 bg-slate-50/70 text-sm font-semibold"><option value="">جميع مدن السعودية</option>{SAUDI_CITIES.map(city => <option key={city} value={city}>{city}</option>)}</select></div>
          <div className="sm:col-span-3 relative"><div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400"><Globe className="w-4 h-4" /></div><select value={filter.yemeniGovernorate} onChange={e => setFilter(prev => ({ ...prev, yemeniGovernorate: e.target.value }))} className="ui-control w-full pl-4 pr-10 py-3 bg-slate-50/70 text-sm font-semibold"><option value="">جميع المحافظات الأصلية</option>{YEMENI_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}</select></div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button id="btn-filter-cand-available" onClick={() => setFilter(prev => ({ ...prev, availableOnly: !prev.availableOnly }))} className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${filter.availableOnly ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}><CheckCircle2 className="w-3.5 h-3.5" /><span>ذكر أنه متاح للمباشرة</span></button>
            <button id="btn-filter-cand-license" onClick={() => setFilter(prev => ({ ...prev, hasLicenseOnly: !prev.hasLicenseOnly }))} className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 border ${filter.hasLicenseOnly ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}><Car className="w-3.5 h-3.5" /><span>ذكر وجود رخصة قيادة سعودية</span></button>
          </div>
          {hasActiveFilters && <button id="btn-clear-cand-filters" onClick={clearFilters} className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-700 transition-colors font-bold self-start sm:self-auto"><X className="w-3.5 h-3.5" /><span>إعادة ضبط الفلاتر</span></button>}
        </div>
      </div>

      {!isLoading && <div className="flex items-center justify-between gap-3 px-1"><div><h3 className="text-lg sm:text-xl font-black text-slate-950 font-display">الملفات المهنية المنشورة</h3><p className="text-xs text-slate-500 mt-1">{filteredCandidates.length} ملف مطابق للفلاتر الحالية</p></div></div>}
      {isLoading && <div className="py-20 text-center flex flex-col items-center justify-center gap-3"><RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" /><p className="text-sm font-semibold text-slate-600">جارٍ تحميل الملفات المهنية...</p></div>}
      {!isLoading && filteredCandidates.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">{filteredCandidates.map(candidate => <CandidateCard key={candidate.id} candidate={candidate} onQuickWhatsApp={onQuickWhatsApp} onViewCV={onViewCV} onReportCandidate={onReportCandidate} isOwner={ownedCandidate?.id === candidate.id} />)}</div>}
      {!isLoading && filteredCandidates.length === 0 && <div className="ui-card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4"><div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto"><Users className="w-8 h-8" /></div><h3 className="text-xl font-black text-slate-950 font-display">لم يتم العثور على ملفات وفق الفلتر المحدد</h3><p className="text-sm text-slate-500 leading-7">جرّب تغيير المدينة أو الكلمات المستخدمة، أو أضف ملفك المهني إذا رغبت في إتاحته للتواصل المباشر.</p><button id="btn-post-candidate-empty" onClick={onOpenPostCandidate} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"><UserPlus className="w-4 h-4" /><span>إضافة ملفي المهني</span></button></div>}
    </section>
  );
};
