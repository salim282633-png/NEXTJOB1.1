import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FEED_FILE = path.join(ROOT, 'public/jobs/external-jobs.json');
const CHECK_ONLY = process.argv.includes('--check');
const REQUEST_TIMEOUT_MS = 12_000;
const USER_AGENT = 'NEXTJOB-yemeni-audience-filter/1.2';

const SAUDI_RESTRICTION_PATTERNS = [
  /\bsaudi nationals?\b/i,
  /\bsaudi nationality\b/i,
  /\bsaudi citizens?\b/i,
  /\bksa nationals?\b/i,
  /\bsaudi applicants?\b/i,
  /\bsaudi candidates?\b/i,
  /\bfor saudis? only\b/i,
  /\bsaudis? only\b/i,
  /\bmust be (?:a )?saudi\b/i,
  /\bsaudi only\b/i,
  /\btamheer\b/i,
  /الجنسية\s+السعودية/,
  /سعودي(?:ة)?\s+الجنسية/,
  /للسعوديين(?:\s+فقط)?/,
  /للسعوديات(?:\s+فقط)?/,
  /يشترط[^.،؛]{0,50}سعودي/,
  /مطلوب[^.،؛]{0,35}سعودي(?:ة)?/,
  /سعودي(?:ة)?\s+فقط/,
  /برنامج\s+تمهير/,
  /تمهير/
];

const YEMENI_PRIORITY_PATTERNS = [
  /يمنيين/,
  /يمنيات/,
  /الجنسية\s+اليمنية/,
  /جنسية\s+يمنية\s+مفضلة/,
  /يفضل[^.،؛]{0,45}الجنسية\s+اليمنية/,
  /من\s+الجنسية\s+اليمنية/,
  /مطلوب[^.،؛]{0,45}يمني(?:ين|ات|ة)?/,
  /\byemeni nationals?\b/i,
  /\byemeni nationality\b/i,
  /\byemeni candidates?\b/i,
  /\byemeni applicants?\b/i,
  /\bprefer(?:red)?[^.]{0,40}yemeni\b/i,
  /\byemenis?\b/i
];

