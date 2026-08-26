import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REGISTRY_FILE = path.join(ROOT, 'config/job-sources.json');
const OUTPUT_FILE = path.join(ROOT, 'public/jobs/external-jobs.json');
const HEALTH_FILE = path.join(ROOT, 'data/job-source-health.json');
const MANUAL_FILE = path.join(ROOT, 'data/manual-external-jobs.json');
const CHECK_CONFIG_ONLY = process.argv.includes('--check-config');
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_PRESERVE_FAILURE_HOURS = 72;
const REQUEST_TIMEOUT_MS = 20_000;
const USER_AGENT = 'NEXTJOB-public-job-indexer/1.0';

const SAUDI_LOCATION_PATTERNS = [
  /saudi arabia/i, /\bksa\b/i, /riyadh/i, /jeddah/i, /jedda/i, /dammam/i,
  /khobar/i, /jubail/i, /makkah/i, /mecca/i, /madinah/i, /medina/i,
  /taif/i, /tabuk/i, /abha/i, /khamis mushait/i, /jazan/i, /jizan/i,
  /najran/i, /yanbu/i, /qassim/i, /hail/i, /ahsa/i, /al.?hasa/i,
  /السعودية/, /الرياض/, /جدة/, /الدمام/, /الخبر/, /الجبيل/, /مكة/,
  /المدينة المنورة/, /الطائف/, /تبوك/, /أبها/, /خميس مشيط/, /جازان/,
  /نجران/, /ينبع/, /القصيم/, /حائل/, /الأحساء/
];

const EXCLUDED_AUDIENCE_PATTERNS = [
  /saudi nationals?\s*(only|required)/i,
  /saudi national\b/i,
  /must be (a )?saudi/i,
  /saudi citizens?\s*(only|required)/i,
  /ksa nationals?\s*(only|required)/i,
  /saudi nationality\s*(required|only)/i,
  /سعودي(?:ة)? الجنسية/,
  /للسعوديين فقط/,
  /للسعوديات فقط/,
  /يشترط الجنسية السعودية/,
  /تمهير/i,
  /tamheer/i
];

const NON_JOB_PATTERNS = [
  /prospective talent pool/i,
  /talent pool/i,
  /submit your cv/i,
  /general application/i,
  /open application/i,
  /future opportunities/i
];

const CITY_RULES = [
  ['الرياض', [/riyadh/i, /الرياض/]],
  ['جدة', [/jeddah/i, /jedda/i, /جدة/]],
  ['الدمام', [/dammam/i, /الدمام/]],
  ['الخبر', [/khobar/i, /الخبر/]],
  ['الجبيل', [/jubail/i, /الجبيل/]],
  ['مكة المكرمة', [/makkah/i, /mecca/i, /مكة/]],
  ['المدينة المنورة', [/madinah/i, /medina/i, /المدينة المنورة/]],
  ['الطائف', [/taif/i, /الطائف/]],
  ['تبوك', [/tabuk/i, /تبوك/]],
  ['خميس مشيط / أبها', [/abha/i, /khamis mushait/i, /أبها/, /خميس مشيط/]],
  ['جازان', [/jazan/i, /jizan/i, /جازان/]],
  ['نجران', [/najran/i, /نجران/]],
  ['ينبع', [/yanbu/i, /ينبع/]],
  ['القصيم (بريدة / عنيزة)', [/qassim/i, /buraidah/i, /unayzah/i, /القصيم/, /بريدة/, /عنيزة/]],
  ['حائل', [/hail/i, /حائل/]],
  ['الأحساء', [/ahsa/i, /al.?hasa/i, /الأحساء/]]
];

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function assertHttps(value, label) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`${label} must use https.`);
  return parsed;
}

