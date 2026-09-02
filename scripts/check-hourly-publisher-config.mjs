import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluatePublishSlot } from './seo-publish-cadence.mjs';

const workflow = fs.readFileSync('.github/workflows/seo-publisher.yml', 'utf8');
const render = fs.readFileSync('render.yaml', 'utf8');
const dispatcher = fs.readFileSync('scripts/trigger-seo-workflow.mjs', 'utf8');

assert.match(workflow, /cron: '17 \* \* \* \*'/, 'primary publisher must run hourly at minute 17');
assert.match(render, /schedule: '47 \* \* \* \*'/, 'Render recovery must run hourly at minute 47');
assert.match(workflow, /SEO_PUBLISH_CADENCE_MODE: hourly-slot/, 'publisher must enforce aligned hourly slots');
assert.match(workflow, /cancel-in-progress: false/, 'a recovery run must not cancel an active publication');
assert.match(dispatcher, /const maxAttempts = 4;/, 'Render recovery dispatch must retry transient failures');

const hour = 60 * 60 * 1000;
const now = Date.parse('2026-09-02T12:17:00.000Z');
assert.equal(evaluatePublishSlot({ now, latestPublishedAt: now - 10 * 60 * 1000 }).eligible, false);
assert.equal(evaluatePublishSlot({ now, latestPublishedAt: now - hour }).eligible, true);
assert.equal(evaluatePublishSlot({ now, latestPublishedAt: now - 3 * hour }).missedSlots, 2);
assert.equal(evaluatePublishSlot({ now, latestPublishedAt: now - 10 * 60 * 1000, force: true }).eligible, true);

console.log('Hourly SEO publisher schedule, recovery dispatch, and slot idempotency verified.');
