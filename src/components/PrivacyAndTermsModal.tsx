import React from 'react';
import { ShieldCheck, X, FileText, Lock, AlertCircle, Building2 } from 'lucide-react';

interface PrivacyAndTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyAndTermsModal: React.FC<PrivacyAndTermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" id="privacy-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 flex flex-col max-h-[88vh]" id="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl"><ShieldCheck className="w-6 h-6 text-emerald-400" /></div>
            <div>
              <h2 id="privacy-title" className="text-lg font-bold">شروط الاستخدام والخصوصية</h2>
              <p className="text-xs text-slate-300">NEXT JOB — مركز إرشادي مستقل للعمل والمسار المهني</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700 leading-relaxed">
          <section className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />1. طبيعة NEXT JOB</h3>
            <p className="text-amber-950 font-medium">
              NEXT JOB مركز إرشادي مستقل يقدم مقالات وأدلة وأدوات عامة تساعد الباحث على تنظيم خطواته المهنية واتخاذ قرارات أكثر وعيًا.
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-900">
              <li>ليست جهة حكومية، ولا تمثل وزارة الموارد البشرية أو منصة قوى أو أي جهة رسمية.</li>
              <li>ليست مكتب توظيف أو استقدام أو إسناد عمالي، ولا تستقبل طلبات التوظيف نيابة عن أصحاب العمل.</li>
              <li>لا تضمن الحصول على وظيفة أو قبول مرشح، ولا تكون طرفًا في أي عقد عمل أو اتفاق مالي.</li>
              <li>أي عقد أو رخصة عمل أو تغيير مهنة أو نقل خدمات يجب التحقق منه وإتمامه عبر الجهات والمنصات الرسمية المختصة بحسب الحالة.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-600" />2. الاستخدام المسؤول</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>لا تعتمد على أي إعلان أو جهة خارجية قبل التحقق من المصدر والهوية والتفاصيل الأساسية.</li>
              <li>لا تدفع رسومًا مقابل وعد بالحصول على وظيفة أو مقابلة أو أولوية قبول.</li>
              <li>لا تشارك كلمات المرور أو رموز OTP أو بيانات الدخول الحكومية أو البنكية مع أي طرف.</li>
              <li>عند وجود معلومات نظامية أو إجراءات رسمية، يُرجع دائمًا إلى المصدر الحكومي الساري.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-600" />3. الخصوصية والبيانات</h3>
            <p>نستخدم الحد الأدنى اللازم من التخزين المحلي والبيانات التقنية لتشغيل الموقع وحفظ التفضيلات وتحسين الأداء والأمان. لا نبيع البيانات الشخصية للمعلنين أو الجهات التسويقية.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>قد تُحفظ بعض التفضيلات محليًا على جهازك، مثل العناصر المحفوظة واختيارات الخصوصية.</li>
              <li>لا تطلب NEXT JOB كلمات المرور أو رموز OTP أو بيانات الدخول إلى قوى أو أبشر أو الحسابات البنكية.</li>
              <li>لا ينبغي إرسال صور الهوية أو الإقامة أو الوثائق الحساسة عبر حقول أو قنوات عامة.</li>
              <li>قد تُستخدم خدمات تقنية لازمة للاستضافة والأمان والقياس وفق إعدادات الموقع واختيارات الخصوصية.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" />4. ملفات تعريف الارتباط والقياس</h3>
            <p>يستخدم الموقع التخزين الضروري لتشغيل الوظائف الأساسية. ويمكنك اختيار السماح بقياس الاستخدام للمساعدة في تحسين تجربة الموقع. يمكنك تعديل تفضيلاتك من مركز الخصوصية في أي وقت.</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">5. المحتوى الإرشادي</h3>
            <p>المقالات والحاسبات والأدلة في NEXT JOB محتوى إرشادي عام وليست استشارة قانونية أو محاسبية أو ضمانًا لنتيجة إجراء حكومي. عند اتخاذ قرار يتعلق بعقد أو رخصة أو نقل خدمات أو مهنة، يجب الرجوع إلى المصدر الحكومي الرسمي الساري.</p>
          </section>

          <p className="text-[11px] text-slate-500">لمزيد من التفاصيل حول حدود الخدمة والمصادر الرسمية، راجع <a href="/compliance/" className="text-emerald-700 font-bold underline">سياسة الامتثال والمصادر</a>.</p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold">فهمت</button>
        </div>
      </div>
    </div>
  );
};
