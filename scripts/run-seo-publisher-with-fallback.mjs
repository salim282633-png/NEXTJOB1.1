import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import process from 'node:process';

const API_KEY = String(process.env.GEMINI_API_KEY || '').trim();
const PREFERRED_MODEL = String(process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim().replace(/^models\//, '');
const MAX_ATTEMPTS = Math.max(8, Math.min(12, Number(process.env.GEMINI_MAX_MODEL_ATTEMPTS || 8)));
const MODEL_RETRIES = Math.max(1, Math.min(3, Number(process.env.GEMINI_MODEL_RETRIES || 2)));
const MIN_PUBLISH_INTERVAL_HOURS = Math.max(1, Number(process.env.SEO_MIN_PUBLISH_INTERVAL_HOURS || 6));
const PUBLISHER_SCRIPT = 'scripts/publish-guidance-seo.mjs';
const ARTICLES_INDEX = 'public/guide/articles.json';

function modelScore(name) {
  let score = 0;
  if (name === PREFERRED_MODEL) score += 10000;
  if (/flash/i.test(name)) score += 1000;
  if (!/preview|experimental|exp/i.test(name)) score += 200;
  if (/latest/i.test(name)) score += 100;
  if (/pro/i.test(name)) score -= 100;
  return score;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const STATIC_FALLBACK_MODELS = unique([
  PREFERRED_MODEL,
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite'
]);

function getLatestPublishedAt() {
  try {
    const raw = readFileSync(ARTICLES_INDEX, 'utf8');
    const articles = JSON.parse(raw);
    if (!Array.isArray(articles) || articles.length === 0) return null;

    let latest = null;
    for (const article of articles) {
      const value = article?.publishedAt || article?.publishedDate;
      if (!value) continue;
      const timestamp = Date.parse(value);
      if (!Number.isFinite(timestamp)) continue;
      if (latest === null || timestamp > latest) latest = timestamp;
    }
    return latest;
  } catch (error) {
    console.warn(`SEO publisher could not read ${ARTICLES_INDEX}; continuing without cooldown history:`, error?.message || error);
    return null;
  }
}

function shouldSkipForCooldown() {
  const latestPublishedAt = getLatestPublishedAt();
  if (latestPublishedAt === null) return false;

  const intervalMs = MIN_PUBLISH_INTERVAL_HOURS * 60 * 60 * 1000;
  const nextEligibleAt = latestPublishedAt + intervalMs;
  const now = Date.now();

  if (now >= nextEligibleAt) return false;

  const remainingMinutes = Math.ceil((nextEligibleAt - now) / 60000);
  console.log(
    `SEO publisher cooldown active: last successful article ${new Date(latestPublishedAt).toISOString()}; ` +
    `next eligible ${new Date(nextEligibleAt).toISOString()} (${remainingMinutes} minute(s) remaining).`
  );
  return true;
}

async function fetchAvailableGenerateContentModels() {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const models = [];
  let pageToken = '';

  for (let page = 0; page < 10; page += 1) {
    const url = new URL('https://generativelanguage.googleapis.com/v1beta/models');
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini model discovery failed (${response.status}): ${body.slice(0, 500)}`);
    }

    const data = await response.json();
    for (const item of data.models || []) {
      const methods = Array.isArray(item.supportedGenerationMethods)
        ? item.supportedGenerationMethods
        : [];
      const name = String(item.name || '').replace(/^models\//, '');

      if (
        name.startsWith('gemini-') &&
        methods.includes('generateContent')
      ) {
        models.push(name);
      }
    }

    pageToken = String(data.nextPageToken || '');
    if (!pageToken) break;
  }

  return unique(models).sort((a, b) => {
    const scoreDiff = modelScore(b) - modelScore(a);
    return scoreDiff || b.localeCompare(a);
  });
}

function shouldAbortWithoutFallback(output) {
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|permission denied|UNAUTHENTICATED|billing.*required|quota.*project.*disabled/i.test(output);
}

function shouldTryAnotherModel(output) {
  return /\b403\b|Forbidden|\b404\b|NOT_FOUND|no longer available|not available|unsupported model|\b429\b|RESOURCE_EXHAUSTED|rate limit|quota exceeded|\b500\b|\b502\b|\b503\b|\b504\b|INTERNAL|UNAVAILABLE|DEADLINE_EXCEEDED|overloaded|Article failed production quality gates/i.test(output);
}

function shouldRetrySameModel(output) {
  return /\b500\b|\b502\b|\b503\b|\b504\b|INTERNAL|UNAVAILABLE|DEADLINE_EXCEEDED|overloaded|Article failed production quality gates/i.test(output);
}

function runPublisher(model) {
  console.log(`SEO publisher model attempt: ${model}`);

  const result = spawnSync(process.execPath, [PUBLISHER_SCRIPT], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      GEMINI_MODEL: model
    },
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status ?? 1,
    output: `${result.stdout || ''}\n${result.stderr || ''}`
  };
}

async function main() {
  if (shouldSkipForCooldown()) {
    console.log(`SEO publisher skipped safely; minimum interval is ${MIN_PUBLISH_INTERVAL_HOURS} hour(s).`);
    return;
  }

  let discovered = [];
  let discoveryAvailable = true;

  try {
    discovered = await fetchAvailableGenerateContentModels();
  } catch (error) {
    discoveryAvailable = false;
    console.warn(
      'SEO publisher model discovery is unavailable; continuing with known generateContent models instead:',
      error?.message || error
    );
  }

  const candidates = discovered.length
    ? unique([...STATIC_FALLBACK_MODELS, ...discovered])
    : STATIC_FALLBACK_MODELS;

  if (!candidates.length) {
    console.error('SEO publisher found no Gemini model candidates.');
    process.exitCode = 1;
    return;
  }

  const attempts = candidates.slice(0, MAX_ATTEMPTS);
  if (discoveryAvailable) {
    console.log(`SEO publisher discovered ${discovered.length} generateContent model(s).`);
  } else {
    console.log('SEO publisher bypassed model discovery safely.');
  }
  console.log(`SEO publisher fallback order: ${attempts.join(' -> ')}`);
  console.log(`SEO publisher transient/quality retries per model: ${MODEL_RETRIES}.`);

  let lastFailure = '';

  for (let index = 0; index < attempts.length; index += 1) {
    const model = attempts[index];

    for (let retry = 1; retry <= MODEL_RETRIES; retry += 1) {
      const result = runPublisher(model);

      if (result.status === 0) {
        console.log(`SEO publisher completed successfully with model: ${model}`);
        return;
      }

      lastFailure = result.output;

      if (shouldAbortWithoutFallback(result.output)) {
        console.error('SEO publisher stopped because the failure is not model-specific. Check the API key, permissions, billing, or project configuration.');
        process.exitCode = result.status;
        return;
      }

      const canRetrySameModel = retry < MODEL_RETRIES && shouldRetrySameModel(result.output);
      if (canRetrySameModel) {
        console.warn(`SEO publisher retrying ${model} after transient/quality failure (${retry}/${MODEL_RETRIES}).`);
        continue;
      }

      const hasNextModel = index + 1 < attempts.length;
      if (!hasNextModel || !shouldTryAnotherModel(result.output)) {
        console.error(`SEO publisher failed with model ${model} and no safe automatic fallback remains.`);
        process.exitCode = result.status;
        return;
      }

      console.warn(`SEO publisher switching automatically from ${model} to ${attempts[index + 1]}.`);
      break;
    }
  }

  console.error('SEO publisher exhausted all automatic Gemini model fallbacks.');
  if (lastFailure) console.error(lastFailure.slice(-1500));
  process.exitCode = 1;
}

main().catch(error => {
  console.error('SEO publisher fallback runner failed:', error);
  process.exitCode = 1;
});