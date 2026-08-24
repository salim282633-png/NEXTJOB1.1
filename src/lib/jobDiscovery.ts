import { Job, JobFilter } from '../types';

function arabicDigitsToLatin(value: string) {
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  const eastern = '۰۱۲۳۴۵۶۷۸۹';
  return value.replace(/[٠-٩۰-۹]/g, char => {
    const a = arabic.indexOf(char);
    if (a >= 0) return String(a);
    return String(eastern.indexOf(char));
  });
}

function timestampLikeToMs(value: unknown): number {
  if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function jobActivityMs(job: Job): number {
  return timestampLikeToMs(job.activityAt) ||
    timestampLikeToMs(job.lastBumpedAt) ||
    timestampLikeToMs(job.updatedAtServer) ||
    timestampLikeToMs(job.createdAtServer) ||
    timestampLikeToMs(job.updatedAt) ||
    timestampLikeToMs(job.createdAt);
}

export function salaryNumbers(value: string): number[] {
  const normalized = arabicDigitsToLatin(value || '').replace(/,/g, '');
  const matches = normalized.match(/\d+(?:\.\d+)?/g) || [];
  return matches.map(Number).filter(Number.isFinite);
}

export function salarySortValue(job: Job): number {
  const numbers = salaryNumbers(job.salary);
  return numbers.length ? Math.max(...numbers) : 0;
}

export function salaryMatches(job: Job, range: string): boolean {
  if (!range) return true;
  const amount = salarySortValue(job);
  if (!amount) return false;
  if (range === 'under3000') return amount < 3000;
  if (range === '3000-5000') return amount >= 3000 && amount <= 5000;
  if (range === '5000-8000') return amount > 5000 && amount <= 8000;
  if (range === '8000+') return amount > 8000;
  return true;
}

export function freshnessMatches(job: Job, freshness: JobFilter['freshness'], now = Date.now()): boolean {
  if (!freshness || freshness === 'all') return true;
  const activity = jobActivityMs(job);
  if (!activity) return false;
  const day = 24 * 60 * 60 * 1000;
  const windowMs = freshness === 'today' ? day : freshness === '3days' ? 3 * day : 7 * day;
  return now - activity <= windowMs;
}

export function isUrgentActive(job: Job, now = Date.now()): boolean {
  if (!job.urgent || job.status === 'closed') return false;
  if (!job.urgentExpiresAt) return false;
  const expires = Date.parse(job.urgentExpiresAt);
  return Number.isFinite(expires) && expires > now;
}

export function urgentWindowLabel(job: Job): string {
  if (!job.urgentStartDate || !job.urgentExpiresAt) return 'عاجل ومباشر';
  const start = Date.parse(job.urgentStartDate);
  const end = Date.parse(job.urgentExpiresAt);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'عاجل ومباشر';
  const hours = Math.round((end - start) / (60 * 60 * 1000));
  if (hours <= 24) return 'مباشرة خلال 24 ساعة';
  if (hours <= 48) return 'مباشرة خلال 48 ساعة';
  return 'عاجل ومباشر';
}
