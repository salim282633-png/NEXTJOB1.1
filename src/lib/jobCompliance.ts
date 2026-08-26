const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

function normalizeArabicText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/ـ/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const BLOCKED_JOB_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /بدون\s+(?:نقل\s+)?(?:خدمات|كفاله)/,
    message: 'لا يُسمح بإعلانات توحي بالعمل لدى صاحب عمل آخر دون اتباع إجراءات نقل الخدمات النظامية.'
  },
  {
    pattern: /(?:اشتغل|اعمل|العمل|عمل)\s+(?:علي|على)\s+كفيلك/,
    message: 'لا يُسمح بصياغات تدعو للعمل لدى الغير خارج الإجراءات النظامية.'
  },
  {
    pattern: /بدون\s+اقام(?:ه|ة)/,
    message: 'لا يُسمح بإعلانات تعرض العمل دون وضع إقامة أو تصريح عمل نظامي.'
  },
  {
    pattern: /(?:بيع|شراء)\s+(?:تاشيره|تأشيره|تأشيرة|فيزا|كفاله)/,
    message: 'لا يُسمح بإعلانات بيع أو شراء التأشيرات أو الكفالات.'
  },
  {
    pattern: /(?:تاشيره|تأشيره|تأشيرة|فيزا)\s+حره/,
    message: 'لا يُسمح بصياغات التأشيرة أو الفيزا الحرة.'
  },
  {
    pattern: /تاجير\s+(?:عامل|عمال|عماله)/,
    message: 'لا يُسمح بإعلانات تأجير العمالة أو الإسناد العمالي عبر NEXT JOB.'
  },
  {
    pattern: /(?:عامله\s+منزليه|عامل\s+منزلي|خادمه|مربيه\s+منزليه|سائق\s+خاص)/,
    message: 'NEXT JOB لا تستقبل إعلانات العمالة المنزلية في هذا المسار.'
  },
  {
    pattern: /استقدام\s+(?:عامل|عمال|عماله)/,
    message: 'NEXT JOB لا تقدم أو تنشر خدمات الاستقدام عبر نموذج الوظائف.'
  }
];

export function findJobComplianceIssue(parts: Array<string | undefined | null>): string | null {
  const text = normalizeArabicText(parts.filter(Boolean).join(' '));
  if (!text) return null;

  for (const rule of BLOCKED_JOB_PATTERNS) {
    if (rule.pattern.test(text)) return rule.message;
  }

  return null;
}

export const EMPLOYER_COMPLIANCE_ATTESTATION =
  'أقر بأن الفرصة حقيقية، وأن التوظيف والعقد ورخصة العمل ونقل الخدمات - عند الحاجة - ستتم عبر الإجراءات والمنصات الرسمية في المملكة، وأنني لن أطلب من الباحث أي رسوم مقابل التوظيف.';

export const PLATFORM_COMPLIANCE_NOTICE =
  'NEXT JOB منصة تقنية لعرض الفرص والتواصل المباشر فقط؛ ليست مكتب استقدام أو شركة إسناد عمالي، ولا تنفذ نقل الخدمات أو العقود نيابة عن الأطراف.';
