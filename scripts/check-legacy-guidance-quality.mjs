import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const GUIDE_DIR = path.join(ROOT, 'public/guide');

const slugs = [
  'yemeni-jobs-jazan-jobs-04c467ec',
  'yemeni-jobs-saudi-restaurants-46226527',
  'yemeni-jobs-saudi-jobs-25065961',
  'yemeni-jobs-dammam-buffet-worker-4bf28d56',
  'yemeni-jobs-saudi-grill-chef-d687295b',
  'yemeni-jobs-saudi-jobs-639efa4e',
  'yemeni-jobs-jeddah-jobs-b98ee3dc',
  'yemeni-jobs-riyadh-jobs-ff091adf',
  'yemeni-jobs-saudi-jobs-98305259',
  'yemeni-jobs-saudi-jobs-9c0f8017'
];

const banned = [
  'منصة NEXT JOB',
  'تحديث بياناتك باستمرار على المنصة',
  'تلقي التنبيهات',
  'تصفح الإعلانات وتوجيههم',
  'الوظائف المنشورة فعليًا على NEXT JOB',
  'الوظائف المنشورة فعلياً على NEXT JOB',
  'استعراض الوظائف',
  'اذهب إلى الوظائف',
  'عرض الوظائف المنشورة',
  'المنصات الموثوقة مثل NEXT JOB',
  'NEXT JOB التي تعرض الفرص',
  'وسيط عرض معلومات',
  'التقديم على الوظائف عبر NEXT JOB',
  'التقديم عبر NEXT JOB'
];

const failures = [];
for (const slug of slugs) {
  const jsonFile = path.join(PUBLISHED_DIR, `${slug}.json`);
  const htmlFile = path.join(GUIDE_DIR, slug, 'index.html');
  for (const [kind, file] of [['source', jsonFile], ['html', htmlFile]]) {
    if (!fs.existsSync(file)) {
      failures.push(`${slug}: missing ${kind}`);
      continue;
    }
    const text = fs.readFileSync(file, 'utf8');
    for (const phrase of banned) {
      if (text.includes(phrase)) failures.push(`${slug}: ${kind} contains legacy operational claim: ${phrase}`);
    }
    if (!text.includes('مدونة إرشادية') && kind === 'source') {
      const parsed = JSON.parse(text);
      const combined = JSON.stringify(parsed.article || {});
      if (!combined.includes('مدونة NEXT JOB') && !combined.includes('المحتوى إرشادي') && !combined.includes('إرشادي')) {
        failures.push(`${slug}: source lacks guidance-first framing`);
      }
    }
  }
}

if (failures.length) {
  console.error('Legacy guidance quality guard failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`Legacy guidance quality verified: ${slugs.length} article(s), no job-platform operational claims.`);
