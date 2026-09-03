import fs from 'node:fs';

export const DEFAULT_SLOT_MINUTES = 360;

export function readLatestPublishedAt(manifestPath = 'public/guide/articles.json') {
  try {
    const articles = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!Array.isArray(articles)) return null;

    let latest = null;
    for (const article of articles) {
      const value = article?.publishedAt || article?.publishedDate;
      const timestamp = value ? Date.parse(value) : NaN;
      if (Number.isFinite(timestamp) && (latest === null || timestamp > latest)) latest = timestamp;
    }
    return latest;
  } catch (error) {
    console.warn(`Could not read ${manifestPath}; publisher will continue without cadence history: ${error.message}`);
    return null;
  }
}

export function evaluatePublishSlot({
  now = Date.now(),
  latestPublishedAt = null,
  slotMinutes = DEFAULT_SLOT_MINUTES,
  force = false
} = {}) {
  const normalizedSlotMinutes = Math.max(5, Number(slotMinutes) || DEFAULT_SLOT_MINUTES);
  const slotMs = normalizedSlotMinutes * 60 * 1000;
  const currentSlotStart = Math.floor(now / slotMs) * slotMs;
  const latestSlotStart = latestPublishedAt === null
    ? null
    : Math.floor(latestPublishedAt / slotMs) * slotMs;
  const eligible = force || latestSlotStart === null || latestSlotStart < currentSlotStart;
  const missedSlots = latestSlotStart === null
    ? 0
    : Math.max(0, Math.floor((currentSlotStart - latestSlotStart) / slotMs) - 1);

  return {
    eligible,
    forced: force,
    slotMinutes: normalizedSlotMinutes,
    currentSlotStart,
    latestSlotStart,
    missedSlots
  };
}

