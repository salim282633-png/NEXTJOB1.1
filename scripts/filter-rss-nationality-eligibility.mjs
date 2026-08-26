import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FEED_FILE = path.join(ROOT, 'public/jobs/external-jobs.json');

const SAUDI_ONLY_PATTERNS = [
  /الجنسية\s+السعودية/,
  /سعودي(?:ة)?\s+الجنسية/,
  /للسعوديين(?:\s+فقط)?/,
  /للسعوديات(?:\s+فقط)?/,
  /السعوديين\s+والسعوديات/,
  /سعوديين\s+فقط/,
  /سعوديات\s+فقط/,
  /مواطنين\s+سعوديين/,
  /مواطنات\s+سعوديات/,
  /المواطنين(?:\s+والمواطنات)?/,
  /الكفاءات\s+الوطنية/,
  /الكوادر\s+الوطنية/,
  /أبناء\s+الوطن/,
  /سعودة/,
  /توطين/,
  /تمهير/,
  /\bsaudi nationals?\b/i,
  /\bsaudi nationality\b/i,
  /\bsaudis? only\b/i,
  /\bfor saudis? only\b/i,
  /\bmust be (?:a )?saudi\b/i,
  /\bksa nationals?\b/i,
  /\btamheer\b/i
];

const NON_SAUDI_EVIDENCE_PATTERNS = [
  /يمنيين/,
  /يمنيات/,
  /الجنسية\s+اليمنية/,
  /جنسية\s+يمنية/,
  /جميع\s+الجنسيات/,
  /مختلف\s+الجنسيات/,
  /لكافة\s+الجنسيات/,
  /للمقيمين/,
  /للمقيمات/,
  /المقيمين\s+والمقيمات/,
  /غير\s+السعوديين/,
  /غير\s+السعوديات/,
  /إقامة\s+(?:سارية|نظامية)/,
  /نقل\s+(?:الكفالة|الخدمات)/,
  /قابل(?:ة)?\s+لنقل\s+(?:الكفالة|الخدمات)/,
  /\byemeni nationals?\b/i,
  /\byemeni nationality\b/i,
  /\byemenis?\b/i,
  /\ball nationalities\b/i,
  /\bopen to all nationalities\b/i,
  /\bexpatriates?\b/i,
  /\bnon[- ]saudis?\b/i,
  /\btransferable iqama\b/i,
  /\bvalid iqama\b/i,
  /\bsponsorship transfer\b/i
];

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function plainText(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

const jobs = readJson(FEED_FILE, null);
if (!Array.isArray(jobs)) throw new Error('public/jobs/external-jobs.json must contain an array.');

let explicitSaudiOnly = 0;
let ambiguousNationality = 0;
let rssKept = 0;

const output = jobs.filter(job => {
  if (job?.sourceIngestion !== 'rss') return true;

  const text = plainText(`${job.title || ''} ${job.description || ''} ${job.sourceText || ''}`);

  if (hasAny(text, SAUDI_ONLY_PATTERNS)) {
    explicitSaudiOnly += 1;
    return false;
  }

  if (!hasAny(text, NON_SAUDI_EVIDENCE_PATTERNS)) {
    ambiguousNationality += 1;
    return false;
  }

  rssKept += 1;
  return true;
});

fs.writeFileSync(FEED_FILE, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(
  `RSS nationality eligibility filter complete: ${rssKept} RSS item(s) kept; ` +
  `${explicitSaudiOnly} Saudi-only item(s) rejected; ${ambiguousNationality} ambiguous item(s) rejected.`
);
