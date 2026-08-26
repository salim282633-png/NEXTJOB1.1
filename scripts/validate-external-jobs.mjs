import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('public/jobs/external-jobs.json');
const registryFile = path.resolve('config/job-sources.json');
const raw = fs.readFileSync(file, 'utf8');
const jobs = JSON.parse(raw);
const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));

if (!Array.isArray(jobs)) {
  throw new Error('external-jobs.json must contain an array.');
}
if (!registry || !Array.isArray(registry.sources)) {
  throw new Error('config/job-sources.json must contain a sources array.');
}

const sourceById = new Map(registry.sources.map(source => [source.id, source]));
const requiredText = [
  'id', 'title', 'company', 'city', 'category', 'description',
  'sourceName', 'sourceUrl', 'applyUrl', 'sourcePublishedAt', 'createdAt'
];
const allowedJobTypes = new Set(['دوام كامل', 'دوام جزئي', 'عمل حر / بالقطعة', 'عقد مؤقت']);
const allowedAutomatedProviders = new Set(['lever', 'greenhouse']);
const seenIds = new Set();
const seenApplyUrls = new Set();
const maxFutureMs = Date.now() + 24 * 60 * 60 * 1000;

function parsedHttps(value, field, id) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${id}: ${field} must be a valid URL.`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`${id}: ${field} must use https.`);
  }
  return parsed;
}

function assertDate(value, field, id) {
  const time = Date.parse(value);
  if (Number.isNaN(time)) throw new Error(`${id}: ${field} must be a valid date.`);
  if (time > maxFutureMs) throw new Error(`${id}: ${field} cannot be materially in the future.`);
  return time;
}

for (const [index, job] of jobs.entries()) {
  if (!job || typeof job !== 'object' || Array.isArray(job)) {
    throw new Error(`Entry ${index} must be an object.`);
  }

  for (const field of requiredText) {
    if (typeof job[field] !== 'string' || !job[field].trim()) {
      throw new Error(`Entry ${index}: missing required text field ${field}.`);
    }
  }

  if (seenIds.has(job.id)) throw new Error(`Duplicate external job id: ${job.id}`);
  seenIds.add(job.id);

  if (job.sourceType !== 'external') {
    throw new Error(`${job.id}: sourceType must be external.`);
  }
  if (job.status !== 'active') {
    throw new Error(`${job.id}: status must be active.`);
  }
  if (!allowedJobTypes.has(job.jobType)) {
    throw new Error(`${job.id}: unsupported jobType.`);
  }
  if (job.phone || job.whatsapp || job.userId || job.employerUid) {
    throw new Error(`${job.id}: external listings must not contain direct-contact or ownership fields.`);
  }

  const sourcePublishedAt = assertDate(job.sourcePublishedAt, 'sourcePublishedAt', job.id);
  const createdAt = assertDate(job.createdAt, 'createdAt', job.id);
  if (Math.abs(sourcePublishedAt - createdAt) > 60_000) {
    throw new Error(`${job.id}: createdAt must reflect the source date for external listings.`);
  }

  const sourceUrl = parsedHttps(job.sourceUrl, 'sourceUrl', job.id);
  const applyUrl = parsedHttps(job.applyUrl, 'applyUrl', job.id);
  const applyKey = applyUrl.toString().replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
  if (seenApplyUrls.has(applyKey)) throw new Error(`${job.id}: duplicate application destination.`);
  seenApplyUrls.add(applyKey);

  if (job.sourceRegistryId || job.sourceProvider) {
    if (typeof job.sourceRegistryId !== 'string' || !job.sourceRegistryId) {
      throw new Error(`${job.id}: automated listings require sourceRegistryId.`);
    }
    if (!allowedAutomatedProviders.has(job.sourceProvider)) {
      throw new Error(`${job.id}: unsupported automated sourceProvider.`);
    }
    const configured = sourceById.get(job.sourceRegistryId);
    if (!configured || configured.enabled !== true) {
      throw new Error(`${job.id}: sourceRegistryId is not an enabled configured source.`);
    }
    if (configured.provider !== job.sourceProvider) {
      throw new Error(`${job.id}: source provider does not match registry.`);
    }
    if (typeof job.sourceVerifiedAt !== 'string') {
      throw new Error(`${job.id}: automated listings require sourceVerifiedAt.`);
    }
    assertDate(job.sourceVerifiedAt, 'sourceVerifiedAt', job.id);
    if (typeof job.sourceLocation !== 'string' || !job.sourceLocation.trim()) {
      throw new Error(`${job.id}: automated listings require sourceLocation.`);
    }
    if (!job.description.includes('راجع المصدر الأصلي')) {
      throw new Error(`${job.id}: automated listing summary must direct users to the original source.`);
    }

    if (job.sourceProvider === 'lever') {
      if (sourceUrl.hostname !== 'jobs.lever.co' || applyUrl.hostname !== 'jobs.lever.co') {
        throw new Error(`${job.id}: Lever automated URLs must stay on jobs.lever.co.`);
      }
    }
    if (job.sourceProvider === 'greenhouse') {
      const allowedHosts = new Set([
        'job-boards.greenhouse.io',
        'boards.greenhouse.io',
        'job-boards.eu.greenhouse.io'
      ]);
      if (!allowedHosts.has(sourceUrl.hostname) || !allowedHosts.has(applyUrl.hostname)) {
        throw new Error(`${job.id}: Greenhouse automated URLs must stay on a hosted Greenhouse board.`);
      }
    }
  }
}

console.log(`External jobs feed validated: ${jobs.length} entr${jobs.length === 1 ? 'y' : 'ies'}.`);
