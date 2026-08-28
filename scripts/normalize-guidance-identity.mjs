import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const HOME_FILE = path.join(ROOT, 'index.html');

const replacements = [
  ['المقالات ودليل وظائف اليمنيين في السعودية | NEXT JOB', 'مركز الأدلة المهنية لليمنيين في السعودية | NEXT JOB'],
  ['مقالات عملية ومحدثة لليمنيين الباحثين عن وظائف وفرص عمل داخل السعودية، تشمل المدن والمهن ونقل الخدمات والتقديم الآمن.', 'أدلة ومقالات عملية لليمنيين في السعودية حول البحث عن عمل والسيرة الذاتية والمقابلات والعقود ونقل الخدمات والأمان المهني.'],
  ['مقالات عملية ومحدثة لليمنيين الباحثين عن وظائف داخل السعودية.', 'أدلة ومقالات مهنية عملية لليمنيين في السعودية.'],
  ['دليل عملي ومتجدد حول البحث عن الوظائف، تجهيز الملف المهني، المدن والمهن، نقل الخدمات، والتقديم الآمن — دون ادعاءات توظيف أو وعود غير موثوقة.', 'مدونة إرشادية متجددة تساعدك على تنظيم البحث عن عمل، تطوير الملف المهني، فهم العقود ونقل الخدمات، والاستفادة من أدلة المدن والمهن بأمان.'],
  ['دليل الفرص من مصادرها الأصلية', 'مركز الأدلة المهنية'],
  ['دليل الفرص كمصدر مساعد فقط دون ادعاء توفر شواغر معينة', 'موضوعات NEXT JOB الإرشادية ذات الصلة فقط'],
  ['دليل الفرص', 'مركز الأدلة'],
  ['دليل الوظائف', 'مركز الأدلة المهنية'],
  ['دليل وظائف اليمنيين في السعودية', 'دليل العمل والمسار المهني لليمنيين في السعودية'],
  ['فرص العمل المفهرسة في NEXT JOB مع الإحالة إلى المصدر الأصلي', 'المقالات والأدلة المهنية المنشورة في NEXT JOB'],
  ['الفرص المفهرسة في NEXT JOB وروابط مصادرها الأصلية', 'المحتوى الإرشادي في NEXT JOB وروابط المصادر الرسمية عند الحاجة'],
  ['عرض الفرص الوظيفية ومصادرها', 'عرض الأدلة المهنية'],
  ['راجع فرص العمل المفهرسة في NEXT JOB ثم انتقل إلى المصدر الأصلي للتحقق والتقديم', 'راجع الأدلة المهنية في NEXT JOB وتحقق من المصدر الرسمي المختص عند الحاجة'],
  ['مركز إرشادي وفهرس فرص من مصادرها الأصلية', 'مدونة إرشادية للعمل والمسار المهني'],
  ['مركز إرشادي مستقل', 'مدونة إرشادية مستقلة'],
  ['مركز إرشادي', 'مدونة إرشادية'],
  ['صفحات الفرص العامة', 'المحتوى الإرشادي العام'],
  ['href="/">المنصة</a>', 'href="/">الرئيسية</a>'],
  ["href='/'>المنصة</a>", "href='/'>الرئيسية</a>"]
];

function normalizeHtml(source) {
  let next = source;

  // Replace the old generated-article CTA with a guidance-only CTA before generic link removal.
  next = next.replace(
    /تابع\s*(<a\b[^>]*href=["']\/guide\/[^"']+["'][^>]*>[^<]+<\/a>)\s*أو تصفح\s*<a\b[^>]*href=["']\/jobs\/?["'][^>]*>[^<]+<\/a>\.?/gi,
    'تابع $1 واستكشف <a href="/guide/">مركز الأدلة المهنية</a>.'
  );

  // Remove paused opportunities links and retired candidate-directory links from public guide pages.
  next = next.replace(/<a\b[^>]*href=["']\/jobs\/?[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '');
  next = next.replace(/<a\b[^>]*href=["']\/candidates\/?[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '');

  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }

  return next;
}

function normalizeFile(file) {
  if (!fs.existsSync(file)) return;
  const source = fs.readFileSync(file, 'utf8');
  const next = normalizeHtml(source);
  if (next !== source) fs.writeFileSync(file, next, 'utf8');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.isFile() && entry.name.endsWith('.html')) normalizeFile(target);
  }
}

normalizeFile(HOME_FILE);
walk(GUIDE_DIR);
console.log('NEXT JOB guidance identity normalization complete.');