export const RATE_LIMITS = {
  OTP: { max: 3, windowMs: 60 * 60 * 1000 },
  POST_JOB: { max: 3, windowMs: 24 * 60 * 60 * 1000 },
  POST_CANDIDATE: { max: 2, windowMs: 24 * 60 * 60 * 1000 },
  LOGIN: { max: 10, windowMs: 60 * 60 * 1000 }
};

/**
 * Legacy client-side limiter for low-risk UI actions only.
 * Fraud reports intentionally do NOT use this helper: their duplicate and
 * quota enforcement lives in Firestore Security Rules and atomic transactions.
 */
export function checkRateLimit(action: keyof typeof RATE_LIMITS): boolean {
  const now = Date.now();
  const limitRule = RATE_LIMITS[action];
  const storageKey = `nextjob_ratelimit_${action}`;

  try {
    const raw = localStorage.getItem(storageKey);
    let history: number[] = raw ? JSON.parse(raw) : [];

    history = history.filter(time => now - time < limitRule.windowMs);
    if (history.length >= limitRule.max) return false;

    history.push(now);
    localStorage.setItem(storageKey, JSON.stringify(history));
    return true;
  } catch {
    return true;
  }
}
