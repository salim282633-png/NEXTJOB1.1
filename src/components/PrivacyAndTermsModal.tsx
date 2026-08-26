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
              <h2 id="privacy-title" className="text-lg font-bold">شروط الاستخدام والخصوصية والامتثال</h2>
              <p className="text-xs text-slate-300">NEXT JOB — سياسة تشغيلية للمنصة التقنية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700 leading-relaxed">
          <section className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />1. طبيعة NEXT JOB</h3>
            <p className="text-amber-950 font-medium">
              NEXT JOB منصة تقنية مستقلة لعرض فرص العمل والملفات المهنية وتسهيل التواصل المباشر بين الباحثين وأصحاب العمل داخل المملكة العربية السعودية.
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-900">
              <li>ليست جهة حكومية، ولا تمثل وزارة الموارد البشرية أو منصة قوى أو أي جهة رسمية.</li>
              <li>ليست مكتب استقدام أو شركة توظيف أو إسناد عمالي، ولا تنفذ نقل الخدمات أو العقود أو التأشيرات نيابة عن الأطراف.</li>
              <li>لا تضمن الحصول على وظيفة أو قبول مرشح، ولا تكون طرفًا في عقد العمل أو الاتفاق المالي بين المستخدمين.</li>
              <li>أي عقد أو رخصة عمل أو تغيير مهنة أو نقل خدمات يجب إتمامه عبر الإجراءات والمنصات الرسمية بحسب الحالة.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-600" />2. الأنشطة والإعلانات غير المقبولة</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>العمل لدى الغير أو لحساب الغير خارج الإجراءات النظامية، أو عبارات مثل «اشتغل على كفيلك» و«بدون نقل خدمات».</li>
              <li>بيع أو شراء التأشيرات أو الكفالات، أو عرض «تأشيرة حرة» أو خدمات مشابهة.</li>
              <li>تأجير العمالة أو الإسناد العمالي أو ممارسة الاستقدام من خلال نماذج الوظائف.</li>
              <li>إعلانات العمالة المنزلية؛ هذا المسار غير مدعوم في NEXT JOB.</li>
              <li>طلب رسوم من الباحث مقابل وعد بالتوظيف أو المقابلة أو أولوية القبول.</li>
              <li>أي إعلان مضلل أو وهمي أو يخالف الأنظمة أو يطلب مستندات أو بيانات لا حاجة لها في مرحلة التقديم.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-600" />3. الخصوصية والبيانات الشخصية</h3>
            <p>نجمع البيانات اللازمة لتشغيل الملف المهني والإعلانات والتواصل والأمان فقط بحسب الميزة المستخدمة. لا نبيع أو نؤجر أرقام الجوال أو السير الذاتية لجهات تسويقية.</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>يمكن للباحث التحكم في ظهور ملفه وإيقاف استقبال التواصل وفق الخيارات المتاحة.</li>
              <li>لا تطلب NEXT JOB كلمات المرور أو رموز OTP أو بيانات الدخول إلى قوى أو أبشر أو الحسابات البنكية.</li>
              <li>لا ينبغي رفع صور الهوية أو الإقامة أو الوثائق الرسمية إلى حقول عامة في المنصة.</li>
              <li>قد تستخدم خدمات تقنية خارجية لازمة للتشغيل والاستضافة والمصادقة والتحليلات وفق إعدادات المنصة وسياسة الموافقة.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" />4. الإعلانات وملفات تعريف الارتباط</h3>
            <p>قد تستخدم المنصة Google AdSense أو خدمات قياس وتشغيل عند تفعيلها. يمكن للمستخدم إدارة تفضيلات الموافقة من إعدادات الخصوصية والكوكيز المتاحة في الموقع.</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">5. قواعد نشر الوظائف</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>يجب أن تكون الفرصة حقيقية، وأن يذكر المعلن اسم المنشأة أو صاحب العمل ومعلومات تواصل صحيحة.</li>
              <li>على صاحب الإعلان استخدام صياغة واضحة عن الراتب والمهام والمدينة والمزايا دون ضمانات مضللة.</li>
              <li>إذا كان نقل الخدمات مطلوبًا، فيجب وصفه على أنه إجراء نظامي يتم عبر قوى والجهات المختصة، وليس خدمة تقدمها NEXT JOB.</li>
              <li>يجوز للمنصة رفض أو إخفاء أو حذف أي إعلان يثير شبهة مخالفة أو احتيال أو إساءة استخدام.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">6. المحتوى الإرشادي</h3>
            <p>المقالات والحاسبات والأدلة في NEXT JOB محتوى إرشادي عام وليست استشارة قانونية أو محاسبية أو ضمانًا لنتيجة إجراء حكومي. عند اتخاذ قرار يتعلق بعقد أو رخصة أو نقل خدمات أو مهنة، يجب الرجوع إلى المصدر الحكومي الرسمي الساري.</p>
          </section>

          <p className="text-[11px] text-slate-500">يمكن الاطلاع على النسخة الموسعة من سياسة الامتثال ونشر الوظائف عبر صفحة <a href="/compliance/" className="text-emerald-700 font-bold underline">سياسة الامتثال</a>.</p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold">فهمت</button>
        </div>
      </div>
    </div>
  );
};
