import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, PlusCircle, RefreshCw, Search } from 'lucide-react';
import { Job, JobFilter } from '../types';
import { JobCard } from './JobCard';
import { JobApplicationAction } from './JobApplicationAction';
import { RecommendedJobs } from './RecommendedJobs';
import { AdSenseSlot } from './AdSenseSlot';
import { SimulatedJobsFallback } from './SimulatedJobsFallback';
import { useOwnedCandidate } from '../hooks/useOwnedCandidate';
import { freshnessMatches, jobActivityMs, salaryMatches, salarySortValue } from '../lib/jobDiscovery';
import { JOB_PROFESSION_FILTERS } from '../lib/jobProfessions';

interface JobListProps {
  jobs: Job[];
  filter: JobFilter;
  setFilter: React.Dispatch<React.SetStateAction<JobFilter>>;
  onSelectJob: (job: Job) => void;
  savedJobIds: Set<string>;
  onToggleSave: (job: Job) => void;
  onQuickWhatsApp: (job: Job) => void;
  onOpenPostJob: () => void;
  isLoading: boolean;
}

function normalizeProfessionText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function jobMatchesProfession(job: Job, profession?: string): boolean {
  if (!profession) return true;

  const haystack = normalizeProfessionText(
    `${job.title} ${job.category} ${job.description} ${(job.requirements || []).join(' ')}`
  );
  const selectedTokens = normalizeProfessionText(profession)
    .split(' ')
    .filter(token => token.length > 1);

  return selectedTokens.every(token => haystack.includes(token));
}

