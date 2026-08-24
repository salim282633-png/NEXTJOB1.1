import React, { useState } from 'react';
import { Share2, X, CheckCircle2, HeartHandshake, MapPin, Building2, Phone, Tag } from 'lucide-react';
import { SAUDI_CITIES, JOB_CATEGORIES } from '../lib/data';
import { CommunityJobSubmission } from '../types';

interface CommunityJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submission: Omit<CommunityJobSubmission, 'id' | 'status' | 'submittedAt'>) => void;
}

export const CommunityJobModal: React.FC<CommunityJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [companyOrShop, setCompanyOrShop] = useState('');
  const [city, setCity] = useState(SAUDI_CITIES[0]);
  const [category, setCategory] = useState(JOB_CATEGORIES[1].id);
  const [contactNumber, setContactNumber] = useState('');
  const [salary, setSalary] = useState('');
  const [details, setDetails] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyOrShop || !contactNumber || !details) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        title,
        companyOrShop,
        city,
        category,
        contactNumber,
        salary,
        details,
        submitterName,
        submitterPhone
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" id="community-job-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200" id="community-job-modal">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-xl">
              <HeartHandshake className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">دلّنا على فرصة عمل (مبادرة مجتمعية)</h2>
              <p className="text-xs text-teal-100 mt-0.5">سمعت عن شاغر في متجر أو شركة؟ ساعد إخوانك الباحثين عن عمل بنشر تفاصيلها مجاناً</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">جزاك الله خيراً!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              تم استلام الفرصة وسيتم مراجعتها سريعاً ونشرها لإخوانك الباحثين عن عمل في أقرب وقت.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>الدال على الخير كفاعله:</strong> هذه الخدمة مخصصة للأفراد والمقيمين الذين يعرفون عن شواغر في محيطهم ويرغبون بنفع غيرهم بدون أي مقابل.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المسمى الوظيفي للشاغر *</label>
              <input
                type="text"
                required
                placeholder="مثال: كاشير في بقالة، معلم شاورما، سائق نقل خفيف"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المتجر أو المؤسسة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مطاعم الروابي، تموينات البركة"
                  value={companyOrShop}
                  onChange={(e) => setCompanyOrShop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المدينة *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                >
                  {SAUDI_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">التخصص / التصنيف *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                >
                  {JOB_CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم التواصل مع صاحب العمل *</label>
                <input
                  type="tel"
                  required
                  placeholder="05xxxxxxxx"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الراتب التقريبي أو المميزات (إن عُلمت)</label>
              <input
                type="text"
                placeholder="مثال: 3500 ريال + سكن"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل وموقع الفرصة *</label>
              <textarea
                required
                rows={3}
                placeholder="مثال: المحل بحي الروضة شارع خالد بن الوليد، يطلبون شاب متفرغ ومعه إقامة سارية ونقل كفالة متاح..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">اسمك (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: فاعل خير / أبو محمد"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">رقمك للمتابعة (اختياري)</label>
                <input
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={submitterPhone}
                  onChange={(e) => setSubmitterPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الفرصة للمراجعة والنشر'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
