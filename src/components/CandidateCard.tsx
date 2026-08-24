import React, { useEffect, useState } from 'react';
import { Briefcase, Camera, Car, CheckCircle2, Clock, FileText, MapPin, MessageCircle, PhoneCall, PhoneOff, Share2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Candidate, CandidateContact } from '../types';
import { auth, getCandidateContact } from '../lib/firebase';
import { CandidateAvatarUploader } from './CandidateAvatarUploader';
import { createCandidateShareCard, shareImage } from '../lib/shareCards';

interface CandidateCardProps {
  candidate: Candidate;
  onQuickWhatsApp: (cand: Candidate) => void;
  onViewCV?: (cand: Candidate) => void;
  onReportCandidate?: (cand: Candidate) => void;
}

function localContact(candidate: Candidate): CandidateContact | null {
  if (!candidate.phone || candidate.phone === 'رقم محذوف') return null;
  return { candidateId: candidate.id, phone: candidate.phone, phoneE164: candidate.phoneE164 || '', whatsapp: candidate.whatsapp || '', phoneVerified: candidate.phoneVerified, userId: candidate.userId || null, schemaVersion: 2 };
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onQuickWhatsApp, onViewCV, onReportCandidate }) => {
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

  const withContact: Candidate = contact ? { ...candidate, phone: contact.phone, phoneE164: contact.phoneE164, whatsapp: contact.whatsapp, phoneVerified: contact.phoneVerified, userId: contact.userId || undefined, avatarUrl } : { ...candidate, avatarUrl };
  const isOwner = Boolean(auth.currentUser && contact?.userId === auth.currentUser.uid);

  const share = async () => {
    if (candidate.isHidden) return;
    setSharing(true);
    try {
      const blob = await createCandidateShareCard(withContact);
      await shareImage(blob, `nextjob-candidate-${candidate.id}.png`, `${candidate.fullName} - ${candidate.profession}`);
    } catch (e) { console.warn(e); } finally { setSharing(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex gap-3 min-w-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">{avatarUrl ? <img src={avatarUrl} alt={`صورة ${candidate.fullName}`} className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-emerald-600" />}</div>
          <div className="min-w-0"><h3 className="text-lg font-black text-slate-900 truncate">{candidate.fullName}</h3><div className="flex items-center gap-1.5 text-emerald-700 text-sm font-bold mt-1"><Briefcase className="w-4 h-4" />{candidate.profession}</div></div>
        </div>
        <button onClick={share} disabled={sharing || candidate.isHidden} className="p-2 rounded-xl border text-slate-400 hover:text-emerald-700 disabled:opacity-40" title="مشاركة بطاقة صورة بدون بيانات التواصل"><Share2 className="w-4 h-4" /></button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3"><span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg flex gap-1"><ShieldCheck className="w-3 h-3" />{candidate.iqamaStatus}</span>{candidate.noExperience && <span className="text-[11px] font-bold bg-violet-50 text-violet-800 border border-violet-100 px-2 py-1 rounded-lg">بدون خبرة سابقة</span>}{candidate.availableImmediately && <span className="text-[11px] font-bold bg-teal-50 text-teal-800 px-2 py-1 rounded-lg">مباشر فورًا</span>}</div>

      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs mb-3"><span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-600" />{candidate.city}</span><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-emerald-600" />{candidate.noExperience ? 'بدون خبرة سابقة' : candidate.experienceYears}</span></div>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3">{candidate.bio}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">{(candidate.skills || []).map((s,i)=><span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{s}</span>)}{candidate.hasDriverLicense && <span className="text-[11px] bg-sky-50 text-sky-800 px-2 py-1 rounded-md flex gap-1"><Car className="w-3 h-3" />رخصة قيادة</span>}</div>
      {candidate.hobbies && candidate.hobbies.length > 0 && <div className="mb-4"><span className="text-[10px] font-bold text-slate-500 ml-1">هوايات واهتمامات:</span><div className="inline-flex flex-wrap gap-1">{candidate.hobbies.map((h,i)=><span key={i} className="text-[10px] bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md">{h}</span>)}</div></div>}

      {candidate.allowContact !== false && contact?.phone && <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 text-xs"><PhoneCall className="w-4 h-4 text-emerald-700" /><span dir="ltr" className="font-mono font-bold">{contact.phone}</span>{contact.phoneVerified ? <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg flex gap-1"><CheckCircle2 className="w-3 h-3" />رقم موثق</span> : <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg">رقم غير موثق</span>}</div>}

      {isOwner && <div className="mb-4"><button onClick={() => setShowAvatarEditor(v => !v)} className="text-[11px] font-bold text-emerald-700 flex items-center gap-1"><Camera className="w-3.5 h-3.5" />{avatarUrl ? 'تغيير الصورة الشخصية' : 'إضافة صورة شخصية 1:1'}</button>{showAvatarEditor && <div className="mt-2"><CandidateAvatarUploader candidateId={candidate.id} currentUrl={avatarUrl} onUpdated={url => { setAvatarUrl(url); setShowAvatarEditor(false); }} /></div>}</div>}

      <div className="pt-3 border-t flex items-center justify-between gap-2">
        <div className="flex gap-2 text-[11px] text-slate-400">{onViewCV && <button onClick={() => onViewCV(withContact)} className="text-emerald-700 font-bold flex gap-1"><FileText className="w-3 h-3" />عرض CV</button>}</div>
        <div className="flex gap-2 items-center">
          {candidate.allowContact === false ? <span className="text-[11px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl flex gap-1"><PhoneOff className="w-3.5 h-3.5" />التواصل موقوف</span> : contact ? <><button onClick={() => { if (!contact.phoneVerified && !window.confirm('هذا الرقم غير موثق. هل تريد المتابعة؟')) return; onQuickWhatsApp(withContact); }} className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold"><MessageCircle className="w-3.5 h-3.5" />واتساب</button><button onClick={() => { if (!contact.phoneVerified && !window.confirm('هذا الرقم غير موثق. هل تريد المتابعة؟')) return; window.location.href=`tel:${contact.phone}`; }} className="p-2 bg-slate-100 rounded-xl"><PhoneCall className="w-4 h-4 text-emerald-700" /></button></> : !loading && <span className="text-[11px] text-slate-400">التواصل غير متاح</span>}
          {onReportCandidate && <button onClick={() => onReportCandidate(candidate)} className="p-2 text-slate-300 hover:text-rose-600"><ShieldAlert className="w-3.5 h-3.5" /></button>}
        </div>
      </div>
    </div>
  );
};
