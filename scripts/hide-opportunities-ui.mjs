import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const SITEMAP_FILE = path.join(ROOT, 'public/sitemap.xml');
const SHOW_OPPORTUNITIES = false;

if (SHOW_OPPORTUNITIES) {
  console.log('Opportunities UI visibility filter skipped.');
  process.exit(0);
}

function hideLinks(html) {
  let next = html;
  next = next.replace(/<a\b[^>]*href=["']\/jobs\/?[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '');
  next = next.replace(/<button\b[^>]*data-(?:tab|target)=["']jobs["'][^>]*>[\s\S]*?<\/button>/gi, '');
  return next;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      const source = fs.readFileSync(target, 'utf8');
      const next = hideLinks(source);
      if (next !== source) fs.writeFileSync(target, next, 'utf8');
    }
  }
}

function hideFromSitemap() {
  if (!fs.existsSync(SITEMAP_FILE)) return;
  const source = fs.readFileSync(SITEMAP_FILE, 'utf8');
  const next = source
    .split('\n')
    .filter(line => !/<loc>[^<]*\/jobs\/?<\/loc>/.test(line))
    .join('\n');
  if (next !== source) fs.writeFileSync(SITEMAP_FILE, next, 'utf8');
}

walk(GUIDE_DIR);
hideFromSitemap();
console.log('Temporary opportunities links hidden and /jobs/ removed from sitemap.');