const UNIVERSITY_PATTERNS = [
  /\bbachelor(?:'s)?\b/i,
  /\bbachelor degree\b/i,
  /\buniversity degree\b/i,
  /\bcollege degree\b/i,
  /\bmaster(?:'s)? degree\b/i,
  /\bmba\b/i,
  /بكالوريوس/,
  /شهادة\s+جامعية/,
  /درجة\s+جامعية/,
  /مؤهل\s+جامعي/,
  /خريج\s+جامع/
];

const HIGH_SCHOOL_PATTERNS = [
  /\bhigh school\b/i,
  /\bsecondary school\b/i,
  /\bsecondary education\b/i,
  /ثانوية\s+عامة/,
  /شهادة\s+الثانوية/,
  /المؤهل\s+الثانوي/,
  /الثانوية\s+أو\s+ما\s+يعادلها/,
  /ثانوي(?:ة)?\s+فما\s+فوق/
];

const DIPLOMA_PATTERNS = [/\bdiploma\b/i, /دبلوم/];

const NO_DEGREE_PATTERNS = [
  /\bno degree required\b/i,
  /\bdegree not required\b/i,
  /\bno formal education\b/i,
  /\bno education required\b/i,
  /\bexperience only\b/i,
  /لا\s+يشترط[^.،؛]{0,30}(?:مؤهل|شهادة)/,
  /بدون\s+(?:مؤهل|شهادة)/,
  /لا\s+يتطلب[^.،؛]{0,30}(?:مؤهل|شهادة)/,
  /خبرة\s+فقط/
];

const RECRUITMENT_FEE_PATTERNS = [
  /رسوم\s+(?:التوظيف|التسجيل|القبول)/,
  /دفع\s+رسوم[^.،؛]{0,40}(?:التوظيف|الوظيفة|القبول)/,
  /تسديد\s+رسوم[^.،؛]{0,40}(?:التوظيف|الوظيفة|القبول)/,
  /تحويل\s+(?:مبلغ|رسوم)[^.،؛]{0,50}(?:للتوظيف|للقبول|للوظيفة)/,
  /عمولة\s+(?:توظيف|مكتب)/,
  /مقابل\s+التوظيف/,
  /\brecruitment fee\b/i,
  /\bapplication fee\b/i,
  /\bpay(?:ment)?[^.]{0,40}(?:to apply|for employment)\b/i
];

const SENIOR_TITLE_PATTERNS = [
  /\bsenior\b/i, /\blead\b/i, /\bmanager\b/i, /\bdirector\b/i, /\bhead of\b/i,
  /\bprincipal\b/i, /\bchief\b/i, /\bengineer\b/i, /\bdeveloper\b/i, /\banalyst\b/i,
  /\barchitect\b/i, /\bconsultant\b/i, /\bproduct manager\b/i, /\baccount manager\b/i,
  /\bfinance\b/i, /\bauditor\b/i, /\bcompliance\b/i,
  /مدير/, /مهندس/, /محلل/, /استشاري/, /رئيس\s+قسم/, /أخصائي\s+(?:أول|رئيسي)/
];

const TARGET_ROLE_RULES = [
  { key: 'security-guard', title: 'حارس أمن', category: 'security', patterns: [/\bsecurity guard\b/i, /\bsecurity officer\b/i, /حارس\s+أمن/, /حراسة\s+أمنية/] },
  { key: 'driver', title: 'سائق', category: 'drivers', patterns: [/\bdriver\b/i, /\bchauffeur\b/i, /سائق/] },
  { key: 'delivery', title: 'مندوب توصيل', category: 'drivers', patterns: [/\bdelivery (?:driver|rider|courier)\b/i, /\bcourier\b/i, /مندوب\s+توصيل/, /عامل\s+توصيل/] },
  { key: 'sales-representative', title: 'مندوب مبيعات', category: 'sales', patterns: [/\bsales representative\b/i, /\bsales rep\b/i, /\bsales executive\b/i, /\bsales agent\b/i, /\bfield sales\b/i, /مندوب\s+مبيعات/, /مسوق\s+ميداني/] },
  { key: 'sales-associate', title: 'بائع / موظف متجر', category: 'sales', patterns: [/\bsales associate\b/i, /\bretail associate\b/i, /\bstore associate\b/i, /\bshop assistant\b/i, /\bretail sales\b/i, /\bsalesman\b/i, /\bsaleswoman\b/i, /بائع/, /موظف\s+متجر/] },
  { key: 'cashier', title: 'كاشير', category: 'sales', patterns: [/\bcashier\b/i, /كاشير/, /أمين\s+صندوق/] },
  { key: 'customer-service', title: 'موظف خدمة عملاء', category: 'sales', patterns: [/\bcustomer service (?:agent|representative|associate)\b/i, /\bcustomer support (?:agent|representative|associate)\b/i, /\bcall center agent\b/i, /خدمة\s+عملاء/, /مركز\s+اتصال/] },
  { key: 'restaurant-worker', title: 'عامل مطعم', category: 'restaurants', patterns: [/\brestaurant (?:worker|crew|staff|team member)\b/i, /\bcrew member\b/i, /\bfood service worker\b/i, /عامل\s+مطعم/, /موظف\s+مطعم/] },
  { key: 'cook', title: 'طباخ', category: 'restaurants', patterns: [/\bcook\b/i, /\bchef\b/i, /طباخ/, /شيف/] },
  { key: 'kitchen-helper', title: 'مساعد مطبخ', category: 'restaurants', patterns: [/\bkitchen helper\b/i, /\bkitchen assistant\b/i, /\bkitchen crew\b/i, /مساعد\s+مطبخ/, /عامل\s+مطبخ/] },
  { key: 'barista', title: 'باريستا', category: 'restaurants', patterns: [/\bbarista\b/i, /باريستا/] },
  { key: 'waiter', title: 'مقدم طعام', category: 'restaurants', patterns: [/\bwaiter\b/i, /\bwaitress\b/i, /\bserver\b/i, /نادل/, /مقدم\s+طعام/] },
  { key: 'warehouse-worker', title: 'عامل مستودع', category: 'warehousing', patterns: [/\bwarehouse worker\b/i, /\bwarehouse associate\b/i, /\bpicker\b/i, /\bpacker\b/i, /\bmaterial handler\b/i, /عامل\s+مستودع/, /عامل\s+مخزن/, /منتقي\s+طلبات/] },
  { key: 'storekeeper', title: 'أمين مستودع', category: 'warehousing', patterns: [/\bstorekeeper\b/i, /\bwarehouse keeper\b/i, /أمين\s+مستودع/, /أمين\s+مخزن/] },
  { key: 'cleaner', title: 'عامل نظافة', category: 'maintenance', patterns: [/\bcleaner\b/i, /\bcleaning worker\b/i, /\bhousekeeper\b/i, /عامل\s+نظافة/, /نظافة/] },
  { key: 'general-worker', title: 'عامل', category: 'general', patterns: [/\bgeneral worker\b/i, /\blaborer\b/i, /\blabourer\b/i, /\bhelper\b/i, /عامل\s+عام/, /عامل\b/] },
  { key: 'technician', title: 'فني', category: 'technical', patterns: [/\btechnician\b/i, /\bmaintenance technician\b/i, /\belectrician\b/i, /\bplumber\b/i, /فني/, /كهربائي/, /سباك/] },
  { key: 'receptionist', title: 'موظف استقبال', category: 'general', patterns: [/\breceptionist\b/i, /\bfront desk\b/i, /موظف\s+استقبال/, /استقبال/] },
  { key: 'promoter', title: 'مروج مبيعات', category: 'sales', patterns: [/\bpromoter\b/i, /\bbrand promoter\b/i, /مروج\s+مبيعات/, /مروج/] },
  { key: 'merchandiser', title: 'مسؤول ترتيب وعرض المنتجات', category: 'sales', patterns: [/\bmerchandiser\b/i, /\bmerchandising associate\b/i, /مرتب\s+أرفف/, /عرض\s+المنتجات/] },
  { key: 'operations-assistant', title: 'مساعد عمليات', category: 'general', patterns: [/\boperations assistant\b/i, /\boperations associate\b/i, /مساعد\s+عمليات/] }
];

const ARABIC_COMPANY_NAMES = new Map([
  ['HALA', 'هلا'], ['Tamara', 'تمارا'], ['BRKZ', 'بركز'], ['SOUM', 'سوم'],
  ['Infinite pl', 'إنفنت بي إل'], ['Lalamove', 'لالاموف'], ['dLocal', 'دي لوكال'], ['Contentsquare', 'كونتنت سكوير']
]);

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&#39;|&#x27;/gi, "'").replace(/&#\d+;/g, ' ');
}

function plainText(value) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripLocationNoise(value) {
  return String(value || '')
    .replace(/saudi arabia/gi, ' ').replace(/kingdom of saudi arabia/gi, ' ')
    .replace(/المملكة العربية السعودية/g, ' ').replace(/داخل السعودية/g, ' ').replace(/في السعودية/g, ' ');
}

function hasAny(text, patterns) { return patterns.some(pattern => pattern.test(text)); }
function isSaudiRestricted(text) { return hasAny(stripLocationNoise(plainText(text)), SAUDI_RESTRICTION_PATTERNS); }
function hasExplicitYemeniAudience(text) { return hasAny(plainText(text), YEMENI_PRIORITY_PATTERNS); }
function requestsRecruitmentFee(text) { return hasAny(plainText(text), RECRUITMENT_FEE_PATTERNS); }

function isPrimarilyArabic(text) {
  const normalized = plainText(text);
  const arabicLetters = (normalized.match(/[\u0600-\u06FF]/g) || []).length;
  const latinLetters = (normalized.match(/[A-Za-z]/g) || []).length;
  return arabicLetters >= 20 && arabicLetters >= latinLetters;
}

function classifyQualification(text) {
  const normalized = plainText(text);
  if (hasAny(normalized, UNIVERSITY_PATTERNS)) return 'شهادة جامعية مطلوبة';
  if (hasAny(normalized, NO_DEGREE_PATTERNS)) return 'بدون شهادة جامعية';
  if (hasAny(normalized, HIGH_SCHOOL_PATTERNS)) return 'ثانوية عامة';
  if (hasAny(normalized, DIPLOMA_PATTERNS)) return 'دبلوم';
  return 'غير مذكور';
}

function inferTargetRole(value) {
  const normalized = plainText(value);
  const senior = hasAny(normalized, SENIOR_TITLE_PATTERNS);
  for (const rule of TARGET_ROLE_RULES) {
    if (!rule.patterns.some(pattern => pattern.test(normalized))) continue;
    if (senior && !['security-guard', 'driver', 'delivery', 'cook', 'barista', 'waiter', 'cleaner', 'general-worker'].includes(rule.key)) return null;
    return rule;
  }
  return null;
}

function isArabicTitle(value) {
  const text = String(value || '').trim();
  return /[\u0600-\u06FF]/.test(text) && !/[A-Za-z]/.test(text);
}

function arabicCompanyName(value) {
  const company = String(value || '').trim();
  if (ARABIC_COMPANY_NAMES.has(company)) return ARABIC_COMPANY_NAMES.get(company);
  if (/[\u0600-\u06FF]/.test(company) && !/[A-Za-z]/.test(company)) return company;
  return 'جهة توظيف';
}

function qualificationScore(level) {
  if (level === 'بدون شهادة جامعية') return 30;
  if (level === 'ثانوية عامة') return 25;
  if (level === 'دبلوم') return 12;
  if (level === 'غير مذكور') return 5;
  return -100;
}

function qualificationSentence(level) {
  if (level === 'بدون شهادة جامعية') return 'بحسب نص الإعلان، لا تظهر اشتراطات لشهادة جامعية.';
  if (level === 'ثانوية عامة') return 'المؤهل المناسب بحسب الإعلان: ثانوية عامة أو ما يعادلها.';
  if (level === 'دبلوم') return 'المؤهل المذكور في الإعلان: دبلوم أو ما يعادله.';
  return 'المؤهل الدراسي غير مذكور بوضوح في المصدر.';
}

function buildArabicDescription({ company, city, explicitYemeni, roleTitle, qualificationLevel }) {
  const audience = explicitYemeni
    ? 'الإعلان يذكر اليمنيين أو الجنسية اليمنية بصورة صريحة، ولذلك يظهر بأولوية قصوى.'
    : 'تم ترشيح الوظيفة لأنها من الأعمال التشغيلية والبسيطة الأكثر ملاءمة للفئة المستهدفة.';
  return [
    `فرصة ${roleTitle} في ${city} لدى ${company}.`, audience, qualificationSentence(qualificationLevel),
    'التقديم يتم عبر المصدر الأصلي، ويجب مراجعة جميع الشروط والتأكد من ملاءمة وضع الإقامة والعمل قبل التقديم.'
  ].join(' ');
}

function scoreJob({ explicitYemeni, role, qualificationLevel, sourcePublishedAt }) {
  const audienceScore = explicitYemeni ? 200 : 0;
  const roleScore = role ? 60 : 0;
  const recencyDays = Math.max(0, (Date.now() - Date.parse(sourcePublishedAt || 0)) / 86_400_000);
  const recencyScore = Number.isFinite(recencyDays) ? Math.max(0, 15 - Math.min(15, recencyDays)) : 0;
  return Math.round(audienceScore + roleScore + qualificationScore(qualificationLevel) + recencyScore);
}

async function fetchSourceText(job) {
  const embedded = plainText(job?.sourceText || '');
  if (embedded) return embedded;

  // RSS and community channels are never scraped here. Their reviewed/feed text must be embedded upstream.
  if (job?.sourceIngestion === 'rss' || job?.sourceIngestion === 'manual-community') return '';

  // Only official Lever/Greenhouse hosted listings may be fetched for eligibility text.
  if (!['lever', 'greenhouse'].includes(job?.sourceProvider) || !job?.sourceUrl) return '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(job.sourceUrl, {
      headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': USER_AGENT },
      signal: controller.signal,
      redirect: 'follow'
    });
    if (!response.ok) return '';
    const text = await response.text();
    return plainText(text.slice(0, 1_500_000));
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return output;
}

