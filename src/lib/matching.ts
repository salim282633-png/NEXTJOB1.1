import { Candidate, Job } from '../types';

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string): Set<string> {
  return new Set(normalize(value).split(' ').filter(token => token.length >= 2));
}

function overlapScore(left: Set<string>, right: Set<string>): number {
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  left.forEach(token => {
    if (right.has(token)) overlap += 1;
  });
  return overlap / Math.max(1, Math.min(left.size, right.size));
}

/**
 * Personalization is intentionally limited to:
 * 1) current Saudi city, 2) profession, 3) skills.
 * Yemeni governorate, nationality, phone, iqama status and other sensitive or
 * irrelevant attributes are deliberately excluded from ranking.
 */
export function scoreJobForCandidate(job: Job, candidate: Candidate): number {
  if (job.status === 'closed') return 0;

  const cityScore = normalize(job.city) === normalize(candidate.city) ? 45 : 0;

  const professionTokens = tokens(candidate.profession);
  const jobProfessionTokens = tokens(`${job.title} ${job.category}`);
  const professionScore = Math.round(overlapScore(professionTokens, jobProfessionTokens) * 35);

  const skillTokens = tokens((candidate.skills || []).join(' '));
  const jobSkillTokens = tokens(`${job.title} ${job.category} ${job.description} ${(job.requirements || []).join(' ')}`);
  const skillScore = Math.round(overlapScore(skillTokens, jobSkillTokens) * 20);

  return Math.min(100, cityScore + professionScore + skillScore);
}

export function getRecommendedJobs(jobs: Job[], candidate: Candidate, max = 6) {
  return jobs
    .map(job => ({ job, score: scoreJobForCandidate(job, candidate) }))
    .filter(item => item.score >= 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}
