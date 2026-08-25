import React, { useState } from 'react';
import { Briefcase, UserPlus, Bookmark, BookOpen, LogIn, LogOut, PlusCircle, Users, ListChecks } from 'lucide-react';
import { User } from 'firebase/auth';
import { MyJobsModal } from './MyJobsModal';

interface NavbarProps {
  activeTab: 'jobs' | 'candidates' | 'guide' | 'saved';
  setActiveTab: (tab: 'jobs' | 'candidates' | 'guide' | 'saved') => void;
  onOpenPostJob: () => void;
  onOpenPostCandidate: () => void;
  savedCount: number;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPostJob,
  onOpenPostCandidate,
  savedCount,
  user,
  onLogin,
  onLogout
}) => {
  const [isMyJobsOpen, setIsMyJobsOpen] = useState(false);

  const handlePostJob = () => {
    if (!user) {
      onLogin();
      return;
    }
    onOpenPostJob();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('jobs')} id="brand-logo-btn">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-slate-900 font-display">NEXT<span className="text-emerald-600">JOB</span></span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">السعودية</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">منصة التوظيف المباشر وبدون عمولات</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button id="nav-tab-jobs" onClick={() => setActiveTab('jobs')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'jobs' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>
                <Briefcase className="w-4 h-4" /><span>فرص العمل</span>
              </button>
              <button id="nav-tab-candidates" onClick={() => setActiveTab('candidates')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'candidates' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>
                <Users className="w-4 h-4" /><span>الباحثون</span>
              </button>
              <button id="nav-tab-guide" onClick={() => setActiveTab('guide')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'guide' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>
                <BookOpen className="w-4 h-4" /><span>المقالات والدليل</span>
              </button>
              <button id="nav-tab-saved" onClick={() => setActiveTab('saved')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${activeTab === 'saved' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'}`}>
                <Bookmark className="w-4 h-4" /><span>المحفوظات</span>
                {savedCount > 0 && <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-bold">{savedCount}</span>}
              </button>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button id="btn-nav-post-candidate" onClick={onOpenPostCandidate} className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors">
                <UserPlus className="w-4 h-4 text-emerald-600" /><span>أنشئ ملفك المهني</span>
              </button>

              <button id="btn-nav-post-job" onClick={handlePostJob} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <PlusCircle className="w-4 h-4" /><span>أعلن عن وظيفة مجاناً</span>
              </button>

              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    id="btn-nav-my-jobs"
                    onClick={() => setIsMyJobsOpen(true)}
                    title="إدارة إعلاناتي"
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-bold"
                  >
                    <ListChecks className="w-4 h-4" />
                    <span>إعلاناتي</span>
                  </button>
                  <button id="btn-nav-profile" onClick={onLogin} title="عرض الملف الشخصي وإدارة الحساب" className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[100px] truncate">{user.displayName || user.email?.split('@')[0] || 'حسابي'}</span>
                  </button>
                  <button id="btn-nav-logout" onClick={onLogout} title="تسجيل الخروج" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button id="btn-nav-login" onClick={onLogin} className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl border border-slate-200 transition-colors">
                  <LogIn className="w-4 h-4 text-emerald-600" /><span>دخول</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-100">
            <button id="mobile-nav-jobs" onClick={() => setActiveTab('jobs')} className={`flex flex-col items-center gap-1 text-xs font-semibold ${activeTab === 'jobs' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}><Briefcase className="w-5 h-5" /><span>الوظائف</span></button>
            <button id="mobile-nav-candidates" onClick={() => setActiveTab('candidates')} className={`flex flex-col items-center gap-1 text-xs font-semibold ${activeTab === 'candidates' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}><Users className="w-5 h-5" /><span>الكفاءات</span></button>
            <button id="mobile-nav-guide" onClick={() => setActiveTab('guide')} className={`flex flex-col items-center gap-1 text-xs font-semibold ${activeTab === 'guide' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}><BookOpen className="w-5 h-5" /><span>المقالات</span></button>
            {user ? (
              <button id="mobile-nav-my-jobs" onClick={() => setIsMyJobsOpen(true)} className="flex flex-col items-center gap-1 text-xs font-semibold text-amber-700"><ListChecks className="w-5 h-5" /><span>إعلاناتي</span></button>
            ) : (
              <button id="mobile-nav-saved" onClick={() => setActiveTab('saved')} className={`flex flex-col items-center gap-1 text-xs font-semibold relative ${activeTab === 'saved' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}><Bookmark className="w-5 h-5" /><span>المحفوظات</span>{savedCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{savedCount}</span>}</button>
            )}
            <button id="mobile-nav-post-cv" onClick={onOpenPostCandidate} className="flex flex-col items-center gap-1 text-xs font-semibold text-emerald-700"><UserPlus className="w-5 h-5" /><span>أنشئ ملفك</span></button>
          </div>
        </div>
      </header>

      {user && (
        <MyJobsModal
          isOpen={isMyJobsOpen}
          onClose={() => setIsMyJobsOpen(false)}
          user={user}
        />
      )}
    </>
  );
};
