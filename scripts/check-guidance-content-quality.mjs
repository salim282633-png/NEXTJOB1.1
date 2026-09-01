import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');
const MIN_ARTICLES = Number(process.env.GUIDANCE_MIN_ARTICLES || 140);
const errors = [];

function text(value) {
  return String(value || '').trim();
}

function fail(slug, message) {
  errors.push(`${slug || 'unknown'}: ${message}`);
}

if (!fs.existsSync(PUBLISHED_DIR)) {
  console.error('Guidance content quality check failed: seo/published is missing.');
  process.exit(1);
}

const files = fs.readdirSync(PUBLISHED_DIR).filter(name => name.endsWith('.json')).sort();
if (files.length < MIN_ARTICLES) {
  fail('collection', `expected at least ${MIN_ARTICLES} article(s), found ${files.length}`);
}

const slugs = new Set();
const titles = new Set();

for (const name of files) {
  const file = path.join(PUBLISHED_DIR, name);
  let item;
  try {
    item = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(name, `invalid JSON (${error.message})`);
    continue;
  }

  const slug = text(item.slug);
  const title = text(item.title || item.article?.title);
  const description = text(item.description || item.article?.metaDescription);
  const sections = Array.isArray(item.article?.sections) ? item.article.sections : [];
  const faq = Array.isArray(item.article?.faq) ? item.article.faq : [];
  const wordCount = Number(item.wordCount || 0);
  const canonical = text(item.canonical);
  const body = JSON.stringify(item.article || {});

  if (!slug) fail(name, 'missing slug');
  else if (slugs.has(slug)) fail(slug, 'duplicate slug');
  else slugs.add(slug);

  if (title.length < 20 || title.length > 80) fail(slug, `title length is ${title.length}, expected 20-80`);
  if (titles.has(title)) fail(slug, 'duplicate title');
  else titles.add(title);
  if (description.length < 100 || description.length > 190) fail(slug, `meta description length is ${description.length}, expected 100-190`);
  if (!Number.isFinite(wordCount) || wordCount < 750) fail(slug, `wordCount is ${wordCount}, expected at least 750`);
  if (sections.length < 5) fail(slug, `only ${sections.length} content section(s)`);
  if (faq.length > 0 && faq.length < 3) fail(slug, `only ${faq.length} FAQ item(s)`);
  if (canonical !== `${SITE_URL}/guide/${slug}/`) fail(slug, 'canonical does not match slug');

  if (/(?:قدم|قدّم) عبر NEXT JOB|NEXT JOB (?:تعرض|تنشر|تستقبل) (?:وظائف|طلبات)|فرص مؤكدة|نضمن لك|نضمن التوظيف|نضمن نقل الخدمات/u.test(body)) {
    fail(slug, 'contains a job-platform or guarantee claim');
  }
  if (/(?:يتوجب|يجب|قم|استخدم).{0,100}(?:تحرير الفرامل|تحريك الكابينة|فتح أبواب المصعد)/u.test(body)) {
    fail(slug, 'contains sensitive procedural elevator-rescue guidance');
  }
}

if (errors.length) {
  console.error(`Guidance content quality check failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 60)) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Guidance content quality verified: ${files.length} article(s), minimum depth, metadata, canonical and safety gates passed.`);
