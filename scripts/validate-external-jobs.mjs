import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('public/jobs/external-jobs.json');
const raw = fs.readFileSync(file, 'utf8');
const jobs = JSON.parse(raw);

if (!Array.isArray(jobs)) {
  throw new Error('external-jobs.json must contain an array.');
}

const requiredText = [
  'id', 'title', 'company', 'city', 'category', 'description',
  'sourceName', 'sourceUrl', 'applyUrl', 'sourcePublishedAt', 'createdAt'
];
const allowedJobTypes = new Set(['دوام كامل', 'دوام جزئي', 'عمل حر / بالقطعة', 'عقد مؤقت']);
const seenIds = new Set();

function assertHttps(value, field, id) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${id}: ${field} must be a valid URL.`);
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(`${id}: ${field} must use https.`);
  }
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
  if (Number.isNaN(Date.parse(job.sourcePublishedAt))) {
    throw new Error(`${job.id}: sourcePublishedAt must be a valid date.`);
  }
  if (Number.isNaN(Date.parse(job.createdAt))) {
    throw new Error(`${job.id}: createdAt must be a valid date.`);
  }

  assertHttps(job.sourceUrl, 'sourceUrl', job.id);
  assertHttps(job.applyUrl, 'applyUrl', job.id);
}

console.log(`External jobs feed validated: ${jobs.length} entr${jobs.length === 1 ? 'y' : 'ies'}.`);
