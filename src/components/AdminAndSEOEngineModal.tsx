import React, { useState } from 'react';
import { BarChart3, CheckCircle2, HeartHandshake, Search, ShieldAlert, Sliders, X } from 'lucide-react';
import { Candidate, CommunityJobSubmission, FraudReport, Job } from '../types';
import { GOOGLE_PRODUCTION_STATUS, googleProductionConfig } from '../lib/googleProduction';
import { useSearchConsole } from '../hooks/useSearchConsole';
import { useSeoQuickWins } from '../hooks/useSeoQuickWins';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  communitySubmissions?: CommunityJobSubmission[];
  fraudReports?: FraudReport[];
  onApproveCommunityJob?: (submission: CommunityJobSubmission) => void;
  onRejectCommunityJob?: (id: string) => void;
  onResolveReport?: (id: string) => void;
  jobsCount?: number;
  candidatesCount?: number;
  jobs?: Job[];
  candidates?: Candidate[];
}

export const AdminAndSEOEngineModal: React.FC<Props> = ({ isOpen, onClose, communitySubmissions = [], fraudReports = [], onApproveCommunityJob = () => {}, onRejectCommunityJob = () => {}, onResolveReport = () => {}, jobsCount, candidatesCount, jobs = [], candidates = [] }) => {
  const [tab, setTab] = useState<'seo'|'gsc'|'community'|'reports'|'monetization'>('seo');
  const gsc = useSearchConsole();
  const wins = useSeoQuickWins(jobs, gsc.data);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="max-w-6xl mx-auto my-4 bg-slate-50 rounded-3xl overflow-hidden shadow-2xl border">
        <div className="p-5 bg-slate-900 text-white flex justify-between items-center"><div><h2 className="font-black text-lg flex gap-2"><Sliders className="w-5 h-5 text-indigo-400" />لوحة الإدارة وSEO الإنتاجية</h2><p className="text-xs text-slate-400 mt-1">لا يتم دمج Seed أو Simulation مع البيانات الحية، ولا توجد أرقام Search Console تقديرية.</p></div><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="flex gap-1 overflow-x-auto bg-white border-b p-2 text-xs font-bold">
          <button onClick={()=>setTab('seo')} className={`px-3 py-2 rounded-xl ${tab==='seo'?'bg-indigo-600 text-white':''}`}><Search className="w-3.5 h-3.5 inline ml-1" />Quick Wins</button>
          <button onClick={()=>setTab('gsc')} className={`px-3 py-2 rounded-xl ${tab==='gsc'?'bg-indigo-600 text-white':''}`}>Search Console</button>
          <button onClick={()=>setTab('community')} className={`px-3 py-2 rounded-xl ${tab==='community'?'bg-teal-700 text-white':''}`}><HeartHandshake className="w-3.5 h-3.5 inline ml-1" />دلّنا ({communitySubmissions.length})</button>
          <button onClick={()=>setTab('reports')} className={`px-3 py-2 rounded-xl ${tab==='reports'?'bg-rose-700 text-white':''}`}><ShieldAlert className="w-3.5 h-3.5 inline ml-1" />البلاغات ({fraudReports.length})</button>
          <button onClick={()=>setTab('monetization')} className={`px-3 py-2 rounded-xl ${tab==='monetization'?'bg-slate-800 text-white':''}`}>Google / AdSense</button>
        </div>
        <div className="p-5 sm:p-7 min-h-[420px]">
          {tab==='seo' && <div className="space-y-4"><div className="grid sm:grid-cols-3 gap-3"><Stat title="وظائف Firestore الحالية" value={jobsCount ?? jobs.length} /><Stat title="باحثون ظاهرون حاليًا" value={candidatesCount ?? candidates.length} /><Stat title="Quick Wins من البيانات الحقيقية" value={wins.length} /></div>{wins.length ? <div className="space-y-2">{wins.map(win=><div key={win.id} className="bg-white border rounded-2xl p-4"><div className="flex justify-between gap-2"><strong className="text-sm">{win.title}</strong><span className="text-[10px] bg-slate-100 px-2 py-1 rounded">{win.priority}</span></div><p className="text-xs text-slate-500 mt-1">الدليل: {win.evidence}</p><p className="text-xs text-indigo-700 mt-2 font-bold">الإجراء: {win.action}</p></div>)}</div> : <p className="text-sm text-slate-500">لا توجد Quick Wins قابلة للاستخراج من البيانات الحالية.</p>}</div>}
          {tab==='gsc' && <div className="space-y-4"><Status title="Search Console" status={gsc.status} />{gsc.status==='READY' && gsc.data && <><div className="grid sm:grid-cols-4 gap-3"><Stat title="Clicks" value={gsc.data.clicks}/><Stat title="Impressions" value={gsc.data.impressions}/><Stat title="CTR" value={`${(gsc.data.ctr*100).toFixed(1)}%`}/><Stat title="Avg position" value={gsc.data.position.toFixed(1)}/></div><p className="text-xs text-slate-500">آخر جلب: {gsc.data.fetchedAt}</p></>}{gsc.error && <p className="text-xs text-rose-700">{gsc.error}</p>}<p className="text-xs text-slate-500">يتطلب `VITE_SEARCH_CONSOLE_API_ENDPOINT` يشير إلى Proxy خادمي موثوق ينفذ Google OAuth. لا يتم وضع OAuth secret في Vite.</p></div>}
          {tab==='community' && <Queue items={communitySubmissions} empty="لا توجد فرص معلقة.">{sub=><div className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3"><div><strong>{sub.title}</strong><p className="text-xs text-slate-500">{sub.companyOrShop} · {sub.city}</p><p className="text-xs mt-2">{sub.details}</p><p className="text-[11px] mt-2">التواصل: <span dir="ltr">{sub.contactNumber}</span></p></div><div className="flex gap-2"><button onClick={()=>onApproveCommunityJob(sub)} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">اعتماد ونشر</button><button onClick={()=>onRejectCommunityJob(sub.id)} className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold">رفض</button></div></div>}</Queue>}
          {tab==='reports' && <Queue items={fraudReports} empty="لا توجد بلاغات معلقة.">{rep=><div className="bg-white border border-rose-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3"><div><strong>{rep.reason}</strong><p className="text-xs text-slate-500">{rep.targetTitle}</p><p className="text-xs mt-2">{rep.details}</p>{rep.reporterPhone && <p className="text-[11px] mt-2">رقم المبلّغ: {rep.reporterPhone}</p>}</div><button onClick={()=>onResolveReport(rep.id)} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold self-start">إغلاق البلاغ</button></div>}</Queue>}
          {tab==='monetization' && <div className="space-y-4"><Status title="حالة تكامل Google للإنتاج" status={GOOGLE_PRODUCTION_STATUS} /><div className="bg-white border rounded-2xl p-4 text-xs space-y-2"><p>AdSense: {googleProductionConfig.adsEnabled && googleProductionConfig.adsenseClient ? 'تم إدخال إعدادات' : 'غير مهيأ'}</p><p>Google tag: {googleProductionConfig.gtagId ? 'تم إدخال Measurement ID' : 'غير مهيأ'}</p><p>Google CMP: {googleProductionConfig.googleCmpEnabled ? 'تم تأكيد التهيئة' : 'بانتظار التهيئة في حساب Google الحقيقي'}</p><p className="text-amber-700 font-bold">لن تتحول الحالة إلى READY إلا بعد إدخال بيانات Google الحقيقية.</p></div></div>}
        </div>
      </div>
    </div>
  );
};

const Stat = ({title,value}:{title:string;value:string|number}) => <div className="bg-white border rounded-2xl p-4"><span className="text-xs text-slate-500">{title}</span><strong className="text-2xl block mt-1">{value}</strong></div>;
const Status = ({title,status}:{title:string;status:string}) => <div className="bg-white border rounded-2xl p-4 flex justify-between gap-3"><strong className="text-sm">{title}</strong><span className={`text-xs font-bold px-3 py-1 rounded-full ${status==='READY'?'bg-emerald-100 text-emerald-800':'bg-amber-100 text-amber-800'}`}>{status}</span></div>;
function Queue<T extends {id:string}>({items,empty,children}:{items:T[];empty:string;children:(item:T)=>React.ReactNode}) { return items.length ? <div className="space-y-3">{items.map(item=><React.Fragment key={item.id}>{children(item)}</React.Fragment>)}</div> : <div className="p-10 text-center text-sm text-slate-500 bg-white border rounded-2xl">{empty}</div>; }
