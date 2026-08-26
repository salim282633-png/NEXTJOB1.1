import React, { useEffect, useRef, useState } from 'react';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  signInWithPhoneNumber,
  updateProfile
} from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LogIn,
  LogOut,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X
} from 'lucide-react';
import {
  auth,
  getAuthErrorMessage,
  loginWithGoogle,
  resolvePhoneSquatting
} from '../lib/firebase';
import { checkRateLimit } from '../lib/rateLimit';
import { normalizeSaudiPhone } from '../lib/phone';

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
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPopupBlockedNotice, setIsPopupBlockedNotice] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown(previous => Math.max(0, previous - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  if (!isOpen) return null;

  const clearRecaptcha = () => {
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
  };

  const resetState = () => {
    clearRecaptcha();
    setAuthMode('options');
    setPhoneInput('');
    setDisplayName('');
    setOtpCode('');
    setConfirmationResult(null);
    setResendCooldown(0);
    setErrorMsg('');
    setSuccessMsg('');
    setIsPopupBlockedNotice(false);
  };

  const closeWithoutAuthentication = () => {
    resetState();
    onClose();
  };

  const buildRecaptchaVerifier = () => {
    clearRecaptcha();
    const verifier = new RecaptchaVerifier(auth, 'phone-recaptcha-container', {
      size: 'invisible'
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setIsPopupBlockedNotice(false);

    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        onLoginSuccess(loggedUser);
        resetState();
        onClose();
      }
    } catch (error: unknown) {
      console.error('Google login caught:', error);
      setErrorMsg(getAuthErrorMessage(error));
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/popup-blocked' || err.message?.includes('popup')) {
        setIsPopupBlockedNotice(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendFirebaseOTP = async (successMessage: string) => {
    const normalized = normalizeSaudiPhone(phoneInput);
    if (!normalized.isValid) {
      setErrorMsg(normalized.error || 'رقم الجوال المدخل غير صحيح.');
      return false;
    }

    const verifier = buildRecaptchaVerifier();
    const result = await signInWithPhoneNumber(auth, normalized.canonical, verifier);
    setConfirmationResult(result);
    setOtpCode('');
    setResendCooldown(60);
    setAuthMode('otp_verify');
    setSuccessMsg(successMessage);
    return true;
  };

  const handleRequestOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!checkRateLimit('OTP')) {
      setErrorMsg('لقد تجاوزت الحد المسموح به لطلب رموز التحقق. يرجى المحاولة بعد ساعة.');
      return;
    }

    const normalized = normalizeSaudiPhone(phoneInput);
    if (!normalized.isValid) {
      setErrorMsg(normalized.error || 'رقم الجوال المدخل غير صحيح.');
      return;
    }

    setIsLoading(true);
    try {
      await sendFirebaseOTP(`تم إرسال رمز التحقق عبر SMS إلى ${normalized.displayLocal}`);
    } catch (error: unknown) {
      console.error('Firebase phone OTP request failed:', error);
      clearRecaptcha();
      setErrorMsg(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isLoading) return;

    if (!checkRateLimit('OTP')) {
      setErrorMsg('لقد تجاوزت الحد المسموح به لإعادة إرسال رمز التحقق. يرجى المحاولة لاحقاً.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await sendFirebaseOTP('تم إرسال رمز تحقق جديد عبر SMS.');
    } catch (error: unknown) {
      console.error('Firebase phone OTP resend failed:', error);
      clearRecaptcha();
      setErrorMsg(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');

    if (!checkRateLimit('LOGIN')) {
      setErrorMsg('لقد تجاوزت الحد المسموح به لمحاولات تسجيل الدخول. يرجى المحاولة بعد ساعة.');
      return;
    }

    if (!confirmationResult) {
      setErrorMsg('لا توجد عملية تحقق نشطة. اطلب رمزاً جديداً ثم حاول مرة أخرى.');
      return;
    }

    if (!/^\d{6}$/.test(otpCode.trim())) {
      setErrorMsg('يرجى إدخال رمز التحقق المكون من 6 أرقام.');
      return;
    }

    setIsLoading(true);

    try {
      const credential = await confirmationResult.confirm(otpCode.trim());
      const firebaseUser = credential.user;
      const normalized = normalizeSaudiPhone(phoneInput);

      if (!normalized.isValid || firebaseUser.phoneNumber !== normalized.canonical) {
        throw new Error('تعذر مطابقة رقم الجوال بعد التحقق.');
      }

      if (displayName.trim() && firebaseUser.displayName !== displayName.trim()) {
        await updateProfile(firebaseUser, { displayName: displayName.trim() });
      }

      await firebaseUser.getIdToken(true);
      await resolvePhoneSquatting(normalized.canonical, firebaseUser.uid);

      onLoginSuccess(firebaseUser);
      resetState();
      onClose();
    } catch (error: unknown) {
      console.error('Firebase phone OTP verification failed:', error);
      setErrorMsg(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative">
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
                {user ? 'إدارة حسابك وعمليات التقديم' : 'Google أو تحقق SMS حقيقي عبر Firebase'}
              </p>
            </div>
          </div>
          <button
            onClick={closeWithoutAuthentication}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {user.displayName || 'مستخدم مسجل'}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      مسجل عبر Firebase
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate font-mono mt-0.5">
                    {user.phoneNumber || user.email || `ID: ${user.uid.slice(0, 12)}...`}
                  </p>
                </div>
              </div>

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
          ) : (
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <p className="font-semibold">{errorMsg}</p>
                    {isPopupBlockedNotice && (
                      <button
                        onClick={handleOpenInNewTab}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 underline hover:text-rose-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>فتح المنصة في تبويب جديد</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {authMode === 'options' && (
                <div className="space-y-3">
                  <button
                    id="btn-auth-google"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-2xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" /> : <span className="text-lg font-black">G</span>}
                    <span>المتابعة باستخدام حساب Google</span>
                  </button>

                  <button
                    id="btn-auth-switch-phone"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setAuthMode('phone_entry');
                    }}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>الدخول برقم الجوال ورمز SMS</span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-[11px]"><span className="bg-white px-2 text-slate-400 font-medium">تصفح بدون تسجيل</span></div>
                  </div>

                  <button
                    id="btn-auth-guest"
                    onClick={closeWithoutAuthentication}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-slate-500" />
                    <span>متابعة التصفح كزائر</span>
                  </button>
                </div>
              )}

              {authMode === 'phone_entry' && (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال السعودي</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        value={phoneInput}
                        onChange={event => setPhoneInput(event.target.value)}
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">الاسم (اختياري)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={event => setDisplayName(event.target.value)}
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
                    <span>إرسال رمز التحقق عبر SMS</span>
                  </button>

                  <div className="p-3.5 rounded-2xl border border-sky-200 bg-sky-50 space-y-2">
                    <p className="text-xs font-bold text-sky-900">باحث عمل جديد؟ توثيق الجوال اختياري للنشر</p>
                    <p className="text-[11px] leading-relaxed text-sky-800">
                      يمكنك العودة للمنصة ونشر ملف باحث بدون إنشاء جلسة دخول. سيبقى الرقم غير موثق حتى تؤكد ملكيته فعليًا عبر Firebase SMS.
                    </p>
                    <button
                      type="button"
                      onClick={closeWithoutAuthentication}
                      disabled={isLoading}
                      className="w-full py-2.5 px-3 bg-white hover:bg-sky-100 border border-sky-300 text-sky-800 rounded-xl text-xs font-bold disabled:opacity-50"
                    >
                      العودة للمنصة والمتابعة بدون تسجيل
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setAuthMode('options');
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold text-right"
                  >
                    ← العودة لخيارات تسجيل الدخول
                  </button>
                </form>
              )}

              {authMode === 'otp_verify' && confirmationResult && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-right space-y-1">
                    <p className="text-xs font-bold text-emerald-900">تم إرسال رمز SMS حقيقي</p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      أدخل الرمز المكون من 6 أرقام الذي أرسلته Firebase إلى رقمك. لا يتم إنشاء أو عرض أي رمز داخل الموقع.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رمز التحقق (6 أرقام)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      dir="ltr"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={event => setOtpCode(event.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center tracking-widest text-lg font-black font-mono py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>لم يصلك الرمز؟</span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleResendOTP}
                      className="text-emerald-600 font-bold hover:underline disabled:text-slate-400 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `إعادة الإرسال بعد (${resendCooldown} ث)` : 'إعادة إرسال الرمز'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>تأكيد الرمز والدخول</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode('');
                      setConfirmationResult(null);
                      setSuccessMsg('');
                      setErrorMsg('');
                      setAuthMode('phone_entry');
                    }}
                    className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                  >
                    ← تغيير رقم الجوال ({phoneInput})
                  </button>
                </form>
              )}
            </div>
          )}

          <div id="phone-recaptcha-container" />

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>أي حالة تسجيل دخول في NEXT JOB تأتي من Firebase Authentication فقط. لا يخزن الموقع رمز OTP محلياً.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
