import React from 'react';
import { ArrowRight, Bookmark, Trash2 } from 'lucide-react';
import { Job } from '../types';
import { JobCard } from './JobCard';

interface SavedJobsViewProps {
  savedJobs: Job[];
  onSelectJob: (job: Job) => void;
  savedJobIds: Set<string>;
  onToggleSave: (job: Job) => void;
  onExploreJobs: () => void;
  onClearAllSaved: () => void;
}

export const SavedJobsView: React.FC<SavedJobsViewProps> = ({ savedJobs = [], onSelectJob, savedJobIds, onToggleSave, onExploreJobs, onClearAllSaved }) => {
  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">الفرص المحفوظة</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">{savedJobs.length} فرصة</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">روابط الفرص الخارجية التي حفظتها للعودة إلى مصادرها الأصلية لاحقًا.</p>
        </div>
        {savedJobs.length > 0 && <button id="btn-clear-all-saved" onClick={onClearAllSaved} className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl font-bold transition-colors"><Trash2 className="w-4 h-4" /><span>مسح جميع المحفوظات</span></button>}
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedJobs.map(job => <JobCard key={job.id} job={job} onSelect={onSelectJob} isSaved={savedJobIds.has(job.id)} onToggleSave={onToggleSave} />)}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto"><Bookmark className="w-8 h-8" /></div>
          <h3 className="text-lg font-bold text-slate-900">لا توجد فرص محفوظة حتى الآن</h3>
          <p className="text-sm text-slate-500 leading-relaxed">احفظ أي فرصة مفهرسة لتعود لاحقًا إلى الإعلان أو رابط التقديم في مصدره الأصلي.</p>
          <button id="btn-explore-jobs-from-saved" onClick={onExploreJobs} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2"><span>استعراض الفرص الوظيفية</span><ArrowRight className="w-4 h-4 rotate-180" /></button>
        </div>
      )}
    </section>
  );
};
