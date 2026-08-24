import React from 'react';
import { ShieldCheck, X, FileText, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrivacyAndTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyAndTermsModal: React.FC<PrivacyAndTermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" id="privacy-modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]" id="privacy-modal">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">الشروط والأحكام وسياسة الخصوصية</h2>
              <p className="text-xs text-slate-300">منصة NEXT JOB - الشفافية والأمان النظامي</p>
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Platform Nature & Legal Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              1. الطبيعة القانونية للمنصة وإخلاء المسؤولية:
            </h3>
            <p className="text-amber-950 font-medium">
              منصة <strong>NEXT JOB</strong> هي منصة تقنية عربية لتبادل الإعلانات الوظيفية المباشرة بين أصحاب العمل والباحثين عن عمل من المقيمين اليمنيين في المملكة العربية السعودية. 
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-900">
              <li>المنصة <strong>ليست مكتب توظيف أو استقدام</strong> ولا تتقاضى أي عمولة توظيف من أي باحث.</li>
              <li>المنصة ليست طرفاً في أي عقد عمل أو اتفاق مالي، وتتم جميع العقود والاتفاقيات بين الطرفين وفق نظام العمل السعودي ومنصة "قوى" الحكومية.</li>
              <li>المنصة تحظر تماماً طلب أي مبالغ مالية مقابل التوظيف وتدعو للتبليغ الفوري عن أي مخالف.</li>
            </ul>
          </div>

          {/* Section 2: Zero Sale of Data & Privacy */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              2. سياسة الخصوصية وحماية البيانات الشخصية:
            </h3>
            <p>
              نحن نلتزم بحماية خصوصية بياناتك بأعلى المعايير:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="block text-slate-800 mb-1">عدم بيع البيانات:</strong>
                <p className="text-slate-600">لا نقوم ببيع أو تأجير أرقام الجوالات أو السير الذاتية لأي جهات تسويقية أو شركات خارجية.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <strong className="block text-slate-800 mb-1">التحكم الكامل في الظهور:</strong>
                <p className="text-slate-600">يحق للباحث إخفاء ملفه بالكامل أو إيقاف استقبال رسائل التواصل بنقرة زر في أي وقت.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Google AdSense & Cookies */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              3. الإعلانات وملفات تعريف الارتباط (Cookies & AdSense):
            </h3>
            <p>
              تستخدم المنصة شبكة إعلانات Google AdSense للمساعدة في تغطية تكاليف السيرفرات والتشغيل المجاني. قد تستخدم Google ملفات تعريف الارتباط لعرض الإعلانات استناداً إلى زياراتك السابقة. يمكنك تعديل تفضيلات الموافقة الإعلانية في أي وقت عبر زر "إعدادات الخصوصية والكوكيز" في أسفل الموقع.
            </p>
          </div>

          {/* Section 4: Rules for Posting Jobs */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">4. قواعد وشروط نشر إعلانات التوظيف:</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>يجب أن تكون الوظيفة حقيقية وشاغرة وتتضمن بيانات واضحة عن المهنة والمدينة والتواصل.</li>
              <li>يحظر نشر أي وظائف تخالف الأنظمة السعودية أو تطلب عمولات أو رسوم تقديم مسبقة.</li>
              <li>يحق لإدارة المنصة حذف أي إعلان أو حظر أي حساب يخالف معايير الأمان دون إشعار مسبق.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            فهمت وموافق على الشروط
          </button>
        </div>
      </div>
    </div>
  );
};
