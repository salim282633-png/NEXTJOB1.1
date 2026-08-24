import React, { useState } from 'react';
import { FileText, Printer, Download, Sparkles, X, CheckCircle2, User, Phone, MapPin, Briefcase, Award, ShieldCheck, ExternalLink } from 'lucide-react';
import { Candidate } from '../types';
import { SAUDI_CITIES, YEMENI_GOVERNORATES } from '../lib/data';

interface FreeCVGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCandidate?: Partial<Candidate> | null;
}

export const FreeCVGeneratorModal: React.FC<FreeCVGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialCandidate
}) => {
  const [fullName, setFullName] = useState<string>(initialCandidate?.fullName || 'صادق محمد عبد الله القاضي');
  const [profession, setProfession] = useState<string>(initialCandidate?.profession || 'محاسب عام ومسؤول إقرارات ضريبية');
  const [city, setCity] = useState<string>(initialCandidate?.city || 'الرياض');
  const [yemeniGovernorate, setYemeniGovernorate] = useState<string>(initialCandidate?.yemeniGovernorate || 'إب');
  const [iqamaStatus, setIqamaStatus] = useState<string>(initialCandidate?.iqamaStatus || 'إقامة سارية وقابلة للنقل عبر قوى');
  const [experienceYears, setExperienceYears] = useState<string>(initialCandidate?.experienceYears || '5 سنوات خبرة بالسوق السعودي');
  const [phone, setPhone] = useState<string>(initialCandidate?.phone || '0554433221');
  const [whatsapp, setWhatsapp] = useState<string>(initialCandidate?.whatsapp || '966554433221');
  const [educationLevel, setEducationLevel] = useState<string>(initialCandidate?.educationLevel || 'بكالوريوس محاسبة مالية');
  const [hasDriverLicense, setHasDriverLicense] = useState<boolean>(initialCandidate?.hasDriverLicense ?? true);
  const [skillsInput, setSkillsInput] = useState<string>(
    initialCandidate?.skills?.join('، ') || 'برامج قيود وسماك، إعداد القوائم المالية، رفع الإقرارات الضريبية لهيئة الزكاة، الفوترة الإلكترونية، إكسل متقدم'
  );
  const [bio, setBio] = useState<string>(
    initialCandidate?.bio ||
    'محاسب مالي متمرس مقيم في الرياض، أتمتع بخبرة عملية قوية في إدارة الحسابات العامة، القيود اليومية، ومطابقة حسابات البنوك والموردين. حاصل على رخصة قيادة سعودية وجاهز لنقل الخدمات والمباشرة الفورية.'
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [showVipServiceModal, setShowVipServiceModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const skillsList = skillsInput
    .split(/[,،\n]/)
    .map(s => s.trim())
    .filter(Boolean);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto" id="free-cv-modal-overlay">
      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden my-4 flex flex-col max-h-[92vh]" id="free-cv-modal">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl">
              <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">منشئ السيرة الذاتية القياسية A4 (مجاناً 100%)</h2>
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  بدون اشتراك
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                صمم سيرة ذاتية ورقية موحدة بصفحة واحدة A4 مخصصة لأصحاب العمل بالسعودية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVipServiceModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              خدمة التصميم الاحترافي (اختياري)
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher for mobile/desktop */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'editor'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              تعديل البيانات
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              معاينة الصفحة A4
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              طباعة / حفظ PDF
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'editor' ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 max-w-3xl mx-auto">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">بيانات السيرة الذاتية:</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المسمى المهني والتخصص *</label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدينة الحالية بالسعودية *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {SAUDI_CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">محافظة الأصل (اليمن)</label>
                  <select
                    value={yemeniGovernorate}
                    onChange={(e) => setYemeniGovernorate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {YEMENI_GOVERNORATES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال بالسعودية *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب (مع رمز الدولة)</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سنوات الخبرة</label>
                  <input
                    type="text"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المؤهل التعليمي</label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">حالة الإقامة ونقل الخدمات عبر قوى</label>
                  <input
                    type="text"
                    value={iqamaStatus}
                    onChange={(e) => setIqamaStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={hasDriverLicense}
                      onChange={(e) => setHasDriverLicense(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    أحمل رخصة قيادة سعودية سارية
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المهارات والأنظمة (افصل بينها بفاصلة)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الملخص المهني والنبذة التعريفية</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  معاينة السيرة الذاتية الآن
                </button>
              </div>
            </div>
          ) : (
            /* Printable A4 CV Paper Container */
            <div className="flex justify-center">
              <div 
                id="printable-a4-cv"
                className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-8 sm:p-10 shadow-2xl border border-slate-300 rounded-sm relative flex flex-col justify-between"
                style={{ fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', sans-serif" }}
              >
                {/* CV Header */}
                <div>
                  <div className="border-b-2 border-emerald-600 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded mb-1.5">
                        سيرة ذاتية مهنية (مقيم يمني بالمملكة)
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {fullName}
                      </h1>
                      <p className="text-base font-bold text-emerald-700 mt-1">
                        {profession}
                      </p>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 sm:text-left text-right bg-slate-50 p-3 rounded-lg border border-slate-200 min-w-[220px]">
                      <div className="flex items-center gap-2 justify-end sm:justify-start">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>الإقامة الحالية: <strong>{city}، السعودية</strong></span>
                      </div>
                      <div className="flex items-center gap-2 justify-end sm:justify-start">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>محافظة الأصل: <strong>{yemeniGovernorate}، اليمن</strong></span>
                      </div>
                      <div className="flex items-center gap-2 justify-end sm:justify-start">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>الجوال: <strong dir="ltr">{phone}</strong> {initialCandidate && initialCandidate.phoneVerified === false && <span className="text-[9px] text-slate-400 font-normal ml-1">(غير موثق)</span>}</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">سنوات الخبرة</span>
                      <strong className="text-xs text-slate-900">{experienceYears}</strong>
                    </div>
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                      <span className="text-[10px] text-emerald-700 block">حالة نقل الخدمات</span>
                      <strong className="text-xs text-emerald-900">{iqamaStatus}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">المؤهل الأكاديمي</span>
                      <strong className="text-xs text-slate-900">{educationLevel || 'ثانوية / دبلوم'}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <span className="text-[10px] text-slate-500 block">رخصة القيادة</span>
                      <strong className="text-xs text-slate-900">{hasDriverLicense ? 'رخصة سعودية سارية' : 'بدون رخصة'}</strong>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded mb-2 border-r-4 border-emerald-600">
                      النبذة المهنية والهدف الوظيفي
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed pr-2 text-justify">
                      {bio}
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded mb-2 border-r-4 border-emerald-600">
                      المهارات والخبرات العملية والأنظمة
                    </h3>
                    <div className="flex flex-wrap gap-2 pr-2">
                      {skillsList.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-md"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Strengths and Commitments */}
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded mb-2 border-r-4 border-emerald-600">
                      مميزات الجاهزية والالتزام
                    </h3>
                    <ul className="text-xs text-slate-700 space-y-1.5 pr-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>جاهزية تامة للمباشرة ونقل الخدمات الإلكتروني عبر منصة قوى دون معوقات.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>الالتزام التام بالتعليمات ومواعيد العمل وحسن التعامل والأمانة المهنية.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>القدرة على العمل بروح الفريق والتعامل مع ضغوط العمل وساعات العمل الإضافية عند الحاجة.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Footer in A4 */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                  <span>تم إنشاء هذه السيرة الذاتية عبر منصة <strong>NEXT JOB</strong> - التوظيف المباشر لليمنيين بالمملكة</span>
                  <span>رقم المرجع: NJ-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="p-3 bg-amber-50 border-t border-amber-200 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-900 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>تنبيه شفاف:</strong> السيرة الذاتية القياسية A4 مجانية بالكامل. أي خدمة تصميم إضافية هي خدمة اختيارية مستقلة ولا تؤثر على ترتيب أو أولوية ظهورك في المنصة.
            </span>
          </div>
          <button
            onClick={() => setShowVipServiceModal(true)}
            className="text-emerald-700 font-bold hover:underline shrink-0"
          >
            طلب تصميم فاخر أو بورتفوليو ←
          </button>
        </div>
      </div>

      {/* Optional Professional Design Service Modal */}
      {showVipServiceModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-600">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">خدمة تصميم السيرة الذاتية الفاخرة (VIP)</h3>
              </div>
              <button
                onClick={() => setShowVipServiceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              إذا كنت ترغب في تصميم ملف أعمال (Portfolio) تفاعلي أو سيرة ذاتية أوروبية مخصصة، يمكنك طلب الخدمة من فريق التصميم المتعاون.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span>تنسيق ATS حديث لشركات الكبرى:</span>
                <span className="font-bold text-emerald-600">متاح</span>
              </div>
              <div className="flex justify-between">
                <span>ملف PDF فكتور قابل للتعديل:</span>
                <span className="font-bold text-emerald-600">متاح</span>
              </div>
              <div className="flex justify-between">
                <span>الربط مع رمز QR لمعرض الأعمال:</span>
                <span className="font-bold text-emerald-600">متاح</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 leading-relaxed font-semibold">
              ⚠️ <strong>إخلاء مسؤولية تنظيمي:</strong> طلب هذه الخدمة الاختيارية لا يمنح أي أفضلية أو تمييز في نتائج البحث أو القبول، حيث تلتزم NEXT JOB بالحياد الكامل ومجانية التوظيف لجميع الباحثين.
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`https://wa.me/966500000000?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن خدمة تصميم السيرة الذاتية الفاخرة الاختيارية عبر NEXT JOB')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                تواصل مع المصمم عبر واتساب
              </a>
              <button
                onClick={() => setShowVipServiceModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
