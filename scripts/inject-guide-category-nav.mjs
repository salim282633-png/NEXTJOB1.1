import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'public/guide/index.html');
if (!fs.existsSync(file)) {
  console.log('Guide blog index not found; category navigation skipped.');
  process.exit(0);
}

const categories = [
  ['job-search', 'البحث عن عمل', 'خطوات البحث والتقديم وتقييم الفرص'],
  ['cv', 'السيرة الذاتية', 'كتابة وتحسين الملف المهني'],
  ['interviews', 'المقابلات', 'الاستعداد والأسئلة وعرض الخبرات'],
  ['contracts', 'العقود', 'ما ينبغي مراجعته قبل التوقيع'],
  ['sponsorship', 'نقل الخدمات', 'أسئلة وإجراءات تحتاج للتحقق الرسمي'],
  ['safety', 'الأمان وتجنب الاحتيال', 'حماية البيانات وكشف الوعود الوهمية'],
  ['cities', 'أدلة المدن', 'محتوى مهني حسب مدن السعودية'],
  ['professions', 'المهن والقطاعات', 'مسارات ومهارات حسب المهنة والقطاع']
];

const cards = categories.map(([slug, title, text], index) => `
  <a class="blog-category-card" href="/guide/${slug}/">
    <span class="blog-category-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
    <span class="blog-category-copy">
      <strong>${title}</strong>
      <span>${text}</span>
    </span>
    <span class="blog-category-arrow" aria-hidden="true">←</span>
  </a>`).join('');

const block = `<!-- NEXTJOB_CATEGORY_NAV_START -->
<section id="blog-categories" class="blog-categories-section" aria-labelledby="blog-categories-title">
  <div class="blog-categories-shell">
    <div class="blog-categories-head">
      <div>
        <div class="blog-categories-kicker">تصفح حسب الموضوع</div>
        <h2 id="blog-categories-title">أقسام المدونة</h2>
        <p>اختر الموضوع الأقرب لاحتياجك، ثم انتقل مباشرة إلى المقالات المرتبطة به.</p>
      </div>
      <a class="blog-categories-all" href="#all-articles">جميع المقالات <span aria-hidden="true">↓</span></a>
    </div>
    <div class="blog-category-grid">${cards}</div>
  </div>
</section>
<!-- NEXTJOB_CATEGORY_NAV_END -->`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<!-- NEXTJOB_CATEGORY_NAV_START -->[\s\S]*?<!-- NEXTJOB_CATEGORY_NAV_END -->/g, '');

if (html.includes('<section class="section" id="latest">')) {
  html = html.replace('<section class="section" id="latest">', `${block}<section class="section" id="latest">`);
} else if (html.includes('<main>')) {
  html = html.replace('<main>', `<main>${block}`);
} else {
  html = html.replace('<body>', `<body>${block}`);
}

fs.writeFileSync(file, html, 'utf8');
console.log('Blog category navigation injected.');
