import { spawnSync } from 'node:child_process';
import process from 'node:process';

const API_KEY = String(process.env.GEMINI_API_KEY || '').trim();
const PREFERRED_MODEL = String(process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim().replace(/^models\//, '');
const MAX_ATTEMPTS = Math.max(1, Math.min(8, Number(process.env.GEMINI_MAX_MODEL_ATTEMPTS || 4)));
const PUBLISHER_SCRIPT = 'scripts/publish-yemeni-seo.mjs';

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
  return /\b404\b|NOT_FOUND|no longer available|not available|unsupported model|\b429\b|RESOURCE_EXHAUSTED|rate limit|quota exceeded|\b500\b|\b502\b|\b503\b|\b504\b|INTERNAL|UNAVAILABLE|DEADLINE_EXCEEDED|overloaded|Article failed production quality gates/i.test(output);
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
  let discovered;

  try {
    discovered = await fetchAvailableGenerateContentModels();
  } catch (error) {
    console.error('SEO publisher could not discover Gemini models:', error);
    process.exitCode = 1;
    return;
  }

  const candidates = unique([
    PREFERRED_MODEL,
    ...discovered
  ]).filter(model => discovered.includes(model) || model === PREFERRED_MODEL);

  if (!candidates.length) {
    console.error('SEO publisher found no Gemini models that support generateContent.');
    process.exitCode = 1;
    return;
  }

  const attempts = candidates.slice(0, MAX_ATTEMPTS);
  console.log(`SEO publisher discovered ${discovered.length} generateContent model(s).`);
  console.log(`SEO publisher fallback order: ${attempts.join(' -> ')}`);

  let lastFailure = '';

  for (let index = 0; index < attempts.length; index += 1) {
    const model = attempts[index];
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

    const hasNext = index + 1 < attempts.length;
    if (!hasNext || !shouldTryAnotherModel(result.output)) {
      console.error(`SEO publisher failed with model ${model} and no safe automatic fallback remains.`);
      process.exitCode = result.status;
      return;
    }

    console.warn(`SEO publisher switching automatically from ${model} to ${attempts[index + 1]}.`);
  }

  console.error('SEO publisher exhausted all automatic Gemini model fallbacks.');
  if (lastFailure) console.error(lastFailure.slice(-1500));
  process.exitCode = 1;
}

main().catch(error => {
  console.error('SEO publisher fallback runner failed:', error);
  process.exitCode = 1;
});
