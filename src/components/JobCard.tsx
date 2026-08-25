import React, { useEffect, useState } from 'react';
import { Banknote, Bookmark, Building2, CheckCircle, ChevronLeft, Clock, Flame, Home, MapPin, MessageCircle, Share2, ShieldCheck, Truck, Utensils } from 'lucide-react';
import { Job } from '../types';
import { isUrgentActive, urgentWindowLabel } from '../lib/jobDiscovery';
import { createJobShareCard, shareImage } from '../lib/shareCards';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  isSaved: boolean;
  onToggleSave: (job: Job) => void;
  onQuickWhatsApp: (job: Job) => void;
  matchScore?: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect, isSaved, onToggleSave, onQuickWhatsApp, matchScore }) => {
  const [now, setNow] = useState(Date.now());
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const urgentActive = isUrgentActive(job, now);
  const share = async () => {
    setSharing(true);
    try {
      const blob = await createJobShareCard(job);
      await shareImage(blob, `nextjob-${job.id}.png`, `${job.title} - ${job.company}`);
    } catch (e) {
      console.warn('Job share card failed:', e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <article className="group bg-white rounded-[24px] border border-slate-200/90 hover:border-emerald-300 p-4 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.045)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.075)] transition-all flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {urgentActive && <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg"><Flame className="w-3 h-3 fill-rose-500" />{urgentWindowLabel(job)}</span>}
            {job.status === 'recently_confirmed' && <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg"><ShieldCheck className="w-3 h-3" />مؤكدة حديثًا</span>}
            {job.sponsorshipTransfer && <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg"><CheckCircle className="w-3 h-3" />نقل خدمات</span>}
            {matchScore !== undefined && <span className="text-[10px] sm:text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-100 px-2.5 py-1 rounded-lg">تطابق {matchScore}%</span>}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={share} disabled={sharing} className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-colors disabled:opacity-50" title="مشاركة بطاقة صورة"><Share2 className="w-4 h-4" /></button>
            <button onClick={() => onToggleSave(job)} className={`w-9 h-9 inline-flex items-center justify-center rounded-xl border transition-colors ${isSaved ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'text-slate-400 border-slate-200 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50'}`} title={isSaved ? 'إزالة من المحفوظات' : 'حفظ الوظيفة'}><Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} /></button>
          </div>
        </div>

        <button onClick={() => onSelect(job)} className="block w-full text-right">
          <h3 className="text-[19px] sm:text-xl font-black text-slate-950 group-hover:text-emerald-700 transition-colors leading-[1.45] mb-1.5 font-display">{job.title}</h3>
        </button>
        <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-[13px] font-semibold mb-4 min-w-0"><Building2 className="w-4 h-4 text-slate-400 shrink-0" /><span className="truncate">{job.company}</span>{job.sourceType === 'community' && <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100 shrink-0">فرصة مجتمعية</span>}</div>

        <div className="grid grid-cols-2 gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 mb-3.5 text-xs sm:text-[13px]">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 min-w-0"><MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" /><span className="truncate">{job.city}</span></div>
          <div className="flex items-center gap-1.5 font-black text-slate-800 min-w-0"><Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" /><span className="truncate">{job.salary || 'يحدد لاحقًا'}</span></div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3.5 text-[10px] sm:text-[11px]">
          {job.accommodationProvided && <span className="bg-sky-50 text-sky-800 border border-sky-100 px-2.5 py-1 rounded-lg flex items-center gap-1"><Home className="w-3 h-3" />سكن</span>}
          {job.transportationProvided && <span className="bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1"><Truck className="w-3 h-3" />مواصلات</span>}
          {job.mealsProvided && <span className="bg-purple-50 text-purple-800 border border-purple-100 px-2.5 py-1 rounded-lg flex items-center gap-1"><Utensils className="w-3 h-3" />وجبات</span>}
        </div>

        <p className="text-[13px] sm:text-sm text-slate-600 line-clamp-2 leading-7 mb-4">{job.description}</p>
      </div>

      <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium"><Clock className="w-3.5 h-3.5" />{job.createdAt}</span>
        <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
          <button onClick={() => onQuickWhatsApp(job)} className="min-h-10 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors"><MessageCircle className="w-3.5 h-3.5" />واتساب</button>
          <button onClick={() => onSelect(job)} className="min-h-10 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors">التفاصيل<ChevronLeft className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </article>
  );
};
