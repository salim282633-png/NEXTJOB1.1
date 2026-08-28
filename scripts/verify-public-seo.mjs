import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const GUIDE_DIR = path.join(PUBLIC_DIR, 'guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');
const FORBIDDEN_PUBLIC_PREFIXES = ['/jobs', '/candidates', '/admin', '/applications', '/saved'];
const CATEGORY_SLUGS = ['job-search', 'cv', 'interviews', 'contracts', 'sponsorship', 'safety', 'cities', 'professions'];

function fail(message) {
  console.error(`SEO verification failed: ${message}`);
  process.exitCode = 1;
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function htmlFileForPath(pathname) {
  if (pathname === '/') return path.join(ROOT, 'index.html');
  if (pathname === '/guide/') return path.join(GUIDE_DIR, 'index.html');
  if (pathname.startsWith('/guide/') && pathname.endsWith('/')) {
    return path.join(PUBLIC_DIR, pathname.replace(/^\//, ''), 'index.html');
  }
  return null;
}

function canonicalFromHtml(html) {
  return html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1]
    || html.match(/<link\s+href=["']([^"']+)["']\s+rel=["']canonical["']/i)?.[1]
    || '';
}

function robotsFromHtml(html) {
  return html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i)?.[1]
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']robots["']/i)?.[1]
    || '';
}

function collectHtmlFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(target));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(target);
  }
  return files;
}

if (!fs.existsSync(SITEMAP_FILE)) fail('public/sitemap.xml is missing.');
const sitemap = fs.existsSync(SITEMAP_FILE) ? fs.readFileSync(SITEMAP_FILE, 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].trim());
const unique = new Set(locs);
if (unique.size !== locs.length) fail('sitemap contains duplicate URLs.');

const manifest = readJson(MANIFEST_FILE, []);
const requiredPaths = [
  '/',
  '/guide/',
  ...CATEGORY_SLUGS.map(slug => `/guide/${slug}/`),
  ...(Array.isArray(manifest) ? manifest.filter(item => item?.slug).map(item => `/guide/${item.slug}/`) : [])
];

for (const requiredPath of requiredPaths) {
  const url = `${SITE_URL}${requiredPath}`;
  if (!unique.has(url)) fail(`sitemap is missing ${url}`);
}

for (const loc of locs) {
  let url;
  try { url = new URL(loc); } catch { fail(`invalid sitemap URL: ${loc}`); continue; }
  if (url.origin !== SITE_URL) fail(`sitemap URL uses a different origin: ${loc}`);
  if (url.search || url.hash) fail(`sitemap URL must not contain query/hash: ${loc}`);
  if (FORBIDDEN_PUBLIC_PREFIXES.some(prefix => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
    fail(`non-indexable path appears in sitemap: ${url.pathname}`);
  }

  const file = htmlFileForPath(url.pathname);
  if (!file || !fs.existsSync(file)) {
    fail(`sitemap URL has no matching static HTML file: ${url.pathname}`);
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  const canonical = canonicalFromHtml(html);
  if (!canonical) fail(`missing canonical in ${path.relative(ROOT, file)}`);
  else if (canonical !== loc) fail(`canonical mismatch in ${path.relative(ROOT, file)}: ${canonical} !== ${loc}`);
  const robots = robotsFromHtml(html).toLowerCase();
  if (robots.includes('noindex')) fail(`indexable sitemap page contains noindex: ${url.pathname}`);
}

for (const file of collectHtmlFiles(GUIDE_DIR)) {
  const html = fs.readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(match => match[1].trim());
  for (const href of hrefs) {
    if (!href.startsWith('/')) continue;
    let pathname;
    try { pathname = new URL(href, SITE_URL).pathname; } catch { continue; }
    if (pathname === '/jobs' || pathname.startsWith('/jobs/') || pathname === '/candidates' || pathname.startsWith('/candidates/')) {
      fail(`paused/retired public link remains in ${path.relative(ROOT, file)}: ${href}`);
      continue;
    }
    if (!pathname.startsWith('/guide/')) continue;
    const target = htmlFileForPath(pathname.endsWith('/') ? pathname : `${pathname}/`);
    if (target && !fs.existsSync(target)) fail(`broken internal guide link in ${path.relative(ROOT, file)}: ${href}`);
  }
}

if (!process.exitCode) {
  console.log(`Public SEO verified: ${locs.length} sitemap URL(s), canonical parity, and guide internal links passed.`);
}
