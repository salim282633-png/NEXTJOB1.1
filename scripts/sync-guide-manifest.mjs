import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const MANIFEST_FILE = path.join(ROOT, 'public/guide/articles.json');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

if (!fs.existsSync(PUBLISHED_DIR)) {
  console.log('Guide manifest sync skipped: no published source directory.');
  process.exit(0);
}

const records = fs.readdirSync(PUBLISHED_DIR)
  .filter(name => name.endsWith('.json'))
  .map(name => readJson(path.join(PUBLISHED_DIR, name)))
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
console.log(`Guide manifest synced from published sources: ${records.length} article(s).`);
