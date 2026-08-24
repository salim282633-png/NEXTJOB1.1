import { GoogleGenAI } from '@google/genai';

// Client-safe generator with offline fallback templates
export async function generateJobPitch(params: {
  jobTitle: string;
  companyName: string;
  candidateName?: string;
  candidateProfession?: string;
  experienceYears?: string;
  iqamaStatus?: string;
  customNotes?: string;
}): Promise<{ whatsappMessage: string; formalCoverLetter: string; interviewTips: string[] }> {
  const name = params.candidateName || 'أحد المتقدمين المهتمين';
  const profession = params.candidateProfession || params.jobTitle;
  const exp = params.experienceYears || 'خبرة عملية متميزة';
  const iqama = params.iqamaStatus || 'إقامة سارية وقابلة للنقل';

  // Fallback high-quality template
  const defaultWhatsApp = `السلام عليكم ورحمة الله وبركاته،
حياكم الله ${params.companyName || 'أصحاب العمل الكرام'}،
بخصوص إعلانكم عن وظيفة (${params.jobTitle}) في منصة NEXT JOB:

أود التقدم لهذه الفرصة الكريمة.
- الاسم: ${name}
- التخصص / المهنة: ${profession}
- سنوات الخبرة: ${exp}
- الوضع النظامي: ${iqama}
${params.customNotes ? `- ملاحظات إضافية: ${params.customNotes}` : ''}

مستعد لمباشرة العمل والمقابلة الشخصية في أي وقت يناسبكم. يسعدني التواصل معكم.
شكراً لكم،
${name}`;

  const defaultCoverLetter = `السادة / إداريي التوظيف في ${params.companyName || 'المؤسسة الموقرة'}،
تحية طيبة وبعد،

يسرني أن أتقدم بطلبي لشغل وظيفة (${params.jobTitle}) المعلنة لديكم. حيث أمتلك خبرة عملية تمتد لـ (${exp}) في هذا المجال داخل المملكة، مع إلمام تام بالمتطلبات المهنية والالتزام بأعلى معايير الجودة والأمانة في أداء المهام.

إن وضعي النظامي (${iqama}) يتيح لي سرعة الانضمام لفريق عملكم والمساهمة الفاعلة في تحقيق أهداف المنشأة.

وتفضلوا بقبول فائق الاحترام والتقدير،
مقدم الطلب: ${name}`;

  const defaultTips = [
    'احرص على إرسال الرسالة في أوقات العمل الرسمية (من 9 صباحاً حتى 6 مساءً).',
    'أرفق مع الرسالة أي شهادات أو صور لأعمالك ومشاريعك السابقة إن وجدت.',
    'كن مستعداً للإجابة عن سؤال: متى يمكنك مباشرة العمل؟ ورخصتك ووضع إقامتك.'
  ];

  return {
    whatsappMessage: defaultWhatsApp,
    formalCoverLetter: defaultCoverLetter,
    interviewTips: defaultTips
  };
}
