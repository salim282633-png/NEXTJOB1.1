import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  limit,
  doc,
  writeBatch,
  runTransaction
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
import { INITIAL_FRAUD_REPORTS } from './lib/data';
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

  // Moderation & Community State. Community queue is Firestore-only.
  const [communitySubmissions, setCommunitySubmissions] = useState<CommunityJobSubmission[]>([]);
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

  // Admin-only real-time moderation queue. Ordinary users cannot read
  // community submissions because they include unpublished contact details.
  useEffect(() => {
    if (!user || !isAdmin) {
      setCommunitySubmissions([]);
      return;
    }

    const submissionsPath = 'communitySubmissions';
    const q = query(
      collection(db, submissionsPath),
      where('status', '==', 'pending'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const pending = snapshot.docs
          .map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          } as CommunityJobSubmission))
          .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
        setCommunitySubmissions(pending);
      },
      error => {
        handleFirestoreError(error, OperationType.LIST, submissionsPath);
        setCommunitySubmissions([]);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, isAdmin]);

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

  // Community flow: submission is saved as pending only. It is deliberately
  // not inserted into the public jobs state/collection here.
  const handleCommunityJobSubmit = async (
    submission: Omit<CommunityJobSubmission, 'id' | 'status' | 'submittedAt' | 'reviewedAt' | 'reviewedBy' | 'publishedJobId'>
  ) => {
    try {
      await addDoc(collection(db, 'communitySubmissions'), {
        ...submission,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      addToast('success', 'تم إرسال الفرصة للمراجعة. لن تُنشر قبل اعتماد الإدارة.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'communitySubmissions');
      addToast('error', 'تعذر إرسال الفرصة للمراجعة. حاول مرة أخرى.');
      throw err;
    }
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

  const normalizeCommunityWhatsApp = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = `966${digits.slice(1)}`;
    else if (/^5\d{8}$/.test(digits)) digits = `966${digits}`;
    return digits;
  };

  // Admin approval is transactional: the submission must still be pending,
  // then one transaction publishes the job and records the approval result.
  const handleApproveCommunityJob = async (submission: CommunityJobSubmission) => {
    if (!requireAdmin()) return;

    const adminUser = auth.currentUser;
    if (!adminUser) return;

    const submissionRef = doc(db, 'communitySubmissions', submission.id);
    const jobRef = doc(collection(db, 'jobs'));
    const reviewedAt = new Date().toISOString();

    try {
      await runTransaction(db, async transaction => {
        const currentSubmissionSnap = await transaction.get(submissionRef);
        if (!currentSubmissionSnap.exists()) {
          throw new Error('Community submission no longer exists.');
        }

        const currentSubmission = currentSubmissionSnap.data() as CommunityJobSubmission;
        if (currentSubmission.status !== 'pending') {
          throw new Error('Community submission has already been reviewed.');
        }

        transaction.set(jobRef, {
          title: currentSubmission.title,
          company: currentSubmission.companyOrShop || 'معلن مجتمعي',
          city: currentSubmission.city,
          category: currentSubmission.category,
          salary: currentSubmission.salary || 'يحدد لاحقاً',
          jobType: 'دوام كامل',
          experienceYears: 'حسب متطلبات صاحب العمل',
          sponsorshipTransfer: false,
          accommodationProvided: false,
          transportationProvided: false,
          description: currentSubmission.details,
          phone: currentSubmission.contactNumber,
          whatsapp: normalizeCommunityWhatsApp(currentSubmission.contactNumber),
          createdAt: reviewedAt,
          lastConfirmedAt: reviewedAt,
          views: 0,
          sourceType: 'community',
          sourceSubmissionId: submission.id,
          approvedBy: adminUser.uid,
          status: 'active'
        });

        transaction.update(submissionRef, {
          status: 'approved',
          reviewedAt,
          reviewedBy: adminUser.uid,
          publishedJobId: jobRef.id
        });
      });

      addToast('success', `تم اعتماد ونشر: "${submission.title}"`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `communitySubmissions/${submission.id} -> jobs/${jobRef.id}`);
      addToast('error', 'تعذر اعتماد الفرصة أو أنها تمت مراجعتها مسبقاً.');
    }
  };

  const handleRejectCommunityJob = async (id: string) => {
    if (!requireAdmin()) return;

    const adminUser = auth.currentUser;
    if (!adminUser) return;

    const submissionRef = doc(db, 'communitySubmissions', id);
    const reviewedAt = new Date().toISOString();

    try {
      await runTransaction(db, async transaction => {
        const currentSubmissionSnap = await transaction.get(submissionRef);
        if (!currentSubmissionSnap.exists()) {
          throw new Error('Community submission no longer exists.');
        }
        if (currentSubmissionSnap.data().status !== 'pending') {
          throw new Error('Community submission has already been reviewed.');
        }

        transaction.update(submissionRef, {
          status: 'rejected',
          reviewedAt,
          reviewedBy: adminUser.uid
        });
      });
      addToast('info', 'تم استبعاد الفرصة من قائمة الانتظار دون نشرها.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `communitySubmissions/${id}`);
      addToast('error', 'تعذر استبعاد الفرصة أو أنها تمت مراجعتها مسبقاً.');
    }
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
      setCommunitySubmissions([]);
      addToast('info', 'تم تسجيل الخروج بنجاح');
    } catch (err) {
      console.error(err);
      setIsAdminSEOOpen(false);
      setCommunitySubmissions([]);
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