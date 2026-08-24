import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Banknote, 
  Clock, 
  CheckCircle, 
  Home, 
  Truck, 
  PhoneCall, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Check, 
  AlertTriangle,
  Briefcase,
  Sparkles,
  UserCheck,
  Utensils,
  Clock3,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Copy,
  ChevronDown
} from 'lucide-react';
import { Job } from '../types';
import { WHATSAPP_PITCH_TEMPLATES } from '../lib/data';

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (job: Job) => void;
  onOpenAICoverLetterForJob: (job: Job) => void;
  onReportFraud?: (job: Job) => void;
  onBumpJob?: (jobId: string) => void;
  currentCandidateName?: string;
  currentCandidateExp?: string;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  isSaved,
  onToggleSave,
  onOpenAICoverLetterForJob,
  onReportFraud,
  onBumpJob,
  currentCandidateName = '',
  currentCandidateExp = ''
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('experienced');
  const [showShareCard, setShowShareCard] = useState<boolean>(false);
  const [copiedShareText, setCopiedShareText] = useState(false);

  if (!job) return null;

  const cleanPhone = job.whatsapp ? job.whatsapp.replace(/[^0-9]/g, '') : job.phone.replace(/[^0-9]/g, '');

  const activeTemplate = WHATSAPP_PITCH_TEMPLATES.find(t => t.id === selectedTemplateId) || WHATSAPP_PITCH_TEMPLATES[0];
  const generatedPitchText = activeTemplate.generateText(job, currentCandidateName, currentCandidateExp);

  const generateWhatsAppUrl = () => {
    const text = encodeURIComponent(generatedPitchText);
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(generatedPitchText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const shareTextFormatted = 
    `📢 فرصة عمل جديدة لليمنيين بالسعودية عبر NEXT JOB:\n` +
    `💼 المسمى: ${job.title}\n` +
    `🏢 المنشأة: ${job.company}\n` +
    `📍 المدينة: ${job.city}\n` +
    `💰 الراتب: ${job.salary || 'مجزٍ'}\n` +
    `${job.sponsorshipTransfer ? '✅ نقل خدمات متاح عبر قوى\n' : ''}` +
    `${job.accommodationProvided ? '🏠 سكن مؤمن\n' : ''}` +
    `📱 للتواصل المباشر مع صاحب العمل: ${job.phone}\n` +
    `🔗 الرابط: ${window.location.href}`;

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(shareTextFormatted);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="job-detail-modal-container"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 flex flex-col"
      >
        
        {/* Header bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              تفاصيل الوظيفة
            </span>
            {job.urgent && (
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                توظيف فوري
              </span>
            )}
            {job.status === 'recently_confirmed' && (
              <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                مؤكدة
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShareCard(!showShareCard)}
              className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
              title="مشاركة وبطاقة الإعلان"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              id="btn-modal-save"
              onClick={() => onToggleSave(job)}
              className={`p-2 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200'
              }`}
              title="حفظ"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
            </button>

            <button
              id="btn-modal-close"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Title & Organization */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight mb-2">
              {job.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{job.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>نُشرت {job.createdAt}</span>
              </div>
              {onBumpJob && (
                <button
                  onClick={() => onBumpJob(job.id)}
                  className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                  title="تحديث تاريخ الإعلان ورفعه للأعلى"
                >
                  <RefreshCw className="w-3 h-3" />
                  تحديث الإعلان ورفعه
                </button>
              )}
            </div>
          </div>

          {/* Social Share Preview Card if toggled */}
          {showShareCard && (
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  بطاقة المشاركة المباشرة (واتساب / تويتر / تليجرام):
                </span>
                <button
                  onClick={() => setShowShareCard(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 text-xs font-mono whitespace-pre-line text-slate-200 leading-relaxed">
                {shareTextFormatted}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyShareText}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedShareText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedShareText ? 'تم نسخ نص المشاركة!' : 'نسخ نص الإعلان للمشاركة'}
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  {copiedLink ? 'تم نسخ الرابط' : 'نسخ الرابط'}
                </button>
              </div>
            </div>
          )}

          {/* Quick Specifications Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">الراتب المتوقع</span>
              <span className="text-sm font-bold text-slate-900">{job.salary || 'يحدد بعد المقابلة'}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">نوع الدوام</span>
              <span className="text-sm font-bold text-slate-900">{job.jobType}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">نقل الكفالة</span>
              <span className={`text-sm font-bold ${job.sponsorshipTransfer ? 'text-emerald-700' : 'text-slate-600'}`}>
                {job.sponsorshipTransfer ? 'متاح ومؤمن عبر قوى' : 'حسب الاتفاق'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block mb-0.5">الخبرة المطلوبة</span>
              <span className="text-sm font-bold text-slate-900">{job.experienceYears || 'غير محدد'}</span>
            </div>
          </div>

          {/* Key Advantages Tags */}
          <div className="flex flex-wrap gap-2">
            {job.sponsorshipTransfer && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>نقل خدمات وكفالة عبر منصة قوى</span>
              </span>
            )}
            {job.accommodationProvided && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-xl">
                <Home className="w-4 h-4 text-sky-600" />
                <span>السكن مؤمن ومجاني</span>
              </span>
            )}
            {job.transportationProvided && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>المواصلات متوفرة</span>
              </span>
            )}
            {job.mealsProvided && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl">
                <Utensils className="w-4 h-4 text-purple-600" />
                <span>الوجبات مؤمنة</span>
              </span>
            )}
            {job.overtimeAvailable && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <Clock3 className="w-4 h-4 text-emerald-600" />
                <span>إضافي (أوفرتايم) متاح</span>
              </span>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>تفاصيل العمل والمهام المطلوبة</span>
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-700 leading-relaxed whitespace-pre-line border border-slate-100">
              {job.description}
            </div>
          </div>

          {/* Requirements if present */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>شروط ومتطلبات الوظيفة</span>
              </h3>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* WhatsApp Smart Pitch Selector */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                اختر صيغة رسالة الواتساب الأنسب لحالتك:
              </h4>
              <button
                onClick={() => onOpenAICoverLetterForJob(job)}
                className="text-[11px] text-emerald-700 hover:underline font-bold flex items-center gap-1"
              >
                توليد بالذكاء الاصطناعي ✨
              </button>
            </div>

            {/* Template Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WHATSAPP_PITCH_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-2 rounded-xl text-right text-[11px] font-bold border transition-all ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block truncate">{tmpl.title}</span>
                  <span className={`text-[9px] block ${selectedTemplateId === tmpl.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {tmpl.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Preview Box */}
            <div className="relative">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">
                {generatedPitchText}
              </div>
              <button
                onClick={handleCopyPitch}
                className="absolute left-2.5 top-2.5 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] flex items-center gap-1 transition-colors"
                title="نسخ النص"
              >
                {copiedPitch ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPitch ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* Direct Contact Actions */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">التواصل المباشر مع صاحب العمل</h4>
                <p className="text-xs text-slate-400">
                  {job.contactPerson ? `المسؤول: ${job.contactPerson}` : 'تواصل فوري بدون وسطاء أو رسوم'}
                </p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                متاح الآن
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* WhatsApp Direct Link */}
              <a
                id="btn-modal-whatsapp-apply"
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl transition-all shadow-md active:scale-95 text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                <span>إرسال عبر الواتساب فوراً</span>
              </a>

              {/* Call Phone Link */}
              <button
                id="btn-modal-phone-call"
                onClick={() => window.location.href = `tel:${job.phone}`}
                className="flex items-center justify-center gap-2 py-3.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all active:scale-95 text-sm"
              >
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                <span dir="ltr">{job.phone}</span>
              </button>

            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>لا تدفع أي رسوم توظيف. منصة NEXT JOB مجانية 100%.</span>
              </div>

              {onReportFraud && (
                <button
                  onClick={() => onReportFraud(job)}
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  إبلاغ عن الإعلان
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
