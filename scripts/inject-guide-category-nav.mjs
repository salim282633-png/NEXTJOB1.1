import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'public/guide/index.html');
if (!fs.existsSync(file)) {
  console.log('Guide index not found; category navigation skipped.');
  process.exit(0);
}

const categories = [
  ['job-search', 'البحث عن عمل', 'خطوات البحث والتقديم وتقييم الفرص'],
  ['cv', 'السيرة الذاتية', 'كتابة وتحسين الملف المهني'],
  ['interviews', 'المقابلات', 'الاستعداد والأسئلة وعرض الخبرات'],
  ['contracts', 'العقود', 'ما ينبغي مراجعته قبل التوقيع'],
  ['sponsorship', 'نقل الخدمات', 'أسئلة وإجراءات تحتاج للتحقق الرسمي'],
  ['safety', 'الأمان وتجنب الاحتيال', 'حماية البيانات وكشف الوعود الوهمية'],
  ['cities', 'أدلة المدن', 'البحث حسب مدن السعودية'],
  ['professions', 'أدلة المهن والقطاعات', 'مسارات ومهارات حسب المهنة']
];

const cards = categories.map(([slug, title, text]) => `<a href="/guide/${slug}/" style="display:block;background:#fff;border:1px solid #dfe7e3;border-radius:18px;padding:18px;text-decoration:none;color:#10221d"><strong style="display:block;color:#0b4f3b;font-size:16px;margin-bottom:5px">${title}</strong><span style="font-size:12px;color:#66736f;line-height:1.7">${text}</span></a>`).join('');

const block = `<!-- NEXTJOB_CATEGORY_NAV_START --><section aria-labelledby="guide-categories-title" style="max-width:1180px;margin:0 auto 26px;padding:0 20px"><div style="background:#eef8f2;border:1px solid #d8eadf;border-radius:26px;padding:24px"><div style="margin-bottom:16px"><div style="font-size:12px;font-weight:800;color:#0f7a55">تصفح حسب الموضوع</div><h2 id="guide-categories-title" style="margin:5px 0 0;font-size:24px;color:#10221d">مركز NEXT JOB الإرشادي</h2></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px">${cards}</div></div></section><!-- NEXTJOB_CATEGORY_NAV_END -->`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<!-- NEXTJOB_CATEGORY_NAV_START -->[\s\S]*?<!-- NEXTJOB_CATEGORY_NAV_END -->/g, '');
if (html.includes('<main>')) html = html.replace('<main>', `<main>${block}`);
else html = html.replace('<body>', `<body>${block}`);
fs.writeFileSync(file, html, 'utf8');
console.log('Guide category navigation injected.');
