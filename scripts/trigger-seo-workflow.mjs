import process from 'node:process';

const token = String(process.env.GITHUB_ACTIONS_TOKEN || '').trim();

if (!token) {
  console.error('Render SEO scheduler failed: GITHUB_ACTIONS_TOKEN is not configured.');
  process.exit(1);
}

const endpoint = 'https://api.github.com/repos/salim282633-png/NEXTJOB1.1/actions/workflows/seo-publisher.yml/dispatches';

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
      scheduler: 'render-cron'
    }
  })
});

const body = await response.text();

if (!response.ok) {
  console.error(`Render SEO scheduler failed (${response.status}): ${body.slice(0, 1000)}`);
  process.exit(1);
}

let runId = '';
try {
  const parsed = body ? JSON.parse(body) : null;
  runId = parsed?.workflow_run_id ? ` run=${parsed.workflow_run_id}` : '';
} catch {
  // GitHub may return an empty successful response on older API behavior.
}

console.log(`Render SEO scheduler dispatched NEXT JOB SEO Publisher successfully.${runId}`);
