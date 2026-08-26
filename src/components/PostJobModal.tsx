import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, PlusCircle, ShieldCheck, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { SAUDI_CITIES, JOB_CATEGORIES } from '../lib/data';
import { checkRateLimit } from '../lib/rateLimit';
import {
  EMPLOYER_COMPLIANCE_ATTESTATION,
  PLATFORM_COMPLIANCE_NOTICE,
  findJobComplianceIssue
} from '../lib/jobCompliance';
import { Job } from '../types';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: Omit<Job, 'id' | 'createdAt' | 'views'>) => Promise<void>;
  user: User | null;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onSubmit, user }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState(SAUDI_CITIES[0]);
  const [category, setCategory] = useState(JOB_CATEGORIES[1].id);
  const [salary, setSalary] = useState('');
  const [jobType, setJobType] = useState<Job['jobType']>('دوام كامل');
  const [sponsorshipTransfer, setSponsorshipTransfer] = useState(false);
  const [accommodationProvided, setAccommodationProvided] = useState(false);
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
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');

    if (!checkRateLimit('POST_JOB')) {
      setErrorMsg('لقد تجاوزت الحد المسموح به لإرسال الوظائف اليوم (3 وظائف كحد أقصى). يرجى المحاولة غداً.');
      return;
    }

    if (!title.trim() || !company.trim() || !phone.trim() || !description.trim()) {
      setErrorMsg('يرجى ملء المسمى الوظيفي واسم المنشأة ورقم الاتصال ووصف الوظيفة.');
      return;
    }

    if (!complianceAccepted) {
      setErrorMsg('يجب الموافقة على إقرار الامتثال قبل إرسال الإعلان للمراجعة.');
      return;
    }

    const complianceIssue = findJobComplianceIssue([
      title,
      company,
      salary,
      description,
      requirementsInput
    ]);
    if (complianceIssue) {
      setErrorMsg(complianceIssue);
      return;
    }

    const requirements = requirementsInput
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);

    let urgent = false;
    let urgentStartDate: string | undefined;
    let urgentExpiresAt: string | undefined;

    if (urgentChoice === '24h' || urgentChoice === '48h') {
      urgent = true;
      urgentStartDate = new Date().toISOString();
      const hours = urgentChoice === '24h' ? 24 : 48;
      urgentExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    }

    try {
      setIsSubmitting(true);
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
        requirements: requirements.length ? requirements : undefined,
        phone: phone.trim(),
        whatsapp: (whatsapp.trim() || phone.trim()).replace(/^0/, '966'),
        contactPerson: contactPerson.trim() || undefined,
        userId: user?.uid,
        urgent,
        urgentStartDate,
        urgentExpiresAt,
        status: 'pending_review'
      });
      onClose();
    } catch (error) {
      console.error(error);
      setErrorMsg('حدث خطأ أثناء إرسال الوظيفة للمراجعة. تحقق من الاتصال وحاول مجددًا.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div
        id="post-job-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-job-modal-title"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative"
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="post-job-modal-title" className="text-lg font-black text-slate-900">أرسل فرصة عمل للمراجعة</h2>
              <p className="text-xs text-slate-500 mt-1">لن يظهر الإعلان للعامة إلا بعد مراجعة الإدارة واعتماده.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="إغلاق نافذة إرسال الوظيفة" className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 leading-relaxed">
            <strong className="block mb-1">تنبيه نظامي قبل الإرسال</strong>
            {PLATFORM_COMPLIANCE_NOTICE} لا تُقبل فرص العمالة المنزلية أو بيع التأشيرات أو تأجير العمالة أو أي صياغة تدعو للعمل خارج الإجراءات النظامية.
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>المسمى الوظيفي *</span>
              <input required maxLength={150} value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: محاسب، كاشير، فني تكييف" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </label>
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>اسم المنشأة / صاحب العمل *</span>
              <input required maxLength={100} value={company} onChange={e => setCompany(e.target.value)} placeholder="اسم المنشأة المعلنة" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>المدينة *</span>
              <select value={city} onChange={e => setCity(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {SAUDI_CITIES.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>التصنيف *</span>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                {JOB_CATEGORIES.filter(item => item.id !== 'all').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>الراتب المتوقع</span>
              <input maxLength={120} value={salary} onChange={e => setSalary(e.target.value)} placeholder="مثال: 4000 - 5000 ريال" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </label>
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>نوع الدوام</span>
              <select value={jobType} onChange={e => setJobType(e.target.value as Job['jobType'])} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <option value="دوام كامل">دوام كامل</option>
                <option value="دوام جزئي">دوام جزئي</option>
                <option value="عقد مؤقت">عقد مؤقت</option>
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold text-slate-700">
              <span>الخبرة المطلوبة</span>
              <input maxLength={100} value={experienceYears} onChange={e => setExperienceYears(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </label>
          </div>

          <label className="space-y-1.5 text-xs font-bold text-slate-700 block">
            <span>تفاصيل الوظيفة والمهام *</span>
            <textarea required rows={4} maxLength={3000} value={description} onChange={e => setDescription(e.target.value)} placeholder="اذكر المهام وساعات العمل ومكان العمل بوضوح. لا تضع أي طلب للعمل خارج عقد أو تصريح أو إجراءات نظامية." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </label>

          <label className="space-y-1.5 text-xs font-bold text-slate-700 block">
            <span>الشروط والمتطلبات (شرط في كل سطر)</span>
            <textarea rows={3} maxLength={2000} value={requirementsInput} onChange={e => setRequirementsInput(e.target.value)} placeholder={'مثال:\nإقامة ورخصة عمل ساريتان بحسب المتطلبات النظامية\nخبرة في المجال\nعند الحاجة يتم نقل الخدمات عبر قوى'} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
          </label>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <span className="block text-xs font-bold text-slate-800">معلومات ومزايا يذكرها صاحب الإعلان</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
              <label className="flex items-start gap-2"><input type="checkbox" checked={sponsorshipTransfer} onChange={e => setSponsorshipTransfer(e.target.checked)} className="mt-0.5" /><span>نقل الخدمات نظاميًا عبر قوى عند الحاجة</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={accommodationProvided} onChange={e => setAccommodationProvided(e.target.checked)} /><span>سكن</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={transportationProvided} onChange={e => setTransportationProvided(e.target.checked)} /><span>مواصلات</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={mealsProvided} onChange={e => setMealsProvided(e.target.checked)} /><span>وجبات</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={overtimeAvailable} onChange={e => setOvertimeAvailable(e.target.checked)} /><span>عمل إضافي بحسب العقد والنظام</span></label>
            </div>
            <label className="block text-xs font-bold text-slate-700">موعد المباشرة
              <select value={urgentChoice} onChange={e => setUrgentChoice(e.target.value as 'normal' | '24h' | '48h')} className="mt-1.5 w-full sm:w-auto px-3.5 py-2 bg-white border border-slate-200 rounded-xl">
                <option value="normal">عادي</option>
                <option value="48h">خلال 48 ساعة بعد استكمال الإجراءات</option>
                <option value="24h">خلال 24 ساعة بعد استكمال الإجراءات</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <label className="space-y-1.5 text-xs font-bold text-slate-800"><span>رقم الاتصال *</span><input required type="tel" maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} placeholder="05XXXXXXXX" className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" /></label>
            <label className="space-y-1.5 text-xs font-bold text-slate-800"><span>واتساب</span><input type="tel" maxLength={30} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="05XXXXXXXX" className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" /></label>
            <label className="space-y-1.5 text-xs font-bold text-slate-800"><span>اسم مسؤول التواصل</span><input maxLength={100} value={contactPerson} onChange={e => setContactPerson(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" /></label>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 cursor-pointer">
            <input type="checkbox" checked={complianceAccepted} onChange={e => setComplianceAccepted(e.target.checked)} className="mt-1 w-4 h-4" />
            <span className="text-xs leading-6 text-emerald-950"><strong className="block mb-1 flex items-center gap-1"><ShieldCheck className="w-4 h-4" />إقرار صاحب الإعلان</strong>{EMPLOYER_COMPLIANCE_ATTESTATION}</span>
          </label>

          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3.5 text-xs leading-6 text-sky-900">
            بعد الإرسال ستكون الحالة <strong>بانتظار مراجعة الإدارة</strong>. لا يتم عرض رقم التواصل أو تفاصيل الإعلان للعامة قبل الاعتماد.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">إلغاء</button>
            <button type="submit" disabled={isSubmitting || !complianceAccepted} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال الإعلان للمراجعة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
