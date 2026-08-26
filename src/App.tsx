import React, { useEffect, useMemo, useState } from 'react';
import { Job, JobFilter, ToastMessage } from './types';
import { Navbar, PublicTab } from './components/Navbar';
import { ProfessionalHome } from './components/ProfessionalHome';
import { HeroSection } from './components/HeroSection';
import { JobList } from './components/JobList';
import { JobDetailModal } from './components/JobDetailModal';
import { SaudiResidentGuide } from './components/SaudiResidentGuide';
import { SavedJobsView } from './components/SavedJobsView';
import { WageCalculatorModal } from './components/WageCalculatorModal';
import { PrivacyAndTermsModal } from './components/PrivacyAndTermsModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { COMPLIANCE_MODE } from './lib/complianceMode';

function initialPublicTab(): PublicTab {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const view = new URLSearchParams(window.location.search).get('view');
  if (path === '/jobs') return 'jobs';
  if (path === '/guide' || view === 'guide') return 'guide';
  if (view === 'saved') return 'saved';
  return 'home';
}

function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function normalizeExternalJob(value: unknown): Job | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const required = ['id', 'title', 'company', 'city', 'category', 'description', 'sourceName', 'sourcePublishedAt', 'createdAt'];
  if (required.some(key => typeof raw[key] !== 'string' || !(raw[key] as string).trim())) return null;
  if (raw.sourceType !== 'external' || raw.status !== 'active') return null;

  const sourceUrl = safeUrl(raw.sourceUrl);
  const applyUrl = safeUrl(raw.applyUrl);
  if (!sourceUrl || !applyUrl) return null;

  const jobTypes: Job['jobType'][] = ['دوام كامل', 'دوام جزئي', 'عمل حر / بالقطعة', 'عقد مؤقت'];
  const jobType = jobTypes.includes(raw.jobType as Job['jobType']) ? raw.jobType as Job['jobType'] : 'دوام كامل';

  return {
    id: String(raw.id),
    title: String(raw.title),
    company: String(raw.company),
    city: String(raw.city),
    category: String(raw.category),
    salary: typeof raw.salary === 'string' ? raw.salary : '',
    jobType,
    sponsorshipTransfer: raw.sponsorshipTransfer === true,
    accommodationProvided: raw.accommodationProvided === true,
    transportationProvided: raw.transportationProvided === true,
    mealsProvided: raw.mealsProvided === true,
    overtimeAvailable: raw.overtimeAvailable === true,
    experienceYears: typeof raw.experienceYears === 'string' ? raw.experienceYears : 'حسب المصدر',
    educationLevel: typeof raw.educationLevel === 'string' ? raw.educationLevel : undefined,
    description: String(raw.description),
    requirements: Array.isArray(raw.requirements) ? raw.requirements.filter(item => typeof item === 'string') as string[] : undefined,
    phone: '',
    whatsapp: '',
    createdAt: String(raw.createdAt),
    status: 'active',
    sourceType: 'external',
    sourceName: String(raw.sourceName),
    sourceUrl,
    applyUrl,
    sourcePublishedAt: String(raw.sourcePublishedAt),
    sourceVerifiedAt: typeof raw.sourceVerifiedAt === 'string' ? raw.sourceVerifiedAt : undefined
  };
}

export function App() {
  const [activeTab, setActiveTab] = useState<PublicTab>(() => initialPublicTab());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isWageCalcOpen, setIsWageCalcOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('nextjob_saved_jobs');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [filter, setFilter] = useState<JobFilter>({
    keyword: '', category: 'all', city: '', sponsorshipOnly: false,
    withAccommodation: false, withTransportation: false, jobType: '', salaryRange: ''
  });

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    window.setTimeout(() => setToasts(prev => prev.filter(item => item.id !== id)), 3500);
  };

  useEffect(() => {
    if (!COMPLIANCE_MODE.externalJobsOnly) {
      setJobs([]);
      setIsLoadingJobs(false);
      return;
    }

    let cancelled = false;
    setIsLoadingJobs(true);
    fetch('/jobs/external-jobs.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`External jobs feed returned ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (cancelled) return;
        const normalized = Array.isArray(data) ? data.map(normalizeExternalJob).filter((job): job is Job => Boolean(job)) : [];
        normalized.sort((a, b) => Date.parse(b.sourcePublishedAt || b.createdAt) - Date.parse(a.sourcePublishedAt || a.createdAt));
        setJobs(normalized);
      })
      .catch(error => {
        console.warn('External jobs feed unavailable:', error);
        if (!cancelled) setJobs([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingJobs(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onPopState = () => setActiveTab(initialPublicTab());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (tab: PublicTab) => {
    setActiveTab(tab);
    const url = tab === 'home' ? '/' : tab === 'jobs' ? '/jobs/' : tab === 'guide' ? '/?view=guide' : '/?view=saved';
    if (`${window.location.pathname}${window.location.search}` !== url) window.history.pushState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSaveJob = (job: Job) => {
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(job.id)) {
        next.delete(job.id);
        addToast('info', `تمت إزالة "${job.title}" من المحفوظات`);
      } else {
        next.add(job.id);
        addToast('success', `تم حفظ "${job.title}"`);
      }
      try {
        localStorage.setItem('nextjob_saved_jobs', JSON.stringify(Array.from(next)));
      } catch (error) {
        console.warn('Unable to persist saved jobs:', error);
      }
      return next;
    });
  };

  const savedJobs = useMemo(() => jobs.filter(job => savedJobIds.has(job.id)), [jobs, savedJobIds]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      <Navbar activeTab={activeTab} setActiveTab={navigate} savedCount={savedJobIds.size} />

      {activeTab === 'home' && <ProfessionalHome jobs={jobs} onNavigate={navigate} />}

      {activeTab === 'jobs' && (
        <>
          <HeroSection filter={filter} setFilter={setFilter} totalJobs={jobs.length} />
          <JobList jobs={jobs} filter={filter} setFilter={setFilter} onSelectJob={setSelectedJob} savedJobIds={savedJobIds} onToggleSave={handleToggleSaveJob} isLoading={isLoadingJobs} />
        </>
      )}

      {activeTab === 'guide' && <SaudiResidentGuide />}

      {activeTab === 'saved' && (
        <SavedJobsView
          savedJobs={savedJobs}
          onSelectJob={setSelectedJob}
          savedJobIds={savedJobIds}
          onToggleSave={handleToggleSaveJob}
          onExploreJobs={() => navigate('jobs')}
          onClearAllSaved={() => {
            setSavedJobIds(new Set());
            localStorage.removeItem('nextjob_saved_jobs');
            addToast('info', 'تم مسح المحفوظات');
          }}
        />
      )}

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} isSaved={selectedJob ? savedJobIds.has(selectedJob.id) : false} onToggleSave={handleToggleSaveJob} />

      {isWageCalcOpen && <WageCalculatorModal isOpen={isWageCalcOpen} onClose={() => setIsWageCalcOpen(false)} />}
      {isPrivacyOpen && <PrivacyAndTermsModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />}

      <CookieConsentBanner onOpenPrivacyModal={() => setIsPrivacyOpen(true)} />
      <Footer onNavigate={navigate} onOpenWageCalc={() => setIsWageCalcOpen(true)} onOpenPrivacy={() => setIsPrivacyOpen(true)} />
      <ToastContainer toasts={toasts} onDismiss={(id: string) => setToasts(prev => prev.filter(item => item.id !== id))} />
    </div>
  );
}

export default App;
