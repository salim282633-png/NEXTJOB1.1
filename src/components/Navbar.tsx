import React from 'react';
import { Bookmark, BookOpen, Briefcase, Home } from 'lucide-react';

export type PublicTab = 'home' | 'jobs' | 'guide' | 'saved';

interface NavbarProps {
  activeTab: PublicTab;
  setActiveTab: (tab: PublicTab) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, savedCount }) => {
  const navItems: Array<{ id: PublicTab; label: string; mobileLabel: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'home', label: 'الرئيسية', mobileLabel: 'الرئيسية', icon: Home },
    { id: 'guide', label: 'المقالات والأدلة', mobileLabel: 'الدليل', icon: BookOpen },
    { id: 'jobs', label: 'دليل الفرص', mobileLabel: 'الفرص', icon: Briefcase },
    { id: 'saved', label: 'المحفوظات', mobileLabel: 'المحفوظ', icon: Bookmark }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_5px_22px_rgba(15,23,42,0.045)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 min-h-[68px] sm:min-h-[76px]">
          <button className="flex items-center gap-2.5 sm:gap-3 min-w-0 text-right" onClick={() => setActiveTab('home')} id="brand-logo-btn">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/15 shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[21px] sm:text-2xl font-black tracking-tight text-slate-950 font-display leading-none">NEXT<span className="text-emerald-600">JOB</span></span>
                <span className="hidden sm:inline-flex text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-100">السعودية</span>
              </div>
              <p className="hidden lg:block text-[11px] text-slate-500 font-medium mt-1 whitespace-nowrap">دليلك للعمل والمسار المهني في السعودية</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100/75 p-1 rounded-2xl border border-slate-200/70 shadow-inner shadow-slate-200/20">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 lg:px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeTab === item.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.id === 'saved' && savedCount > 0 && <span className="min-w-5 h-5 px-1 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{savedCount}</span>}
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-800">
            معرفة عملية · مصادر واضحة · تقديم مباشر
          </div>
        </div>

        <div className="md:hidden grid grid-cols-4 gap-1 border-t border-slate-100 py-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] font-bold transition-colors ${activeTab === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'}`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.mobileLabel}</span>
                {item.id === 'saved' && savedCount > 0 && <span className="absolute top-0 right-2 min-w-4 h-4 px-0.5 bg-emerald-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">{savedCount}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
