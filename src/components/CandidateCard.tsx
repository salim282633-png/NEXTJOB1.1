import React from 'react';
import {
  UserCheck,
  MapPin,
  Briefcase,
  Clock,
  MessageCircle,
  PhoneCall,
  Car,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Tag,
  FileText,
  ShieldAlert,
  Flag,
  Lock,
  PhoneOff
} from 'lucide-react';
import { Candidate } from '../types';

interface CandidateCardProps {
  candidate: Candidate;
  onQuickWhatsApp: (cand: Candidate) => void;
  onViewCV?: (cand: Candidate) => void;
  onReportCandidate?: (cand: Candidate) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onQuickWhatsApp,
  onViewCV,
  onReportCandidate
}) => {
  return (
    <div
      id={`candidate-card-${candidate.id}`}
      className={`bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${
        candidate.isHidden ? 'opacity-50' : ''
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{candidate.iqamaStatus}</span>
            </span>

            {candidate.yemeniGovernorate && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                <span>أصل: {candidate.yemeniGovernorate}</span>
              </span>
            )}
          </div>

          {candidate.availableImmediately && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>مباشر فوراً</span>
            </span>
          )}
        </div>

        {/* Name & Profession */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1">
          {candidate.fullName}
        </h3>

        <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold mb-3">
          <Briefcase className="w-4 h-4 shrink-0" />
          <span>{candidate.profession}</span>
        </div>

        {/* Location & Experience specs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{candidate.city}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{candidate.experienceYears}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3">
          {candidate.bio}
        </p>

        {/* Skills Pills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {candidate.skills.map((skill, idx) => (
              <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                {skill}
              </span>
            ))}
            {candidate.hasDriverLicense && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md font-semibold">
                <Car className="w-3 h-3 text-sky-600" />
                <span>رخصة قيادة سعودية</span>
              </span>
            )}
          </div>
        )}

        {/* Phone remains visible when contact is enabled, even if unverified. */}
        {candidate.allowContact !== false && candidate.phone && candidate.phone !== 'رقم محذوف' && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
            <PhoneCall className="w-4 h-4 text-emerald-700 shrink-0" />
            <span dir="ltr" className="font-mono font-bold text-slate-800">{candidate.phone}</span>
            {candidate.phoneVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg" title="تم التحقق من ملكية رقم الجوال عبر Firebase SMS">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>رقم موثق</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg" title="لم يتم تأكيد ملكية هذا الرقم عبر Firebase SMS">
                <span>رقم غير موثق</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{candidate.createdAt}</span>
          {onViewCV && (
            <button
              onClick={() => onViewCV(candidate)}
              className="text-emerald-700 hover:underline font-bold flex items-center gap-1 text-[11px]"
            >
              <FileText className="w-3 h-3" />
              عرض الـ CV
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {candidate.allowContact === false ? (
            <span className="text-[11px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1">
              <PhoneOff className="w-3.5 h-3.5" />
              التواصل موقوف
            </span>
          ) : (
            <>
              {/* WhatsApp Direct */}
              <button
                id={`btn-cand-wa-${candidate.id}`}
                onClick={() => {
                  if (!candidate.phoneVerified) {
                    if (!window.confirm('هذا الرقم لم يتم تأكيد ملكيته عبر NEXT JOB.\n\nهل تريد المتابعة إلى واتساب؟')) {
                      return;
                    }
                  }
                  onQuickWhatsApp(candidate);
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                title="تواصل مباشر عبر الواتساب"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>تواصل واتساب</span>
              </button>

              {/* Phone call */}
              <button
                id={`btn-cand-phone-${candidate.id}`}
                onClick={() => {
                  if (!candidate.phoneVerified) {
                    if (!window.confirm('هذا الرقم لم يتم تأكيد ملكيته عبر NEXT JOB.\n\nهل تريد المتابعة للاتصال؟')) {
                      return;
                    }
                  }
                  window.location.href = `tel:${candidate.phone}`;
                }}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 p-2 rounded-xl text-xs font-semibold transition-colors"
                title="اتصال هاتفي"
              >
                <PhoneCall className="w-4 h-4 text-emerald-700" />
              </button>
            </>
          )}

          {onReportCandidate && (
            <button
              onClick={() => onReportCandidate(candidate)}
              className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
              title="إبلاغ عن الحساب"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
