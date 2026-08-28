import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const LEGACY_UPDATED_AT = '2026-08-28T17:35:00.000Z';

const OVERRIDES = {
  'yemeni-jobs-jazan-jobs-04c467ec': {
    title: 'البحث عن عمل في جازان لليمنيين: دليل عملي وآمن',
    description: 'دليل عملي للباحث اليمني في جازان حول تنظيم البحث عن عمل، تجهيز الملف المهني، تقييم الإعلانات، والتحقق من الإجراءات الرسمية عند الحاجة.'
  },
  'yemeni-jobs-saudi-restaurants-46226527': {
    title: 'العمل في قطاع المطاعم لليمنيين في السعودية: دليل مهني',
    description: 'دليل مهني لليمنيين في السعودية حول مهارات قطاع المطاعم، تجهيز السيرة الذاتية، البحث الآمن عن عمل، والتحقق من المعلومات عبر المصادر الرسمية.'
  },
  'yemeni-jobs-saudi-jobs-25065961': {
    title: 'البحث عن عمل لليمنيين في السعودية: خطوات عملية وآمنة',
    description: 'دليل عملي للمقيم اليمني في السعودية لتنظيم البحث عن عمل، تحسين السيرة الذاتية، التواصل المهني، والتحقق من إجراءات نقل الخدمات رسميًا.'
  },
  'yemeni-jobs-dammam-buffet-worker-4bf28d56': {
    title: 'العمل كمعلم بوفيه في الدمام لليمنيين: دليل مهني',
    description: 'دليل مهني للباحث اليمني عن عمل كمعلم بوفيه في الدمام، مع نصائح للمهارات والسيرة الذاتية والبحث الآمن والتحقق من الإجراءات الرسمية.'
  },
  'yemeni-jobs-saudi-grill-chef-d687295b': {
    title: 'العمل كشيف مشويات لليمنيين في السعودية: دليل مهني',
    description: 'دليل مهني لليمنيين في السعودية حول العمل كشيف مشويات، إبراز الخبرة والمهارات، تجهيز ملف التقديم، والبحث الآمن عن فرص مناسبة.'
  },
  'yemeni-jobs-saudi-jobs-639efa4e': {
    title: 'كيف يبحث اليمني عن عمل في السعودية؟ دليل عملي',
    description: 'خطوات عملية للباحث اليمني في السعودية لبناء خطة بحث عن عمل، تجهيز الملف المهني، التواصل مع المنشآت، وتجنب الإعلانات والوعود المضللة.'
  },
  'yemeni-jobs-jeddah-jobs-b98ee3dc': {
    title: 'البحث عن عمل في جدة لليمنيين: دليل عملي للبدء',
    description: 'دليل عملي للباحث اليمني في جدة حول قنوات البحث عن عمل، تجهيز السيرة الذاتية، التواصل المهني، والتحقق من الإعلانات والإجراءات الرسمية.'
  },
  'yemeni-jobs-riyadh-jobs-ff091adf': {
    title: 'البحث عن عمل في الرياض لليمنيين: خطوات عملية وآمنة',
    description: 'دليل عملي للباحث اليمني في الرياض لتنظيم البحث عن عمل، تحسين السيرة الذاتية، اختيار قنوات التقديم، وتجنب الإعلانات والوعود المضللة.'
  },
  'yemeni-jobs-saudi-jobs-98305259': {
    title: 'البحث عن عمل ونقل الخدمات لليمنيين في السعودية: دليل تحقق',
    description: 'دليل للباحث اليمني في السعودية يوضح تنظيم البحث عن عمل وما يجب التحقق منه بشأن نقل الخدمات، مع الرجوع إلى قوى والجهات الرسمية المختصة.'
  },
  'yemeni-jobs-saudi-jobs-9c0f8017': {
    title: 'دليل البحث عن عمل لليمنيين في السعودية وخطوات التقديم',
    description: 'دليل عملي لليمنيين في السعودية حول البحث عن عمل، تجهيز السيرة الذاتية، خطوات التقديم الآمن، والتحقق من العقود ونقل الخدمات رسميًا.'
  }
};

const SAFE_ROLE = 'NEXT JOB مدونة إرشادية مستقلة للعمل والمسار المهني. تقدم محتوى وأدلة عامة تساعد الباحث على تنظيم خطواته والتحقق من المعلومات، ولا تستقبل طلبات التوظيف نيابة عن أصحاب العمل ولا تضمن الحصول على وظيفة أو نقل الخدمات.';
const SAFE_SEARCH = 'يمكنك الاستفادة من أدلة NEXT JOB لتنظيم البحث عن عمل، ثم التحقق من أي إعلان أو جهة عبر المصدر الأصلي والجهات الرسمية المختصة عند الحاجة.';

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function misleadingNextJobClaim(text) {
  return /NEXT JOB/.test(text) && /(نشر|إعلان|إعلانات|وظائف|الفرص|التوظيف|وسيط|الربط بين|تنبيهات|تحديث بيانات|شواغر)/.test(text);
}

