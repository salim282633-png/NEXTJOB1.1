import fs from 'node:fs';
import process from 'node:process';
import { evaluatePublishSlot, readLatestPublishedAt } from './seo-publish-cadence.mjs';

const manifestPath = process.env.SEO_MANIFEST_PATH || 'public/guide/articles.json';
const nowValue = process.env.SEO_NOW ? Date.parse(process.env.SEO_NOW) : Date.now();
const now = Number.isFinite(nowValue) ? nowValue : Date.now();
const force = /^(1|true|yes)$/i.test(String(process.env.SEO_FORCE_PUBLISH || ''));
const latestPublishedAt = readLatestPublishedAt(manifestPath);
const result = evaluatePublishSlot({
  now,
  latestPublishedAt,
  slotMinutes: process.env.SEO_PUBLISH_SLOT_MINUTES || 360,
  force
});

const currentSlot = new Date(result.currentSlotStart).toISOString();
const latestSlot = result.latestSlotStart === null ? '' : new Date(result.latestSlotStart).toISOString();

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, [
    `eligible=${result.eligible}`,
    `current_slot=${currentSlot}`,
    `latest_slot=${latestSlot}`,
    `missed_slots=${result.missedSlots}`
  ].join('\n') + '\n');
}

if (result.forced) {
  console.log(`Manual editorial override enabled for slot ${currentSlot}.`);
} else if (result.latestSlotStart === null) {
  console.log(`No valid previous publication found; slot ${currentSlot} is eligible.`);
} else if (result.eligible) {
  console.log(`Six-hour slot ${currentSlot} is eligible; ${result.missedSlots} earlier slot(s) were missed.`);
} else {
  console.log(`Six-hour slot ${currentSlot} already contains an article; duplicate run ends safely.`);
}
