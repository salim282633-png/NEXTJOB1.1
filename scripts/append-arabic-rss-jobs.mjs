import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const CONFIG_FILE = path.join(ROOT, 'config/arabic-job-sources.json');
const FEED_FILE = path.join(ROOT, 'public/jobs/external-jobs.json');
const REQUEST_TIMEOUT_MS = 15_000;
const USER_AGENT = 'NEXTJOB-arabic-rss-indexer/1.2';

const CITY_RULES = [
  ['الرياض', [/الرياض/, /riyadh/i]],
  ['جدة', [/جدة/, /jeddah/i, /jedda/i]],
  ['الدمام', [/الدمام/, /dammam/i]],
  ['الخبر', [/الخبر/, /khobar/i]],
  ['الجبيل', [/الجبيل/, /jubail/i]],
  ['مكة المكرمة', [/مكة/, /makkah/i, /mecca/i]],
  ['المدينة المنورة', [/المدينة المنورة/, /madinah/i, /medina/i]],
  ['الطائف', [/الطائف/, /taif/i]],
  ['تبوك', [/تبوك/, /tabuk/i]],
  ['أبها', [/أبها/, /abha/i]],
  ['خميس مشيط', [/خميس مشيط/, /khamis mushait/i]],
  ['جازان', [/جازان/, /jazan/i, /jizan/i]],
  ['نجران', [/نجران/, /najran/i]],
  ['ينبع', [/ينبع/, /yanbu/i]],
  ['بريدة', [/بريدة/, /buraidah/i]],
  ['عنيزة', [/عنيزة/, /unayzah/i]],
  ['حائل', [/حائل/, /hail/i]],
  ['الأحساء', [/الأحساء/, /ahsa/i, /al.?hasa/i]]
];

const JOB_SIGNAL_PATTERNS = [
  /وظائف/,
  /وظيفة/,
  /فرص?\s+عمل/,
  /شواغر?\s+وظيفية/,
  /شاغر(?:ة|ات)?\s+(?:وظيفي|وظيفية|لدى|في)?/,
  /توظيف/,
  /التقديم\s+(?:متاح|مفتوح|على|عبر|من\s+خلال)/,
  /مطلوب\s+(?:موظف|موظفة|موظفين|سائق|سائقين|عامل|عمال|كاشير|بائع|مندوب|فني|حارس|طباخ|شيف|باريستا|استقبال)/,
  /راتب\s*(?:يبدأ|من|حتى|:)?\s*[0-9٠-٩]{3,}/,
  /\bjob(?:s)?\b/i,
  /\bjob opening(?:s)?\b/i,
  /\bvacanc(?:y|ies)\b/i,
  /\bhiring\b/i,
  /\bapply now\b/i
];

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function plainText(value) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tagValue(block, tag) {
  const match = String(block || '').match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function tagAttribute(block, tag, attribute) {
  const match = String(block || '').match(new RegExp(`<${tag}\\b[^>]*\\b${attribute}=["']([^"']+)["'][^>]*>`, 'i'));
  return match ? decodeEntities(match[1]).trim() : '';
}

function parseFeed(xml) {
  const source = String(xml || '');
  const rssItems = source.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  const atomEntries = source.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];

  const rss = rssItems.map(item => ({
    title: plainText(tagValue(item, 'title')),
    link: plainText(tagValue(item, 'link') || tagValue(item, 'guid')),
    description: plainText(tagValue(item, 'description') || tagValue(item, 'content:encoded')),
    publishedAt: tagValue(item, 'pubDate') || tagValue(item, 'dc:date')
  }));

  const atom = atomEntries.map(entry => ({
    title: plainText(tagValue(entry, 'title')),
    link: plainText(tagAttribute(entry, 'link', 'href') || tagValue(entry, 'link') || tagValue(entry, 'id')),
    description: plainText(tagValue(entry, 'summary') || tagValue(entry, 'content')),
    publishedAt: tagValue(entry, 'published') || tagValue(entry, 'updated') || tagValue(entry, 'dc:date')
  }));

  return [...rss, ...atom];
}

function safeHttpsUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function resolveOriginalUrl(value) {
  const safe = safeHttpsUrl(value);
  if (!safe) return null;
  try {
    const parsed = new URL(safe);
    const isGoogleRedirect = /(^|\.)google\.com$/i.test(parsed.hostname) && parsed.pathname === '/url';
    if (!isGoogleRedirect) return safe;
    const target = parsed.searchParams.get('url') || parsed.searchParams.get('q');
    return safeHttpsUrl(target) || safe;
  } catch {
    return safe;
  }
}

function hasClearJobSignal(value) {
  const text = plainText(value);
  return JOB_SIGNAL_PATTERNS.some(pattern => pattern.test(text));
}

