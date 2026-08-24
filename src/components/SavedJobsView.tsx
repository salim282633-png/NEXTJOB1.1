import React from 'react';
import { Bookmark, Briefcase, Trash2, ArrowRight } from 'lucide-react';
import { Job } from '../types';
import { JobCard } from './JobCard';

interface SavedJobsViewProps {
  savedJobs: Job[];
  onSelectJob: (job: Job) => void;
  savedJobIds: Set<string>;
  onToggleSave: (job: Job) => void;
  onQuickWhatsApp: (job: Job) => void;
  onExploreJobs: () => void;
  onClearAllSaved: () => void;
}

export const SavedJobsView: React.FC<SavedJobsViewProps> = ({
  savedJobs = [],
  onSelectJob,
  savedJobIds,
  onToggleSave,
  onQuickWhatsApp,
  onExploreJobs,
  onClearAllSaved
}) => {
  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              الوظائف المحفوظة
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
              {savedJobs.length} وظيفة
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            قائمة الوظائف التي قمت بحفظها لسهولة العودة إليها والتواصل مع أصحاب العمل
          </p>
        </div>

        {savedJobs.length > 0 && (
          <button
            id="btn-clear-all-saved"
            onClick={onClearAllSaved}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح جميع المحفوظات</span>
          </button>
        )}
      </div>

      {/* Grid or Empty */}
      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedJobs.map(job => (
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
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">لا توجد وظائف محفوظة حتى الآن</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            عند تصفح فرص العمل المتاحة، اضغط على أيقونة الإشارة المرجعية لحفظ الوظائف المهمة ومقارنتها هنا.
          </p>
          <button
            id="btn-explore-jobs-from-saved"
            onClick={onExploreJobs}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2"
          >
            <span>استعراض جميع الوظائف الشاغرة</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}

    </section>
  );
};
