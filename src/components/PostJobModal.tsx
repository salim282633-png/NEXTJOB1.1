import React, { useState } from 'react';
import { X, PlusCircle, Building2, MapPin, Phone, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SAUDI_CITIES, JOB_CATEGORIES } from '../lib/data';
import { Job } from '../types';
import { User } from 'firebase/auth';
import { checkRateLimit } from '../lib/rateLimit';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: Omit<Job, 'id' | 'createdAt' | 'views'>) => Promise<void>;
  user: User | null;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState(SAUDI_CITIES[0]);
  const [category, setCategory] = useState(JOB_CATEGORIES[1].id);
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState<Job['jobType']>('دوام كامل');
  const [sponsorshipTransfer, setSponsorshipTransfer] = useState(true);
  const [accommodationProvided, setAccommodationProvided] = useState(true);
  const [transportationProvided, setTransportationProvided] = useState(false);
  const [mealsProvided, setMealsProvided] = useState(false);
  const [overtimeAvailable, setOvertimeAvailable] = useState(false);
  const [experienceYears, setExperienceYears] = useState('سنة على الأقل');
  const [description, setDescription] = useState('');
  const [requirementsInput, setRequirementsInput] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [urgentChoice, setUrgentChoice] = useState<'normal' | '24h' | '48h'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!checkRateLimit('POST_JOB')) {
      setErrorMsg('لقد تجاوزت الحد المسموح به لنشر الوظائف اليوم (3 وظائف كحد أقصى). يرجى المحاولة غداً.');
      return;
    }

    if (!title.trim() || !company.trim() || !phone.trim() || !description.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول الإلزامية (المسمى الوظيفي، اسم المنشأة، رقم الهاتف، والوصف).');
      return;
    }

    try {
      setIsSubmitting(true);
      const requirements = requirementsInput
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      let urgent = false;
      let urgentStartDate = undefined;
      let urgentExpiresAt = undefined;

      if (urgentChoice === '24h' || urgentChoice === '48h') {
        urgent = true;
        urgentStartDate = new Date().toISOString();
        const hours = urgentChoice === '24h' ? 24 : 48;
        urgentExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      }

      await onSubmit({
        title: title.trim(),
        company: company.trim(),
        city,
        category,
        salary: salary.trim() || 'يحدد بعد المقابلة',
        jobType,
        sponsorshipTransfer,
        accommodationProvided,
        transportationProvided,
        mealsProvided,
        overtimeAvailable,
        experienceYears: experienceYears.trim(),
        description: description.trim(),
        requirements: requirements.length > 0 ? requirements : undefined,
        phone: phone.trim(),
        whatsapp: (whatsapp.trim() || phone.trim()).replace(/^0/, '966'),
        contactPerson: contactPerson.trim() || undefined,
        userId: user?.uid,
        urgent,
        urgentStartDate,
        urgentExpiresAt,
        status: 'recently_confirmed',
        lastConfirmedAt: 'اليوم'
      });

      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء نشر الوظيفة، يرجى التحقق من الاتصال والمحاولة مجدداً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="post-job-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-job-modal-title"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="post-job-modal-title" className="text-lg font-black text-slate-900 leading-none">أعلن عن فرصة عمل جديدة</h2>
              <p className="text-xs text-slate-500 mt-1">يصل إعلانك لآلاف الباحثين عن عمل مباشرة وبدون عمولات</p>
            </div>
          </div>

          <button
            id="btn-close-post-job"
            onClick={onClose}
            aria-label="إغلاق نافذة نشر الوظيفة"
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

          {/* Job Title & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المسمى الوظيفي المطلوب <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-post-title"
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: محاسب عام، معلم مشاوي، سائق دينا..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المؤسسة / المتجر / صاحب العمل <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-post-company"
                type="text"
                required
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="مثال: مؤسسة البناء الحديث للتجارة"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* City & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المدينة بالسعودية <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-post-city"
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
                التصنيف والتخصص <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-post-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {JOB_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Salary, Type, Experience & Urgent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الراتب المتوقع (بالريال السعودي)
              </label>
              <input
                id="input-post-salary"
                type="text"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder="مثال: 4,000 - 5,000 ريال"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع الدوام
              </label>
              <select
                id="select-post-jobtype"
                value={jobType}
                onChange={e => setJobType(e.target.value as Job['jobType'])}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="دوام كامل">دوام كامل</option>
                <option value="دوام جزئي">دوام جزئي</option>
                <option value="عمل حر / بالقطعة">عمل حر / بالقطعة</option>
                <option value="عقد مؤقت">عقد مؤقت</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الخبرة المطلوبة
              </label>
              <input
                id="input-post-experience"
                type="text"
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                placeholder="مثال: سنتان فأكثر"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                موعد المباشرة
              </label>
              <select
                id="select-post-urgent"
                value={urgentChoice}
                onChange={e => setUrgentChoice(e.target.value as 'normal' | '24h' | '48h')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="normal">عادي</option>
                <option value="48h">مباشرة خلال 48 ساعة</option>
                <option value="24h">مباشرة خلال 24 ساعة</option>
              </select>
            </div>
          </div>

          {/* Benefits Checkboxes */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="block text-xs font-bold text-slate-800 mb-1">المزايا الموفرة من قبلكم للموظف:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="cb-sponsorship"
                  type="checkbox"
                  checked={sponsorshipTransfer}
                  onChange={e => setSponsorshipTransfer(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>نقل خدمات عبر قوى</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="cb-accommodation"
                  type="checkbox"
                  checked={accommodationProvided}
                  onChange={e => setAccommodationProvided(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>سكن مؤمن</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="cb-transportation"
                  type="checkbox"
                  checked={transportationProvided}
                  onChange={e => setTransportationProvided(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>مواصلات</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="cb-meals"
                  type="checkbox"
                  checked={mealsProvided}
                  onChange={e => setMealsProvided(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>وجبات مؤمنة</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="cb-overtime"
                  type="checkbox"
                  checked={overtimeAvailable}
                  onChange={e => setOvertimeAvailable(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>إضافي (أوفرتايم) متاح</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              تفاصيل الوظيفة وطبيعة المهام <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="textarea-post-description"
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اكتب شرحاً واضحاً عن ساعات العمل، المهام اليومية، وأي تفاصيل أخرى تهم المتقدم..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Requirements (One per line) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الشروط والمتطلبات (شرط في كل سطر)
            </label>
            <textarea
              id="textarea-post-requirements"
              rows={3}
              value={requirementsInput}
              onChange={e => setRequirementsInput(e.target.value)}
              placeholder="مثال:
إقامة قابلة للتحويل عبر قوى
خبرة في المطاعم أو المبيعات
كرت صحي ساري"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                رقم الاتصال <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-post-phone"
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                رقم الواتساب
              </label>
              <input
                id="input-post-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                اسم المسؤول للتواصل
              </label>
              <input
                id="input-post-contactperson"
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="مثال: أبو فهد"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="btn-cancel-post-job"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors"
            >
              إلغاء
            </button>
            <button
              id="btn-submit-post-job"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جارٍ النشر...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>نشر الإعلان فوراً</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
