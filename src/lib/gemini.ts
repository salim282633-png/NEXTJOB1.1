export interface JobPitchResult {
  whatsappMessage: string;
  formalCoverLetter: string;
  interviewTips: string[];
  source: 'gemini' | 'fallback';
}

type JobPitchParams = {
  jobTitle: string;
  companyName: string;
  candidateName?: string;
  candidateProfession?: string;
  experienceYears?: string;
  iqamaStatus?: string;
  customNotes?: string;
};

function fallback(params: JobPitchParams): JobPitchResult {
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

function validResult(value: unknown): value is Omit<JobPitchResult, 'source'> {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.whatsappMessage === 'string' &&
    typeof v.formalCoverLetter === 'string' &&
    Array.isArray(v.interviewTips) &&
    v.interviewTips.every(item => typeof item === 'string');
}

/**
 * Client code must never receive a Gemini API key. If a server-side proxy is
 * configured, this function can use it; otherwise NEXT JOB falls back to a
 * deterministic local draft that does not send candidate data off-device.
 */
export async function generateJobPitch(params: JobPitchParams): Promise<JobPitchResult> {
  const proxyEndpoint = String(import.meta.env.VITE_GEMINI_PROXY_ENDPOINT || '').trim();
  if (!proxyEndpoint) return fallback(params);

  try {
    const endpoint = new URL(proxyEndpoint, window.location.origin);
    if (endpoint.protocol !== 'https:' && endpoint.origin !== window.location.origin) {
      throw new Error('INSECURE_GEMINI_PROXY_ENDPOINT');
    }

    const response = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(params),
      credentials: endpoint.origin === window.location.origin ? 'same-origin' : 'omit'
    });

    if (!response.ok) {
      throw new Error(`GEMINI_PROXY_FAILED_${response.status}`);
    }

    const parsed: unknown = await response.json();
    if (!validResult(parsed)) throw new Error('INVALID_GEMINI_PROXY_RESPONSE');
    return { ...parsed, source: 'gemini' };
  } catch (error) {
    console.warn('Secure Gemini proxy unavailable; safe local fallback used.', error);
    return fallback(params);
  }
}
