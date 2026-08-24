import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Briefcase, CheckCircle2, Clock3, Edit3, PauseCircle, PlayCircle, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { collection, doc, limit, onSnapshot, query, runTransaction, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { JOB_CATEGORIES, SAUDI_CITIES } from '../lib/data';
import { Job } from '../types';
import { EmployerApplicationsPanel } from './EmployerApplicationsPanel';

interface MyJobsModalProps { isOpen: boolean; onClose: () => void; user: User; }
const DAY_MS = 24 * 60 * 60 * 1000;

function toMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') return (value as { toMillis: () => number }).toMillis();
  return 0;
}

function waitLabel(value: unknown) {
  const used = toMillis(value);
  if (!used) return '';
  const remaining = used + DAY_MS - Date.now();
  return remaining > 0 ? `${Math.ceil(remaining / 3_600_000)} س` : '';
}

function statusLabel(status: Job['status']) {
  if (status === 'closed') return 'مغلقة';
  if (status === 'awaiting_confirmation') return 'بانتظار تأكيد الاستمرار';
  if (status === 'recently_confirmed') return 'مؤكدة حديثًا';
  return 'نشطة';
}

export const MyJobsModal: React.FC<MyJobsModalProps> = ({ isOpen, onClose, user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState<Partial<Job>>({});
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const q = query(collection(db, 'jobs'), where('userId', '==', user.uid), limit(100));
    return onSnapshot(q, snap => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Job)).sort((a,b) => {
        const am = toMillis(a.activityAt) || toMillis(a.createdAtServer) || Date.parse(a.createdAt) || 0;
        const bm = toMillis(b.activityAt) || toMillis(b.createdAtServer) || Date.parse(b.createdAt) || 0;
        return bm - am;
      }));
      setLoading(false);
    }, e => { console.warn(e); setLoading(false); setError('تعذر تحميل إعلاناتك.'); });
  }, [isOpen, user.uid]);

  const stats = useMemo(() => ({ total: jobs.length, open: jobs.filter(j=>j.status!=='closed').length, closed: jobs.filter(j=>j.status==='closed').length }), [jobs]);
  if (!isOpen) return null;

  const flash = (message: string) => { setSuccess(message); window.setTimeout(()=>setSuccess(''), 2500); };
  const assertOwner = (data: Record<string, unknown>) => { if (data.userId !== user.uid) throw new Error('NOT_OWNER'); };

  const lifecycle = async (job: Job, action: 'close'|'reopen'|'confirm'|'bump') => {
    setBusyId(job.id); setError('');
    const ref = doc(db, 'jobs', job.id);
    try {
      await runTransaction(db, async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('NOT_FOUND');
        const current = snap.data() as Record<string, unknown>;
        assertOwner(current);
        const status = current.status as Job['status'];
        const nowIso = new Date().toISOString();

        if (action === 'close') {
          if (status === 'closed') throw new Error('BAD_STATE');
          tx.update(ref, { status: 'closed', closedAt: serverTimestamp(), updatedAt: nowIso, updatedAtServer: serverTimestamp() });
          return;
        }
        if (action === 'reopen') {
          if (status !== 'closed') throw new Error('BAD_STATE');
          tx.update(ref, { status: 'active', reopenedAt: serverTimestamp(), updatedAt: nowIso, updatedAtServer: serverTimestamp() });
          return;
        }
        if (status === 'closed') throw new Error('BAD_STATE');
        if (action === 'confirm') {
          const last = toMillis(current.lastConfirmedAtServer);
          if (last && Date.now() - last < DAY_MS) throw new Error('COOLDOWN');
          tx.update(ref, { status: 'recently_confirmed', lastConfirmedAt: nowIso, lastConfirmedAtServer: serverTimestamp(), updatedAt: nowIso, updatedAtServer: serverTimestamp() });
          return;
        }
        const last = toMillis(current.lastBumpedAt);
        if (last && Date.now() - last < DAY_MS) throw new Error('COOLDOWN');
        tx.update(ref, { lastBumpedAt: serverTimestamp(), activityAt: serverTimestamp(), updatedAt: nowIso, updatedAtServer: serverTimestamp() });
      });
      flash(action === 'close' ? 'تم إغلاق الإعلان.' : action === 'reopen' ? 'تمت إعادة فتح الإعلان.' : action === 'confirm' ? 'تم تأكيد استمرار الشاغر.' : 'تم رفع الإعلان للأعلى.');
    } catch (e) {
      setError(e instanceof Error && e.message === 'COOLDOWN' ? 'هذه العملية متاحة مرة واحدة كل 24 ساعة.' : 'تعذر تنفيذ العملية. تحقق من الملكية والحالة الحالية.');
    } finally { setBusyId(''); }
  };

  const startEdit = (job: Job) => {
    setEditing(job);
    setForm({ title:job.title, company:job.company, city:job.city, category:job.category, salary:job.salary, jobType:job.jobType, experienceYears:job.experienceYears, description:job.description, phone:job.phone, whatsapp:job.whatsapp, contactPerson:job.contactPerson||'', sponsorshipTransfer:job.sponsorshipTransfer, accommodationProvided:job.accommodationProvided, transportationProvided:job.transportationProvided, mealsProvided:Boolean(job.mealsProvided), overtimeAvailable:Boolean(job.overtimeAvailable) });
    setRequirements((job.requirements || []).join('\n'));
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !form.title?.trim() || !form.company?.trim() || !form.description?.trim() || !form.phone?.trim()) { setError('المسمى واسم المنشأة والوصف ورقم التواصل حقول إلزامية.'); return; }
    setBusyId(editing.id); setError('');
    const ref = doc(db, 'jobs', editing.id);
    try {
      await runTransaction(db, async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error('NOT_FOUND');
        assertOwner(snap.data() as Record<string, unknown>);
        tx.update(ref, {
          title: form.title!.trim(), company: form.company!.trim(), city: form.city || editing.city, category: form.category || editing.category,
          salary: form.salary?.trim() || 'يحدد بعد المقابلة', jobType: form.jobType || editing.jobType, experienceYears: form.experienceYears?.trim() || 'غير محدد',
          description: form.description!.trim(), requirements: requirements.split('\n').map(v=>v.trim()).filter(Boolean), phone: form.phone!.trim(),
          whatsapp: (form.whatsapp?.trim() || form.phone!.trim()).replace(/^0/, '966'), contactPerson: form.contactPerson?.trim() || '',
          sponsorshipTransfer:Boolean(form.sponsorshipTransfer), accommodationProvided:Boolean(form.accommodationProvided), transportationProvided:Boolean(form.transportationProvided),
          mealsProvided:Boolean(form.mealsProvided), overtimeAvailable:Boolean(form.overtimeAvailable), updatedAt:new Date().toISOString(), updatedAtServer:serverTimestamp()
        });
      });
      setEditing(null); flash('تم حفظ تعديلات الإعلان.');
    } catch { setError('تعذر حفظ التعديلات.'); } finally { setBusyId(''); }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto" dir="rtl">
      <div className="max-w-5xl mx-auto bg-slate-50 rounded-3xl shadow-2xl border overflow-hidden my-4">
        <div className="bg-slate-900 text-white px-5 sm:px-7 py-5 flex items-center justify-between"><div><h2 className="text-xl font-black flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-400" />إعلاناتي وطلبات التقديم</h2><p className="text-xs text-slate-400 mt-1">إدارة الإعلانات والطلبات المرتبطة بحسابك فقط</p></div><button onClick={onClose} className="p-2"><X className="w-5 h-5" /></button></div>
        <div className="p-5 sm:p-7 space-y-5">
          <div className="grid grid-cols-3 gap-3"><Stat value={stats.total} label="الكل"/><Stat value={stats.open} label="مفتوحة"/><Stat value={stats.closed} label="مغلقة"/></div>
          <EmployerApplicationsPanel user={user} />
          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex gap-2"><CheckCircle2 className="w-4 h-4" />{success}</div>}

          {editing ? (
            <form onSubmit={saveEdit} className="bg-white border rounded-2xl p-4 space-y-4">
              <div className="flex justify-between"><strong>تعديل: {editing.title}</strong><button type="button" onClick={()=>setEditing(null)} className="text-xs text-slate-500">إلغاء</button></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="المسمى الوظيفي"/><Input value={form.company} onChange={v=>setForm(f=>({...f,company:v}))} placeholder="اسم المنشأة"/>
                <select value={form.city||''} onChange={e=>setForm(f=>({...f,city:e.target.value}))} className="px-3 py-2 border rounded-xl text-sm">{SAUDI_CITIES.map(c=><option key={c}>{c}</option>)}</select>
                <select value={form.category||''} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="px-3 py-2 border rounded-xl text-sm">{JOB_CATEGORIES.filter(c=>c.id!=='all').map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
                <Input value={form.salary} onChange={v=>setForm(f=>({...f,salary:v}))} placeholder="الراتب"/><Input value={form.experienceYears} onChange={v=>setForm(f=>({...f,experienceYears:v}))} placeholder="الخبرة"/>
                <Input value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder="رقم الاتصال"/><Input value={form.whatsapp} onChange={v=>setForm(f=>({...f,whatsapp:v}))} placeholder="واتساب"/>
              </div>
              <textarea value={form.description||''} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="الوصف"/>
              <textarea value={requirements} onChange={e=>setRequirements(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="الشروط - شرط في كل سطر"/>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">{([['sponsorshipTransfer','نقل خدمات'],['accommodationProvided','سكن'],['transportationProvided','مواصلات'],['mealsProvided','وجبات'],['overtimeAvailable','إضافي']] as const).map(([k,l])=><label key={k} className="flex gap-2 bg-slate-50 p-2 rounded-lg"><input type="checkbox" checked={Boolean(form[k])} onChange={e=>setForm(f=>({...f,[k]:e.target.checked}))}/>{l}</label>)}</div>
              <button disabled={busyId===editing.id} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">حفظ التعديلات</button>
            </form>
          ) : loading ? <div className="p-8 text-center text-sm text-slate-500">جارٍ تحميل إعلاناتك...</div> : jobs.length===0 ? <div className="p-8 text-center bg-white border rounded-2xl text-sm text-slate-500">لا توجد إعلانات مرتبطة بحسابك.</div> : (
            <div className="space-y-3">{jobs.map(job=>{ const closed=job.status==='closed'; const bump=waitLabel(job.lastBumpedAt); const confirm=waitLabel(job.lastConfirmedAtServer); return <div key={job.id} className="bg-white border rounded-2xl p-4 space-y-3"><div className="flex justify-between gap-3"><div><strong>{job.title}</strong><p className="text-xs text-slate-500">{job.company} · {job.city}</p></div><span className="text-[11px] bg-slate-100 px-2 py-1 rounded-lg h-fit">{statusLabel(job.status)}</span></div><div className="flex flex-wrap gap-2"><Action onClick={()=>startEdit(job)} disabled={Boolean(busyId)} icon={<Edit3 className="w-3.5 h-3.5"/>}>تعديل</Action>{closed?<Action onClick={()=>lifecycle(job,'reopen')} disabled={Boolean(busyId)} icon={<PlayCircle className="w-3.5 h-3.5"/>}>إعادة فتح</Action>:<Action onClick={()=>lifecycle(job,'close')} disabled={Boolean(busyId)} icon={<PauseCircle className="w-3.5 h-3.5"/>}>إغلاق</Action>}{!closed&&<Action onClick={()=>lifecycle(job,'confirm')} disabled={Boolean(busyId)||Boolean(confirm)} icon={<ShieldCheck className="w-3.5 h-3.5"/>}>تأكيد الاستمرار {confirm&&`(${confirm})`}</Action>}{!closed&&<Action onClick={()=>lifecycle(job,'bump')} disabled={Boolean(busyId)||Boolean(bump)} icon={<RefreshCw className="w-3.5 h-3.5"/>}>Bump {bump&&`(${bump})`}</Action>}</div><div className="text-[11px] text-slate-400 flex gap-1"><Clock3 className="w-3.5 h-3.5"/>Cooldown للرفع والتأكيد: 24 ساعة.</div></div>})}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat=({value,label}:{value:number;label:string})=><div className="bg-white border rounded-2xl p-3 text-center"><strong className="text-xl block">{value}</strong><span className="text-xs text-slate-500">{label}</span></div>;
const Input=({value,onChange,placeholder}:{value:unknown;onChange:(v:string)=>void;placeholder:string})=><input value={String(value??'')} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="px-3 py-2 border rounded-xl text-sm"/>;
const Action=({children,onClick,disabled,icon}:{children:React.ReactNode;onClick:()=>void;disabled:boolean;icon:React.ReactNode})=><button disabled={disabled} onClick={onClick} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold flex gap-1 items-center disabled:opacity-50">{icon}{children}</button>;
