import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  RefreshCw, 
  Copy, 
  Clock 
} from 'lucide-react';
import { SAUDI_CITIES, YEMENI_GOVERNORATES } from '../lib/data';
import { Candidate } from '../types';
import { User } from 'firebase/auth';
import { checkRateLimit } from '../lib/rateLimit';
import { 
  normalizeSaudiPhone, 
  createOTPChallenge, 
  verifyOTPChallenge, 
  OTPChallenge 
} from '../lib/phone';

interface PostCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'views'>) => Promise<void>;
  user: User | null;
}

export const PostCandidateModal: React.FC<PostCandidateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user
}) => {
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [profession, setProfession] = useState('');
  const [city, setCity] = useState(SAUDI_CITIES[0]);
  const [yemeniGovernorate, setYemeniGovernorate] = useState(YEMENI_GOVERNORATES[0]);
  const [iqamaStatus, setIqamaStatus] = useState<Candidate['iqamaStatus']>('إقامة سارية وقابلة للنقل');
  const [experienceYears, setExperienceYears] = useState('3 سنوات');
  const [educationLevel, setEducationLevel] = useState('ثانوية عامة / دبلوم');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [whatsapp, setWhatsapp] = useState(user?.phoneNumber || '');
  const [skillsInput, setSkillsInput] = useState('');
  const [bio, setBio] = useState('');
  const [hasDriverLicense, setHasDriverLicense] = useState(false);
  const [availableImmediately, setAvailableImmediately] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [allowContact, setAllowContact] = useState(true);

  // Phone Verification State
  const [activeChallenge, setActiveChallenge] = useState<OTPChallenge | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(Boolean(user?.emailVerified || user?.phoneNumber));
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    if (!otpSent || !activeChallenge) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((activeChallenge.expiresAt - now) / 1000));
      setTimeLeft(remaining);
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSent, activeChallenge]);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    const norm = normalizeSaudiPhone(phone);
    if (!norm.isValid) {
      setErrorMsg(norm.error || 'يرجى كتابة رقم جوال سعودي صحيح أولاً.');
      return;
    }
    setErrorMsg('');
    const challenge = createOTPChallenge(norm.canonical);
    setActiveChallenge(challenge);
    setTimeLeft(180);
    setResendCooldown(60);
    setOtpSent(true);
    setSuccessMsg(`تم إرسال رمز التحقق إلى الرقم ${norm.displayLocal}`);
  };

  const handleConfirmOtp = () => {
    if (!otpCode.trim()) {
      setErrorMsg('يرجى إدخال رمز التحقق المكون من 6 أرقام.');
      return;
    }

    const result = verifyOTPChallenge(otpCode.trim());
    if (result.success) {
      setIsPhoneVerified(true);
      setOtpSent(false);
      setErrorMsg('');
      setSuccessMsg('تم توثيق رقم الجوال بنجاح! سيظهر برمز التوثيق المعتمد.');
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!checkRateLimit('POST_CANDIDATE')) {
      setErrorMsg('لقد تجاوزت الحد المسموح به لنشر الملفات اليوم (ملفين كحد أقصى). يرجى المحاولة غداً.');
      return;
    }

    if (!fullName.trim() || !profession.trim() || !phone.trim() || !bio.trim()) {
      setErrorMsg('يرجى ملء الاسم، المهنة، رقم الجوال، ونبذة مختصرة عن خبرتك.');
      return;
    }

    const norm = normalizeSaudiPhone(phone);
    if (!norm.isValid) {
      setErrorMsg(norm.error || 'يرجى إدخال رقم جوال سعودي صحيح (مثال: 0501234567).');
      return;
    }

    try {
      setIsSubmitting(true);
      const skills = skillsInput
        .split(/[,،]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const whatsappNorm = whatsapp.trim() ? normalizeSaudiPhone(whatsapp).canonical.replace('+', '') : norm.canonical.replace('+', '');

      await onSubmit({
        fullName: fullName.trim(),
        profession: profession.trim(),
        city,
        yemeniGovernorate,
        iqamaStatus,
        experienceYears: experienceYears.trim() || 'خبرة عملية',
        educationLevel,
        phone: norm.displayLocal,
        phoneVerified: isPhoneVerified,
        whatsapp: whatsappNorm,
        skills: skills.length > 0 ? skills : [profession.trim()],
        bio: bio.trim(),
        hasDriverLicense,
        availableImmediately,
        isHidden,
        allowContact,
        nationality: 'يمني',
        userId: user?.uid
      });

      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء نشر الملف الشخصي، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div 
        id="post-candidate-modal-container"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">أضف سيرتك الذاتية وطلب العمل (مجاناً 100%)</h2>
              <p className="text-xs text-slate-500 mt-1">يظهر ملفك لأصحاب العمل المباشرين دون أي وسطاء أو عمولات</p>
            </div>
          </div>

          <button
            id="btn-close-post-candidate"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name & Profession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الاسم الثلاثي أو الرباعي <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-cand-name"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="مثال: عبد الله أحمد السقاف"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المهنة الأساسية / التخصص <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-cand-profession"
                type="text"
                required
                value={profession}
                onChange={e => setProfession(e.target.value)}
                placeholder="مثال: محاسب، باريستا، فني كهربائي..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* City, Yemeni Governorate & Iqama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المدينة الحالية بالسعودية <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-cand-city"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {SAUDI_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                محافظة الأصل (اليمن)
              </label>
              <select
                value={yemeniGovernorate}
                onChange={e => setYemeniGovernorate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {YEMENI_GOVERNORATES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                حالة الإقامة / النظام <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-cand-iqama"
                value={iqamaStatus}
                onChange={e => setIqamaStatus(e.target.value as Candidate['iqamaStatus'])}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="إقامة سارية وقابلة للنقل">إقامة سارية وقابلة للنقل</option>
                <option value="تأشيرة زيارة / هوية زائر">تأشيرة زيارة / هوية زائر</option>
                <option value="إقامة سارية دون نقل">إقامة سارية دون نقل</option>
                <option value="مهن فردية / سائق خاص">مهن فردية / سائق خاص</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>

          {/* Education & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المؤهل الأكاديمي
              </label>
              <input
                type="text"
                value={educationLevel}
                onChange={e => setEducationLevel(e.target.value)}
                placeholder="مثال: بكالوريوس، دبلوم مهني، ثانوية..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                سنوات الخبرة بالسعودية
              </label>
              <input
                id="input-cand-exp"
                type="text"
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                placeholder="مثال: 4 سنوات بالسعودية"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bio / Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نبذة عن خبراتك والمهام التي تجيدها <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="textarea-cand-bio"
              required
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="اكتب نبذة مقنعة: الشركات أو المتاجر التي عملت بها، البرامج التي تتقنها، والأعمال التي أنجزتها..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Skills (Comma separated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              المهارات والكلمات المفتاحية (مفصولة بفاصلة)
            </label>
            <input
              id="input-cand-skills"
              type="text"
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              placeholder="مثال: برنامج سماك، ضريبة القيمة المضافة، إعداد القوائم، إكسل"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Contact Details & Verification */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  رقم الجوال للاتصال <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-cand-phone"
                    type="tel"
                    dir="ltr"
                    required
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      setIsPhoneVerified(false);
                    }}
                    placeholder="05XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {!isPhoneVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
                    >
                      <span>تأكيد رقم الجوال</span>
                    </button>
                  ) : (
                    <span className="px-3 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      رقم موثق
                    </span>
                  )}
                </div>
                {!isPhoneVerified && (
                  <div className="mt-2 p-2 bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-600 leading-relaxed">
                    <strong>تنبيه:</strong> رقمك ظاهر حالياً كرقم غير موثق. يمكنك تأكيده اختيارياً لإظهار علامة (رقم موثق). يمكنك تغيير الرقم، إخفاؤه تماماً عبر (إلغاء تفعيل وسيلة التواصل)، أو إخفاء الملف كلياً من الأسفل.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  رقم الواتساب
                </label>
                <input
                  id="input-cand-whatsapp"
                  type="tel"
                  dir="ltr"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* OTP Verification Interactive Prompt */}
            {otpSent && !isPhoneVerified && activeChallenge && (
              <div className="p-3.5 bg-white rounded-xl border border-emerald-300 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">
                      رمز التحقق للتجربة: <strong>{activeChallenge.code}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(activeChallenge.code)}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                  >
                    <Copy className="w-3 h-3" />
                    <span>نسخ وتعبئة الرمز</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-32 px-2 py-1.5 text-center font-bold tracking-widest text-base font-mono border border-slate-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleConfirmOtp}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    تأكيد التوثيق
                  </button>
                  <span className="text-[11px] text-slate-500 font-mono mr-auto">
                    الصلاحية: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Visibility Options */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="text-xs font-bold text-slate-800 block">خيارات الخصوصية والظهور:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={hasDriverLicense}
                  onChange={e => setHasDriverLicense(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>أحمل رخصة قيادة سعودية سارية</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={availableImmediately}
                  onChange={e => setAvailableImmediately(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>جاهز ومستعد للمباشرة فوراً</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={allowContact}
                  onChange={e => setAllowContact(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>السماح باستقبال رسائل واتساب المباشرة</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isHidden}
                  onChange={e => setIsHidden(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-rose-700">إخفاء الملف مؤقتاً من دليل الباحثين</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="btn-cancel-post-candidate"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors"
            >
              إلغاء
            </button>
            <button
              id="btn-submit-post-candidate"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جارٍ الحفظ والنشر...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>نشر الملف الشخصي مجاناً</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
