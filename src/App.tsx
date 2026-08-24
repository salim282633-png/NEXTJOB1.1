import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  limit,
  doc,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  db,
  logoutUser,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType
} from './lib/firebase';
import { INITIAL_COMMUNITY_SUBMISSIONS, INITIAL_FRAUD_REPORTS } from './lib/data';
import { Job, Candidate, JobFilter, ToastMessage, CommunityJobSubmission, FraudReport } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { JobList } from './components/JobList';
import { JobDetailModal } from './components/JobDetailModal';
import { PostJobModal } from './components/PostJobModal';
import { CandidatesDirectory } from './components/CandidatesDirectory';
import { PostCandidateModal } from './components/PostCandidateModal';
import { SaudiResidentGuide } from './components/SaudiResidentGuide';
import { SavedJobsView } from './components/SavedJobsView';
import { AICoverLetterModal } from './components/AICoverLetterModal';
import { WageCalculatorModal } from './components/WageCalculatorModal';
import { FreeCVGeneratorModal } from './components/FreeCVGeneratorModal';
import { CommunityJobModal } from './components/CommunityJobModal';
import { ReportFraudModal } from './components/ReportFraudModal';
import { AdminAndSEOEngineModal } from './components/AdminAndSEOEngineModal';
import { PrivacyAndTermsModal } from './components/PrivacyAndTermsModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { useAdminAccess } from './hooks/useAdminAccess';