function validateTargetFeed(jobs) {
  const allowedQualifications = new Set(['بدون شهادة جامعية', 'ثانوية عامة', 'دبلوم', 'غير مذكور']);
  for (const job of jobs) {
    if (!job || typeof job !== 'object') throw new Error('Targeted job entry must be an object.');
    if (job.language !== 'ar') throw new Error(`${job.id}: language must be ar.`);
    if (!isArabicTitle(job.title)) throw new Error(`${job.id}: public job title must be Arabic only.`);
    if (!allowedQualifications.has(job.qualificationLevel)) throw new Error(`${job.id}: unsupported qualificationLevel.`);
    if (typeof job.targetRole !== 'string' || !job.targetRole.trim()) throw new Error(`${job.id}: targetRole is required.`);
    if (typeof job.audienceLabel !== 'string' || !job.audienceLabel.trim()) throw new Error(`${job.id}: audienceLabel is required.`);
    if (!Number.isFinite(job.priorityScore)) throw new Error(`${job.id}: priorityScore is required.`);
    if ('sourceText' in job) throw new Error(`${job.id}: raw sourceText must never be published.`);
    if (isSaudiRestricted(`${job.title} ${job.description} ${job.audienceLabel}`)) throw new Error(`${job.id}: Saudi-national restriction leaked into targeted feed.`);
    if (requestsRecruitmentFee(`${job.title} ${job.description}`)) throw new Error(`${job.id}: recruitment-fee language leaked into targeted feed.`);
    if (/[A-Za-z]{3,}/.test(String(job.description || ''))) throw new Error(`${job.id}: public description must stay Arabic.`);
  }
}