function validateRegistry(registry) {
  if (!registry || registry.version !== 1 || !registry.providers || !Array.isArray(registry.sources)) {
    throw new Error('config/job-sources.json has an unsupported schema.');
  }

  const lever = registry.providers.lever;
  const greenhouse = registry.providers.greenhouse;
  if (!lever || !greenhouse) throw new Error('Both lever and greenhouse provider policies are required.');

  const leverDoc = assertHttps(lever.documentationUrl, 'Lever documentationUrl');
  const greenhouseDoc = assertHttps(greenhouse.documentationUrl, 'Greenhouse documentationUrl');
  if (leverDoc.hostname !== 'github.com' || !leverDoc.pathname.startsWith('/lever/postings-api')) {
    throw new Error('Lever documentation must point to the official lever/postings-api repository.');
  }
  if (!['developers.greenhouse.io', 'developer.greenhouse.io'].includes(greenhouseDoc.hostname)) {
    throw new Error('Greenhouse documentation must point to the official Greenhouse developer site.');
  }

  const ids = new Set();
  for (const source of registry.sources) {
    if (!source || typeof source !== 'object') throw new Error('Every job source must be an object.');
    if (!/^[a-z0-9-]{3,80}$/.test(String(source.id || ''))) throw new Error('Invalid job source id.');
    if (ids.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
    ids.add(source.id);
    if (!['lever', 'greenhouse'].includes(source.provider)) throw new Error(`${source.id}: unsupported provider.`);
    if (typeof source.company !== 'string' || !source.company.trim()) throw new Error(`${source.id}: company is required.`);
    const board = assertHttps(source.boardUrl, `${source.id} boardUrl`);
    if (source.provider === 'lever') {
      if (!/^[A-Za-z0-9_-]{2,80}$/.test(String(source.site || ''))) throw new Error(`${source.id}: invalid Lever site.`);
      if (board.hostname !== 'jobs.lever.co' || board.pathname.replace(/^\//, '').split('/')[0] !== source.site) {
        throw new Error(`${source.id}: Lever boardUrl/site mismatch.`);
      }
    } else {
      if (!/^[A-Za-z0-9_-]{2,80}$/.test(String(source.boardToken || ''))) throw new Error(`${source.id}: invalid Greenhouse board token.`);
      if (!['job-boards.greenhouse.io', 'boards.greenhouse.io'].includes(board.hostname)) {
        throw new Error(`${source.id}: Greenhouse boardUrl must use a Greenhouse hosted board.`);
      }
      if (board.pathname.replace(/^\//, '').split('/')[0] !== source.boardToken) {
        throw new Error(`${source.id}: Greenhouse boardUrl/token mismatch.`);
      }
    }
    if (!Number.isInteger(source.maxItems) || source.maxItems < 1 || source.maxItems > 100) {
      throw new Error(`${source.id}: maxItems must be an integer from 1 to 100.`);
    }
  }
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'");
}

function plainText(value) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSaudiLocation(value) {
  const text = String(value || '');
  return SAUDI_LOCATION_PATTERNS.some(pattern => pattern.test(text));
}

function isExcludedForAudience(value) {
  const text = plainText(value);
  return EXCLUDED_AUDIENCE_PATTERNS.some(pattern => pattern.test(text)) || NON_JOB_PATTERNS.some(pattern => pattern.test(text));
}

function normalizeCity(sourceLocation) {
  const value = String(sourceLocation || '');
  for (const [city, patterns] of CITY_RULES) {
    if (patterns.some(pattern => pattern.test(value))) return city;
  }
  return 'السعودية (الموقع حسب المصدر)';
}

function inferCategory(value) {
  const text = plainText(value).toLowerCase();
  if (/(software|developer|engineering|data|technology|cyber|security|cloud|it\b|product engineer|programmer|برمج|تقني|بيانات)/i.test(text)) return 'technology';
  if (/(sales|customer|care|account manager|business development|retail|cashier|مبيعات|خدمة عملاء|كاشير)/i.test(text)) return 'sales';
  if (/(restaurant|cafe|food|chef|barista|kitchen|مطعم|كافيه|شيف|طباخ)/i.test(text)) return 'restaurants';
  if (/(finance|accounting|accountant|audit|risk|compliance|treasury|financial|محاسب|مالية|تدقيق|امتثال)/i.test(text)) return 'accounting';
  if (/(driver|delivery|transport|fleet|logistics|سائق|توصيل|نقليات)/i.test(text)) return 'drivers';
  if (/(warehouse|inventory|procurement|supply chain|مستودع|مخزون|مشتريات|سلسلة الإمداد)/i.test(text)) return 'warehousing';
  if (/(construction|architect|civil|site engineer|project engineer|bim|cad|quantity survey|مقاول|معمار|مدني|إنشاء|بناء)/i.test(text)) return 'construction';
  if (/(mechanic|automotive|vehicle|maintenance|ميكانيك|سيارات|صيانة)/i.test(text)) return 'maintenance';
  if (/(electrical|electrician|hvac|technician|plumb|فني|كهرب|تكييف|سباك)/i.test(text)) return 'technical';
  if (/(medical|clinical|health|pharma|nurse|doctor|صيدل|طبي|تمريض)/i.test(text)) return 'medical';
  if (/(marketing|brand|content|design|media|growth|تسويق|محتوى|تصميم|إعلام)/i.test(text)) return 'marketing';
  return 'management';
}

function inferJobType(value) {
  const text = String(value || '').toLowerCase();
  if (/(part[- ]?time|part time|دوام جزئي)/i.test(text)) return 'دوام جزئي';
  if (/(contract|contractor|temporary|fixed term|internship|intern\b|عقد|مؤقت|تدريب)/i.test(text)) return 'عقد مؤقت';
  if (/(freelance|freelancer|عمل حر)/i.test(text)) return 'عمل حر / بالقطعة';
  return 'دوام كامل';
}

function toIsoDate(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === 'string' && /^\d{10,13}$/.test(value.trim())) {
    const numeric = Number(value);
    const date = new Date(value.trim().length === 10 ? numeric * 1000 : numeric);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  const date = new Date(String(value || ''));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function safeHttpsUrl(value) {
  try {
    const parsed = new URL(String(value || ''));
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function sourceSummary({ company, title, sourceLocation, department, commitment }) {
  const parts = [
    `فرصة منشورة لدى ${company}: ${title}.`,
    sourceLocation ? `الموقع كما في المصدر: ${sourceLocation}.` : '',
    department ? `القسم: ${department}.` : '',
    commitment ? `نوع العمل كما في المصدر: ${commitment}.` : '',
    'تعرض NEXT JOB بيانات فهرسة مختصرة فقط؛ راجع المصدر الأصلي لمعرفة الوصف الكامل، متطلبات الجنسية والإقامة، شروط الأهلية، والمزايا قبل التقديم.'
  ];
  return parts.filter(Boolean).join(' ');
}

function normalizedJobBase({ source, rawId, title, sourceLocation, sourcePublishedAt, sourceUrl, applyUrl, categoryText, commitment, department, verifiedAt }) {
  return {
    id: `${source.provider}-${source.id}-${String(rawId)}`,
    title: plainText(title).slice(0, 150),
    company: source.company,
    city: normalizeCity(sourceLocation),
    category: inferCategory(`${title} ${categoryText || ''} ${department || ''}`),
    salary: '',
    jobType: inferJobType(commitment),
    sponsorshipTransfer: false,
    accommodationProvided: false,
    transportationProvided: false,
    mealsProvided: false,
    overtimeAvailable: false,
    experienceYears: 'حسب المصدر',
    description: sourceSummary({ company: source.company, title: plainText(title), sourceLocation, department, commitment }),
    phone: '',
    whatsapp: '',
    createdAt: sourcePublishedAt,
    status: 'active',
    sourceType: 'external',
    sourceName: `${source.company} Careers`,
    sourceUrl,
    applyUrl,
    sourcePublishedAt,
    sourceVerifiedAt: verifiedAt,
    sourceProvider: source.provider,
    sourceRegistryId: source.id,
    sourceLocation: plainText(sourceLocation).slice(0, 180)
  };
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'user-agent': USER_AGENT
      },
      signal: controller.signal
    });
    if (!response.ok) {
      if (attempt < 3 && (response.status === 429 || response.status >= 500)) {
        const retryAfter = Number(response.headers.get('retry-after') || 0);
        await wait(Math.min(Math.max(retryAfter * 1000, attempt * 1500), 10_000));
        return fetchJson(url, attempt + 1);
      }
      throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}`);
    }
    return response.json();
  } catch (error) {
    if (attempt < 3 && (error?.name === 'AbortError' || error instanceof TypeError)) {
      await wait(attempt * 1500);
      return fetchJson(url, attempt + 1);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return output;
}

async function fetchLeverSource(source, verifiedAt) {
  const endpoint = `https://api.lever.co/v0/postings/${encodeURIComponent(source.site)}?mode=json`;
  const payload = await fetchJson(endpoint);
  if (!Array.isArray(payload)) throw new Error(`${source.id}: Lever response is not an array.`);

  return payload
    .map(job => {
      const sourceLocation = [
        job?.categories?.location,
        ...(Array.isArray(job?.categories?.allLocations) ? job.categories.allLocations : [])
      ].filter(Boolean).join(' / ');
      const audienceText = [
        job?.text,
        sourceLocation,
        job?.descriptionPlain,
        job?.additionalPlain,
        ...(Array.isArray(job?.lists) ? job.lists.flatMap(list => [list?.text, list?.content]) : [])
      ].filter(Boolean).join(' ');
      if (!isSaudiLocation(sourceLocation) || isExcludedForAudience(audienceText)) return null;

      const sourcePublishedAt = toIsoDate(job?.createdAt);
      const sourceUrl = safeHttpsUrl(job?.hostedUrl);
      const applyUrl = safeHttpsUrl(job?.applyUrl) || sourceUrl;
      if (!job?.id || !job?.text || !sourcePublishedAt || !sourceUrl || !applyUrl) return null;

      const commitment = job?.categories?.commitment || job?.workplaceType || '';
      const department = job?.categories?.department || job?.categories?.team || '';
      return normalizedJobBase({
        source,
        rawId: job.id,
        title: job.text,
        sourceLocation,
        sourcePublishedAt,
        sourceUrl,
        applyUrl,
        categoryText: `${job?.categories?.team || ''} ${job?.categories?.department || ''}`,
        commitment,
        department,
        verifiedAt
      });
    })
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.sourcePublishedAt) - Date.parse(a.sourcePublishedAt))
    .slice(0, source.maxItems);
}

async function fetchGreenhouseSource(source, verifiedAt) {
  const token = encodeURIComponent(source.boardToken);
  const listEndpoint = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`;
  const payload = await fetchJson(listEndpoint);
  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : null;
  if (!jobs) throw new Error(`${source.id}: Greenhouse response has no jobs array.`);

  const candidates = jobs
    .filter(job => {
      const sourceLocation = job?.location?.name || '';
      const audienceText = `${job?.title || ''} ${sourceLocation} ${plainText(job?.content || '')}`;
      return isSaudiLocation(sourceLocation) && !isExcludedForAudience(audienceText) && job?.id && job?.title;
    })
    .sort((a, b) => Date.parse(b?.updated_at || 0) - Date.parse(a?.updated_at || 0))
    .slice(0, source.maxItems);

  const detailed = await mapLimit(candidates, 4, async job => {
    const detailEndpoint = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs/${encodeURIComponent(job.id)}`;
    try {
      return await fetchJson(detailEndpoint);
    } catch (error) {
      console.warn(`${source.id}: detail fetch failed for ${job.id}: ${error.message}`);
      return job;
    }
  });

  return detailed.map((detail, index) => {
    const fallback = candidates[index];
    const sourceLocation = detail?.location?.name || fallback?.location?.name || '';
    const sourcePublishedAt = toIsoDate(detail?.first_published || detail?.updated_at || fallback?.updated_at);
    const sourceUrl = safeHttpsUrl(detail?.absolute_url || fallback?.absolute_url);
    const applyUrl = sourceUrl;
    if (!sourcePublishedAt || !sourceUrl || !detail?.title) return null;

    const departments = Array.isArray(detail?.departments) ? detail.departments.map(item => item?.name).filter(Boolean) : [];
    const department = departments[0] || '';
    const audienceText = `${detail.title} ${sourceLocation} ${plainText(detail?.content || '')}`;
    if (isExcludedForAudience(audienceText)) return null;

    return normalizedJobBase({
      source,
      rawId: detail.id || fallback.id,
      title: detail.title,
      sourceLocation,
      sourcePublishedAt,
      sourceUrl,
      applyUrl,
      categoryText: departments.join(' '),
      commitment: '',
      department,
      verifiedAt
    });
  }).filter(Boolean);
}

