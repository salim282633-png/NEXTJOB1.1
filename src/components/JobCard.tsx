import React from 'react';
import { 
  Building2, 
  MapPin, 
  Banknote, 
  Clock, 
  CheckCircle, 
  Home, 
  Truck, 
  PhoneCall, 
  MessageCircle, 
  Bookmark, 
  Eye, 
  Flame, 
  ChevronLeft,
  Briefcase,
  Utensils,
  Clock3,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  isSaved: boolean;
  onToggleSave: (job: Job) => void;
  onQuickWhatsApp: (job: Job) => void;
  onShare?: (job: Job) => void;
  matchScore?: number;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  isSaved,
  onToggleSave,
  onQuickWhatsApp,
  onShare,
  matchScore
}) => {
  const isUrgentActive = Boolean(
    job.urgent && 
    (!job.urgentExpiresAt || new Date(job.urgentExpiresAt).getTime() > Date.now()) &&
    job.status !== 'closed'
  );

  return (
    <div 
      id={`job-card-${job.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between group relative p-5 sm:p-6 shadow-xs hover:shadow-lg ${
        job.status === 'closed' 
          ? 'opacity-65 border-slate-200 bg-slate-50/50' 
          : 'border-slate-200/90 hover:border-emerald-500/60'
      }`}
    >
      {/* Top row: Badges & Bookmark */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {isUrgentActive && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg">
                <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span>عاجل ومباشر</span>
              </span>
            )}

            {job.status === 'recently_confirmed' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>مؤكد التوفر {job.lastConfirmedAt ? `(${job.lastConfirmedAt})` : ''}</span>
              </span>
            )}

            {job.status === 'closed' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg">
                <span>مكتفية / مغلقة</span>
              </span>
            )}

            {job.sponsorshipTransfer && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>نقل خدمات (قوى)</span>
              </span>
            )}

            {job.accommodationProvided && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-lg">
                <Home className="w-3 h-3 text-sky-600" />
                <span>سكن</span>
              </span>
            )}

            {job.transportationProvided && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-lg">
                <Truck className="w-3 h-3 text-amber-600" />
                <span>مواصلات</span>
              </span>
            )}

            {job.mealsProvided && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-lg">
                <Utensils className="w-3 h-3 text-purple-600" />
                <span>وجبات</span>
              </span>
            )}

            {job.overtimeAvailable && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg">
                <Clock3 className="w-3 h-3 text-emerald-600" />
                <span>إضافي (أوفرتايم)</span>
              </span>
            )}

            {matchScore !== undefined && matchScore > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-lg">
                <span>تطابق {matchScore}%</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(job);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                title="مشاركة الإعلان"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            <button
              id={`btn-save-job-${job.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(job);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
              title={isSaved ? 'إزالة من المحفوظات' : 'حفظ الوظيفة'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Job Title & Company */}
        <h3 
          onClick={() => onSelect(job)}
          className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 cursor-pointer transition-colors leading-snug mb-1.5"
        >
          {job.title}
        </h3>

        <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-medium mb-3">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{job.company}</span>
          {job.sourceType === 'community' && (
            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-bold border border-teal-200">
              فرصة مجتمعية
            </span>
          )}
        </div>

        {/* City & Salary specs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{job.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
            <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{job.salary || 'راتب مجزٍ'}</span>
          </div>
        </div>

        {/* Short description preview */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {job.description}
        </p>
      </div>

      {/* Footer / Action row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{job.createdAt}</span>
          </span>
          {job.views && (
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{job.views} مشاهدة</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick WhatsApp button */}
          <button
            id={`btn-quick-wa-${job.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickWhatsApp(job);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
            title="تواصل فوري واتساب"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>واتساب</span>
          </button>

          {/* Details button */}
          <button
            id={`btn-view-job-${job.id}`}
            onClick={() => onSelect(job)}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <span>التفاصيل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
