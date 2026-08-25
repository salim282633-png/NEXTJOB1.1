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
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_5px_22px_rgba(15,23,42,0.045)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 min-h-[68px] sm:min-h-[76px]">
            <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0" onClick={() => setActiveTab('jobs')} id="brand-logo-btn">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/15 shrink-0">
                <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[21px] sm:text-2xl font-black tracking-tight text-slate-950 font-display leading-none">NEXT<span className="text-emerald-600">JOB</span></span>
                  <span className="hidden sm:inline-flex text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-100">السعودية</span>
                </div>
                <p className="hidden xl:block text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">تواصل مهني مباشر دون عمولات توظيف</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 bg-slate-100/75 p-1 rounded-2xl border border-slate-200/70 shadow-inner shadow-slate-200/20">
              <button id="nav-tab-jobs" onClick={() => setActiveTab('jobs')} className={`flex items-center gap-2 px-3.5 lg:px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'jobs' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}>
                <Briefcase className="w-4 h-4" /><span>فرص العمل</span>
              </button>
              <button id="nav-tab-candidates" onClick={() => setActiveTab('candidates')} className={`flex items-center gap-2 px-3.5 lg:px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'candidates' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}>
                <Users className="w-4 h-4" /><span>الباحثون</span>
              </button>
              <button id="nav-tab-guide" onClick={() => setActiveTab('guide')} className={`flex items-center gap-2 px-3.5 lg:px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === 'guide' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}>
                <BookOpen className="w-4 h-4" /><span>المقالات</span>
              </button>
              <button id="nav-tab-saved" onClick={() => setActiveTab('saved')} className={`flex items-center gap-2 px-3.5 lg:px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all relative ${activeTab === 'saved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}>
                <Bookmark className="w-4 h-4" /><span>المحفوظات</span>
                {savedCount > 0 && <span className="min-w-5 h-5 px-1 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{savedCount}</span>}
              </button>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button id="btn-nav-post-candidate" onClick={onOpenPostCandidate} className="hidden xl:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors">
                <UserPlus className="w-4 h-4 text-emerald-600" /><span>أنشئ ملفك</span>
              </button>

              <button id="btn-nav-post-job" onClick={handlePostJob} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-[12px] sm:text-[13px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]">
                <PlusCircle className="w-4 h-4 shrink-0" /><span className="hidden min-[390px]:inline">أعلن عن وظيفة</span><span className="min-[390px]:hidden">إعلان</span>
              </button>

              {user ? (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    id="btn-nav-my-jobs"
                    onClick={() => setIsMyJobsOpen(true)}
                    title="إدارة إعلاناتي"
                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-100 text-xs font-bold"
                  >
                    <ListChecks className="w-4 h-4" />
                    <span>إعلاناتي</span>
                  </button>
                  <button id="btn-nav-profile" onClick={onLogin} title="عرض الملف الشخصي وإدارة الحساب" className="flex items-center gap-2 p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden lg:inline text-xs font-bold text-slate-700 max-w-[90px] truncate">{user.displayName || user.email?.split('@')[0] || 'حسابي'}</span>
                  </button>
                  <button id="btn-nav-logout" onClick={onLogout} title="تسجيل الخروج" className="hidden sm:inline-flex p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button id="btn-nav-login" onClick={onLogin} className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2.5 text-[12px] sm:text-[13px] font-bold text-slate-700 bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl border border-slate-200 transition-colors">
                  <LogIn className="w-4 h-4 text-emerald-600" /><span className="hidden sm:inline">دخول</span>
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden grid grid-cols-5 gap-1 border-t border-slate-100 py-2">
            <button id="mobile-nav-jobs" onClick={() => setActiveTab('jobs')} className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-colors ${activeTab === 'jobs' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}><Briefcase className="w-[18px] h-[18px]" /><span>الوظائف</span></button>
            <button id="mobile-nav-candidates" onClick={() => setActiveTab('candidates')} className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-colors ${activeTab === 'candidates' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}><Users className="w-[18px] h-[18px]" /><span>الباحثون</span></button>
            <button id="mobile-nav-guide" onClick={() => setActiveTab('guide')} className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-colors ${activeTab === 'guide' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}><BookOpen className="w-[18px] h-[18px]" /><span>المقالات</span></button>
            {user ? (
              <button id="mobile-nav-my-jobs" onClick={() => setIsMyJobsOpen(true)} className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold text-amber-700"><ListChecks className="w-[18px] h-[18px]" /><span>إعلاناتي</span></button>
            ) : (
              <button id="mobile-nav-saved" onClick={() => setActiveTab('saved')} className={`flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold relative ${activeTab === 'saved' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}><Bookmark className="w-[18px] h-[18px]" /><span>المحفوظ</span>{savedCount > 0 && <span className="absolute top-0.5 right-2 min-w-4 h-4 px-0.5 bg-emerald-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">{savedCount}</span>}</button>
            )}
            <button id="mobile-nav-post-cv" onClick={onOpenPostCandidate} className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold text-emerald-700"><UserPlus className="w-[18px] h-[18px]" /><span>ملفي</span></button>
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
