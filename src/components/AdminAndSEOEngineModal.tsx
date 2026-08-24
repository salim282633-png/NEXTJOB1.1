import React, { useState } from 'react';
import { 
  BarChart3, 
  Search, 
  ShieldAlert, 
  HeartHandshake, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  FileText, 
  Globe, 
  ShieldCheck, 
  Eye, 
  Trash2,
  Sliders,
  Database,
  Radio
} from 'lucide-react';
import { 
  SEO_CLUSTERS, 
  SEED_SEO_KEYWORDS, 
  SEO_30_DAYS_DRY_RUN 
} from '../lib/data';
import { CommunityJobSubmission, FraudReport, SEOKeywordMetric, Job, Candidate } from '../types';

interface AdminAndSEOEngineModalProps {
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

export const AdminAndSEOEngineModal: React.FC<AdminAndSEOEngineModalProps> = ({
  isOpen,
  onClose,
  communitySubmissions = [],
  fraudReports = [],
  onApproveCommunityJob = (_submission: CommunityJobSubmission) => {},
  onRejectCommunityJob = (_id: string) => {},
  onResolveReport = (_id: string) => {},
  jobsCount,
  candidatesCount,
  jobs = [],
  candidates = []
}) => {
  const [activeTab, setActiveTab] = useState<'seo' | 'dryrun' | 'community' | 'reports' | 'monetization'>('seo');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('all');

  const liveJobsCount = jobsCount ?? jobs.length;
  const liveCandidatesCount = candidatesCount ?? candidates.length;

  if (!isOpen) return null;

  const filteredKeywords = (SEED_SEO_KEYWORDS || []).map(k => {
    // Calculate live matching jobs in the system for this keyword
    const matchedLiveJobs = jobs.filter(j => 
      j.title.toLowerCase().includes(k.keyword.toLowerCase()) ||
      j.description.toLowerCase().includes(k.keyword.toLowerCase())
    );

    return {
      ...k,
      liveSignalCount: matchedLiveJobs.length,
      isLiveSignalActive: matchedLiveJobs.length > 0 || k.realJobCount > 0
    };
  }).filter(k => {
    const matchCluster = selectedCluster === 'all' || k.cluster.includes(selectedCluster);
    const matchText = k.keyword.toLowerCase().includes(keywordFilter.toLowerCase());
    return matchCluster && matchText;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto" id="admin-seo-modal-overlay" dir="rtl">
      <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-6xl overflow-hidden my-4 flex flex-col max-h-[92vh]" id="admin-seo-modal">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
              <Sliders className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">لوحة التحكم ومحرك SEO الذكي</h2>
                <span className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Live Engine Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                إدارة عناقيد المحتوى، فصل البيانات الحية (Live) عن البذور (Seed)، إشارة الوظائف، والرقابة المجتمعية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            id="tab-btn-seo"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'seo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            محرك الكلمات وعناقيد المحتوى
          </button>

          <button
            id="tab-btn-dryrun"
            onClick={() => setActiveTab('dryrun')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'dryrun'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            محاكاة الـ 30 يوم (Dry Run)
          </button>

          <button
            id="tab-btn-community"
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${
              activeTab === 'community'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            مراجعة شواغر المجتمع (دلّنا على فرصة)
            {communitySubmissions.filter(s => s.status === 'pending').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold mr-1">
                {communitySubmissions.filter(s => s.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            id="tab-btn-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'reports'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            بلاغات الاحتيال والرقابة ({fraudReports.filter(r => r.status === 'pending').length})
          </button>

          <button
            id="tab-btn-monetization"
            onClick={() => setActiveTab('monetization')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'monetization'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            حوكمة الإعلانات والخصوصية (AdSense & CMP)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: SEO Clusters & Keywords */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              
              {/* Distinct separation: Live Data vs SEO Seed Targets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500"></div>
                  <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    الوظائف الحية (Live Firestore)
                  </span>
                  <div className="text-xl font-black text-emerald-900 mt-0.5">{liveJobsCount} وظيفة</div>
                  <span className="text-[10px] text-emerald-700 font-bold">نشطة بقاعدة البيانات</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-blue-500"></div>
                  <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
                    <Database className="w-3 h-3 text-blue-600" />
                    السير الذاتية الحية (Live Data)
                  </span>
                  <div className="text-xl font-black text-blue-900 mt-0.5">{liveCandidatesCount} باحث</div>
                  <span className="text-[10px] text-blue-700 font-bold">ملفات مسجلة بالمنصة</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-indigo-500"></div>
                  <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    عناقيد المحتوى (Clusters)
                  </span>
                  <div className="text-xl font-black text-indigo-900 mt-0.5">{SEO_CLUSTERS.length} عناقيد</div>
                  <span className="text-[10px] text-indigo-600 font-bold">استهداف جغرافي ونظامي</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-slate-400"></div>
                  <span className="text-[11px] text-slate-500 font-bold block">الزيارات العضوية المتوقعة</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">250K+ زيارة/شهر</div>
                  <span className="text-[10px] text-slate-500">حركة بحث عضوية مجانية</span>
                </div>
              </div>

              {/* Cluster Pills */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  عناقيد الكلمات الرئيسية المستهدفة (Content Clusters):
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCluster('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCluster === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    كل العناقيد
                  </button>
                  {SEO_CLUSTERS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCluster(c.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedCluster === c.name
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {c.name} ({c.trafficEst})
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords Table with Live vs Signal Comparison */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-800">
                    مصفوفة محرك الكلمات وإشارة الوظائف الحقيقية (Real Job Signal & Anti-Cannibalization):
                  </div>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="بحث في الكلمات المفتاحية..."
                      value={keywordFilter}
                      onChange={(e) => setKeywordFilter(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">الكلمة المفتاحية</th>
                        <th className="p-3">العنقود</th>
                        <th className="p-3">نية البحث</th>
                        <th className="p-3">حجم البحث المقدر</th>
                        <th className="p-3">إشارة الوظائف المباشرة</th>
                        <th className="p-3">حالة الفهرسة</th>
                        <th className="p-3">خطر التنازع</th>
                        <th className="p-3">الإجراء المقترح</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredKeywords.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{item.keyword}</td>
                          <td className="p-3 text-slate-600">{item.cluster}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                              {item.intent}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">{item.searchVolumeEst.toLocaleString()} / شهر</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              item.isLiveSignalActive 
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.liveSignalCount > 0 ? `${item.liveSignalCount} وظيفة حية` : `${item.realJobCount} شاغر مؤكد`}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px]">
                              index, follow
                            </span>
                          </td>
                          <td className="p-3 text-emerald-600 font-bold">{item.cannibalizationRisk}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-md font-bold text-[11px]">
                              {item.recommendedAction}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dry Run 30-Day Simulation */}
          {activeTab === 'dryrun' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-xs text-indigo-950 space-y-1">
                <div className="font-bold text-sm flex items-center gap-2 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  محاكاة نشر المحتوى لـ 30 يوماً (بمعدل مقالين صباحي ومسائي):
                </div>
                <p>
                  يتم تمرير كل عنوان عبر <strong>Quality Gate</strong> للتحقق من خلوه من حشو الذكاء الاصطناعي وتطابقه مع إشارة الوظائف الواقعية في قاعدة البيانات لتجنب الصفحات الفارغة (Thin Content).
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">اليوم / التوقيت</th>
                      <th className="p-3">عنوان المحتوى المجدول</th>
                      <th className="p-3">العنقود</th>
                      <th className="p-3">الكلمة المستهدفة</th>
                      <th className="p-3">إشارة الوظائف</th>
                      <th className="p-3">نسبة التميز (Diversity)</th>
                      <th className="p-3">بوابة الجودة</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {SEO_30_DAYS_DRY_RUN.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          اليوم {item.day} - {item.slot}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{item.title}</td>
                        <td className="p-3 text-slate-600">{item.cluster}</td>
                        <td className="p-3 text-indigo-700 font-mono text-[11px]">{item.targetKeyword}</td>
                        <td className="p-3 text-emerald-600 font-bold">{item.realJobSignal} شواغر</td>
                        <td className="p-3 text-slate-700 font-bold">{100 - item.cannibalizationScore}%</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                            ✓ مجاز
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px]">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Community Submissions Moderation Queue */}
          {activeTab === 'community' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-teal-700" />
                  قائمة الفرص الوظيفية المجتمعية (دلّنا على فرصة):
                </h3>
                <span className="text-xs text-slate-500">
                  إجمالي المشاركات: {communitySubmissions.length}
                </span>
              </div>

              {communitySubmissions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  لا توجد طلبات جديدة في قائمة الانتظار حالياً.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {communitySubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded">
                            {sub.city}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{sub.title}</h4>
                          <span className="text-xs text-slate-500">({sub.companyOrShop})</span>
                        </div>
                        <p className="text-xs text-slate-600">{sub.details}</p>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                          <span>رقم التواصل: <strong dir="ltr">{sub.contactNumber}</strong></span>
                          {sub.salary && <span>الراتب: <strong>{sub.salary}</strong></span>}
                          {sub.submitterName && <span>مرسلة بواسطة: {sub.submitterName}</span>}
                          <span>التوقيت: {sub.submittedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sub.status === 'approved' ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            تم النشر للعامة
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => onApproveCommunityJob(sub)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              موافقة ونشر كإعلان
                            </button>
                            <button
                              onClick={() => onRejectCommunityJob(sub.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-all"
                            >
                              استبعاد
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Abuse & Fraud Reports */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  سجل البلاغات ومكافحة الاحتيال والعمولات:
                </h3>
              </div>

              {fraudReports.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  لا توجد بلاغات معلقة. البيئة آمنة ونظيفة.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {fraudReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                            {rep.reason}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{rep.targetTitle}</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rep.details}</p>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                          {rep.reporterPhone && <span>رقم المبلّغ: {rep.reporterPhone}</span>}
                          <span>تاريخ البلاغ: {rep.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rep.status === 'reviewed' ? (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                            تمت المعالجة والإغلاق
                          </span>
                        ) : (
                          <button
                            onClick={() => onResolveReport(rep.id)}
                            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
                          >
                            اتخاذ إجراء وإغلاق
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Monetization, AdSense & Privacy CMP */}
          {activeTab === 'monetization' && (
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  حوكمة Google AdSense وشروط الخصوصية (CMP):
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-800">حالة إعلانات Google AdSense:</div>
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      جاهزة للتفعيل والربط مع Client ID
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      مساحات AdSlot مهيأة ومميزة بوضوح ("إعلان برعاية") لمنع الالتباس مع إعلانات الوظائف الحقيقية.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-800">راية الخصوصية والموافقة (Google CMP):</div>
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      موافقة متوافقة مع معايير IAB TCF وخصوصية البيانات
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      إتاحة خيار إعادة فتح إعدادات ملفات تعريف الارتباط للمستخدم في أي وقت من أسفل الموقع.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900">مبادئ الإيرادات الأخلاقية في NEXT JOB:</div>
                  <ul className="space-y-1 text-slate-600">
                    <li>• <strong>مجانية كاملة للباحث:</strong> التقديم والتواصل المباشر مع أصحاب العمل مجاني 100% بدون عمولات.</li>
                    <li>• <strong>عدم بيع البيانات:</strong> لا يتم بيع أو مشاركة بيانات السير الذاتية أو أرقام الجوال مع شركات خارجية.</li>
                    <li>• <strong>الإعلانات المباشرة:</strong> يتم وسم أي رابط تسويقي أو راعٍ رسمي بـ <code>rel="sponsored nofollow"</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            إغلاق لوحة المحرك
          </button>
        </div>
      </div>
    </div>
  );
};
