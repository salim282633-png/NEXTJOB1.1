import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');
const errors = [];

function fail(slug, message) {
  errors.push(`${slug}: ${message}`);
}

function extractJsonLd(html, slug) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.map((match, index) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      fail(slug, `JSON-LD block ${index + 1} is invalid (${error.message})`);
      return null;
    }
  }).filter(Boolean);
}

function oneOfType(items, type, slug) {
  const matches = items.filter(item => item?.['@type'] === type);
  if (matches.length !== 1) fail(slug, `expected one ${type} block, found ${matches.length}`);
  return matches[0];
}

function sameValue(actual, expected, slug, field) {
  if (actual !== expected) fail(slug, `${field} does not match the published source`);
}

const files = fs.readdirSync(PUBLISHED_DIR).filter(name => name.endsWith('.json')).sort();
const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
const displayTitles = new Map(manifest.map(item => [item.slug, item.title]));

const blogIndex = path.join(GUIDE_DIR, 'index.html');
if (!fs.existsSync(blogIndex)) {
  fail('guide-index', 'blog index is missing');
} else {
  const blogItems = extractJsonLd(fs.readFileSync(blogIndex, 'utf8'), 'guide-index');
  const blog = oneOfType(blogItems, 'Blog', 'guide-index');
  if (blog) {
    sameValue(blog['@id'], `${SITE_URL}/guide/#blog`, 'guide-index', 'Blog @id');
    sameValue(blog.url, `${SITE_URL}/guide/`, 'guide-index', 'Blog url');
    sameValue(blog.name, 'مدونة NEXT JOB', 'guide-index', 'Blog name');
    sameValue(blog.publisher?.name, 'NEXT JOB', 'guide-index', 'Blog publisher.name');
    sameValue(blog.publisher?.url, `${SITE_URL}/`, 'guide-index', 'Blog publisher.url');
  }
}

for (const name of files) {
  const source = JSON.parse(fs.readFileSync(path.join(PUBLISHED_DIR, name), 'utf8'));
  const article = source.article || {};
  const slug = source.slug || name;
  const displayTitle = displayTitles.get(slug) || article.title || source.title;
  const canonical = `${SITE_URL}/guide/${slug}/`;
  const htmlFile = path.join(GUIDE_DIR, slug, 'index.html');

  if (!fs.existsSync(htmlFile)) {
    fail(slug, 'public article page is missing');
    continue;
  }

  const html = fs.readFileSync(htmlFile, 'utf8');
  const items = extractJsonLd(html, slug);
  const posting = oneOfType(items, 'BlogPosting', slug);
  const faq = oneOfType(items, 'FAQPage', slug);
  const breadcrumb = oneOfType(items, 'BreadcrumbList', slug);

  if (posting) {
    sameValue(posting['@context'], 'https://schema.org', slug, 'BlogPosting @context');
    sameValue(posting['@id'], `${canonical}#article`, slug, 'BlogPosting @id');
    sameValue(posting.url, canonical, slug, 'BlogPosting url');
    sameValue(posting.headline, displayTitle, slug, 'BlogPosting headline');
    sameValue(posting.description, article.metaDescription || source.description, slug, 'BlogPosting description');
    sameValue(posting.datePublished, source.publishedAt || source.publishedDate, slug, 'BlogPosting datePublished');
    sameValue(posting.dateModified, source.modifiedAt || source.publishedAt || source.publishedDate, slug, 'BlogPosting dateModified');
    sameValue(posting.mainEntityOfPage?.['@id'], canonical, slug, 'BlogPosting mainEntityOfPage');
    sameValue(Number(posting.wordCount), Number(source.wordCount), slug, 'BlogPosting wordCount');
    sameValue(posting.inLanguage, 'ar-SA', slug, 'BlogPosting inLanguage');
    sameValue(posting.author?.name, 'NEXT JOB', slug, 'BlogPosting author.name');
    sameValue(posting.author?.url, `${SITE_URL}/`, slug, 'BlogPosting author.url');
    sameValue(posting.publisher?.name, 'NEXT JOB', slug, 'BlogPosting publisher.name');
    sameValue(posting.publisher?.url, `${SITE_URL}/`, slug, 'BlogPosting publisher.url');
    sameValue(posting.isPartOf?.['@id'], `${SITE_URL}/guide/#blog`, slug, 'BlogPosting isPartOf');
    if (!Number.isFinite(Date.parse(posting.datePublished))) fail(slug, 'datePublished is not a valid ISO date');
    if (!Number.isFinite(Date.parse(posting.dateModified))) fail(slug, 'dateModified is not a valid ISO date');
  }

  if (faq) {
    const sourceFaq = Array.isArray(article.faq) ? article.faq : [];
    const entities = Array.isArray(faq.mainEntity) ? faq.mainEntity : [];
    if (entities.length !== sourceFaq.length) fail(slug, `FAQ schema has ${entities.length} item(s), source has ${sourceFaq.length}`);
    sourceFaq.forEach((item, index) => {
      sameValue(entities[index]?.name, item.question, slug, `FAQ ${index + 1} question`);
      sameValue(entities[index]?.acceptedAnswer?.text, item.answer, slug, `FAQ ${index + 1} answer`);
    });
    const visibleFaqCount = (html.match(/<details class="faq-item"/g) || []).length;
    if (visibleFaqCount !== sourceFaq.length) fail(slug, `page shows ${visibleFaqCount} FAQ item(s), source has ${sourceFaq.length}`);
  }

  if (breadcrumb) {
    const entries = Array.isArray(breadcrumb.itemListElement) ? breadcrumb.itemListElement : [];
    if (entries.length !== 3) fail(slug, `breadcrumb has ${entries.length} item(s), expected 3`);
    entries.forEach((entry, index) => {
      if (entry.position !== index + 1) fail(slug, `breadcrumb position ${index + 1} is invalid`);
    });
    sameValue(entries[0]?.item, `${SITE_URL}/`, slug, 'breadcrumb home URL');
    sameValue(entries[1]?.item, `${SITE_URL}/guide/`, slug, 'breadcrumb blog URL');
    sameValue(entries[2]?.item, canonical, slug, 'breadcrumb article URL');
    sameValue(entries[2]?.name, displayTitle, slug, 'breadcrumb article name');
  }
}

if (errors.length) {
  console.error(`Guide structured-data check failed with ${errors.length} issue(s):`);
  errors.slice(0, 80).forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Guide structured data verified: one Blog and ${files.length} BlogPosting, FAQPage and BreadcrumbList page(s) match their published sources.`);
