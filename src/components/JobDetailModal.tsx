import React, { useEffect, useState } from 'react';
import { AlertTriangle, Banknote, Bookmark, Briefcase, Building2, Check, FileText, Flame, MapPin, MessageCircle, PhoneCall, Share2, ShieldAlert, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Job } from '../types';
import { isUrgentActive, urgentWindowLabel } from '../lib/jobDiscovery';
import { createJobShareCard, shareImage } from '../lib/shareCards';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (job: Job) => void;
  onOpenAICoverLetterForJob: (job: Job) => void;
  onReportFraud?: (job: Job) => void;
  onBumpJob?: (jobId: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, isSaved, onToggleSave, onOpenAICoverLetterForJob, onReportFraud }) => {
  const [now, setNow] = useState(Date.now());
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!job) return null;

  const urgentActive = isUrgentActive(job, now);
  const cleanPhone = (job.whatsapp || job.phone).replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(`السلام عليكم، بخصوص إعلان وظيفة (${job.title}) في NEXT JOB، أود التقديم والاستفسار عن الشاغر.`);

  const share = async () => {
    setSharing(true);
    try {
      const blob = await createJobShareCard(job);
      await shareImage(blob, `nextjob-${job.id}.png`, `${job.title} - ${job.company}`);
    } catch (e) { console.warn(e); } finally { setSharing(false); }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">تفاصيل الوظيفة</span>
            {urgentActive && <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full flex gap-1"><Flame className="w-3.5 h-3.5" />{urgentWindowLabel(job)}</span>}
            {job.status === 'recently_confirmed' && <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full flex gap-1"><ShieldCheck className="w-3.5 h-3.5" />مؤكدة حديثًا</span>}
          </div>
          <div className="flex gap-1">
            <button onClick={share} disabled={sharing} className="p-2 border rounded-xl text-slate-500" title="مشاركة بطاقة صورة"><Share2 className="w-4 h-4" /></button>
            <button onClick={() => onToggleSave(job)} className={`p-2 border rounded-xl ${isSaved ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500'}`}><Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} /></button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-500"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{job.title}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600"><span className="flex gap-1"><Building2 className="w-4 h-4 text-emerald-600" />{job.company}</span><span className="flex gap-1"><MapPin className="w-4 h-4" />{job.city}</span></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[11px] text-slate-500 block">الراتب</span><strong className="text-sm">{job.salary || 'يحدد لاحقًا'}</strong></div>
            <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[11px] text-slate-500 block">الدوام</span><strong className="text-sm">{job.jobType}</strong></div>
            <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[11px] text-slate-500 block">الخبرة</span><strong className="text-sm">{job.experienceYears}</strong></div>
            <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[11px] text-slate-500 block">نقل الخدمات</span><strong className="text-sm">{job.sponsorshipTransfer ? 'متاح' : 'حسب الاتفاق'}</strong></div>
          </div>

          <div><h3 className="font-bold flex gap-2 mb-2"><Briefcase className="w-4 h-4 text-emerald-600" />تفاصيل العمل</h3><div className="bg-slate-50 border rounded-2xl p-4 text-sm whitespace-pre-line leading-relaxed">{job.description}</div></div>
          {job.requirements?.length ? <div><h3 className="font-bold mb-2">المتطلبات</h3><ul className="space-y-2">{job.requirements.map((r,i)=><li key={i} className="text-sm flex gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" />{r}</li>)}</ul></div> : null}

          <button onClick={() => onOpenAICoverLetterForJob(job)} className="w-full rounded-2xl border border-teal-200 bg-teal-50 text-teal-800 px-4 py-3 font-bold text-sm flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" />إنشاء رسالة تقديم ذكية</button>

          <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3">
            <h4 className="font-bold">التواصل المباشر مع صاحب العمل</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <a href={`https://wa.me/${cleanPhone}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-slate-950 font-bold rounded-2xl"><MessageCircle className="w-5 h-5" />واتساب</a>
              <button onClick={() => window.location.href = `tel:${job.phone}`} className="flex items-center justify-center gap-2 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold"><PhoneCall className="w-5 h-5 text-emerald-400" /><span dir="ltr">{job.phone}</span></button>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400"><span className="flex gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" />لا تدفع أي رسوم توظيف.</span>{onReportFraud && <button onClick={() => onReportFraud(job)} className="text-rose-400 font-bold flex gap-1"><ShieldAlert className="w-3.5 h-3.5" />إبلاغ</button>}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
