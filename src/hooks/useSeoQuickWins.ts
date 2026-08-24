import { useMemo } from 'react';
import { Job } from '../types';
import { SearchConsoleSnapshot } from './useSearchConsole';
import { jobActivityMs } from '../lib/jobDiscovery';

export interface SeoQuickWin {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  evidence: string;
  action: string;
}

/** Quick Wins derived only from current Firestore jobs and real GSC data. */
export function useSeoQuickWins(jobs: Job[], searchConsole: SearchConsoleSnapshot | null) {
  return useMemo<SeoQuickWin[]>(() => {
    const wins: SeoQuickWin[] = [];
    const weakDescriptions = jobs.filter(job => (job.description || '').trim().length < 180);
    if (weakDescriptions.length) wins.push({ id: 'weak-descriptions', priority: 'high', title: 'إعلانات بوصف قصير', evidence: `${weakDescriptions.length} إعلانًا حيًا بوصف أقل من 180 حرفًا.`, action: 'تحسين وصف هذه الإعلانات بمعلومات الوظيفة الفعلية دون حشو.' });

    const titleCounts = new Map<string, number>();
    jobs.forEach(job => titleCounts.set(job.title.trim().toLowerCase(), (titleCounts.get(job.title.trim().toLowerCase()) || 0) + 1));
    const duplicateTitles = [...titleCounts.values()].filter(count => count > 1).reduce((a,b)=>a+b,0);
    if (duplicateTitles) wins.push({ id: 'duplicate-titles', priority: 'medium', title: 'عناوين وظائف متكررة', evidence: `${duplicateTitles} إعلانًا يستخدم عنوانًا متكررًا.`, action: 'تمييز العناوين بالمدينة أو التخصص الحقيقي عند الحاجة.' });

    const fourteenDays = 14 * 24 * 60 * 60 * 1000;
    const stale = jobs.filter(job => jobActivityMs(job) > 0 && Date.now() - jobActivityMs(job) > fourteenDays);
    if (stale.length) wins.push({ id: 'stale-jobs', priority: 'high', title: 'وظائف تحتاج تأكيد الاستمرار', evidence: `${stale.length} إعلانًا بلا نشاط حديث لأكثر من 14 يومًا.`, action: 'طلب تأكيد الاستمرار من صاحب الإعلان أو إغلاق الإعلان.' });

    if (searchConsole) {
      const lowCtr = searchConsole.rows.filter(row => row.impressions >= 100 && row.ctr < 0.02).slice(0, 5);
      lowCtr.forEach((row, index) => wins.push({ id: `gsc-low-ctr-${index}`, priority: 'medium', title: `CTR منخفض: ${row.query || row.page || 'صفحة'}`, evidence: `${row.impressions} ظهور، CTR ${(row.ctr * 100).toFixed(1)}%.`, action: 'مراجعة Title/Description بما يعكس المحتوى الحقيقي للصفحة.' }));
    }

    return wins;
  }, [jobs, searchConsole]);
}
