import process from 'node:process';

const token = String(process.env.GITHUB_ACTIONS_TOKEN || '').trim();

if (!token) {
  console.error('Render SEO scheduler failed: GITHUB_ACTIONS_TOKEN is not configured.');
  process.exit(1);
}

const endpoint = 'https://api.github.com/repos/salim282633-png/NEXTJOB1.1/actions/workflows/seo-publisher.yml/dispatches';
const currentHour = new Date(Math.floor(Date.now() / 3600000) * 3600000).toISOString();
const maxAttempts = 4;

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function dispatch() {
  let lastError = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2026-03-10',
          'Content-Type': 'application/json',
          'User-Agent': 'nextjob-render-seo-scheduler'
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            scheduler: 'render-cron',
            scheduled_slot: currentHour
          }
        })
      });

      const body = await response.text();
      if (response.ok) return body;

      lastError = `GitHub returned ${response.status}: ${body.slice(0, 1000)}`;
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      if (!retryable || attempt === maxAttempts) break;
    } catch (error) {
      lastError = error?.message || String(error);
      if (attempt === maxAttempts) break;
    }

    const delayMs = [2000, 5000, 12000][attempt - 1] || 12000;
    console.warn(`Render SEO scheduler attempt ${attempt}/${maxAttempts} failed; retrying in ${delayMs / 1000}s. ${lastError}`);
    await wait(delayMs);
  }

  throw new Error(lastError || 'unknown dispatch failure');
}

let body = '';
try {
  body = await dispatch();
} catch (error) {
  console.error(`Render SEO scheduler failed after ${maxAttempts} attempts: ${error.message}`);
  process.exit(1);
}

let runId = '';
try {
  const parsed = body ? JSON.parse(body) : null;
  runId = parsed?.workflow_run_id ? ` run=${parsed.workflow_run_id}` : '';
} catch {
  // GitHub may return an empty successful response on older API behavior.
}

console.log(`Render SEO scheduler dispatched slot ${currentHour} successfully.${runId}`);
