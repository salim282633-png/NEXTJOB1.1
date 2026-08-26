import React, { useState } from 'react';
import { Share2, X, CheckCircle2, HeartHandshake, AlertCircle } from 'lucide-react';
import { SAUDI_CITIES, JOB_CATEGORIES } from '../lib/data';
import { CommunityJobSubmission } from '../types';
import { findJobComplianceIssue, PLATFORM_COMPLIANCE_NOTICE } from '../lib/jobCompliance';

interface CommunityJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: Omit<CommunityJobSubmission, 'id' | 'status' | 'submittedAt' | 'reviewedAt' | 'reviewedBy' | 'publishedJobId'>) => Promise<void>;
}

export const CommunityJobModal: React.FC<CommunityJobModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [companyOrShop, setCompanyOrShop] = useState('');
  const [city, setCity] = useState(SAUDI_CITIES[0]);
  const [category, setCategory] = useState(JOB_CATEGORIES[1].id);
  const [contactNumber, setContactNumber] = useState('');
  const [salary, setSalary] = useState('');
  const [details, setDetails] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!title.trim() || !companyOrShop.trim() || !contactNumber.trim() || !details.trim() || isSubmitting) return;
    if (!policyAccepted) {
      setSubmitError('يجب تأكيد أن الفرصة لا تتضمن ممارسة مخالفة أو رسوم توظيف قبل إرسالها للمراجعة.');
      return;
    }

    const complianceIssue = findJobComplianceIssue([title, companyOrShop, salary, details]);
    if (complianceIssue) {
      setSubmitError(complianceIssue);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        companyOrShop: companyOrShop.trim(),
        city,
        category,
        contactNumber: contactNumber.trim(),
        salary: salary.trim(),
        details: details.trim(),
        submitterName: submitterName.trim(),
        submitterPhone: submitterPhone.trim()
      });
      setIsSuccess(true);
      window.setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (error) {
      console.error('Community submission failed:', error);
      setSubmitError('تعذر إرسال الفرصة للمراجعة. لم يتم نشرها، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" id="community-job-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6" id="community-job-modal" role="dialog" aria-modal="true" aria-labelledby="community-job-title">
        <div className="p-6 bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl"><HeartHandshake className="w-6 h-6 text-emerald-300" /></div>
            <div>
              <h2 id="community-job-title" className="text-xl font-bold">دلّنا على فرصة عمل</h2>
              <p className="text-xs text-teal-100 mt-0.5">تُرسل للمراجعة أولًا ولا تظهر للعامة قبل اعتماد الإدارة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10" /></div>
            <h3 className="text-lg font-bold text-slate-800">تم إرسال الفرصة للمراجعة</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">لن تظهر الفرصة ضمن الوظائف قبل مراجعة الإدارة واعتمادها.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span><strong>مسار النشر:</strong> إرسال ← مراجعة الإدارة ← اعتماد ← ظهور للعامة.</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{PLATFORM_COMPLIANCE_NOTICE} لا ترسل فرص العمالة المنزلية أو التأشيرات أو تأجير العمالة أو أي عرض للعمل خارج الإجراءات النظامية.</span>
            </div>

            {submitError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-700">{submitError}</div>}

            <label className="block text-xs font-bold text-slate-700 space-y-1">
              <span>المسمى الوظيفي *</span>
              <input type="text" required maxLength={150} placeholder="مثال: كاشير، معلم شاورما، سائق نقل خفيف" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-slate-700 space-y-1"><span>اسم المتجر أو المؤسسة *</span><input type="text" required maxLength={100} value={companyOrShop} onChange={e => setCompanyOrShop(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></label>
              <label className="block text-xs font-bold text-slate-700 space-y-1"><span>المدينة *</span><select value={city} onChange={e => setCity(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">{SAUDI_CITIES.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-slate-700 space-y-1"><span>التخصص *</span><select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">{JOB_CATEGORIES.filter(item => item.id !== 'all').map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              <label className="block text-xs font-bold text-slate-700 space-y-1"><span>رقم صاحب العمل *</span><input type="tel" required maxLength={30} value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="05xxxxxxxx" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></label>
            </div>

            <label className="block text-xs font-bold text-slate-700 space-y-1"><span>الراتب أو المميزات إن عُلمت</span><input type="text" maxLength={120} value={salary} onChange={e => setSalary(e.target.value)} placeholder="مثال: 3500 ريال + سكن" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></label>

            <label className="block text-xs font-bold text-slate-700 space-y-1"><span>تفاصيل وموقع الفرصة *</span><textarea required rows={3} maxLength={3000} placeholder="اذكر ما تعرفه فقط. عند الحاجة لنقل الخدمات اكتب أنه يتم عبر قوى والإجراءات الرسمية." value={details} onChange={e => setDetails(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-500 space-y-1"><span>اسمك للمتابعة (اختياري)</span><input type="text" maxLength={100} value={submitterName} onChange={e => setSubmitterName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></label>
              <label className="block text-[11px] font-bold text-slate-500 space-y-1"><span>رقمك للمتابعة (اختياري)</span><input type="tel" maxLength={30} value={submitterPhone} onChange={e => setSubmitterPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></label>
            </div>

            <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 cursor-pointer">
              <input type="checkbox" checked={policyAccepted} onChange={e => setPolicyAccepted(e.target.checked)} className="mt-0.5" />
              <span className="text-xs leading-5 text-slate-700">أؤكد أن المعلومات التي أرسلها حسب علمي لا تتضمن طلب رسوم توظيف أو بيع تأشيرات أو عمالة منزلية أو عملًا خارج الإجراءات النظامية.</span>
            </label>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">إلغاء</button>
              <button type="submit" disabled={isSubmitting || !policyAccepted} className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-xs font-bold">{isSubmitting ? 'جاري الإرسال...' : 'إرسال للمراجعة'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
