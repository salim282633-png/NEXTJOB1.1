import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, UserRoundCheck, XCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, doc, getDoc, limit, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { Application, ApplicationStatus, Candidate, Job } from '../types';
import { db } from '../lib/firebase';

interface Props { user: User; }
interface EnrichedApplication { application: Application; candidate: Candidate | null; job: Job | null; }

const labels: Record<ApplicationStatus, string> = {
  submitted: 'جديد', viewed: 'تم الاطلاع', shortlisted: 'مرشح', rejected: 'مرفوض', withdrawn: 'مسحوب'
};

export const EmployerApplicationsPanel: React.FC<Props> = ({ user }) => {
  const [items, setItems] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const q = query(collection(db, 'applications'), where('employerUid', '==', user.uid), limit(100));
    const unsubscribe = onSnapshot(q, async snap => {
      const apps = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
      const enriched = await Promise.all(apps.map(async application => {
        const [jobResult, candidateResult] = await Promise.all([
          getDoc(doc(db, 'jobs', application.jobId)).then(s => s.exists() ? ({ id:s.id, ...s.data() } as Job) : null).catch(() => null),
          // If the candidate is hidden, Firestore Rules intentionally reject this get.
          getDoc(doc(db, 'candidates', application.candidateId)).then(s => s.exists() ? ({ id:s.id, phone:'', whatsapp:'', ...s.data() } as Candidate) : null).catch(() => null)
        ]);
        return { application, candidate: candidateResult, job: jobResult };
      }));
      if (!cancelled) { setItems(enriched); setLoading(false); }
    }, err => { console.warn(err); if (!cancelled) { setLoading(false); setError('تعذر تحميل طلبات التقديم.'); } });
    return () => { cancelled = true; unsubscribe(); };
  }, [user.uid]);

  const updateStatus = async (app: Application, status: 'viewed'|'shortlisted'|'rejected') => {
    setBusy(app.id); setError('');
    try {
      await runTransaction(db, async tx => {
        const ref = doc(db, 'applications', app.id);
        const snap = await tx.get(ref);
        if (!snap.exists() || snap.data().employerUid !== user.uid) throw new Error('NOT_OWNER');
        if (snap.data().status === 'withdrawn') throw new Error('WITHDRAWN');
        tx.update(ref, { status, updatedAt: new Date().toISOString(), updatedAtServer: serverTimestamp() });
      });
    } catch { setError('تعذر تحديث حالة الطلب. قد يكون المتقدم قد سحب طلبه.'); } finally { setBusy(''); }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div><h3 className="font-black text-slate-900 flex items-center gap-2"><UserRoundCheck className="w-4 h-4 text-teal-700" />طلبات التقديم على إعلاناتك</h3><p className="text-[11px] text-slate-500 mt-1">الطلب مرتبط بالوظيفة والباحث. الملف المخفي يبقى مخفيًا ولا يكشف بياناته لصاحب العمل من خلال هذا المسار.</p></div>
        <span className="text-xs bg-teal-50 text-teal-800 px-2 py-1 rounded-lg font-bold">{items.length}</span>
      </div>
      {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-2">{error}</div>}
      {loading ? <div className="py-6 text-center text-xs text-slate-500">جارٍ تحميل الطلبات...</div> : items.length === 0 ? <div className="py-6 text-center text-xs text-slate-500">لا توجد طلبات تقديم حتى الآن.</div> : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto">
          {items.map(({ application: app, candidate, job }) => (
            <div key={app.id} className="border rounded-xl p-3 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="flex gap-3 min-w-0">
                {candidate?.avatarUrl ? <img src={candidate.avatarUrl} alt="" className="w-11 h-11 rounded-xl object-cover border shrink-0" /> : <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />}
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{candidate?.fullName || 'ملف باحث مخفي أو غير متاح'}</div>
                  <div className="text-xs text-slate-500 truncate">{candidate ? `${candidate.profession} · ${candidate.city}` : `Candidate ID: ${app.candidateId}`}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-1">على: {job?.title || app.jobId}{job?.company ? ` · ${job.company}` : ''}</div>
                  {candidate?.skills?.length ? <div className="text-[10px] text-teal-700 mt-1 truncate">{candidate.skills.slice(0,5).join(' · ')}</div> : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center shrink-0">
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-lg font-bold">{labels[app.status]}</span>
                {app.status !== 'withdrawn' && <>
                  <button disabled={busy===app.id} onClick={()=>updateStatus(app,'viewed')} className="p-2 rounded-lg bg-sky-50 text-sky-700" title="تم الاطلاع"><Eye className="w-3.5 h-3.5" /></button>
                  <button disabled={busy===app.id} onClick={()=>updateStatus(app,'shortlisted')} className="p-2 rounded-lg bg-emerald-50 text-emerald-700" title="ترشيح"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                  <button disabled={busy===app.id} onClick={()=>updateStatus(app,'rejected')} className="p-2 rounded-lg bg-rose-50 text-rose-700" title="رفض"><XCircle className="w-3.5 h-3.5" /></button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