function dedupeJobs(jobs) {
  const byId = new Map();
  const byApply = new Set();
  for (const job of [...jobs].sort((a, b) => Date.parse(b.sourcePublishedAt) - Date.parse(a.sourcePublishedAt))) {
    if (!job?.id || byId.has(job.id)) continue;
    const applyKey = String(job.applyUrl || '').replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
    if (applyKey && byApply.has(applyKey)) continue;
    byId.set(job.id, job);
    if (applyKey) byApply.add(applyKey);
  }
  return [...byId.values()];
}

function preservedFromFailedSource(previousJobs, sourceId, nowMs) {
  const maxAgeMs = MAX_PRESERVE_FAILURE_HOURS * 60 * 60 * 1000;
  return previousJobs.filter(job => {
    if (job?.sourceRegistryId !== sourceId) return false;
    const verified = Date.parse(job?.sourceVerifiedAt || '');
    return Number.isFinite(verified) && nowMs - verified <= maxAgeMs;
  });
}

async function main() {
  const registry = readJson(REGISTRY_FILE, null);
  validateRegistry(registry);
  console.log(`Trusted source registry validated: ${registry.sources.length} configured source(s).`);
  if (CHECK_CONFIG_ONLY) return;

  const enabled = registry.sources.filter(source => source.enabled === true);
  if (!enabled.length) throw new Error('No trusted external job sources are enabled.');

  const previousJobs = readJson(OUTPUT_FILE, []);
  const manualJobs = readJson(MANUAL_FILE, []);
  if (!Array.isArray(previousJobs) || !Array.isArray(manualJobs)) throw new Error('Job data files must contain arrays.');

  const verifiedAt = new Date().toISOString();
  const nowMs = Date.now();
  const collected = [...manualJobs];
  const health = [];
  let successfulSources = 0;

  for (const source of enabled) {
    try {
      const jobs = source.provider === 'lever'
        ? await fetchLeverSource(source, verifiedAt)
        : await fetchGreenhouseSource(source, verifiedAt);
      collected.push(...jobs);
      successfulSources += 1;
      health.push({ id: source.id, provider: source.provider, company: source.company, status: 'ok', count: jobs.length, checkedAt: verifiedAt });
      console.log(`${source.id}: ${jobs.length} eligible Saudi job(s).`);
    } catch (error) {
      const preserved = preservedFromFailedSource(previousJobs, source.id, nowMs);
      collected.push(...preserved);
      health.push({ id: source.id, provider: source.provider, company: source.company, status: 'error', count: preserved.length, checkedAt: verifiedAt, error: String(error?.message || error).slice(0, 240) });
      console.warn(`${source.id}: source failed; preserved ${preserved.length} recently verified job(s). ${error?.message || error}`);
    }
  }

  if (successfulSources === 0) {
    throw new Error('All enabled job sources failed. Existing public feed was left untouched.');
  }

  const output = dedupeJobs(collected)
    .filter(job => job && job.sourceType === 'external' && job.status === 'active')
    .sort((a, b) => Date.parse(b.sourcePublishedAt) - Date.parse(a.sourcePublishedAt));

  const healthDoc = {
    version: 1,
    checkedAt: verifiedAt,
    enabledSources: enabled.length,
    successfulSources,
    totalJobs: output.length,
    preservedFailureWindowHours: MAX_PRESERVE_FAILURE_HOURS,
    sources: health
  };

  console.log(`External jobs sync complete: ${output.length} normalized job(s) from ${successfulSources}/${enabled.length} successful source(s).`);
  if (DRY_RUN) return;

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.mkdirSync(path.dirname(HEALTH_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');
  fs.writeFileSync(HEALTH_FILE, JSON.stringify(healthDoc, null, 2) + '\n', 'utf8');
}

main().catch(error => {
  console.error('External job sync failed:', error);
  process.exit(1);
});
