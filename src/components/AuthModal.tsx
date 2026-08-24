import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Phone, 
  User as UserIcon, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  KeyRound,
  RefreshCw,
  Copy,
  Clock,
  ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  loginWithGoogle, 
  getAuthErrorMessage,
  resolvePhoneSquatting
} from '../lib/firebase';
import { checkRateLimit } from '../lib/rateLimit';
import { 
  normalizeSaudiPhone, 
  createOTPChallenge, 
  verifyOTPChallenge, 
  handlePhoneClaimWithVerification, 
  registerUnverifiedSeeker,
  getActiveOTPChallenge,
  findUserByPhone,
  OTPChallenge
} from '../lib/phone';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onLoginSuccess: (user: User) => void;
  savedJobsCount?: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onLoginSuccess,
  savedJobsCount = 0
}) => {
  const [authMode, setAuthMode] = useState<'options' | 'phone_entry' | 'otp_verify'>('options');
  const [phoneInput, setPhoneInput] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [activeChallenge, setActiveChallenge] = useState<OTPChallenge | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPopupBlockedNotice, setIsPopupBlockedNotice] = useState(false);

  // Timer countdown for OTP expiry and resend cooldown
  useEffect(() => {
    if (authMode !== 'otp_verify' || !activeChallenge) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remainingExpiry = Math.max(0, Math.floor((activeChallenge.expiresAt - now) / 1000));
      setTimeLeft(remainingExpiry);

      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [authMode, activeChallenge]);

  if (!isOpen) return null;

  const resetState = () => {
    setAuthMode('options');
    setPhoneInput('');
    setDisplayName('');
    setOtpCode('');
    setActiveChallenge(null);
    setErrorMsg('');
    setSuccessMsg('');
    setIsPopupBlockedNotice(false);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setIsPopupBlockedNotice(false);

    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        onLoginSuccess(loggedUser);
        onClose();
      }
    } catch (err: unknown) {
      console.error('Google login caught:', err);
      const friendlyMessage = getAuthErrorMessage(err);
      setErrorMsg(friendlyMessage);
      
      const errObj = err as { code?: string; message?: string };
      if (errObj?.code === 'auth/popup-blocked' || (errObj?.message && errObj.message.includes('popup'))) {
        setIsPopupBlockedNotice(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Request Phone OTP
  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!checkRateLimit('OTP')) {
      setErrorMsg('لقد تجاوزت الحد المسموح به لطلب رموز التحقق. يرجى المحاولة بعد ساعة.');
      return;
    }

    const norm = normalizeSaudiPhone(phoneInput);
    if (!norm.isValid) {
      setErrorMsg(norm.error || 'رقم الجوال المدخل غير صحيح.');
      return;
    }

    const existingUser = findUserByPhone(norm.canonical);
    if (!existingUser) {
      // New user! Log them in immediately without OTP.
      handleUnverifiedSeekerEntry();
      return;
    }

    setIsLoading(true);
    try {
      const challenge = createOTPChallenge(norm.canonical);
      setActiveChallenge(challenge);
      setTimeLeft(180);
      setResendCooldown(60);
      setAuthMode('otp_verify');
      setSuccessMsg(`تم إرسال رمز التحقق إلى الرقم ${norm.displayLocal}`);
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء تجهيز رمز التحقق، يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = () => {
    if (resendCooldown > 0) return;
    const norm = normalizeSaudiPhone(phoneInput);
    if (!norm.isValid) return;

    setErrorMsg('');
    const challenge = createOTPChallenge(norm.canonical);
    setActiveChallenge(challenge);
    setTimeLeft(180);
    setResendCooldown(60);
    setSuccessMsg('تم إرسال رمز تحقق جديد بنجاح.');
  };

  // Verify OTP
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit('LOGIN')) {
      setErrorMsg('لقد تجاوزت الحد المسموح به لمحاولات تسجيل الدخول. يرجى المحاولة بعد ساعة.');
      return;
    }

    if (!otpCode.trim()) {
      setErrorMsg('يرجى إدخال رمز التحقق المكون من 6 أرقام.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const result = verifyOTPChallenge(otpCode.trim());
    if (!result.success) {
      setErrorMsg(result.message);
      setIsLoading(false);
      return;
    }

    // OTP Verified! Link account and resolve any phone squatting
    const norm = normalizeSaudiPhone(phoneInput);
    const userAccount = handlePhoneClaimWithVerification(norm.canonical, displayName.trim());

    // Resolve squatting in Firestore instantly
    resolvePhoneSquatting(norm.displayLocal, userAccount.uid);

    // Construct authenticated session User
    const authenticatedUser = {
      uid: userAccount.uid,
      displayName: userAccount.displayName,
      phoneNumber: userAccount.phone,
      email: `${userAccount.phone.replace('+', '')}@phone.nextjob.sa`,
      emailVerified: true,
      isAnonymous: false,
    } as unknown as User;

    onLoginSuccess(authenticatedUser);
    onClose();
    setIsLoading(false);
  };

  // Fast Unverified Seeker Access (phoneVerified = false)
  const handleUnverifiedSeekerEntry = () => {
    const norm = normalizeSaudiPhone(phoneInput);
    if (!norm.isValid) {
      setErrorMsg('يرجى كتابة رقم جوال سعودي صحيح للمتابعة كباحث عمل.');
      return;
    }

    const userAccount = registerUnverifiedSeeker(norm.canonical, displayName.trim());
    const seekerUser = {
      uid: userAccount.uid,
      displayName: userAccount.displayName,
      phoneNumber: userAccount.phone,
      email: `${userAccount.phone.replace('+', '')}@phone.nextjob.sa`,
      emailVerified: false,
      isAnonymous: false,
    } as unknown as User;

    onLoginSuccess(seekerUser);
    onClose();
  };

  // Quick Guest Mode for browsing only
  const handleGuestBrowsing = () => {
    const guestUser = {
      uid: `user-guest-${Date.now()}`,
      displayName: 'زائر المنصة (تصفح فقط)',
      email: 'guest@nextjob.sa',
      emailVerified: false,
      isAnonymous: true,
    } as unknown as User;

    onLoginSuccess(guestUser);
    onClose();
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {user ? 'الملف الشخصي والحساب' : 'تسجيل الدخول إلى NEXT JOB'}
              </h3>
              <p className="text-xs text-slate-500">
                {user ? 'إدارة حسابك وعمليات التقديم' : 'بالجوال ورمز OTP أو حساب Google المباشر'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* If already logged in */}
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {user.displayName || 'مستخدم مسجل'}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      مسجل
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate font-mono mt-0.5">
                    {user.phoneNumber || user.email || `ID: ${user.uid.slice(0, 12)}...`}
                  </p>
                </div>
              </div>

              {/* Stats & Perks */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">الوظائف المحفوظة</span>
                  <span className="text-lg font-black text-emerald-700">{savedJobsCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">حالة العضوية</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 inline-block">مجانية ودائمة</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-modal-logout"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login forms / options */
            <div className="space-y-4">
              
              {/* Error Banner if any */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 leading-relaxed animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <p className="font-semibold">{errorMsg}</p>
                    {isPopupBlockedNotice && (
                      <button
                        onClick={handleOpenInNewTab}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 underline hover:text-rose-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>فتح المنصة في تبويب جديد للسماح بتسجيل الدخول</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Mode: Main Options */}
              {authMode === 'options' && (
                <div className="space-y-3">
                  
                  {/* Google OAuth Button */}
                  <button
                    id="btn-auth-google"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                    )}
                    <span>المتابعة باستخدام حساب Google المباشر</span>
                  </button>

                  {/* Phone OTP Button */}
                  <button
                    id="btn-auth-switch-phone"
                    onClick={() => {
                      resetState();
                      setAuthMode('phone_entry');
                    }}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>الدخول برقم الجوال ورمز التحقق (OTP)</span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white px-2 text-slate-400 font-medium">تصفح بدون تسجيل</span>
                    </div>
                  </div>

                  {/* Guest Browsing Mode */}
                  <button
                    id="btn-auth-guest"
                    onClick={handleGuestBrowsing}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-slate-500" />
                    <span>وضع الزائر (للبحث وتصفح الوظائف وحساب الأجور)</span>
                  </button>

                </div>
              )}

              {/* Mode: Phone Entry */}
              {authMode === 'phone_entry' && (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الجوال السعودي
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        value={phoneInput}
                        onChange={e => setPhoneInput(e.target.value)}
                        placeholder="0501234567 أو 501234567"
                        className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    {phoneInput && (
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        الصيغة النظامية: {normalizeSaudiPhone(phoneInput).canonical || 'يرجى إدخال رقم صحيح'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الاسم (اختياري)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="مثال: يحيى المطري"
                        className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    <span>المتابعة</span>
                  </button>

                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetState();
                        setAuthMode('options');
                      }}
                      className="text-slate-400 hover:text-slate-600 text-xs font-semibold text-right"
                    >
                      ← العودة لخيارات تسجيل الدخول
                    </button>
                  </div>
                </form>
              )}

              {/* Mode: OTP Verification */}
              {authMode === 'otp_verify' && activeChallenge && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-right space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">
                        رمز التحقق (بيئة العرض والتجربة)
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 font-mono bg-emerald-100 px-2 py-0.5 rounded-md">
                        {activeChallenge.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      تم إنشاء رمز التحقق المكون من 6 أرقام. يمكنك نسخه أو كتابته مباشرة.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOtpCode(activeChallenge.code)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs"
                    >
                      <Copy className="w-3 h-3" />
                      <span>تعبئة الرمز تلقائياً ({activeChallenge.code})</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      أدخل رمز التحقق (6 أرقام)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center tracking-widest text-lg font-black font-mono py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>الصلاحية: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                    </div>

                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendOTP}
                      className="text-emerald-600 font-bold hover:underline disabled:text-slate-400 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `إعادة الإرسال بعد (${resendCooldown} ث)` : 'إعادة إرسال الرمز'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 6}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>تأكيد الرمز والدخول</span>
                  </button>

                  <div className="pt-2 border-t border-slate-100 text-right">
                    <button
                      type="button"
                      onClick={() => setAuthMode('phone_entry')}
                      className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                    >
                      ← تغيير رقم الجوال ({phoneInput})
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* Privacy & Safety Note */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>بياناتك ورقم جوالك في أمان تام ومحمي، ولا يتم مشاركتها مع أي جهة خارجية.</span>
          </div>

        </div>

      </div>
    </div>
  );
};
