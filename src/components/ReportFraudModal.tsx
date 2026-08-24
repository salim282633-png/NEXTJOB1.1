import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { collection, doc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { FraudReport } from '../types';
import { auth, db } from '../lib/firebase';

interface ReportFraudModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'job' | 'candidate';
  targetId: string;
  targetTitle: string;
  // Kept for backwards-compatible App props. Persistence is enforced here so
  // the report, dedupe lock and rate-limit slot are one atomic transaction.
  onSubmitReport?: (report: Omit<FraudReport, 'id' | 'createdAt' | 'status'>) => Promise<void> | void;
}

const REPORT_WINDOW_MS = 24 * 60 * 60 * 1000;
const REPORT_QUOTA_SLOTS = ['1', '2', '3', '4', '5'] as const;

function timestampToMillis(value: unknown): number {
  if (value instanceof Timestamp) return value.toMillis();
  if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

export const ReportFraudModal: React.FC<ReportFraudModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle
}) => {
  const [reason, setReason] = useState<FraudReport['reason']>('طلب مبالغ أو عمولات توظيف');
  const [details, setDetails] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || isSubmitting) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.isAnonymous) {
        throw new Error('AUTH_REQUIRED');
      }

      // Footer-level reports have no specific target. They are kept in the
      // same protected queue under a stable platform target.
      const effectiveTargetType = targetId ? targetType : 'general';
      const effectiveTargetId = targetId || 'platform';
      const effectiveTargetTitle = targetTitle || 'بلاغ عام عن احتيال أو طلب رسوم';
      const dedupeId = `${currentUser.uid}__${effectiveTargetType}__${effectiveTargetId}`;

      const reportRef = doc(collection(db, 'fraudReports'));
      const dedupeRef = doc(db, 'reportDedupe', dedupeId);
      const slotRefs = REPORT_QUOTA_SLOTS.map(slot =>
        doc(db, 'reportRateLimits', currentUser.uid, 'slots', slot)
      );

      await runTransaction(db, async transaction => {
        // All reads happen before writes. Security Rules independently enforce
        // the same 24-hour windows, so local clock manipulation cannot bypass it.
        const dedupeSnap = await transaction.get(dedupeRef);
        const slotSnaps = [];
        for (const slotRef of slotRefs) {
          slotSnaps.push(await transaction.get(slotRef));
        }

        const nowMs = Timestamp.now().toMillis();
        if (dedupeSnap.exists()) {
          const lastReportMs = timestampToMillis(dedupeSnap.data().usedAt);
          if (lastReportMs && nowMs - lastReportMs < REPORT_WINDOW_MS) {
            throw new Error('DUPLICATE_REPORT');
          }
        }

        let selectedSlotIndex = -1;
        for (let i = 0; i < slotSnaps.length; i += 1) {
          if (!slotSnaps[i].exists()) {
            selectedSlotIndex = i;
            break;
          }
          const usedAtMs = timestampToMillis(slotSnaps[i].data().usedAt);
          if (!usedAtMs || nowMs - usedAtMs >= REPORT_WINDOW_MS) {
            selectedSlotIndex = i;
            break;
          }
        }

        if (selectedSlotIndex < 0) {
          throw new Error('REPORT_RATE_LIMIT');
        }

        const quotaSlot = REPORT_QUOTA_SLOTS[selectedSlotIndex];
        const createdAt = new Date().toISOString();

        transaction.set(reportRef, {
          targetType: effectiveTargetType,
          targetId: effectiveTargetId,
          targetTitle: effectiveTargetTitle,
          reason,
          details: details.trim(),
          reporterPhone: reporterPhone.trim(),
          reporterUid: currentUser.uid,
          quotaSlot,
          createdAt,
          createdAtServer: serverTimestamp(),
          status: 'pending'
        });

        transaction.set(dedupeRef, {
          reporterUid: currentUser.uid,
          targetType: effectiveTargetType,
          targetId: effectiveTargetId,
          reportId: reportRef.id,
          usedAt: serverTimestamp()
        });

        transaction.set(slotRefs[selectedSlotIndex], {
          uid: currentUser.uid,
          reportId: reportRef.id,
          usedAt: serverTimestamp()
        });
      });

      setIsSuccess(true);
      window.setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      if (code === 'AUTH_REQUIRED') {
        setErrorMsg('لحماية نظام البلاغات من الإساءة، سجّل الدخول بحساب موثوق أولاً ثم أرسل البلاغ.');
      } else if (code === 'DUPLICATE_REPORT') {
        setErrorMsg('سبق أن أرسلت بلاغاً عن هذا المحتوى خلال آخر 24 ساعة.');
      } else if (code === 'REPORT_RATE_LIMIT') {
        setErrorMsg('بلغت الحد الأقصى وهو 5 بلاغات خلال 24 ساعة. حاول لاحقاً.');
      } else {
        console.error('Fraud report transaction failed:', error);
        setErrorMsg('تعذر حفظ البلاغ في قاعدة البيانات. لم يتم تسجيل البلاغ، يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" id="report-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200" id="report-modal">
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
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white" aria-label="إغلاق">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">تم حفظ البلاغ بنجاح</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              تم تسجيل البلاغ في Firestore وسيظهر للإدارة لاتخاذ الإجراء المناسب.
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
                <p className="font-semibold text-slate-800 mt-0.5 line-clamp-1">"{targetTitle || 'بلاغ عام عن احتيال أو طلب رسوم'}"</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب البلاغ *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as FraudReport['reason'])}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-900 font-medium"
              >
                <option value="طلب مبالغ أو عمولات توظيف">طلب مبالغ مالية أو عمولات مقابل الوظيفة</option>
                <option value="إعلان وهمي / احتيال">إعلان وهمي أو جهة غير موجودة</option>
                <option value="بيانات اتصال خاطئة أو مضللة">بيانات اتصال خاطئة أو مضللة</option>
                <option value="الوظيفة اكتفت أو غير متاحة">الوظيفة اكتفت أو لم تعد متاحة</option>
                <option value="محتوى غير لائق أو مخالف">محتوى مسيء أو مخالف</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">تفاصيل الشكوى أو ما حدث معك *</label>
              <textarea
                required
                rows={3}
                maxLength={2000}
                placeholder="يرجى كتابة ما حدث باختصار..."
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
                  maxLength={30}
                  placeholder="05xxxxxxxx"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <span className="text-[10px] text-slate-500">لا تتم مشاركة رقم المبلّغ مع صاحب الإعلان أو صاحب الملف.</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] text-slate-500 leading-relaxed">
              يجب تسجيل الدخول. يُمنع تكرار البلاغ عن نفس المحتوى خلال 24 ساعة، والحد الأقصى 5 بلاغات خلال 24 ساعة.
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                إلغاء
              </button>
              <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold transition-all shadow-sm">
                {isSubmitting ? 'جاري الحفظ...' : 'إرسال البلاغ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
