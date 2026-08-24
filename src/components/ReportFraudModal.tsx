import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { FraudReport } from '../types';
import { checkRateLimit } from '../lib/rateLimit';

interface ReportFraudModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'job' | 'candidate';
  targetId: string;
  targetTitle: string;
  onSubmitReport: (report: Omit<FraudReport, 'id' | 'createdAt' | 'status'>) => void;
}

export const ReportFraudModal: React.FC<ReportFraudModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onSubmitReport
}) => {
  const [reason, setReason] = useState<FraudReport['reason']>('طلب مبالغ أو عمولات توظيف');
  const [details, setDetails] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!checkRateLimit('REPORT')) {
      setErrorMsg('لقد بلغت الحد الأقصى للبلاغات المسموح بها اليوم. يرجى المحاولة غداً.');
      return;
    }
    
    if (!details) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitReport({
        targetType,
        targetId,
        targetTitle,
        reason,
        details,
        reporterPhone
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" id="report-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200" id="report-modal">
        {/* Header */}
        <div className="p-5 bg-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">إبلاغ عن محتوى أو مخالفة</h2>
              <p className="text-xs text-rose-100">لحماية مجتمع الباحثين وأصحاب العمل من أي احتيال</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">تم استلام البلاغ بنجاح</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              شكراً لحرصك، يقوم فريق الإشراف بالتحقق الفوري واتخاذ الإجراء اللازم لحماية الجميع.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>الإبلاغ بخصوص:</strong>
                <p className="font-semibold text-slate-800 mt-0.5 line-clamp-1">"{targetTitle}"</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب البلاغ *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-900 font-medium"
              >
                <option value="طلب مبالغ أو عمولات توظيف">طلب مبالغ مالية أو عمولات مقابل الوظيفة (احتيال مالي)</option>
                <option value="إعلان وهمي / احتيال">إعلان وهمي أو شركة غير موجودة على أرض الواقع</option>
                <option value="بيانات اتصال خاطئة أو مضللة">رقم التواصل لا يرد / الرقم مغلق أو غير معني</option>
                <option value="رقم التواصل لا يخص صاحب الملف">رقم التواصل لا يخص صاحب الملف التعريفي</option>
                <option value="الوظيفة اكتفت أو غير متاحة">الوظيفة تم شغلها بالفعل وانتهت الفرصة</option>
                <option value="محتوى غير لائق أو مخالف">محتوى مسيء أو مخل بسياسات المنصة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تفاصيل الشكوى أو ما حدث معك *</label>
              <textarea
                required
                rows={3}
                placeholder="يرجى كتابة ما حدث باختصار (مثال: طلب تحويل مبلغ مالي كرسوم ملف، أو ادعى وجود تأشيرات، إلخ)..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم جوالك للتحقق (اختياري وسري)</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <span className="text-[10px] text-slate-500">لا يتم مشاركة رقمك أو هويتك مع أي معلن نهائياً.</span>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ فوراً'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
