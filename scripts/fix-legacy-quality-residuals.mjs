import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const GUIDE_DIR = path.join(ROOT, 'public/guide');

const SAFE_ROLE = 'NEXT JOB مدونة إرشادية مستقلة للعمل والمسار المهني، ولا تستقبل طلبات التوظيف نيابة عن أصحاب العمل ولا تضمن الحصول على وظيفة أو نقل الخدمات.';
const SAFE_USE = 'استخدم مدونة NEXT JOB لتنظيم خطوات البحث، ثم انتقل إلى المصدر الأصلي لأي إعلان أو جهة وتحقق من التفاصيل قبل التقديم.';

const slugs = [
  'yemeni-jobs-jazan-jobs-04c467ec',
  'yemeni-jobs-saudi-restaurants-46226527',
  'yemeni-jobs-saudi-jobs-25065961',
  'yemeni-jobs-dammam-buffet-worker-4bf28d56',
  'yemeni-jobs-saudi-grill-chef-d687295b',
  'yemeni-jobs-saudi-jobs-639efa4e',
  'yemeni-jobs-jeddah-jobs-b98ee3dc',
  'yemeni-jobs-riyadh-jobs-ff091adf',
  'yemeni-jobs-saudi-jobs-98305259',
  'yemeni-jobs-saudi-jobs-9c0f8017'
];

function cleanString(value) {
  const text = String(value);
  if (/وسيط عرض معلومات/.test(text)) return SAFE_ROLE;
  if (/استعراض الوظائف/.test(text)) return SAFE_USE;
  return text;
}

function cleanJson(value) {
  if (Array.isArray(value)) return value.map(cleanJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanJson(item)]));
  }
  return typeof value === 'string' ? cleanString(value) : value;
}

for (const slug of slugs) {
  const sourceFile = path.join(PUBLISHED_DIR, `${slug}.json`);
  if (fs.existsSync(sourceFile)) {
    const parsed = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    fs.writeFileSync(sourceFile, `${JSON.stringify(cleanJson(parsed), null, 2)}\n`, 'utf8');
  }

  const htmlFile = path.join(GUIDE_DIR, slug, 'index.html');
  if (fs.existsSync(htmlFile)) {
    let html = fs.readFileSync(htmlFile, 'utf8');
    html = html.replace(/[^<]*وسيط عرض معلومات[^<]*/g, SAFE_ROLE);
    html = html.replace(/[^<]*استعراض الوظائف[^<]*/g, SAFE_USE);
    fs.writeFileSync(htmlFile, html, 'utf8');
  }
}

console.log('Residual legacy job-platform claims removed.');
