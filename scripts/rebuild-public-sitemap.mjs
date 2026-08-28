import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const SITEMAP_FILE = path.join(ROOT, 'public/sitemap.xml');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');

const CATEGORY_SLUGS = [
  'job-search',
  'cv',
  'interviews',
  'contracts',
  'sponsorship',
  'safety',
  'cities',
  'professions'
];

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function dateOnly(value, fallback) {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  const raw = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : fallback;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function row(pathname, lastmod, changefreq, priority) {
  return `  <url><loc>${xmlEscape(`${SITE_URL}${pathname}`)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

const today = new Date().toISOString().slice(0, 10);
const manifest = readJson(MANIFEST_FILE, []);
const articles = Array.isArray(manifest) ? manifest.filter(item => item?.slug) : [];
const guideLastmod = articles.reduce((latest, item) => {
  const candidate = dateOnly(item.modifiedAt || item.publishedAt || item.publishedDate, today);
  return candidate > latest ? candidate : latest;
}, today);

const rows = [
  row('/', today, 'weekly', '1.0'),
  row('/guide/', guideLastmod, 'weekly', '0.9'),
  ...CATEGORY_SLUGS.map(slug => row(`/guide/${slug}/`, guideLastmod, 'weekly', '0.8')),
  ...articles.map(item => row(
    `/guide/${encodeURIComponent(String(item.slug)).replace(/%2F/gi, '/')}/`,
    dateOnly(item.modifiedAt || item.publishedAt || item.publishedDate, today),
    'monthly',
    '0.7'
  ))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
fs.writeFileSync(SITEMAP_FILE, xml, 'utf8');
console.log(`Public sitemap rebuilt: ${rows.length} indexable URL(s).`);