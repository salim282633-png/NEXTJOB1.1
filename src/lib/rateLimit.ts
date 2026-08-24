export const RATE_LIMITS = {
  OTP: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 OTPs per hour
  REPORT: { max: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 reports per day
  POST_JOB: { max: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 jobs per day
  POST_CANDIDATE: { max: 2, windowMs: 24 * 60 * 60 * 1000 }, // 2 profiles per day
  LOGIN: { max: 10, windowMs: 60 * 60 * 1000 } // 10 login attempts per hour
};

export function checkRateLimit(action: keyof typeof RATE_LIMITS): boolean {
  const now = Date.now();
  const limitRule = RATE_LIMITS[action];
  const storageKey = `nextjob_ratelimit_${action}`;
  
  try {
    const raw = localStorage.getItem(storageKey);
    let history: number[] = raw ? JSON.parse(raw) : [];
    
    // Clean up old entries
    history = history.filter(time => now - time < limitRule.windowMs);
    
    if (history.length >= limitRule.max) {
      return false; // Rate limit exceeded
    }
    
    history.push(now);
    localStorage.setItem(storageKey, JSON.stringify(history));
    return true;
  } catch {
    return true; // Failsafe
  }
}