async function main() {
  const jobs = readJson(FEED_FILE, null);
  if (!Array.isArray(jobs)) throw new Error('public/jobs/external-jobs.json must contain an array.');

  if (CHECK_ONLY) {
    validateTargetFeed(jobs);
    console.log(`Yemeni-targeted Arabic jobs feed validated: ${jobs.length} job(s).`);
    return;
  }

  const processed = await mapLimit(jobs, 6, async job => {
    const sourceText = await fetchSourceText(job);
    const combinedText = `${job.title || ''} ${job.description || ''} ${sourceText || ''}`;

    if (!isPrimarilyArabic(combinedText)) return null;
    if (isSaudiRestricted(combinedText)) return null;
    if (requestsRecruitmentFee(combinedText)) return null;

    const explicitYemeni = hasExplicitYemeniAudience(combinedText);
    const role = inferTargetRole(`${job.title || ''} ${sourceText || ''}`);
    const qualificationLevel = classifyQualification(combinedText);

    if (qualificationLevel === 'شهادة جامعية مطلوبة') return null;
    if (!explicitYemeni && !role) return null;

    const roleTitle = role?.title || (isArabicTitle(job.title) ? job.title : 'فرصة عمل مخصصة لليمنيين');
    const company = arabicCompanyName(job.company);
    const city = String(job.city || 'السعودية').replace(/[A-Za-z]/g, '').replace(/\s+/g, ' ').trim() || 'السعودية';
    const priorityScore = scoreJob({ explicitYemeni, role, qualificationLevel, sourcePublishedAt: job.sourcePublishedAt });
    const { sourceText: _privateSourceText, ...publicJob } = job;

    return {
      ...publicJob,
      title: roleTitle,
      company,
      city,
      category: role?.category || job.category || 'general',
      description: buildArabicDescription({ company, city, explicitYemeni, roleTitle, qualificationLevel }),
      sourceName: ['rss', 'manual-community'].includes(job.sourceIngestion) && isArabicTitle(job.sourceName)
        ? job.sourceName
        : 'المصدر الرسمي للوظيفة',
      sourceLocation: city,
      language: 'ar',
      audienceLabel: explicitYemeni ? '🎯 مطلوب يمنيين' : 'مناسب للفئة المستهدفة',
      qualificationLevel,
      targetRole: role?.title || 'فرصة موجهة لليمنيين',
      priorityScore,
      sourceTextCheckedAt: new Date().toISOString()
    };
  });

  const output = processed
    .filter(Boolean)
    .sort((a, b) => (b.priorityScore - a.priorityScore) || (Date.parse(b.sourcePublishedAt) - Date.parse(a.sourcePublishedAt)));

  validateTargetFeed(output);
  fs.writeFileSync(FEED_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`Audience targeting complete: ${output.length}/${jobs.length} job(s) kept; non-Arabic, Saudi-only, university-required, paid-recruitment, and off-target ads excluded.`);
}

main().catch(error => {
  console.error('Yemeni audience job filter failed:', error);
  process.exit(1);
});
