import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const CONFIG_FILE = path.join(ROOT, 'config/arabic-job-sources.json');
const INTAKE_FILE = path.join(ROOT, 'data/community-job-intake.json');
const FEED_FILE = path.join(ROOT, 'public/jobs/external-jobs.json');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function plainText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeHttpsUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function toIsoDate(value) {
  const date = new Date(String(value || ''));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function stableId(item) {
  if (typeof item.id === 'string' && /^[A-Za-z0-9_-]{5,120}$/.test(item.id)) return `community-${item.id}`;
  const digest = crypto.createHash('sha256')
    .update(`${item.sourceId || ''}\n${item.sourceUrl || ''}\n${item.title || ''}\n${item.publishedAt || ''}`)
    .digest('hex')
    .slice(0, 20);
  return `community-${digest}`;
}

function normalizedItem(item, source) {
  if (item.status !== 'approved') return null;
  const sourceUrl = safeHttpsUrl(item.sourceUrl);
  const applyUrl = safeHttpsUrl(item.applyUrl || item.sourceUrl);
  const title = plainText(item.title).slice(0, 150);
  const sourceText = plainText(item.text).slice(0, 15_000);
  if (!sourceUrl || !applyUrl || !title || !sourceText) return null;

  const sourcePublishedAt = toIsoDate(item.publishedAt);
  const city = plainText(item.city || 'السعودية').slice(0, 100) || 'السعودية';
  const company = plainText(item.company || 'جهة توظيف').slice(0, 120) || 'جهة توظيف';

  return {
    id: stableId(item),
    title,
    company,
    city,
    category: plainText(item.category || 'general') || 'general',
    salary: plainText(item.salary || ''),
    jobType: ['دوام كامل', 'دوام جزئي', 'عمل حر / بالقطعة', 'عقد مؤقت'].includes(item.jobType) ? item.jobType : 'دوام كامل',
    sponsorshipTransfer: Boolean(item.sponsorshipTransfer),
    accommodationProvided: Boolean(item.accommodationProvided),
    transportationProvided: Boolean(item.transportationProvided),
    mealsProvided: Boolean(item.mealsProvided),
    overtimeAvailable: Boolean(item.overtimeAvailable),
    experienceYears: plainText(item.experienceYears || 'حسب المصدر'),
    description: `فرصة من مصدر مجتمعي تمت مراجعتها قبل الإدخال. راجع الإعلان الأصلي وكل الشروط قبل التقديم.`,
    phone: '',
    whatsapp: '',
    createdAt: sourcePublishedAt,
    status: 'active',
    sourceType: 'external',
    sourceName: source.name,
    sourceUrl,
    applyUrl,
    sourcePublishedAt,
    sourceVerifiedAt: new Date().toISOString(),
    sourceLocation: city,
    sourceIngestion: 'manual-community',
    sourceText
  };
}

async function main() {
  const config = readJson(CONFIG_FILE, null);
  const intake = readJson(INTAKE_FILE, null);
  const feed = readJson(FEED_FILE, null);
  if (!config || config.version !== 1 || !Array.isArray(config.manualReviewSources)) {
    throw new Error('config/arabic-job-sources.json is invalid.');
  }
  if (!intake || intake.version !== 1 || !Array.isArray(intake.items)) {
    throw new Error('data/community-job-intake.json is invalid.');
  }
  if (!Array.isArray(feed)) throw new Error('public/jobs/external-jobs.json must be an array.');

  const sourceById = new Map(config.manualReviewSources.filter(s => s.enabled === true).map(s => [s.id, s]));
  const appended = [];
  for (const item of intake.items) {
    const source = sourceById.get(item?.sourceId);
    if (!source) continue;
    const normalized = normalizedItem(item, source);
    if (normalized) appended.push(normalized);
  }

  const output = [];
  const seenUrls = new Set();
  for (const job of [...feed, ...appended]) {
    if (!job?.sourceUrl) continue;
    const key = String(job.sourceUrl).replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
    if (seenUrls.has(key)) continue;
    seenUrls.add(key);
    output.push(job);
  }

  fs.writeFileSync(FEED_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`Community intake complete: ${appended.length} approved item(s) appended; no social channel scraping performed.`);
}

main().catch(error => {
  console.error('Community intake failed:', error);
  process.exit(1);
});
