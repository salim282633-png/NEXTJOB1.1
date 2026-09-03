import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluatePublishSlot } from './seo-publish-cadence.mjs';

const workflow = fs.readFileSync('.github/workflows/seo-publisher.yml', 'utf8');
const render = fs.readFileSync('render.yaml', 'utf8');
const dispatcher = fs.readFileSync('scripts/trigger-seo-workflow.mjs', 'utf8');

assert.match(workflow, /cron: '17 \\*\\/6 \\* \\* \\*'/, 'primary publisher must run every six hours at minute 17');
assert.match(render, /schedule: '47 \\* \\* \\* \\*'/, 'Render recovery must check hourly at minute 47');
assert.match(workflow, /SEO_PUBLISH_CADENCE_MODE: six-hour-slot/, 'publisher must enforce aligned six-hour slots');
assert.match(workflow, /SEO_PUBLISH_SLOT_MINUTES: 360/, 'publisher slot must be exactly six hours');
assert.match(workflow, /cancel-in-progress: false/, 'a recovery run must not cancel an active publication');
assert.match(dispatcher, /const publishSlotMs = 6 \\* 60 \\* 60 \\* 1000;/, 'recovery dispatch must report the aligned six-hour slot');
assert.match(dispatcher, /const maxAttempts = 4;/, 'Render recovery dispatch must retry transient failures');

const sixHours = 6 * 60 * 60 * 1000;
const now = Date.parse('2026-09-02T12:17:00.000Z');
assert.equal(evaluatePublishSlot({ now, latestPublishedAt: now - 10 * 60 * 1000 }).eligible, false);
assert.equal(evaluatePublishSlot({ now, latestPublishedAt: now - sixHours, slotMinutes: 360 }).eligible, true);
assert.equal(evaluatePublishSlot({ now, latestPublishedAt: now - 18 * 60 * 60 * 1000, slotMinutes: 360 }).missedSlots, 2);
assert.equal(evaluatePublishSlot({ now, latestPublishedAt: now - 10 * 60 * 1000, slotMinutes: 360, force: true }).eligible, true);

console.log('Six-hour SEO publisher schedule, hourly recovery dispatch, and slot idempotency verified.');
