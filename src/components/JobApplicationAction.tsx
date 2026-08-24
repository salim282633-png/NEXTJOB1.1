import React, { useEffect, useState } from 'react';
import { CheckCircle2, Send, UserRoundCheck, XCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Application, Candidate, Job } from '../types';

interface Props { job: Job; user: User | null; candidate: Candidate | null; }

function statusLabel(status: Application['status']) {
  if (status === 'viewed') return 'اطّلع صاحب العمل على طلبك';
  if (status === 'shortlisted') return 'تم ترشيحك مبدئيًا';
  if (status === 'rejected') return 'تم إغلاق الطلب';
  if (status === 'withdrawn') return 'تم سحب الطلب';
  return 'تم إرسال طلبك';
}

export const JobApplicationAction: React.FC<Props> = ({ job, user, candidate }) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const applicationId = job.userId && user && job.userId !== user.uid ? `${job.id}__${user.uid}` : '';

  useEffect(() => {
    if (!applicationId) { setApplication(null); return; }
    return onSnapshot(doc(db, 'applications', applicationId), snap => {
      setApplication(snap.exists() ? ({ id: snap.id, ...snap.data() } as Application) : null);
    }, () => setApplication(null));
  }, [applicationId]);

  if (!job.userId) return null;
  if (!user) return <div className="mt-2 text-[11px] text-slate-500">سجّل الدخول للتقديم عبر NEXT JOB.</div>;
  if (job.userId === user.uid) return null;
  if (!candidate) return <div className="mt-2 text-[11px] text-amber-700">أنشئ ملفك المهني أولًا لربط طلب التقديم بملفك.</div>;

  const submit = async () => {
    setBusy(true); setError('');
    const ref = doc(db, 'applications', `${job.id}__${user.uid}`);
    try {
      await runTransaction(db, async tx => {
        const existing = await tx.get(ref);
        const jobSnap = await tx.get(doc(db, 'jobs', job.id));
        if (existing.exists()) throw new Error('ALREADY_EXISTS');
        if (!jobSnap.exists() || jobSnap.data().status === 'closed') throw new Error('JOB_CLOSED');
        if (jobSnap.data().userId !== job.userId) throw new Error('OWNER_CHANGED');
        tx.set(ref, {
          jobId: job.id,
          candidateId: candidate.id,
          applicantUid: user.uid,
          employerUid: job.userId,
          status: 'submitted',
          candidateSnapshot: {
            fullName: candidate.fullName,
            profession: candidate.profession,
            city: candidate.city,
            skills: (candidate.skills || []).slice(0, 12),
            ...(candidate.avatarUrl ? { avatarUrl: candidate.avatarUrl } : {})
          },
          jobSnapshot: { title: job.title, company: job.company, city: job.city },
          createdAt: new Date().toISOString(),
          createdAtServer: serverTimestamp()
        });
      });
    } catch (e) {
      const code = e instanceof Error ? e.message : '';
      setError(code === 'ALREADY_EXISTS' ? 'سبق إرسال طلب لهذه الوظيفة.' : 'تعذر إرسال الطلب. تحقق من أن الوظيفة ما زالت متاحة.');
    } finally { setBusy(false); }
  };

  const withdraw = async () => {
    if (!application) return;
    setBusy(true); setError('');
    try {
      await runTransaction(db, async tx => {
        const ref = doc(db, 'applications', application.id);
        const snap = await tx.get(ref);
        if (!snap.exists() || snap.data().applicantUid !== user.uid) throw new Error('NOT_OWNER');
        if (snap.data().status === 'withdrawn') return;
        tx.update(ref, { status: 'withdrawn', updatedAt: new Date().toISOString(), updatedAtServer: serverTimestamp() });
      });
    } catch { setError('تعذر سحب الطلب.'); } finally { setBusy(false); }
  };

  if (application) return (
    <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-emerald-800 flex items-center gap-1"><UserRoundCheck className="w-3.5 h-3.5" />{statusLabel(application.status)}</span>
        {application.status !== 'withdrawn' && application.status !== 'rejected' && <button disabled={busy} onClick={withdraw} className="text-slate-500 hover:text-rose-700 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />سحب</button>}
      </div>
      {error && <div className="text-rose-700 mt-1">{error}</div>}
    </div>
  );

  return <div className="mt-2"><button disabled={busy || job.status === 'closed'} onClick={submit} className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50">{busy ? <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" /> : <Send className="w-3.5 h-3.5" />}التقديم عبر NEXT JOB</button>{error && <div className="text-[11px] text-rose-700 mt-1">{error}</div>}</div>;
};
