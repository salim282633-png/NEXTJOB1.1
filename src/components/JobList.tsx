import React, { useState } from 'react';
import { Briefcase, SlidersHorizontal, ArrowUpDown, PlusCircle, Search, RefreshCw } from 'lucide-react';
import { Job, JobFilter } from '../types';
import { JobCard } from './JobCard';

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

export const JobList: React.FC<JobListProps> = ({
  jobs = [],
  filter,
  setFilter,
  onSelectJob,
  savedJobIds,
  onToggleSave,
  onQuickWhatsApp,
  onOpenPostJob,
  isLoading
}) => {
  const [sortBy, setSortBy] = useState<'latest' | 'salary'>('latest');

  // Filter jobs based on active filter state
  const filteredJobs = (jobs || []).filter(job => {
    if (!job) return false;
    if (filter?.keyword) {
      const q = filter.keyword.toLowerCase();
      const matchTitle = (job.title || '').toLowerCase().includes(q);
      const matchCompany = (job.company || '').toLowerCase().includes(q);
      const matchDesc = (job.description || '').toLowerCase().includes(q);
      const matchCity = (job.city || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchDesc && !matchCity) return false;
    }

    if (filter?.city && job.city !== filter.city) {
      return false;
    }

    if (filter?.category && filter.category !== 'all' && job.category !== filter.category) {
      return false;
    }

    if (filter?.sponsorshipOnly && !job.sponsorshipTransfer) {
      return false;
    }

    if (filter?.withAccommodation && !job.accommodationProvided) {
      return false;
    }

    return true;
  });

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header & Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              الوظائف الشاغرة المتاحة
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredJobs.length} فرصة
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            يتم تحديث الوظائف والتواصل المباشر مع أصحاب الأعمال على مدار الساعة
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs">
            <span className="text-slate-400 px-2 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>الترتيب:</span>
            </span>
            <button
              id="sort-btn-latest"
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sortBy === 'latest'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الأحدث
            </button>
            <button
              id="sort-btn-salary"
              onClick={() => setSortBy('salary')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                sortBy === 'salary'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الأعلى راتباً
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">جارٍ جلب أحدث الوظائف المباشرة...</p>
        </div>
      )}

      {/* Grid of jobs */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={onSelectJob}
              isSaved={savedJobIds.has(job.id)}
              onToggleSave={onToggleSave}
              onQuickWhatsApp={onQuickWhatsApp}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredJobs.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 my-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">لم نعثر على وظائف تطابق بحثك الحالي</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            جرب تعديل الكلمات المفتاحية أو اختيار مدينة وتخصص مختلف، أو قم بنشر طلبك في قسم الباحثين عن عمل ليتواصل معك أصحاب الأعمال مباشرة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="btn-reset-filters-empty"
              onClick={() => setFilter({
                keyword: '',
                category: 'all',
                city: '',
                sponsorshipOnly: false,
                withAccommodation: false,
                withTransportation: false,
                jobType: '',
                salaryRange: ''
              })}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              عرض جميع الوظائف
            </button>
            <button
              id="btn-post-job-empty"
              onClick={onOpenPostJob}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>أعلن عن وظيفة الآن</span>
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
