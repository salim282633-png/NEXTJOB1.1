import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, LockKeyhole, LogIn, LogOut, ShieldX } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { auth, db, logoutUser } from '../lib/firebase';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { AdminAndSEOEngineModal } from './AdminAndSEOEngineModal';
import { AuthModal } from './AuthModal';
import { Candidate, CommunityJobSubmission, FraudReport, Job } from '../types';

function normalizeCommunityWhatsApp(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `966${digits.slice(1)}`;
  else if (/^5\d{8}$/.test(digits)) digits = `966${digits}`;
  return digits;
}

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [communitySubmissions, setCommunitySubmissions] = useState<CommunityJobSubmission[]>([]);
  const [fraudReports, setFraudReports] = useState<FraudReport[]>([]);
  const { isAdmin, isCheckingAdmin } = useAdminAccess();

  useEffect(() => onAuthStateChanged(auth, currentUser => {
    setUser(currentUser);
    setAuthReady(true);
    if (currentUser) setShowAuth(false);
  }), []);

  useEffect(() => {
    if (!user || !isAdmin) {
      setCommunitySubmissions([]);
      setFraudReports([]);
      setJobs([]);
      setCandidates([]);
      return;
    }

    const stopCommunity = onSnapshot(
      query(collection(db, 'communitySubmissions'), where('status', '==', 'pending'), limit(100)),
      snapshot => setCommunitySubmissions(
        snapshot.docs
          .map(item => ({ id: item.id, ...item.data() } as CommunityJobSubmission))
          .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      ),
      error => console.warn('Admin community queue unavailable:', error)
    );

    const stopReports = onSnapshot(
      query(collection(db, 'fraudReports'), where('status', '==', 'pending'), limit(100)),
      snapshot => setFraudReports(
        snapshot.docs
          .map(item => ({ id: item.id, ...item.data() } as FraudReport))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      ),
      error => console.warn('Admin fraud queue unavailable:', error)
    );

    const stopJobs = onSnapshot(
      query(
        collection(db, 'jobs'),
        where('status', 'in', ['active', 'recently_confirmed', 'awaiting_confirmation']),
        limit(100)
      ),
      snapshot => setJobs(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Job))),
      error => console.warn('Admin jobs snapshot unavailable:', error)
    );

    const stopCandidates = onSnapshot(
      query(
        collection(db, 'candidates'),
        where('schemaVersion', '==', 2),
        where('isHidden', '==', false),
        limit(100)
      ),
      snapshot => setCandidates(snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Candidate))),
      error => console.warn('Admin candidates snapshot unavailable:', error)
    );

    return () => {
      stopCommunity();
      stopReports();
      stopJobs();
      stopCandidates();
    };
  }, [user?.uid, isAdmin]);

  const approveCommunityJob = async (submission: CommunityJobSubmission) => {
    const adminUser = auth.currentUser;
    if (!adminUser || !isAdmin) return;

    const submissionRef = doc(db, 'communitySubmissions', submission.id);
    const jobRef = doc(collection(db, 'jobs'));
    const reviewedAt = new Date().toISOString();

    try {
      await runTransaction(db, async transaction => {
        const snap = await transaction.get(submissionRef);
        if (!snap.exists() || snap.data().status !== 'pending') throw new Error('ALREADY_REVIEWED');
        const current = snap.data() as CommunityJobSubmission;

        transaction.set(jobRef, {
          title: current.title,
          company: current.companyOrShop || 'معلن مجتمعي',
          city: current.city,
          category: current.category,
          salary: current.salary || 'يحدد لاحقاً',
          jobType: 'دوام كامل',
          experienceYears: 'حسب متطلبات صاحب العمل',
          sponsorshipTransfer: false,
          accommodationProvided: false,
          transportationProvided: false,
          description: current.details,
          phone: current.contactNumber,
          whatsapp: normalizeCommunityWhatsApp(current.contactNumber),
          createdAt: reviewedAt,
          createdAtServer: serverTimestamp(),
          activityAt: serverTimestamp(),
          lastBumpedAt: serverTimestamp(),
          lastConfirmedAt: reviewedAt,
          lastConfirmedAtServer: serverTimestamp(),
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
    } catch (error) {
      console.warn('Unable to approve community job:', error);
      window.alert('تعذر اعتماد الفرصة أو أنها تمت مراجعتها مسبقًا.');
    }
  };

  const rejectCommunityJob = async (id: string) => {
    const adminUser = auth.currentUser;
    if (!adminUser || !isAdmin) return;

    try {
      await runTransaction(db, async transaction => {
        const submissionRef = doc(db, 'communitySubmissions', id);
        const snap = await transaction.get(submissionRef);
        if (!snap.exists() || snap.data().status !== 'pending') throw new Error('ALREADY_REVIEWED');
        transaction.update(submissionRef, {
          status: 'rejected',
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminUser.uid
        });
      });
    } catch (error) {
      console.warn('Unable to reject community job:', error);
      window.alert('تعذر رفض الفرصة أو أنها تمت مراجعتها مسبقًا.');
    }
  };

  const resolveFraudReport = async (id: string) => {
    const adminUser = auth.currentUser;
    if (!adminUser || !isAdmin) return;

    try {
      await runTransaction(db, async transaction => {
        const reportRef = doc(db, 'fraudReports', id);
        const snap = await transaction.get(reportRef);
        if (!snap.exists() || snap.data().status !== 'pending') throw new Error('ALREADY_REVIEWED');
        transaction.update(reportRef, {
          status: 'reviewed',
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminUser.uid
        });
      });
    } catch (error) {
      console.warn('Unable to resolve fraud report:', error);
      window.alert('تعذر إغلاق البلاغ أو أنه تمت معالجته مسبقًا.');
    }
  };

  const goHome = () => window.location.assign('/');

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setShowAuth(true);
  };

  if (!authReady || (user && isCheckingAdmin)) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6" dir="rtl">
        <div className="text-center space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-400 mx-auto" />
          <h1 className="font-black text-xl">جارٍ التحقق من صلاحية الإدارة</h1>
          <p className="text-sm text-slate-400">يتم التحقق مباشرة من Firebase وFirestore.</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-7 text-center shadow-2xl">
          <LockKeyhole className="w-11 h-11 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black">دخول إدارة NEXT JOB</h1>
          <p className="text-sm text-slate-400 mt-2 leading-6">سجّل الدخول بحساب الإدارة. لن يتم فتح اللوحة إلا إذا كان UID الحساب موجودًا في <span dir="ltr" className="font-mono">admins/{'{uid}'}</span> داخل Firestore.</p>
          <button onClick={() => setShowAuth(true)} className="mt-6 w-full bg-emerald-500 text-slate-950 font-black rounded-xl py-3 flex items-center justify-center gap-2">
            <LogIn className="w-4 h-4" /> تسجيل دخول الإدارة
          </button>
          <button onClick={goHome} className="mt-3 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"><ArrowRight className="w-3.5 h-3.5" />العودة للمنصة</button>
        </div>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          user={user}
          onLogout={logout}
          onLoginSuccess={loggedUser => {
            setUser(loggedUser);
            setShowAuth(false);
          }}
          savedJobsCount={0}
        />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-md bg-slate-900 border border-rose-900/40 rounded-3xl p-7 text-center shadow-2xl">
          <ShieldX className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black">غير مصرح بالدخول</h1>
          <p className="text-sm text-slate-400 mt-2 leading-6">الحساب <span dir="ltr" className="text-slate-300">{user.email || user.phoneNumber || user.uid}</span> مسجل دخول، لكنه لا يملك صلاحية Admin في Firestore.</p>
          <button onClick={logout} className="mt-6 w-full bg-slate-800 hover:bg-slate-700 rounded-xl py-3 font-bold flex items-center justify-center gap-2"><LogOut className="w-4 h-4" />تسجيل الخروج واستخدام حساب آخر</button>
          <button onClick={goHome} className="mt-3 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto"><ArrowRight className="w-3.5 h-3.5" />العودة للمنصة</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950" dir="rtl">
      <AdminAndSEOEngineModal
        isOpen
        onClose={goHome}
        communitySubmissions={communitySubmissions}
        fraudReports={fraudReports}
        onApproveCommunityJob={approveCommunityJob}
        onRejectCommunityJob={rejectCommunityJob}
        onResolveReport={resolveFraudReport}
        jobsCount={jobs.length}
        candidatesCount={candidates.length}
        jobs={jobs}
        candidates={candidates}
      />
    </main>
  );
};