export const JobList: React.FC<JobListProps> = ({ jobs = [], filter, setFilter, onSelectJob, savedJobIds, onToggleSave, onQuickWhatsApp, onOpenPostJob, isLoading }) => {
  const [sortBy, setSortBy] = useState<'latest' | 'salary'>('latest');
  const [now, setNow] = useState(Date.now());
  const { user, candidate } = useOwnedCandidate();
  const showSimulatedJobs = !isLoading && jobs.length === 0;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter(job => {
      if (!job || job.status === 'closed') return false;
      if (filter.keyword) {
        const q = filter.keyword.toLowerCase().trim();
        const haystack = `${job.title} ${job.company} ${job.description} ${job.city} ${(job.requirements || []).join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (!jobMatchesProfession(job, filter.profession)) return false;
      if (filter.city && job.city !== filter.city) return false;
      if (filter.category && filter.category !== 'all' && job.category !== filter.category) return false;
      if (filter.sponsorshipOnly && !job.sponsorshipTransfer) return false;
      if (filter.withAccommodation && !job.accommodationProvided) return false;
      if (filter.withTransportation && !job.transportationProvided) return false;
      if (filter.withMeals && !job.mealsProvided) return false;
      if (filter.withOvertime && !job.overtimeAvailable) return false;
      if (filter.jobType && job.jobType !== filter.jobType) return false;
      if (!salaryMatches(job, filter.salaryRange)) return false;
      if (!freshnessMatches(job, filter.freshness, now)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'salary') {
        const salaryDiff = salarySortValue(b) - salarySortValue(a);
        return salaryDiff || jobActivityMs(b) - jobActivityMs(a);
      }
      return jobActivityMs(b) - jobActivityMs(a);
    });
  }, [jobs, filter, sortBy, now]);

  const reset = () => setFilter({
    keyword: '', profession: '', category: 'all', city: '', sponsorshipOnly: false,
    withAccommodation: false, withTransportation: false, withMeals: false,
    withOvertime: false, jobType: '', salaryRange: '', freshness: 'all'
  });

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {candidate && <RecommendedJobs jobs={jobs} candidate={candidate} onSelectJob={onSelectJob} />}

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">الوظائف الشاغرة المتاحة</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">{filteredJobs.length} فرصة حقيقية</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {showSimulatedJobs
                ? 'لا توجد وظائف حقيقية منشورة الآن؛ النماذج أدناه توضيحية فقط ولا تُحفظ في قاعدة البيانات.'
                : 'النتائج مرتبة من البيانات الفعلية للإعلانات، وليست بيانات Seed.'}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1"><ArrowUpDown className="w-3.5 h-3.5" />الترتيب:</span>
            <button onClick={() => setSortBy('latest')} className={`px-3 py-1.5 rounded-lg font-semibold ${sortBy === 'latest' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>الأحدث</button>
            <button onClick={() => setSortBy('salary')} className={`px-3 py-1.5 rounded-lg font-semibold ${sortBy === 'salary' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}>الأعلى راتبًا</button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2 bg-white border border-slate-200 rounded-2xl p-3">
          <select
            value={filter.profession || ''}
            onChange={e => setFilter(v => ({ ...v, profession: e.target.value }))}
            className="col-span-2 border rounded-xl px-2 py-2 text-xs bg-white"
            aria-label="فلترة الوظائف حسب المهنة"
          >
            <option value="">كل المهن</option>
            {JOB_PROFESSION_FILTERS.map(profession => (
              <option key={profession} value={profession}>{profession}</option>
            ))}
          </select>
          <select value={filter.jobType} onChange={e => setFilter(v => ({ ...v, jobType: e.target.value }))} className="border rounded-xl px-2 py-2 text-xs bg-white">
            <option value="">كل أنواع الدوام</option><option value="دوام كامل">دوام كامل</option><option value="دوام جزئي">دوام جزئي</option><option value="عمل حر / بالقطعة">عمل حر / بالقطعة</option><option value="عقد مؤقت">عقد مؤقت</option>
          </select>
          <select value={filter.salaryRange} onChange={e => setFilter(v => ({ ...v, salaryRange: e.target.value }))} className="border rounded-xl px-2 py-2 text-xs bg-white">
            <option value="">كل الرواتب</option><option value="under3000">أقل من 3,000</option><option value="3000-5000">3,000–5,000</option><option value="5000-8000">5,001–8,000</option><option value="8000+">أكثر من 8,000</option>
          </select>
          <select value={filter.freshness || 'all'} onChange={e => setFilter(v => ({ ...v, freshness: e.target.value as JobFilter['freshness'] }))} className="border rounded-xl px-2 py-2 text-xs bg-white">
            <option value="all">كل التواريخ</option><option value="today">آخر 24 ساعة</option><option value="3days">آخر 3 أيام</option><option value="week">آخر 7 أيام</option>
          </select>
          <label className="flex items-center gap-1.5 text-xs px-2"><input type="checkbox" checked={filter.withTransportation} onChange={e => setFilter(v => ({ ...v, withTransportation: e.target.checked }))} />مواصلات</label>
          <label className="flex items-center gap-1.5 text-xs px-2"><input type="checkbox" checked={Boolean(filter.withMeals)} onChange={e => setFilter(v => ({ ...v, withMeals: e.target.checked }))} />وجبات</label>
          <label className="flex items-center gap-1.5 text-xs px-2"><input type="checkbox" checked={Boolean(filter.withOvertime)} onChange={e => setFilter(v => ({ ...v, withOvertime: e.target.checked }))} />إضافي</label>
          <button onClick={reset} className="text-xs font-bold text-slate-600 bg-slate-100 rounded-xl px-2 py-2">مسح الفلاتر</button>
        </div>
      </div>

      {/* Clearly separated from job cards and application buttons. Renders only
          when Google production config is READY and a real slot ID is present. */}
      <AdSenseSlot />

      {isLoading && <div className="py-20 text-center flex flex-col items-center gap-3"><RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" /><p className="text-sm font-semibold text-slate-600">جارٍ جلب أحدث الوظائف...</p></div>}

      {showSimulatedJobs && <SimulatedJobsFallback onOpenPostJob={onOpenPostJob} />}

      {!isLoading && !showSimulatedJobs && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map(job => (
            <div key={job.id} className="flex flex-col">
              <JobCard job={job} onSelect={onSelectJob} isSaved={savedJobIds.has(job.id)} onToggleSave={onToggleSave} onQuickWhatsApp={onQuickWhatsApp} />
              <JobApplicationAction job={job} user={user} candidate={candidate} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !showSimulatedJobs && filteredJobs.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 my-6">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">لم نعثر على وظائف تطابق الفلاتر</h3>
          <p className="text-sm text-slate-500">جرّب تغيير المهنة أو الراتب أو التاريخ أو نوع الدوام أو المدينة.</p>
          <div className="flex justify-center gap-3"><button onClick={reset} className="px-4 py-2.5 bg-slate-100 rounded-xl text-xs font-bold">عرض جميع الوظائف</button><button onClick={onOpenPostJob} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"><PlusCircle className="w-4 h-4" />أعلن عن وظيفة</button></div>
        </div>
      )}
    </section>
  );
};