export function App() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'guide' | 'saved'>('jobs');
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin, isCheckingAdmin } = useAdminAccess();

  // Production data states: Firestore live data only. No demo/seed records.
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState<boolean>(false);

  // Saved / Bookmarked Job IDs. No seeded demo job IDs in production.
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('nextjob_saved_jobs');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Filter states
  const [filter, setFilter] = useState<JobFilter>({
    keyword: '',
    category: 'all',
    city: '',
    sponsorshipOnly: false,
    withAccommodation: false,
    withTransportation: false,
    jobType: '',
    salaryRange: ''
  });

  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isPostCandidateOpen, setIsPostCandidateOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiJobContext, setAIJobContext] = useState<Job | null>(null);

  // Advanced Tools & Modals
  const [isWageCalcOpen, setIsWageCalcOpen] = useState(false);
  const [isCVGenOpen, setIsCVGenOpen] = useState(false);
  const [cvCandidatePrefill, setCvCandidatePrefill] = useState<Candidate | null>(null);
  const [isCommunityJobOpen, setIsCommunityJobOpen] = useState(false);
  const [isReportFraudOpen, setIsReportFraudOpen] = useState(false);
  const [fraudTargetJob, setFraudTargetJob] = useState<Job | null>(null);
  const [fraudTargetCand, setFraudTargetCand] = useState<Candidate | null>(null);
  const [isAdminSEOOpen, setIsAdminSEOOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Moderation & Community State
  const [communitySubmissions, setCommunitySubmissions] = useState<CommunityJobSubmission[]>(INITIAL_COMMUNITY_SUBMISSIONS);
  const [fraudReports, setFraudReports] = useState<FraudReport[]>(INITIAL_FRAUD_REPORTS);

  // Toast messages
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth listener & Firestore connection test
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fail closed: if the live admins/{uid} marker disappears, close the admin
  // panel immediately. Ordinary users never get an admin modal instance.
  useEffect(() => {
    if (!isAdmin) {
      setIsAdminSEOOpen(false);
    }
  }, [isAdmin]);

  // Listen to live Firestore jobs only. Empty/error states stay empty.
  useEffect(() => {
    setIsLoadingJobs(true);
    const jobsPath = 'jobs';
    try {
      const q = query(collection(db, jobsPath), limit(100));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedJobs: Job[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as Job));
          setJobs(fetchedJobs);
          setIsLoadingJobs(false);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, jobsPath);
          setJobs([]);
          setIsLoadingJobs(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up jobs listener:', err);
      setJobs([]);
      setIsLoadingJobs(false);
    }
  }, []);

  // Public candidate listener: live Firestore data only.
  // Hidden profiles and legacy documents containing contact data are never
  // returned by this public query. Empty/error states stay empty.
  useEffect(() => {
    setIsLoadingCandidates(true);
    const candPath = 'candidates';
    try {
      const q = query(
        collection(db, candPath),
        where('schemaVersion', '==', 2),
        where('isHidden', '==', false),
        limit(100)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedCandidates: Candidate[] = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as Candidate));
          setCandidates(fetchedCandidates);
          setIsLoadingCandidates(false);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, candPath);
          setCandidates([]);
          setIsLoadingCandidates(false);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Error setting up candidates listener:', err);
      setCandidates([]);
      setIsLoadingCandidates(false);
    }
  }, []);

  // Save / Bookmark Job handler
  const handleToggleSaveJob = (job: Job) => {
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(job.id)) {
        next.delete(job.id);
        addToast('info', `تمت إزالة "${job.title}" من المحفوظات`);
      } else {
        next.add(job.id);
        addToast('success', `تم حفظ "${job.title}" في المحفوظات`);
      }
      try {
        localStorage.setItem('nextjob_saved_jobs', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Quick WhatsApp Action
  const handleQuickWhatsAppJob = (job: Job) => {
    const cleanPhone = job.whatsapp ? job.whatsapp.replace(/[^0-9]/g, '') : job.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `السلام عليكم ورحمة الله، بخصوص إعلانكم عن وظيفة (${job.title}) في منصة NEXT JOB، أود الاستفسار والتقديم للشاغر.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleQuickWhatsAppCandidate = (candidate: Candidate) => {
    const contactNumber = candidate.whatsapp || candidate.phone || '';
    const cleanPhone = contactNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone) return;

    const text = encodeURIComponent(
      `السلام عليكم أخي ${candidate.fullName}، شاهدت سيرتك الذاتية (${candidate.profession}) في منصة NEXT JOB ولدينا فرصة عمل مناسبة.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Bump / Refresh Job
  const handleBumpJob = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          createdAt: 'الآن',
          status: 'recently_confirmed',
          lastConfirmedAt: 'اليوم'
        };
      }
      return j;
    }));
    addToast('success', 'تم تجديد تاريخ وتأكيد الوظيفة بنجاح ورفعها للأعلى!');
  };

  // Post Job submit handler
  const handlePostJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'views'>) => {
    const newJobObj: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: 'الآن',
      views: 1,
      status: 'recently_confirmed',
      lastConfirmedAt: 'اليوم'
    };

    try {
      await addDoc(collection(db, 'jobs'), {
        ...newJobObj,
        createdAt: new Date().toISOString()
      });
      addToast('success', 'تم نشر إعلان الوظيفة بنجاح في منصة NEXT JOB!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'jobs');
      addToast('error', 'تعذر نشر الوظيفة في قاعدة البيانات. لم تتم إضافة بيانات محلية بديلة.');
    }
  };

  // Candidate publication is atomic: public profile and sensitive contact data
  // are written to two separate collections in the same batch.
  const handlePostCandidate = async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'views'>) => {
    const {
      phone,
      phoneE164,
      whatsapp,
      userId: _submittedUserId,
      userEmail: _submittedUserEmail,
      ...publicCandidateData
    } = candidateData;

    try {
      const candidateRef = doc(collection(db, 'candidates'));
      const contactRef = doc(db, 'candidateContacts', candidateRef.id);
      const ownerUid = auth.currentUser?.uid || null;
      const createdAt = new Date().toISOString();
      const batch = writeBatch(db);

      batch.set(candidateRef, {
        ...publicCandidateData,
        schemaVersion: 2,
        createdAt
      });

      batch.set(contactRef, {
        candidateId: candidateRef.id,
        phone,
        phoneE164: phoneE164 || '',
        whatsapp,
        phoneVerified: candidateData.phoneVerified,
        userId: ownerUid,
        schemaVersion: 2
      });

      await batch.commit();
      addToast('success', 'تم نشر ملفك وسيرتك الذاتية بنجاح!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'candidates + candidateContacts');
      addToast('error', 'تعذر نشر ملف الباحث في قاعدة البيانات. لم تتم إضافة بيانات محلية بديلة.');
    }
  };

  // Community Job Submission
  const handleCommunityJobSubmit = async (submission: Omit<CommunityJobSubmission, 'id' | 'status' | 'submittedAt'>) => {
    const newSubmission: CommunityJobSubmission = {
      ...submission,
      id: `comm-${Date.now()}`,
      status: 'pending',
      submittedAt: 'الآن'
    };
    setCommunitySubmissions(prev => [newSubmission, ...prev]);

    const newJobObj: Job = {
      id: newSubmission.id,
      title: submission.title,
      company: submission.companyOrShop || 'معلن مجتمعي',
      city: submission.city,
      category: submission.category,
      salary: submission.salary || 'حسب التفاصيل بالإعلان',
      jobType: 'دوام كامل',
      experienceYears: 'حسب الكفاءة',
      sponsorshipTransfer: false,
      accommodationProvided: false,
      transportationProvided: false,
      description: submission.details || 'فرصة عمل تمت مشاركتها من المجتمع في NEXT JOB',
      phone: submission.contactNumber,
      whatsapp: submission.contactNumber.replace(/^0/, '966'),
      createdAt: 'الآن',
      views: 1,
      sourceType: 'community',
      status: 'active'
    };

    setJobs(prev => [newJobObj, ...prev]);
    addToast('success', 'شكراً لمساهمتك! تم إرسال الفرصة ومشاركتها مع المجتمع.');
  };

  // Report Fraud Submission
  const handleReportFraudSubmit = async (report: Omit<FraudReport, 'id' | 'createdAt' | 'status'>) => {
    const newReport: FraudReport = {
      ...report,
      id: `rep-${Date.now()}`,
      createdAt: 'الآن',
      status: 'pending'
    };
    setFraudReports(prev => [newReport, ...prev]);
    addToast('success', 'تم استلام بلاغك وسيقوم فريق المراجعة بالتحقق فوراً لحماية المجتمع.');
  };

  const requireAdmin = () => {
    if (!auth.currentUser || !isAdmin) {
      setIsAdminSEOOpen(false);
      addToast('error', 'هذه العملية متاحة لمسؤولي NEXT JOB فقط.');
      return false;
    }
    return true;
  };

  const handleOpenAdminPanel = () => {
    if (isCheckingAdmin) {
      addToast('info', 'جارٍ التحقق من صلاحية الإدارة...');
      return;
    }
    if (!requireAdmin()) return;
    setIsAdminSEOOpen(true);
  };

  // Community Moderation Actions. These client-side actions are also gated;
  // persistent Firestore admin writes remain protected by Security Rules.
  const handleApproveCommunityJob = (submission: CommunityJobSubmission) => {
    if (!requireAdmin()) return;
    setCommunitySubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, status: 'approved' } : s));
    addToast('success', `تمت الموافقة على نشر: "${submission.title}"`);
  };

  const handleRejectCommunityJob = (id: string) => {
    if (!requireAdmin()) return;
    setCommunitySubmissions(prev => prev.filter(s => s.id !== id));
    addToast('info', 'تم استبعاد المشاركة من قائمة الانتظار');
  };

  const handleResolveFraudReport = (id: string) => {
    if (!requireAdmin()) return;
    setFraudReports(prev => prev.map(r => r.id === id ? { ...r, status: 'reviewed' } : r));
    addToast('success', 'تم اتخاذ الإجراء ومعالجة البلاغ بنجاح');
  };

  // Open A4 CV Generator with prefilled candidate
  const handleViewCandidateCV = (candidate: Candidate) => {
    setCvCandidatePrefill(candidate);
    setIsCVGenOpen(true);
  };

  // User Auth Handlers
  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    addToast('success', `أهلاً بك يا ${loggedUser.displayName || 'مستخدمنا العزيز'}`);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAdminSEOOpen(false);
      addToast('info', 'تم تسجيل الخروج بنجاح');
    } catch (err) {
      console.error(err);
      setIsAdminSEOOpen(false);
      addToast('info', 'تم تسجيل الخروج');
    }
  };

  const savedJobsList = jobs.filter(j => savedJobIds.has(j.id));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans antialiased" dir="rtl">

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPostJob={() => setIsPostJobOpen(true)}
        onOpenPostCandidate={() => setIsPostCandidateOpen(true)}
        savedCount={savedJobIds.size}
        user={user}
        onLogin={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1">

        {/* Tab 1: Jobs */}
        {activeTab === 'jobs' && (
          <div>
            <HeroSection
              filter={filter}
              setFilter={setFilter}
              totalJobs={jobs.length}
              onOpenAICoverLetter={() => {
                setAIJobContext(null);
                setIsAIOpen(true);
              }}
            />
            <JobList
              jobs={jobs}
              filter={filter}
              setFilter={setFilter}
              onSelectJob={(job) => setSelectedJob(job)}
              savedJobIds={savedJobIds}
              onToggleSave={handleToggleSaveJob}
              onQuickWhatsApp={handleQuickWhatsAppJob}
              onOpenPostJob={() => setIsPostJobOpen(true)}
              isLoading={isLoadingJobs}
            />
          </div>
        )}

        {/* Tab 2: Candidates */}
        {activeTab === 'candidates' && (
          <CandidatesDirectory
            candidates={candidates}
            onOpenPostCandidate={() => setIsPostCandidateOpen(true)}
            onQuickWhatsApp={handleQuickWhatsAppCandidate}
            onViewCV={handleViewCandidateCV}
            onReportCandidate={(cand) => {
              setFraudTargetCand(cand);
              setFraudTargetJob(null);
              setIsReportFraudOpen(true);
            }}
            isLoading={isLoadingCandidates}
          />
        )}

        {/* Tab 3: Saudi Resident Guide */}
        {activeTab === 'guide' && (
          <SaudiResidentGuide />
        )}

        {/* Tab 4: Saved Jobs */}
        {activeTab === 'saved' && (
          <SavedJobsView
            savedJobs={savedJobsList}
            onSelectJob={(job) => setSelectedJob(job)}
            savedJobIds={savedJobIds}
            onToggleSave={handleToggleSaveJob}
            onQuickWhatsApp={handleQuickWhatsAppJob}
            onExploreJobs={() => setActiveTab('jobs')}
            onClearAllSaved={() => {
              setSavedJobIds(new Set());
              localStorage.removeItem('nextjob_saved_jobs');
              addToast('info', 'تم مسح جميع المحفوظات');
            }}
          />
        )}

      </main>

      {/* Modals */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          isSaved={savedJobIds.has(selectedJob.id)}
          onToggleSave={handleToggleSaveJob}
          onOpenAICoverLetterForJob={(job) => {
            setAIJobContext(job);
            setIsAIOpen(true);
          }}
          onReportFraud={(job) => {
            setFraudTargetJob(job);
            setFraudTargetCand(null);
            setIsReportFraudOpen(true);
          }}
          onBumpJob={handleBumpJob}
        />
      )}

      {isPostJobOpen && (
        <PostJobModal
          isOpen={isPostJobOpen}
          onClose={() => setIsPostJobOpen(false)}
          onSubmit={handlePostJob}
          user={user}
        />
      )}

      {isPostCandidateOpen && (
        <PostCandidateModal
          isOpen={isPostCandidateOpen}
          onClose={() => setIsPostCandidateOpen(false)}
          onSubmit={handlePostCandidate}
          user={user}
        />
      )}

      {isAIOpen && (
        <AICoverLetterModal
          isOpen={isAIOpen}
          onClose={() => {
            setIsAIOpen(false);
            setAIJobContext(null);
          }}
          selectedJob={aiJobContext}
        />
      )}

      {/* Wage & Living Cost Calculator Modal */}
      {isWageCalcOpen && (
        <WageCalculatorModal
          isOpen={isWageCalcOpen}
          onClose={() => setIsWageCalcOpen(false)}
        />
      )}

      {/* Free A4 CV Generator Modal */}
      {isCVGenOpen && (
        <FreeCVGeneratorModal
          isOpen={isCVGenOpen}
          onClose={() => {
            setIsCVGenOpen(false);
            setCvCandidatePrefill(null);
          }}
          initialCandidate={cvCandidatePrefill}
        />
      )}

      {/* Community Job Submission Modal */}
      {isCommunityJobOpen && (
        <CommunityJobModal
          isOpen={isCommunityJobOpen}
          onClose={() => setIsCommunityJobOpen(false)}
          onSubmit={handleCommunityJobSubmit}
        />
      )}

      {/* Report Fraud & Safety Modal */}
      {isReportFraudOpen && (
        <ReportFraudModal
          isOpen={isReportFraudOpen}
          onClose={() => {
            setIsReportFraudOpen(false);
            setFraudTargetJob(null);
            setFraudTargetCand(null);
          }}
          targetType={fraudTargetJob ? 'job' : 'candidate'}
          targetId={fraudTargetJob?.id || fraudTargetCand?.id || ''}
          targetTitle={fraudTargetJob?.title || fraudTargetCand?.fullName || ''}
          onSubmitReport={handleReportFraudSubmit}
        />
      )}

      {/* Admin, Moderation & SEO Engine Modal: never instantiated for non-admin users. */}
      {user && isAdmin && isAdminSEOOpen && (
        <AdminAndSEOEngineModal
          isOpen={isAdminSEOOpen}
          onClose={() => setIsAdminSEOOpen(false)}
          communitySubmissions={communitySubmissions}
          fraudReports={fraudReports}
          onApproveCommunityJob={handleApproveCommunityJob}
          onRejectCommunityJob={handleRejectCommunityJob}
          onResolveReport={handleResolveFraudReport}
          jobsCount={jobs.length}
          candidatesCount={candidates.length}
          jobs={jobs}
          candidates={candidates}
        />
      )}

      {/* Auth & Profile Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          user={user}
          onLogout={handleLogout}
          onLoginSuccess={handleLoginSuccess}
          savedJobsCount={savedJobIds.size}
        />
      )}

      {/* Privacy Policy & Terms Modal */}
      {isPrivacyOpen && (
        <PrivacyAndTermsModal
          isOpen={isPrivacyOpen}
          onClose={() => setIsPrivacyOpen(false)}
        />
      )}

      {/* Google CMP Cookie Consent Banner */}
      <CookieConsentBanner
        onOpenPrivacyModal={() => setIsPrivacyOpen(true)}
      />

      {/* Footer */}
      <Footer
        onNavigate={setActiveTab}
        onOpenWageCalc={() => setIsWageCalcOpen(true)}
        onOpenCVGen={() => {
          setCvCandidatePrefill(null);
          setIsCVGenOpen(true);
        }}
        onOpenCommunityJob={() => setIsCommunityJobOpen(true)}
        onOpenReportFraud={() => {
          setFraudTargetJob(null);
          setFraudTargetCand(null);
          setIsReportFraudOpen(true);
        }}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenAdminSEO={user && isAdmin && !isCheckingAdmin ? handleOpenAdminPanel : undefined}
      />

    </div>
  );
}

export default App;