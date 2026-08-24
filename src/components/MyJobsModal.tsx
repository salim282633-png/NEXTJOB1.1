import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock3,
  Edit3,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { JOB_CATEGORIES, SAUDI_CITIES } from '../lib/data';
import { Job } from '../types';

interface MyJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const BUMP_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const CONFIRM_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function remainingLabel(value: unknown, windowMs: number): string {
  const usedAt = toMillis(value);
  if (!usedAt) return '';
  const remaining = usedAt + windowMs - Date.now();
  if (remaining <= 0) return '';
  const hours = Math.ceil(remaining / (60 * 60 * 1000));
  return `${hours} س`;
}

function statusLabel(status: Job['status']) {
  if (status === 'closed') return 'مغلقة';
  if (status === 'awaiting_confirmation') return 'بانتظار تأكيد الاستمرار';
  if (status === 'recently_confirmed') return 'مؤكدة حديثًا';
  return 'نشطة';
}

function cleanUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

export const MyJobsModal: React.FC<MyJobsModalProps> = ({ isOpen, onClose, user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<Partial<Job>>({});
  const [requirementsText, setRequirementsText] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const q = query(collection(db, 'jobs'), where('userId', '==', user.uid), limit(100));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const owned = snapshot.docs
          .map(item => ({ id: item.id, ...item.data() } as Job))
          .sort((a, b) => {
            const aTime = toMillis(a.activityAt) || toMillis(a.createdAtServer) || Date.parse(a.createdAt) || 0;
            const bTime = toMillis(b.activityAt) || toMillis(b.createdAtServer) || Date.parse(b.createdAt) || 0;
            return bTime - aTime;
          });
        setJobs(owned);
        setLoading(false);
      },
      err => {
        console.error('My jobs query failed:', err);
        setError('تعذر تحميل إعلاناتك. تحقق من صلاحيات Firestore ثم حاول مجددًا.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [isOpen, user.uid]);

  const stats = useMemo(() => ({
    total: jobs.length,
    open: jobs.filter(j => j.status !== 'closed').length,
    closed: jobs.filter(j => j.status === 'closed').length
  }), [jobs]);

  if (!isOpen) return null;

  const flash = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 2500);
  };

  const assertOwner = (data: Record<string, unknown>) => {
    if (data.userId !== user.uid) throw new Error('NOT_OWNER');
  };

  const runLifecycle = async (job: Job, action: 'close' | 'reopen' | 'confirm' | 'bump') => {
    setBusyId(job.id);
    setError('');
    const ref = doc(db, 'jobs', job.id);
    const nowIso = new Date().toISOString();

    try {
      await runTransaction(db, async transaction => {
        const snap = await transaction.get(ref);
        if (!snap.exists()) throw new Error('NOT_FOUND');
        const current = snap.data() as Record<string, unknown>;
        assertOwner(current);
        const status = current.status as Job['status'];

        if (action === 'close') {
          if (status === 'closed') throw new Error('ALREADY_CLOSED');
          transaction.update(ref, {
            status: 'closed',
            closedAt: serverTimestamp(),
            updatedAt: nowIso,
            updatedAtServer: serverTimestamp()
          });
          return;
        }

        if (action === 'reopen') {
          if (status !== 'closed') throw new Error('NOT_CLOSED');
          transaction.update(ref, {
            status: 'active',
            reopenedAt: serverTimestamp(),
            updatedAt: nowIso,
            updatedAtServer: serverTimestamp()
          });
          return;
        }

        if (status === 'closed') throw new Error('CLOSED_JOB');

        if (action === 'confirm') {
          const lastConfirmed = toMillis(current.lastConfirmedAtServer);
          if (lastConfirmed && Date.now() - lastConfirmed < CONFIRM_COOLDOWN_MS) {
            throw new Error('CONFIRM_COOLDOWN');
          }
          transaction.update(ref, {
            status: 'recently_confirmed',
            lastConfirmedAt: nowIso,
            lastConfirmedAtServer: serverTimestamp(),
            updatedAt: nowIso,
            updatedAtServer: serverTimestamp()
          });
          return;
        }

        const lastBumped = toMillis(current.lastBumpedAt);
        if (lastBumped && Date.now() - lastBumped < BUMP_COOLDOWN_MS) {
          throw new Error('BUMP_COOLDOWN');
        }
        transaction.update(ref, {
          lastBumpedAt: serverTimestamp(),
          activityAt: serverTimestamp(),
          updatedAt: nowIso,
          updatedAtServer: serverTimestamp()
        });
      });

      if (action === 'close') flash('تم إغلاق الإعلان وإخفاؤه عن القائمة العامة.');
      if (action === 'reopen') flash('تمت إعادة فتح الإعلان.');
      if (action === 'confirm') flash('تم تأكيد استمرار الشاغر.');
      if (action === 'bump') flash('تم رفع الإعلان للأعلى.');
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'BUMP_COOLDOWN') setError('يمكن رفع الإعلان مرة واحدة كل 24 ساعة.');
      else if (code === 'CONFIRM_COOLDOWN') setError('يمكن تأكيد استمرار الشاغر مرة واحدة كل 24 ساعة.');
      else if (code === 'NOT_OWNER') setError('لا تملك صلاحية إدارة هذا الإعلان.');
      else setError('تعذر تنفيذ العملية. قد تكون حالة الإعلان تغيرت أو القواعد لم تُنشر بعد.');
      console.error('Job lifecycle action failed:', err);
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (job: Job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      company: job.company,
      city: job.city,
      category: job.category,
      salary: job.salary,
      jobType: job.jobType,
      experienceYears: job.experienceYears,
      description: job.description,
      phone: job.phone,
      whatsapp: job.whatsapp,
      contactPerson: job.contactPerson || '',
      sponsorshipTransfer: job.sponsorshipTransfer,
      accommodationProvided: job.accommodationProvided,
      transportationProvided: job.transportationProvided,
      mealsProvided: Boolean(job.mealsProvided),
      overtimeAvailable: Boolean(job.overtimeAvailable)
    });
    setRequirementsText((job.requirements || []).join('\n'));
    setError('');
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    if (!form.title?.trim() || !form.company?.trim() || !form.description?.trim() || !form.phone?.trim()) {
      setError('المسمى واسم المنشأة والوصف ورقم التواصل حقول إلزامية.');
      return;
    }

    setBusyId(editingJob.id);
    setError('');
    const ref = doc(db, 'jobs', editingJob.id);
    const requirements = requirementsText.split('\n').map(v => v.trim()).filter(Boolean);
    const nowIso = new Date().toISOString();

    try {
      await runTransaction(db, async transaction => {
        const snap = await transaction.get(ref);
        if (!snap.exists()) throw new Error('NOT_FOUND');
        assertOwner(snap.data() as Record<string, unknown>);
        transaction.update(ref, cleanUndefined({
          title: form.title!.trim(),
          company: form.company!.trim(),
          city: form.city,
          category: form.category,
          salary: form.salary?.trim() || 'يحدد بعد المقابلة',
          jobType: form.jobType,
          experienceYears: form.experienceYears?.trim() || 'غير محدد',
          description: form.description!.trim(),
          requirements,
          phone: form.phone!.trim(),
          whatsapp: (form.whatsapp?.trim() || form.phone!.trim()).replace(/^0/, '966'),
          contactPerson: form.contactPerson?.trim() || '',
          sponsorshipTransfer: Boolean(form.sponsorshipTransfer),
          accommodationProvided: Boolean(form.accommodationProvided),
          transportationProvided: Boolean(form.transportationProvided),
          mealsProvided: Boolean(form.mealsProvided),
          overtimeAvailable: Boolean(form.overtimeAvailable),
          updatedAt: nowIso,
          updatedAtServer: serverTimestamp()
        }));
      });
      setEditingJob(null);
      flash('تم حفظ تعديلات الإعلان.');
    } catch (err) {
      console.error('Job edit failed:', err);
      setError('تعذر حفظ التعديلات. تحقق من ملكية الإعلان وقواعد Firestore.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto" dir="rtl">
      <div className="max-w-5xl mx-auto bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        <div className="bg-slate-900 text-white px-5 sm:px-7 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-400" /> إعلاناتي</h2>
            <p className="text-xs text-slate-400 mt-1">إدارة الإعلانات المرتبطة بحسابك فقط</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border rounded-2xl p-3 text-center"><strong className="text-xl block">{stats.total}</strong><span className="text-xs text-slate-500">الكل</span></div>
            <div className="bg-white border rounded-2xl p-3 text-center"><strong className="text-xl text-emerald-700 block">{stats.open}</strong><span className="text-xs text-slate-500">مفتوحة</span></div>
            <div className="bg-white border rounded-2xl p-3 text-center"><strong className="text-xl text-slate-600 block">{stats.closed}</strong><span className="text-xs text-slate-500">مغلقة</span></div>
          </div>

          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{success}</div>}

          {editingJob ? (
            <form onSubmit={saveEdit} className="bg-white border rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex justify-between items-center"><h3 className="font-bold">تعديل: {editingJob.title}</h3><button type="button" onClick={() => setEditingJob(null)} className="text-xs text-slate-500">إلغاء التعديل</button></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.title || ''} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} placeholder="المسمى الوظيفي" className="px-3 py-2 border rounded-xl text-sm" />
                <input value={form.company || ''} onChange={e => setForm(v => ({ ...v, company: e.target.value }))} placeholder="اسم المنشأة" className="px-3 py-2 border rounded-xl text-sm" />
                <select value={form.city || ''} onChange={e => setForm(v => ({ ...v, city: e.target.value }))} className="px-3 py-2 border rounded-xl text-sm">{SAUDI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select value={form.category || ''} onChange={e => setForm(v => ({ ...v, category: e.target.value }))} className="px-3 py-2 border rounded-xl text-sm">{JOB_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                <input value={form.salary || ''} onChange={e => setForm(v => ({ ...v, salary: e.target.value }))} placeholder="الراتب" className="px-3 py-2 border rounded-xl text-sm" />
                <select value={form.jobType || 'دوام كامل'} onChange={e => setForm(v => ({ ...v, jobType: e.target.value as Job['jobType'] }))} className="px-3 py-2 border rounded-xl text-sm"><option>دوام كامل</option><option>دوام جزئي</option><option>عمل حر / بالقطعة</option><option>عقد مؤقت</option></select>
                <input value={form.experienceYears || ''} onChange={e => setForm(v => ({ ...v, experienceYears: e.target.value }))} placeholder="الخبرة المطلوبة" className="px-3 py-2 border rounded-xl text-sm" />
                <input value={form.phone || ''} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))} placeholder="رقم الاتصال" className="px-3 py-2 border rounded-xl text-sm" />
                <input value={form.whatsapp || ''} onChange={e => setForm(v => ({ ...v, whatsapp: e.target.value }))} placeholder="واتساب" className="px-3 py-2 border rounded-xl text-sm" />
                <input value={form.contactPerson || ''} onChange={e => setForm(v => ({ ...v, contactPerson: e.target.value }))} placeholder="مسؤول التواصل" className="px-3 py-2 border rounded-xl text-sm" />
              </div>
              <textarea value={form.description || ''} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={4} placeholder="تفاصيل الوظيفة" className="w-full px-3 py-2 border rounded-xl text-sm" />
              <textarea value={requirementsText} onChange={e => setRequirementsText(e.target.value)} rows={3} placeholder="الشروط - شرط في كل سطر" className="w-full px-3 py-2 border rounded-xl text-sm" />
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {([
                  ['sponsorshipTransfer', 'نقل خدمات'],
                  ['accommodationProvided', 'سكن'],
                  ['transportationProvided', 'مواصلات'],
                  ['mealsProvided', 'وجبات'],
                  ['overtimeAvailable', 'إضافي']
                ] as const).map(([key, label]) => <label key={key} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg"><input type="checkbox" checked={Boolean(form[key])} onChange={e => setForm(v => ({ ...v, [key]: e.target.checked }))} />{label}</label>)}
              </div>
              <button disabled={busyId === editingJob.id} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">حفظ التعديلات</button>
            </form>
          ) : loading ? (
            <div className="p-10 text-center text-sm text-slate-500">جارٍ تحميل إعلاناتك...</div>
          ) : jobs.length === 0 ? (
            <div className="p-10 text-center bg-white border rounded-2xl text-sm text-slate-500">لا توجد إعلانات مرتبطة بحسابك حتى الآن.</div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => {
                const bumpWait = remainingLabel(job.lastBumpedAt, BUMP_COOLDOWN_MS);
                const confirmWait = remainingLabel(job.lastConfirmedAtServer, CONFIRM_COOLDOWN_MS);
                const isClosed = job.status === 'closed';
                const busy = busyId === job.id;
                return (
                  <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div><h3 className="font-black text-slate-900">{job.title}</h3><p className="text-xs text-slate-500 mt-1">{job.company} · {job.city}</p></div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isClosed ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>{statusLabel(job.status)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button disabled={busy} onClick={() => startEdit(job)} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold flex gap-1 items-center"><Edit3 className="w-3.5 h-3.5" /> تعديل</button>
                      {isClosed ? (
                        <button disabled={busy} onClick={() => runLifecycle(job, 'reopen')} className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex gap-1 items-center"><PlayCircle className="w-3.5 h-3.5" /> إعادة فتح</button>
                      ) : (
                        <button disabled={busy} onClick={() => runLifecycle(job, 'close')} className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold flex gap-1 items-center"><PauseCircle className="w-3.5 h-3.5" /> إغلاق</button>
                      )}
                      {!isClosed && <button disabled={busy || Boolean(confirmWait)} onClick={() => runLifecycle(job, 'confirm')} className="px-3 py-2 bg-teal-50 text-teal-800 rounded-xl text-xs font-bold flex gap-1 items-center disabled:opacity-50"><ShieldCheck className="w-3.5 h-3.5" /> تأكيد الاستمرار {confirmWait && `(${confirmWait})`}</button>}
                      {!isClosed && <button disabled={busy || Boolean(bumpWait)} onClick={() => runLifecycle(job, 'bump')} className="px-3 py-2 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold flex gap-1 items-center disabled:opacity-50"><RefreshCw className="w-3.5 h-3.5" /> رفع الإعلان {bumpWait && `(${bumpWait})`}</button>}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> Cooldown للرفع والتأكيد: 24 ساعة لكل عملية.</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
