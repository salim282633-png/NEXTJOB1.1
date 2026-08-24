import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { Candidate, Job } from '../types';
import { getRecommendedJobs } from '../lib/matching';

interface Props {
  jobs: Job[];
  candidate: Candidate;
  onSelectJob: (job: Job) => void;
}

export const RecommendedJobs: React.FC<Props> = ({ jobs, candidate, onSelectJob }) => {
  const matches = getRecommendedJobs(jobs, candidate, 6);
  if (!matches.length) return null;

  return (
    <div className="mb-7 rounded-3xl border border-teal-200 bg-teal-50/70 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-teal-700" /> فرص قد تناسبك</h3>
          <p className="text-[11px] text-slate-500 mt-1">الترتيب يعتمد فقط على مدينتك الحالية في السعودية ومهنتك ومهاراتك.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {matches.map(({ job, score }) => (
          <button key={job.id} onClick={() => onSelectJob(job)} className="text-right bg-white border border-teal-100 hover:border-teal-400 rounded-2xl p-3 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm text-slate-900 line-clamp-1">{job.title}</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold rounded-lg px-2 py-0.5">{score}%</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 line-clamp-1">{job.company}</div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{job.city} · {job.salary}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
