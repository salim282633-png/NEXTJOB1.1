import React, { useEffect, useState } from 'react';
import { Briefcase, Camera, Car, CheckCircle2, Clock, FileText, MapPin, MessageCircle, PhoneCall, PhoneOff, Share2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Candidate, CandidateContact } from '../types';
import { getCandidateContact } from '../lib/firebase';
import { CandidateAvatarUploader } from './CandidateAvatarUploader';
import { createCandidateShareCard, shareImage } from '../lib/shareCards';

interface CandidateCardProps {
  candidate: Candidate;
  onQuickWhatsApp: (cand: Candidate) => void;
  onViewCV?: (cand: Candidate) => void;
  onReportCandidate?: (cand: Candidate) => void;
  isOwner?: boolean;
}

function localContact(candidate: Candidate): CandidateContact | null {
  if (!candidate.phone || candidate.phone === 'رقم محذوف') return null;
  return {
    candidateId: candidate.id,
    phone: candidate.phone,
    whatsapp: candidate.whatsapp || '',
    phoneVerified: candidate.phoneVerified,
    schemaVersion: 3
  };
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onQuickWhatsApp, onViewCV, onReportCandidate, isOwner = false }) => {
  const [contact, setContact] = useState<CandidateContact | null>(() => localContact(candidate));
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(candidate.avatarUrl || '');
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const local = localContact(candidate);
    if (local) { setContact(local); return; }
    setLoading(true);
    getCandidateContact(candidate.id).then(value => { if (!cancelled) setContact(value); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [candidate.id, candidate.phone, candidate.allowContact]);

  useEffect(() => setAvatarUrl(candidate.avatarUrl || ''), [candidate.avatarUrl]);

  const withContact: Candidate = contact
    ? { ...candidate, phone: contact.phone, whatsapp: contact.whatsapp, phoneVerified: contact.phoneVerified, avatarUrl }
    : { ...candidate, avatarUrl };

  const share = async () => {
    if (candidate.isHidden) return;
    setSharing(true);
    try {
      const blob = await createCandidateShareCard(withContact);
      await shareImage(blob, `nextjob-candidate-${candidate.id}.png`, `${candidate.fullName} - ${candidate.profession}`);
    } catch (e) {
      console.warn(e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <article className="bg-white rounded-[24px] border border-slate-200/90 p-4 sm:p-5 shadow-[0_10px_30px_rgba(15,23,42,0.045)] hover:border-emerald-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.075)] transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex gap-3 min-w-0">
          <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-[18px] overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-inner">
            {avatarUrl ? <img src={avatarUrl} alt={`صورة ${candidate.fullName}`} className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-emerald-600" />}
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-[19px] sm:text-xl font-black text-slate-950 truncate font-display">{candidate.fullName}</h3>
            <div className="flex items-center gap-1.5 text-emerald-700 text-[13px] sm:text-sm font-extrabold mt-1.5 min-w-0"><Briefcase className="w-4 h-4 shrink-0" /><span className="truncate">{candidate.profession}</span></div>
          </div>
        </div>
        <button onClick={share} disabled={sharing || candidate.isHidden} className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition-colors disabled:opacity-40 shrink-0" title="مشاركة بطاقة صورة بدون بيانات التواصل"><Share2 className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3.5">
        <span className="text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{candidate.iqamaStatus}</span>
        {candidate.noExperience && <span className="text-[10px] sm:text-[11px] font-bold bg-violet-50 text-violet-800 border border-violet-100 px-2.5 py-1 rounded-lg">بدون خبرة سابقة</span>}
        {candidate.availableImmediately && <span className="text-[10px] sm:text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-100 px-2.5 py-1 rounded-lg">مباشر فورًا</span>}
      </div>

      <div className="grid grid-cols-2 gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-xs sm:text-[13px] mb-3.5">
        <span className="flex items-center gap-1.5 font-bold text-slate-700 min-w-0"><MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" /><span className="truncate">{candidate.city}</span></span>
        <span className="flex items-center gap-1.5 font-bold text-slate-700 min-w-0"><Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" /><span className="truncate">{candidate.noExperience ? 'بدون خبرة' : candidate.experienceYears}</span></span>
      </div>

      <p className="text-[13px] sm:text-sm text-slate-600 leading-7 line-clamp-3 mb-3.5">{candidate.bio}</p>

      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {(candidate.skills || []).map((s, i) => <span key={i} className="text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/70">{s}</span>)}
        {candidate.hasDriverLicense && <span className="text-[10px] sm:text-[11px] bg-sky-50 text-sky-800 border border-sky-100 px-2.5 py-1 rounded-lg flex items-center gap-1"><Car className="w-3 h-3" />رخصة قيادة</span>}
      </div>

      {candidate.hobbies && candidate.hobbies.length > 0 && (
        <div className="mb-4 pt-1">
          <span className="text-[10px] font-bold text-slate-500 ml-1">هوايات واهتمامات:</span>
          <div className="inline-flex flex-wrap gap-1">{candidate.hobbies.map((h, i) => <span key={i} className="text-[10px] bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md">{h}</span>)}</div>
        </div>
      )}

      {candidate.allowContact !== false && contact?.phone && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs">
          <PhoneCall className="w-4 h-4 text-emerald-700" />
          <span dir="ltr" className="font-mono font-bold text-slate-800">{contact.phone}</span>
          {contact.phoneVerified ? <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />رقم موثق</span> : <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg">رقم غير موثق</span>}
        </div>
      )}

      {isOwner && (
        <div className="mb-4">
          <button onClick={() => setShowAvatarEditor(v => !v)} className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" />{avatarUrl ? 'تغيير الصورة الشخصية' : 'إضافة صورة شخصية 1:1'}</button>
          {showAvatarEditor && <div className="mt-2"><CandidateAvatarUploader candidateId={candidate.id} currentUrl={avatarUrl} onUpdated={url => { setAvatarUrl(url); setShowAvatarEditor(false); }} /></div>}
        </div>
      )}

      <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 text-[11px] text-slate-400">
          {onViewCV && <button onClick={() => onViewCV(withContact)} className="min-h-9 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"><FileText className="w-3.5 h-3.5" />عرض CV</button>}
        </div>
        <div className="flex gap-2 items-center justify-end">
          {candidate.allowContact === false ? (
            <span className="text-[11px] bg-slate-100 text-slate-500 px-3 py-2 rounded-xl flex items-center gap-1"><PhoneOff className="w-3.5 h-3.5" />التواصل موقوف</span>
          ) : contact ? (
            <>
              <button onClick={() => { if (!contact.phoneVerified && !window.confirm('هذا الرقم غير موثق. هل تريد المتابعة؟')) return; onQuickWhatsApp(withContact); }} className="min-h-10 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors"><MessageCircle className="w-3.5 h-3.5" />واتساب</button>
              <button onClick={() => { if (!contact.phoneVerified && !window.confirm('هذا الرقم غير موثق. هل تريد المتابعة؟')) return; window.location.href=`tel:${contact.phone}`; }} className="w-10 h-10 inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"><PhoneCall className="w-4 h-4 text-emerald-700" /></button>
            </>
          ) : !loading && <span className="text-[11px] text-slate-400">التواصل غير متاح</span>}
          {onReportCandidate && <button onClick={() => onReportCandidate(candidate)} className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="إبلاغ"><ShieldAlert className="w-3.5 h-3.5" /></button>}
        </div>
      </div>
    </article>
  );
};
