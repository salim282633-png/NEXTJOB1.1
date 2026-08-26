import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sitemapPath = path.join(root, 'public/sitemap.xml');
const guideDir = path.join(root, 'public/guide');

function normalizeSitemap() {
  if (!fs.existsSync(sitemapPath)) return;
  const source = fs.readFileSync(sitemapPath, 'utf8');
  const next = source
    .split('\n')
    .filter(line => !line.includes('/candidates/'))
    .join('\n');
  if (next !== source) fs.writeFileSync(sitemapPath, next, 'utf8');
}

const replacements = [
  ['الوظائف المنشورة فعليًا على NEXT JOB', 'فرص العمل المفهرسة في NEXT JOB مع الإحالة إلى المصدر الأصلي'],
  ['الوظائف الفعلية المنشورة في المنصة', 'الفرص المفهرسة في NEXT JOB وروابط مصادرها الأصلية'],
  ['عرض الوظائف الفعلية', 'عرض الفرص الوظيفية ومصادرها'],
  ['راجع الوظائف المنشورة فعليًا على NEXT JOB', 'راجع فرص العمل المفهرسة في NEXT JOB ثم انتقل إلى المصدر الأصلي للتحقق والتقديم']
];

function normalizeHtml(file) {
  let source = fs.readFileSync(file, 'utf8');
  let next = source;
  for (const [from, to] of replacements) next = next.split(from).join(to);
  if (next !== source) fs.writeFileSync(file, next, 'utf8');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.isFile() && entry.name.endsWith('.html')) normalizeHtml(target);
  }
}

normalizeSitemap();
walk(guideDir);
console.log('Content-hub SEO normalization complete.');
