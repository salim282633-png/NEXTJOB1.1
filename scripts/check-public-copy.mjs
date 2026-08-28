import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const files = {
  navbar: read('src/components/Navbar.tsx'),
  footer: read('src/components/Footer.tsx'),
  privacy: read('src/components/PrivacyAndTermsModal.tsx'),
  cookies: read('src/components/CookieConsentBanner.tsx'),
  compliance: read('public/compliance/index.html')
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

for (const [key, needles] of Object.entries({
  navbar: ['NEEDS_PRODUCTION_CONFIGURATION'],
  footer: ['دخول الإدارة', 'خدمات متوقفة حاليًا'],
  privacy: ['سياسة تشغيلية للمنصة التقنية', 'منصة تقنية مستقلة لعرض فرص العمل', 'قواعد نشر الوظائف', 'Google AdSense'],
  cookies: ['NEEDS_PRODUCTION_CONFIGURATION', 'Google CMP', 'AdSense', 'السماح بما هو مهيأ'],
  compliance: ['فهرس فرص', 'خدمات متوقفة حاليًا', 'سياسة تشغيلية داخلية', 'إيقاف التقديم الداخلي']
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

console.log('Public copy verified: guidance-only identity, no internal status leakage, advertising consent denied.');
