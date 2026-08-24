import { GoogleGenAI } from '@google/genai';

export interface JobPitchResult {
  whatsappMessage: string;
  formalCoverLetter: string;
  interviewTips: string[];
  source: 'gemini' | 'fallback';
}

function fallback(params: {
  jobTitle: string;
  companyName: string;
  candidateName?: string;
  candidateProfession?: string;
  experienceYears?: string;
  iqamaStatus?: string;
  customNotes?: string;
}): JobPitchResult {
  const name = params.candidateName?.trim() || 'المتقدم';
  const profession = params.candidateProfession?.trim() || params.jobTitle;
  const exp = params.experienceYears?.trim() || 'خبرة عملية مناسبة';
  const iqama = params.iqamaStatus?.trim() || 'حسب البيانات المقدمة';
  return {
    source: 'fallback',
    whatsappMessage: `السلام عليكم ورحمة الله وبركاته،\nبخصوص إعلان وظيفة (${params.jobTitle}) لدى ${params.companyName || 'المنشأة'}، أود التقدم للشاغر.\n\nالاسم: ${name}\nالمهنة: ${profession}\nالخبرة: ${exp}\nالوضع النظامي: ${iqama}${params.customNotes ? `\nملاحظة: ${params.customNotes}` : ''}\n\nيسعدني تزويدكم بأي معلومات إضافية وتحديد موعد للمقابلة.`,
    formalCoverLetter: `السادة في ${params.companyName || 'المنشأة'}،\nتحية طيبة،\n\nأتقدم لشغل وظيفة (${params.jobTitle}). أمتلك ${exp}، وأرغب في مناقشة مدى ملاءمة خبرتي لمتطلبات الشاغر. وضعي النظامي: ${iqama}.\n\nوتفضلوا بقبول الاحترام،\n${name}`,
    interviewTips: [
      'راجع وصف الوظيفة وحدد أمثلة حقيقية من خبرتك مرتبطة بالمهام المطلوبة.',
      'لا تدّعِ شهادات أو خبرات غير موجودة، واذكر موعد المباشرة ووضع الإقامة بدقة.',
      'لا تدفع أي رسوم مقابل التوظيف، وتحقق من هوية صاحب العمل قبل مشاركة مستندات حساسة.'
    ]
  };
}

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

function validResult(value: unknown): value is Omit<JobPitchResult, 'source'> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.whatsappMessage === 'string' &&
    typeof v.formalCoverLetter === 'string' &&
    Array.isArray(v.interviewTips) &&
    v.interviewTips.every(item => typeof item === 'string');
}

export async function generateJobPitch(params: {
  jobTitle: string;
  companyName: string;
  candidateName?: string;
  candidateProfession?: string;
  experienceYears?: string;
  iqamaStatus?: string;
  customNotes?: string;
}): Promise<JobPitchResult> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) return fallback(params);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `أنت مساعد توظيف عربي لمنصة NEXT JOB. اكتب محتوى مهنيًا دقيقًا دون اختلاق خبرات أو شهادات. لا تعد المستخدم بالحصول على الوظيفة ولا تطلب دفع رسوم.\n\nبيانات المتقدم والوظيفة:\n${JSON.stringify(params, null, 2)}\n\nأعد JSON صالحًا فقط بالشكل التالي:\n{"whatsappMessage":"...","formalCoverLetter":"...","interviewTips":["...","...","..."]}\nاجعل رسالة واتساب مختصرة، والخطاب رسميًا، والنصائح عملية ومناسبة للسعودية.`;

    const response = await ai.models.generateContent({
      model: (import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash').trim(),
      contents: prompt,
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    });

    const parsed = extractJson(response.text || '');
    if (!validResult(parsed)) throw new Error('INVALID_GEMINI_RESPONSE');
    return { ...parsed, source: 'gemini' };
  } catch (error) {
    console.warn('Gemini unavailable; safe local fallback used.', error);
    return fallback(params);
  }
}
