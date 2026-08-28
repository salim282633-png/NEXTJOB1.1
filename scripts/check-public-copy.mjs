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
  readme: read('README.md')
};

const failures = [];
const requireText = (key, needle, label) => {
  if (!files[key].includes(needle)) failures.push(`missing: ${label}`);
};
const forbidText = (key, needle, label) => {
  if (files[key].includes(needle)) failures.push(`public copy leak: ${label}`);
};

requireText('navbar', 'محتوى إرشادي مستقل', 'guidance-only navbar disclosure');
requireText('footer', 'المحتوى والخدمات المتاحة حاليًا إرشادية فقط', 'neutral footer service description');
requireText('privacy', 'مركز إرشادي مستقل', 'guidance-only privacy identity');
requireText('compliance', 'مركز إرشادي مستقل', 'guidance-only compliance identity');
requireText('candidates', 'الصفحة غير متاحة', 'neutral retired candidates route');
requireText('jobsPage', 'content="noindex,follow"', 'source-level noindex on paused opportunities page');
requireText('metadata', 'مركز إرشادي عربي', 'guidance-only app metadata');
requireText('readme', 'مركز إرشادي عربي', 'guidance-only public repository description');

for (const [key, needles] of Object.entries({
  navbar: ['NEEDS_PRODUCTION_CONFIGURATION'],
  footer: ['دخول الإدارة', 'خدمات متوقفة حاليًا'],
  privacy: ['سياسة تشغيلية للمنصة التقنية', 'منصة تقنية مستقلة لعرض فرص العمل', 'قواعد نشر الوظائف', 'Google AdSense'],
  cookies: ['NEEDS_PRODUCTION_CONFIGURATION', 'Google CMP', 'AdSense', 'السماح بما هو مهيأ'],
  compliance: ['فهرس فرص', 'خدمات متوقفة حاليًا', 'سياسة تشغيلية داخلية', 'إيقاف التقديم الداخلي'],
  candidates: ['متوقف حاليًا', 'وضع التشغيل الحالي', '/jobs/', 'الفرص الوظيفية'],
  metadata: ['يفهرس فرصًا وظيفية', 'فهرس فرص'],
  readme: ['Firebase Phone Authentication', 'old demo OTP', 'Run and deploy your AI Studio app']
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

console.log('Public copy verified: guidance-only identity, neutral retired routes, no internal status leakage, advertising consent denied.');