function sanitizeString(value, key = '') {
  let text = String(value);
  text = text.replace(/دليل الوظائف/g, 'مركز الأدلة المهنية');
  text = text.replace(/منصة NEXT JOB/g, 'NEXT JOB');

  if (key === 'name' && /NEXT JOB/.test(text)) {
    if (/هل.*(?:تضمن|توظيف|نقل)/.test(text)) return 'هل يضمن NEXT JOB الحصول على وظيفة أو نقل الخدمات؟';
    if (/ما دور/.test(text)) return 'ما دور NEXT JOB في رحلة البحث عن عمل؟';
  }

  if (key === 'text' && misleadingNextJobClaim(text)) return SAFE_ROLE;
  return text;
}

function sanitizeJson(value, key = '') {
  if (Array.isArray(value)) return value.map(item => sanitizeJson(item, key));
  if (value && typeof value === 'object') {
    const next = {};
    for (const [childKey, childValue] of Object.entries(value)) next[childKey] = sanitizeJson(childValue, childKey);
    return next;
  }
  if (typeof value === 'string') return sanitizeString(value, key);
  return value;
}

function replaceTitleAndDescription(html, oldTitle, oldDescription, nextTitle, nextDescription) {
  let next = html.split(oldTitle).join(nextTitle).split(oldDescription).join(nextDescription);
  next = next.replace(/"dateModified":"[^"]+"/g, `"dateModified":"${LEGACY_UPDATED_AT}"`);
  return next;
}

function sanitizeHtml(html) {
  let next = html;
  next = next.replace(/دليل الوظائف/g, 'مركز الأدلة المهنية');
  next = next.replace(/هل تضمن(?: منصة)? NEXT JOB[^<]*\?/g, 'هل يضمن NEXT JOB الحصول على وظيفة أو نقل الخدمات؟');
  next = next.replace(/ما دور(?: منصة)? NEXT JOB في عملية التوظيف\?/g, 'ما دور NEXT JOB في رحلة البحث عن عمل؟');

  next = next.replace(/<p>([^<]*NEXT JOB[^<]*)<\/p>/g, (full, text) => {
    if (!misleadingNextJobClaim(text)) return full.replace(/منصة NEXT JOB/g, 'NEXT JOB');
    return `<p>${SAFE_SEARCH}</p>`;
  });

  next = next.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (full, raw) => {
    try {
      const parsed = JSON.parse(raw);
      return `<script type="application/ld+json">${JSON.stringify(sanitizeJson(parsed)).replace(/</g, '\\u003c')}</script>`;
    } catch {
      return full.replace(/دليل الوظائف/g, 'مركز الأدلة المهنية').replace(/منصة NEXT JOB/g, 'NEXT JOB');
    }
  });

  return next.replace(/منصة NEXT JOB/g, 'NEXT JOB');
}

function updateManifest() {
  const manifest = readJson(MANIFEST_FILE, []);
  if (!Array.isArray(manifest)) return;
  let changed = false;
  const next = manifest.map(item => {
    const override = OVERRIDES[item?.slug];
    if (!override) return item;
    const modifiedAt = item.modifiedAt || LEGACY_UPDATED_AT;
    if (item.title === override.title && item.description === override.description && item.modifiedAt === modifiedAt) return item;
    changed = true;
    return { ...item, title: override.title, description: override.description, modifiedAt };
  });
  if (changed) writeJson(MANIFEST_FILE, next);
}

function updatePublishedSources() {
  if (!fs.existsSync(PUBLISHED_DIR)) return;
  for (const [slug, override] of Object.entries(OVERRIDES)) {
    const file = path.join(PUBLISHED_DIR, `${slug}.json`);
    if (!fs.existsSync(file)) continue;
    const source = readJson(file, null);
    if (!source || typeof source !== 'object') continue;
    const next = sanitizeJson(source);
    next.title = override.title;
    next.description = override.description;
    next.modifiedAt = next.modifiedAt || LEGACY_UPDATED_AT;
    if (next.article && typeof next.article === 'object') {
      next.article.title = override.title;
      next.article.metaDescription = override.description;
    }
    writeJson(file, next);
  }
}

function updateHtmlArticles() {
  for (const [slug, override] of Object.entries(OVERRIDES)) {
    const file = path.join(GUIDE_DIR, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    const source = fs.readFileSync(file, 'utf8');
    const manifest = readJson(MANIFEST_FILE, []);
    const published = readJson(path.join(PUBLISHED_DIR, `${slug}.json`), {});
    const oldTitle = published?.article?.title || published?.title || manifest.find(item => item.slug === slug)?.title || override.title;
    const oldDescription = published?.article?.metaDescription || published?.description || manifest.find(item => item.slug === slug)?.description || override.description;
    let next = replaceTitleAndDescription(source, oldTitle, oldDescription, override.title, override.description);
    next = sanitizeHtml(next);
    if (next !== source) fs.writeFileSync(file, next, 'utf8');
  }
}

// HTML uses the pre-modernization title/description, so update it before rewriting
// the source JSON records that contain those old values.
updateHtmlArticles();
updateManifest();
updatePublishedSources();
console.log(`Legacy guidance articles modernized: ${Object.keys(OVERRIDES).length}.`);