function toIsoDate(value) {
  const date = new Date(String(value || ''));
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function inferCity(text) {
  for (const [city, patterns] of CITY_RULES) {
    if (patterns.some(pattern => pattern.test(text))) return city;
  }
  return 'السعودية';
}

function inferCategory(text) {
  if (/(سائق|توصيل|driver|courier)/i.test(text)) return 'drivers';
  if (/(مطعم|مطبخ|طباخ|شيف|باريستا|نادل|restaurant|kitchen|cook|chef|barista|waiter)/i.test(text)) return 'restaurants';
  if (/(مبيعات|بائع|كاشير|متجر|خدمة عملاء|sales|cashier|retail|customer service)/i.test(text)) return 'sales';
  if (/(مستودع|مخزن|warehouse|storekeeper)/i.test(text)) return 'warehousing';
  if (/(حارس أمن|حراسة|security guard)/i.test(text)) return 'security';
  if (/(فني|صيانة|كهربائي|سباك|technician|maintenance|electrician|plumber)/i.test(text)) return 'technical';
  return 'general';
}

function inferCompany(title, sourceName) {
  const clean = plainText(title);
  const match = clean.match(/^(?:وظائف\s+)?(.{2,80}?)(?:\s+(?:تعلن|يعلن|تطرح|يطرح|توفر|يوفر|تدعو|يفتح|تفتح)\b|\s*[:–-])/);
  const company = match?.[1]?.trim();
  if (company && company.length >= 2) return company;
  return sourceName;
}

function stableId(sourceId, link, title) {
  const digest = crypto.createHash('sha256').update(`${sourceId}\n${link}\n${title}`).digest('hex').slice(0, 20);
  return `rss-${sourceId}-${digest}`;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/rss+xml,application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.5', 'user-agent': USER_AGENT },
      signal: controller.signal,
      redirect: 'follow'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

function normalizedRssJob(source, item, verifiedAt) {
  const sourceUrl = resolveOriginalUrl(item.link);
  if (!sourceUrl || !item.title) return null;
  const sourceText = plainText(`${item.title} ${item.description}`).slice(0, 12_000);
  const sourcePublishedAt = toIsoDate(item.publishedAt);
  const city = inferCity(sourceText);
  return {
    id: stableId(source.id, sourceUrl, item.title),
    title: item.title.slice(0, 150),
    company: inferCompany(item.title, source.name),
    city,
    category: inferCategory(sourceText),
    salary: '',
    jobType: 'دوام كامل',
    sponsorshipTransfer: false,
    accommodationProvided: false,
    transportationProvided: false,
    mealsProvided: false,
    overtimeAvailable: false,
    experienceYears: 'حسب المصدر',
    description: `فرصة واردة عبر خلاصة عامة لمصدر ${source.name}. راجع الإعلان الأصلي قبل التقديم.`,
    phone: '',
    whatsapp: '',
    createdAt: sourcePublishedAt,
    status: 'active',
    sourceType: 'external',
    sourceName: source.name,
    sourceUrl,
    applyUrl: sourceUrl,
    sourcePublishedAt,
    sourceVerifiedAt: verifiedAt,
    sourceLocation: city,
    sourceIngestion: 'rss',
    sourceText
  };
}

async function main() {
  const config = readJson(CONFIG_FILE, null);
  const feed = readJson(FEED_FILE, null);
  if (!config || config.version !== 1 || !Array.isArray(config.rssSources)) {
    throw new Error('config/arabic-job-sources.json is invalid.');
  }
  if (!Array.isArray(feed)) throw new Error('public/jobs/external-jobs.json must be an array.');

  const enabled = config.rssSources.filter(source => source.enabled === true);
  const verifiedAt = new Date().toISOString();
  const appended = [];

  for (const source of enabled) {
    const feedUrl = safeHttpsUrl(source.feedUrl);
    if (!feedUrl) throw new Error(`${source.id}: feedUrl must be HTTPS.`);
    try {
      const xml = await fetchText(feedUrl);
      const parsed = parseFeed(xml).slice(0, Math.max(1, Math.min(Number(source.maxItems) || 40, 100)));
      const selected = source.requireJobSignal === true
        ? parsed.filter(item => hasClearJobSignal(`${item.title} ${item.description}`))
        : parsed;
      const jobs = selected.map(item => normalizedRssJob(source, item, verifiedAt)).filter(Boolean);
      appended.push(...jobs);
      const rejected = parsed.length - selected.length;
      console.log(`${source.id}: ${jobs.length} feed item(s) normalized without page scraping${source.requireJobSignal === true ? `; ${rejected} non-job item(s) rejected` : ''}.`);
    } catch (error) {
      console.warn(`${source.id}: RSS/Atom source skipped: ${error?.message || error}`);
    }
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
  console.log(`Arabic feed ingestion complete: ${appended.length} item(s) appended from ${enabled.length} configured feed(s).`);
}

main().catch(error => {
  console.error('Arabic RSS/Atom ingestion failed:', error);
  process.exit(1);
});
