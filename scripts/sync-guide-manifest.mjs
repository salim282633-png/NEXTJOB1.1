import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const MANIFEST_FILE = path.join(ROOT, 'public/guide/articles.json');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');

const PREFERRED_TITLES = new Map([
  ['guide-yemeni-cv-fc6b2383', 'دليلك لكتابة سيرة ذاتية احترافية للبحث عن عمل في السعودية'],
  ['guide-yemeni-interviews-1ddc1946', 'كيف تستعد لمقابلة عمل في السعودية؟ دليل عملي'],
  ['guide-yemeni-safety-ffa608e8', 'البحث عن عمل في السعودية بدون الوقوع في الاحتيال'],
  ['guide-yemeni-city-choice-62d7c841', 'كيف تختار مدينة مناسبة للبحث عن عمل في السعودية؟'],
  ['guide-yemeni-skills-5b7e34a1', 'مهارات مهمة للباحث عن عمل في السعودية: دليل عملي'],
  ['guide-yemeni-company-application-c3a91f72', 'التقديم على عمل في السعودية عبر مواقع الشركات: دليل عملي'],
  ['guide-yemeni-interview-questions-8e2f4a6c', 'أسئلة مقابلة العمل في السعودية وكيفية الاستعداد: دليل عملي'],
  ['guide-yemeni-contract-review-4c8a9e31', 'كيف تراجع عقد العمل في السعودية قبل التوقيع؟ دليل عملي']
]);

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function naturalizeTitle(item) {
  if (!item || !item.title) return '';
  if (PREFERRED_TITLES.has(item.slug)) return PREFERRED_TITLES.get(item.slug);

  const keyword = String(item.keyword || '');
  if (/نقل الخدمات/.test(keyword) && /تغيير العمل/.test(keyword)) {
    return 'دليلك لنقل الخدمات عند تغيير العمل في السعودية وما الذي يجب التحقق منه؟';
  }

  let title = String(item.title).trim();
  title = title
    .replace(/^كيف يستعد اليمني\s+/u, 'كيف تستعد ')
    .replace(/^كيف يختار اليمني\s+/u, 'كيف تختار ')
    .replace(/^كيف يراجع اليمني\s+/u, 'كيف تراجع ')
    .replace(/لليمني الباحث عن عمل/u, 'للباحث عن عمل')
    .replace(/لليمنيين الباحثين عن عمل/u, 'للباحثين عن عمل')
    .replace(/لليمنيين في السعودية/u, 'في السعودية')
    .replace(/لليمني في السعودية/u, 'في السعودية')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return title;
}

function normalizeSourceTitle(file, item) {
  if (!item || !item.slug || !item.title) return item;
  const title = naturalizeTitle(item);
  if (!title || title === item.title) return item;

  item.title = title;
  if (item.article && typeof item.article === 'object') item.article.title = title;
  fs.writeFileSync(file, `${JSON.stringify(item, null, 2)}\n`, 'utf8');
  return item;
}

if (!fs.existsSync(PUBLISHED_DIR)) {
  console.log('Guide manifest sync skipped: no published source directory.');
  process.exit(0);
}

let normalizedTitles = 0;
const records = fs.readdirSync(PUBLISHED_DIR)
  .filter(name => name.endsWith('.json'))
  .map(name => {
    const file = path.join(PUBLISHED_DIR, name);
    const item = readJson(file);
    if (!item) return null;
    const before = item.title;
    const normalized = normalizeSourceTitle(file, item);
    if (normalized?.title && normalized.title !== before) normalizedTitles += 1;
    return normalized;
  })
  .filter(item => item && item.slug && item.title)
  .map(item => ({
    slug: item.slug,
    title: item.title,
    description: item.description || item.article?.metaDescription || '',
    keyword: item.keyword || '',
    intent: item.intent || 'guidance',
    ...(item.topic ? { topic: item.topic } : {}),
    city: item.city || null,
    profession: item.profession || null,
    publishedAt: item.publishedAt || item.publishedDate || '',
    publishedDate: item.publishedDate || String(item.publishedAt || '').slice(0, 10),
    ...(item.modifiedAt ? { modifiedAt: item.modifiedAt } : {}),
    canonical: item.canonical || `${SITE_URL}/guide/${item.slug}/`,
    wordCount: Number(item.wordCount || 0),
    source: item.source || 'guidance-publisher'
  }))
  .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

const slugs = new Set();
const duplicates = records.filter(item => slugs.has(item.slug) || !slugs.add(item.slug));
if (duplicates.length) {
  console.error(`Guide manifest sync failed: duplicate slug(s): ${duplicates.map(item => item.slug).join(', ')}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
fs.writeFileSync(MANIFEST_FILE, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
if (normalizedTitles) console.log(`Guidance display titles naturalized: ${normalizedTitles}.`);
console.log(`Guide manifest synced from published sources: ${records.length} article(s).`);
