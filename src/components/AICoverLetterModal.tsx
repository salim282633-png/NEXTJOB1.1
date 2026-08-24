import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, MessageCircle, FileText, Lightbulb, RefreshCw, Send } from 'lucide-react';
import { generateJobPitch } from '../lib/gemini';
import { Job } from '../types';

interface AICoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob?: Job | null;
}

export const AICoverLetterModal: React.FC<AICoverLetterModalProps> = ({
  isOpen,
  onClose,
  selectedJob
}) => {
  const [candidateName, setCandidateName] = useState('');
  const [jobTitle, setJobTitle] = useState(selectedJob?.title || 'محاسب مالي');
  const [companyName, setCompanyName] = useState(selectedJob?.company || 'الشركة / المنشأة');
  const [experience, setExperience] = useState('3 سنوات');
  const [iqamaStatus, setIqamaStatus] = useState('إقامة سارية وقابلة للنقل');
  const [customNotes, setCustomNotes] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState<{
    whatsappMessage: string;
    formalCoverLetter: string;
    interviewTips: string[];
  } | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'whatsapp' | 'formal' | 'tips'>('whatsapp');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedJob) {
      setJobTitle(selectedJob.title);
      setCompanyName(selectedJob.company);
    }
  }, [selectedJob]);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    try {
      const result = await generateJobPitch({
        jobTitle,
        companyName,
        candidateName,
        experienceYears: experience,
        iqamaStatus,
        customNotes
      });
      setGeneratedPitch(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openInWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="ai-modal-container"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">مستشار التقديم الذكي (AI)</h2>
              <p className="text-xs text-slate-500 mt-1">صياغة رسائل تقديم واتساب وسيرة ذاتية قوية ومقنعة</p>
            </div>
          </div>

          <button
            id="btn-close-ai-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Inputs Section */}
          <form onSubmit={handleGenerate} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسمك الكامل</label>
                <input
                  id="input-ai-applicant-name"
                  type="text"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  placeholder="مثال: يحيى صالح"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوظيفة المستهدفة</label>
                <input
                  id="input-ai-job-title"
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="مثال: معلم شاورما، محاسب، كاشير..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المنشأة</label>
                <input
                  id="input-ai-company"
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="اسم المطعم أو المؤسسة"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الخبرة</label>
                <input
                  id="input-ai-exp"
                  type="text"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="مثال: 3 سنوات بالسعودية"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">وضع الإقامة</label>
                <select
                  id="select-ai-iqama"
                  value={iqamaStatus}
                  onChange={e => setIqamaStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="إقامة سارية وقابلة للنقل">إقامة سارية وقابلة للنقل</option>
                  <option value="تأشيرة زيارة / هوية زائر">تأشيرة زيارة / هوية زائر</option>
                  <option value="إقامة سارية دون نقل">إقامة سارية دون نقل</option>
                  <option value="مهن فردية / سائق خاص">مهن فردية / سائق خاص</option>
                </select>
              </div>
            </div>

            <button
              id="btn-generate-ai-pitch"
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ صياغة الرسالة والنصائح...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد الرسالة الذكية الآن</span>
                </>
              )}
            </button>
          </form>

          {/* Results Display */}
          {generatedPitch && (
            <div className="space-y-3 animate-in fade-in duration-300">
              
              {/* Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
                <button
                  id="tab-ai-whatsapp"
                  onClick={() => setActiveSubTab('whatsapp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeSubTab === 'whatsapp'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>رسالة الواتساب السريعة</span>
                </button>

                <button
                  id="tab-ai-formal"
                  onClick={() => setActiveSubTab('formal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeSubTab === 'formal'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>خطاب التقديم الرسمي</span>
                </button>

                <button
                  id="tab-ai-tips"
                  onClick={() => setActiveSubTab('tips')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeSubTab === 'tips'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>نصائح المقابلة</span>
                </button>
              </div>

              {/* Tab 1: WhatsApp Message */}
              {activeSubTab === 'whatsapp' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                    {generatedPitch.whatsappMessage}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      id="btn-copy-ai-wa"
                      onClick={() => handleCopyText(generatedPitch.whatsappMessage)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'تم النسخ' : 'نسخ الرسالة'}</span>
                    </button>

                    <button
                      id="btn-share-ai-wa"
                      onClick={() => openInWhatsApp(generatedPitch.whatsappMessage)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال عبر الواتساب</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Formal Cover Letter */}
              {activeSubTab === 'formal' && (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {generatedPitch.formalCoverLetter}
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      id="btn-copy-ai-formal"
                      onClick={() => handleCopyText(generatedPitch.formalCoverLetter)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'تم النسخ' : 'نسخ الخطاب'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Tips */}
              {activeSubTab === 'tips' && (
                <div className="space-y-2">
                  {generatedPitch.interviewTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl text-xs text-amber-900 font-medium">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
