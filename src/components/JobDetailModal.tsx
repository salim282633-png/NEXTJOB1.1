import React, { useState } from 'react';
import { AlertTriangle, Banknote, Bookmark, Briefcase, Building2, Check, ExternalLink, MapPin, Share2, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { Job } from '../types';
import { createJobShareCard, shareImage } from '../lib/shareCards';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (job: Job) => void;
  onReportFraud?: (job: Job) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, onClose, isSaved, onToggleSave, onReportFraud }) => {
  const [sharing, setSharing] = useState(false);

  if (!job) return null;

  const applyUrl = job.applyUrl || job.sourceUrl || '#';

  const share = async () => {
    setSharing(true);
    try {
      const blob = await createJobShareCard(job);
      await shareImage(blob, `nextjob-${job.id}.png`, `${job.title} - ${job.company}`);
    } catch (error) {
      console.warn(error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200" role="dialog" aria-modal="true" aria-labelledby="job-detail-title">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">تفاصيل الفرصة</span>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-full flex gap-1"><ShieldCheck className="w-3.5 h-3.5" />مصدر خارجي</span>
          </div>
          <div className="flex gap-1">
            <button onClick={share} disabled={sharing} className="p-2 border rounded-xl text-slate-500" title="مشاركة"><Share2 className="w-4 h-4" /></button>
            <button onClick={() => onToggleSave(job)} className={`p-2 border rounded-xl ${isSaved ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500'}`} aria-label={isSaved ? 'إزالة من المحفوظات' : 'حفظ الفرصة'}><Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} /></button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-500" aria-label="إغلاق"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 id="job-detail-title" className="text-2xl font-black text-slate-900">{job.title}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600"><span className="flex gap-1"><Building2 className="w-4 h-4 text-emerald-600" />{job.company}</span><span className="flex gap-1"><MapPin className="w-4 h-4" />{job.city}</span></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[11px] text-slate-500 block">الراتب</span><strong className="text-sm">{job.salary || 'غير مذكور'}</strong></div>
            <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[11px] text-slate-500 block">الدوام</span><strong className="text-sm">{job.jobType}</strong></div>
            <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[11px] text-slate-500 block">الخبرة</span><strong className="text-sm">{job.experienceYears || 'حسب المصدر'}</strong></div>
            <div className="bg-slate-50 p-3 rounded-xl"><span className="text-[11px] text-slate-500 block">المصدر</span><strong className="text-sm">{job.sourceName || 'المصدر الأصلي'}</strong></div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950 leading-relaxed">
            <strong>تنبيه:</strong> NEXT JOB يعرض ملخصًا وإحالة فقط. راجع المصدر الأصلي للتحقق من المتطلبات والتفاصيل وحداثة الإعلان قبل التقديم.
          </div>

          <div><h3 className="font-bold flex gap-2 mb-2"><Briefcase className="w-4 h-4 text-emerald-600" />ملخص الفرصة</h3><div className="bg-slate-50 border rounded-2xl p-4 text-sm whitespace-pre-line leading-relaxed">{job.description}</div></div>
          {job.requirements?.length ? <div><h3 className="font-bold mb-2">المتطلبات المذكورة</h3><ul className="space-y-2">{job.requirements.map((item, index) => <li key={index} className="text-sm flex gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" />{item}</li>)}</ul></div> : null}

          <div className="rounded-3xl bg-slate-900 p-5 text-white space-y-3">
            <h4 className="font-bold">المصدر والتقديم</h4>
            <p className="text-xs leading-6 text-slate-300">المصدر: {job.sourceName || 'المصدر الأصلي'}{job.sourcePublishedAt ? ` · تاريخ النشر: ${job.sourcePublishedAt}` : ''}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-slate-950 font-bold rounded-2xl"><ExternalLink className="w-5 h-5" />التقديم عبر المصدر الأصلي</a>
              {job.sourceUrl && <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold"><ExternalLink className="w-5 h-5 text-emerald-400" />عرض الإعلان الأصلي</a>}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400"><span className="flex gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" />لا تدفع رسومًا مقابل وعد بالتوظيف.</span>{onReportFraud && <button onClick={() => onReportFraud(job)} className="text-rose-400 font-bold flex gap-1"><ShieldAlert className="w-3.5 h-3.5" />إبلاغ</button>}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
