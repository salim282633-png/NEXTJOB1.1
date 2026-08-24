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
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {urgentActive && <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg"><Flame className="w-3 h-3 fill-rose-500" />{urgentWindowLabel(job)}</span>}
            {job.status === 'recently_confirmed' && <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg"><ShieldCheck className="w-3 h-3" />مؤكدة حديثًا</span>}
            {job.sponsorshipTransfer && <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg"><CheckCircle className="w-3 h-3" />نقل خدمات</span>}
            {matchScore !== undefined && <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg">تطابق {matchScore}%</span>}
          </div>
          <div className="flex gap-1">
            <button onClick={share} disabled={sharing} className="p-2 rounded-xl border text-slate-400 hover:text-emerald-700" title="مشاركة بطاقة صورة"><Share2 className="w-4 h-4" /></button>
            <button onClick={() => onToggleSave(job)} className={`p-2 rounded-xl border ${isSaved ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'text-slate-400'}`}><Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} /></button>
          </div>
        </div>

        <h3 onClick={() => onSelect(job)} className="text-lg font-bold text-slate-900 hover:text-emerald-700 cursor-pointer leading-snug mb-1.5">{job.title}</h3>
        <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-medium mb-3"><Building2 className="w-4 h-4 text-slate-400" /><span className="truncate">{job.company}</span>{job.sourceType === 'community' && <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 rounded border">فرصة مجتمعية</span>}</div>

        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold"><MapPin className="w-3.5 h-3.5 text-emerald-600" />{job.city}</div>
          <div className="flex items-center gap-1.5 font-bold"><Banknote className="w-3.5 h-3.5 text-emerald-600" /><span className="truncate">{job.salary || 'يحدد لاحقًا'}</span></div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3 text-[11px]">
          {job.accommodationProvided && <span className="bg-sky-50 text-sky-800 px-2 py-1 rounded-lg flex gap-1"><Home className="w-3 h-3" />سكن</span>}
          {job.transportationProvided && <span className="bg-amber-50 text-amber-800 px-2 py-1 rounded-lg flex gap-1"><Truck className="w-3 h-3" />مواصلات</span>}
          {job.mealsProvided && <span className="bg-purple-50 text-purple-800 px-2 py-1 rounded-lg flex gap-1"><Utensils className="w-3 h-3" />وجبات</span>}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">{job.description}</p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="w-3.5 h-3.5" />{job.createdAt}</span>
        <div className="flex gap-2">
          <button onClick={() => onQuickWhatsApp(job)} className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold"><MessageCircle className="w-3.5 h-3.5" />واتساب</button>
          <button onClick={() => onSelect(job)} className="flex items-center gap-1 bg-slate-100 text-slate-800 px-3 py-2 rounded-xl text-xs font-semibold">التفاصيل<ChevronLeft className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  );
};
