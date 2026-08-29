import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const files = {
  navbar: read('src/components/Navbar.tsx'),
  footer: read('src/components/Footer.tsx'),
  privacy: read('src/components/PrivacyAndTermsModal.tsx'),
  cookies: read('src/components/CookieConsentBanner.tsx'),
  compliance: read('public/compliance/index.html'),
  candidates: read('public/candidates/index.html'),
  jobsPage: read('jobs/index.html'),
  metadata: read('metadata.json'),
  readme: read('README.md'),
  home: read('src/components/ProfessionalHome.tsx'),
  blogGenerator: read('scripts/style-guide-index.mjs'),
  categoryNav: read('scripts/inject-guide-category-nav.mjs'),
  blogPolish: read('scripts/polish-blog-ui.mjs')
};

const failures = [];
const requireText = (key, needle, label) => {
  if (!files[key].includes(needle)) failures.push(`missing: ${label}`);
};
const forbidText = (key, needle, label) => {
  if (files[key].includes(needle)) failures.push(`public copy leak: ${label}`);
};

requireText('navbar', "label: 'المدونة'", 'blog navbar label');
requireText('navbar', 'مدونة إرشادية مستقلة', 'guidance-blog navbar disclosure');
requireText('footer', 'المحتوى والخدمات المتاحة حاليًا إرشادية فقط', 'neutral footer service description');
requireText('footer', 'مدونة إرشادية مستقلة', 'guidance-blog footer identity');
requireText('footer', '>المدونة</button>', 'blog footer navigation');
requireText('privacy', 'مدونة إرشادية مستقلة', 'guidance-blog privacy identity');
requireText('compliance', 'مدونة إرشادية مستقلة', 'guidance-blog compliance identity');
requireText('home', 'مدونة إرشادية للعمل والمسار المهني', 'guidance-blog homepage identity');
requireText('home', 'تصفح المدونة', 'homepage blog CTA');
requireText('home', 'أقسام المدونة', 'homepage blog sections heading');
requireText('home', 'أحدث المقالات', 'homepage latest articles heading');
requireText('blogGenerator', 'مدونة NEXT JOB لليمنيين في السعودية', 'blog archive SEO title');
requireText('blogGenerator', 'أحدث المقالات', 'blog archive latest articles heading');
requireText('categoryNav', 'أقسام المدونة', 'blog category navigation heading');
requireText('categoryNav', 'blog-category-card', 'structured blog category cards');
requireText('blogPolish', 'nextjob-blog-polish', 'blog visual polish marker');
requireText('blogPolish', '.blog-category-grid', 'responsive category grid styling');
requireText('blogPolish', '.article-card:hover', 'article card interaction styling');
requireText('candidates', 'الصفحة غير متاحة', 'neutral retired candidates route');
requireText('jobsPage', 'content="noindex,follow"', 'source-level noindex on paused opportunities page');
requireText('metadata', 'مدونة إرشادية عربية', 'guidance-blog app metadata');
requireText('readme', 'مدونة إرشادية عربية', 'guidance-blog public repository description');

for (const [key, needles] of Object.entries({
  navbar: ['NEEDS_PRODUCTION_CONFIGURATION', "label: 'المقالات والأدلة'", "mobileLabel: 'الدليل'"],
  footer: ['دخول الإدارة', 'خدمات متوقفة حاليًا', 'مركز إرشادي', '>المقالات والأدلة</button>', 'أرشيف المقالات والأدلة'],
  privacy: ['سياسة تشغيلية للمنصة التقنية', 'منصة تقنية مستقلة لعرض فرص العمل', 'قواعد نشر الوظائف', 'Google AdSense', 'مركز إرشادي'],
  cookies: ['NEEDS_PRODUCTION_CONFIGURATION', 'Google CMP', 'AdSense', 'السماح بما هو مهيأ'],
  compliance: ['فهرس فرص', 'خدمات متوقفة حاليًا', 'سياسة تشغيلية داخلية', 'إيقاف التقديم الداخلي', 'مركز إرشادي'],
  candidates: ['متوقف حاليًا', 'وضع التشغيل الحالي', '/jobs/', 'الفرص الوظيفية'],
  metadata: ['يفهرس فرصًا وظيفية', 'فهرس فرص', 'مركز إرشادي'],
  readme: ['Firebase Phone Authentication', 'old demo OTP', 'Run and deploy your AI Studio app', 'مركز إرشادي'],
  home: ['مركز إرشادي', 'مركز المعرفة', 'ابدأ من الدليل المهني', 'مقالات وأدلة مهنية'],
  blogGenerator: ['<a href="/jobs/">', '<a href="/candidates/">', '>المنصة</a>', 'عرض الوظائف المنشورة'],
  categoryNav: ['مركز NEXT JOB الإرشادي']
})) {
  for (const needle of needles) forbidText(key, needle, `${key}: ${needle}`);
}

for (const consentField of [
  "ad_storage: 'denied'",
  "ad_user_data: 'denied'",
  "ad_personalization: 'denied'"
]) requireText('cookies', consentField, `advertising consent locked denied (${consentField})`);

if (failures.length) {
  console.error('Public copy guard failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Public copy verified: blog-first identity, polished blog UI, neutral retired routes, no internal status leakage, advertising consent denied.');
