import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const SITEMAP_FILE = path.join(ROOT, 'public/sitemap.xml');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');

const CATEGORIES = [
  { slug: 'job-search', title: 'البحث عن عمل', description: 'أدلة عملية للباحث اليمني في السعودية حول قنوات البحث، التقديم، تقييم الفرص، وبناء خطة بحث واضحة.' },
  { slug: 'cv', title: 'السيرة الذاتية', description: 'إرشادات كتابة وتحسين السيرة الذاتية والملف المهني لليمنيين الباحثين عن عمل داخل السعودية.' },
  { slug: 'interviews', title: 'المقابلات', description: 'نصائح عملية للاستعداد للمقابلات، الإجابة عن الأسئلة، وعرض الخبرات بصورة مهنية.' },
  { slug: 'contracts', title: 'العقود', description: 'محتوى إرشادي لفهم ما ينبغي مراجعته قبل توقيع عقد عمل، مع الرجوع دائمًا إلى الجهات الرسمية.' },
  { slug: 'sponsorship', title: 'نقل الخدمات', description: 'شرح مبسط للأسئلة والإجراءات التي يحتاج الباحث اليمني للتحقق منها عبر قوى والجهات الرسمية المختصة.' },
  { slug: 'safety', title: 'الأمان وتجنب الاحتيال', description: 'علامات التحذير في إعلانات العمل والرسائل المشبوهة وكيفية حماية البيانات وتجنب الوعود الوهمية.' },
  { slug: 'cities', title: 'أدلة المدن', description: 'مقالات تساعد الباحث اليمني على فهم البحث عن عمل حسب مدن السعودية واختلاف القطاعات والفرص.' },
  { slug: 'professions', title: 'أدلة المهن والقطاعات', description: 'أدلة مهنية حسب الوظائف والقطاعات والمهارات المطلوبة للباحث اليمني داخل السعودية.' }
];

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function categorySlugsFor(article) {
  const intent = String(article.intent || '').toLowerCase();
  const text = `${article.title || ''} ${article.description || ''} ${article.keyword || ''}`;
  const slugs = new Set();

  if (/سيرة ذاتية|السيره الذاتيه|cv|سي في/i.test(text) || intent.includes('cv')) slugs.add('cv');
  if (/مقابلة|مقابلات|اسئلة مقابلة|أسئلة مقابلة/i.test(text) || intent.includes('interview')) slugs.add('interviews');
  if (/عقد العمل|العقد|العقود|قبل التوقيع/i.test(text) || intent.includes('contract')) slugs.add('contracts');
  if (/نقل الخدمات|نقل الكفالة/i.test(text) || intent.includes('sponsorship')) slugs.add('sponsorship');
  if (/احتيال|نصب|وهمي|مشبوه|الأمان|الامان/i.test(text) || intent.includes('safety')) slugs.add('safety');
  if (article.city || intent.includes('city')) slugs.add('cities');
  if (article.profession || intent.includes('profession') || intent === 'sector') slugs.add('professions');
  if (/بحث عن عمل|التقديم|فرص عمل|وظائف|بدون خبرة|دوام جزئي|رسالة واتساب/i.test(text) || ['jobs', 'application-guide', 'application-message', 'no-experience', 'part-time', 'benefit', 'manual'].includes(intent)) slugs.add('job-search');

  if (!slugs.size) slugs.add('job-search');
  return [...slugs];
}

function articleCard(article) {
  return `<article class="card">
    <div class="meta">${escapeHtml(article.publishedDate || '')}${article.city ? ` · ${escapeHtml(article.city)}` : ''}${article.profession ? ` · ${escapeHtml(article.profession)}` : ''}</div>
    <h2><a href="/guide/${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a></h2>
    <p>${escapeHtml(article.description || '')}</p>
    <a class="read" href="/guide/${escapeHtml(article.slug)}/">قراءة الدليل ←</a>
  </article>`;
}

function categoryPage(category, articles) {
  const canonical = `${SITE_URL}/guide/${category.slug}/`;
  const items = articles.map((article, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_URL}/guide/${article.slug}/`,
    name: article.title
  }));
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.title} لليمنيين في السعودية | NEXT JOB`,
    description: category.description,
    url: canonical,
    mainEntity: { '@type': 'ItemList', itemListElement: items }
  };
  const related = CATEGORIES.filter(item => item.slug !== category.slug)
    .map(item => `<a href="/guide/${item.slug}/">${escapeHtml(item.title)}</a>`).join('');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(category.title)} لليمنيين في السعودية | NEXT JOB</title>
  <meta name="description" content="${escapeHtml(category.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:title" content="${escapeHtml(category.title)} لليمنيين في السعودية | NEXT JOB">
  <meta property="og:description" content="${escapeHtml(category.description)}">
  <meta property="og:url" content="${canonical}">
  <script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
  <style>
    :root{--bg:#f7faf8;--surface:#fff;--ink:#10211c;--muted:#66756f;--line:#dfe9e4;--green:#0f7a55;--dark:#0b4f3b;--soft:#eaf7f0}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Tahoma,Arial,sans-serif;line-height:1.9}a{text-decoration:none;color:inherit}.shell{max-width:1080px;margin:auto;padding:0 18px}.top{background:#fff;border-bottom:1px solid var(--line)}.top .shell{height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{font-weight:900;font-size:20px;color:var(--dark)}.topnav{display:flex;gap:8px;font-size:13px}.topnav a{padding:8px 10px;border-radius:10px}.topnav a:hover{background:var(--soft)}.hero{padding:48px 0 24px}.hero-card{background:linear-gradient(145deg,#0b4f3b,#0f7a55);color:#fff;border-radius:30px;padding:36px}.crumbs{font-size:12px;color:#ccecdf}.hero h1{font-size:clamp(30px,5vw,48px);line-height:1.3;margin:12px 0}.hero p{max-width:780px;color:#ddf5ea;margin:0}.count{margin-top:18px;font-size:13px;color:#bfe8d7}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:12px 0 34px}.card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px;display:flex;flex-direction:column;min-height:230px}.card h2{font-size:20px;line-height:1.5;margin:8px 0}.card p{font-size:14px;color:var(--muted);margin:0 0 18px}.meta{font-size:11px;color:#7f8f88}.read{margin-top:auto;color:var(--green);font-weight:900;font-size:13px}.empty{background:#fff;border:1px dashed #c9d8d1;border-radius:20px;padding:28px;text-align:center;color:var(--muted)}.related{background:#fff;border:1px solid var(--line);border-radius:24px;padding:22px;margin-bottom:38px}.related h2{font-size:18px;margin:0 0 12px}.chips{display:flex;flex-wrap:wrap;gap:8px}.chips a{background:var(--soft);color:var(--dark);padding:8px 11px;border-radius:999px;font-size:12px;font-weight:800}.note{font-size:12px;color:#6e7d77;margin-top:16px}.footer{text-align:center;color:#77867f;font-size:12px;padding:28px 0 44px}@media(max-width:720px){.grid{grid-template-columns:1fr}.topnav a:nth-child(n+3){display:none}.hero-card{padding:26px}}
  </style>
</head>
<body>
  <header class="top"><div class="shell"><a class="brand" href="/">NEXT JOB</a><nav class="topnav"><a href="/guide/">كل الأدلة</a><a href="/guide/job-search/">البحث عن عمل</a><a href="/jobs/">دليل الفرص</a></nav></div></header>
  <main class="shell">
    <section class="hero"><div class="hero-card"><div class="crumbs"><a href="/guide/">مركز NEXT JOB الإرشادي</a> / ${escapeHtml(category.title)}</div><h1>${escapeHtml(category.title)} لليمنيين في السعودية</h1><p>${escapeHtml(category.description)}</p><div class="count">${articles.length} مقالًا أو دليلًا مرتبطًا بهذا المسار</div></div></section>
    ${articles.length ? `<section class="grid">${articles.map(articleCard).join('\n')}</section>` : '<div class="empty">سيظهر المحتوى هنا تلقائيًا مع نشر أدلة جديدة مرتبطة بهذا الموضوع.</div>'}
    <section class="related"><h2>استكشف موضوعات أخرى</h2><div class="chips">${related}</div><p class="note">المحتوى إرشادي عام. عند التعامل مع عقد أو نقل خدمات أو إجراء حكومي، تحقق من المصدر الرسمي المختص قبل اتخاذ أي قرار.</p></section>
  </main>
  <footer class="footer">NEXT JOB — مركز إرشادي للعمل والمسار المهني لليمنيين في السعودية.</footer>
</body>
</html>`;
}

function ensureCategoryPages(manifest) {
  const map = new Map(CATEGORIES.map(category => [category.slug, []]));
  for (const article of manifest) {
    for (const slug of categorySlugsFor(article)) map.get(slug)?.push(article);
  }

  for (const category of CATEGORIES) {
    const dir = path.join(GUIDE_DIR, category.slug);
    fs.mkdirSync(dir, { recursive: true });
    const articles = (map.get(category.slug) || []).sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
    fs.writeFileSync(path.join(dir, 'index.html'), categoryPage(category, articles), 'utf8');
  }
}

function injectArticleLinks(manifest) {
  for (const article of manifest) {
    const file = path.join(GUIDE_DIR, article.slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    html = html.replace(/<!-- NEXTJOB_TOPIC_LINKS_START -->[\s\S]*?<!-- NEXTJOB_TOPIC_LINKS_END -->/g, '');
    const links = categorySlugsFor(article)
      .map(slug => CATEGORIES.find(item => item.slug === slug))
      .filter(Boolean)
      .map(category => `<a href="/guide/${category.slug}/" style="display:inline-block;margin:4px;padding:7px 10px;border-radius:999px;background:#eaf7f0;color:#0b4f3b;text-decoration:none;font-size:12px;font-weight:700">${escapeHtml(category.title)}</a>`)
      .join('');
    const block = `<!-- NEXTJOB_TOPIC_LINKS_START --><nav aria-label="موضوعات مرتبطة" style="margin:28px 0;padding:16px;border:1px solid #dfe9e4;border-radius:16px;background:#f8fbf9"><div style="font-weight:800;margin-bottom:8px">موضوعات مرتبطة بهذا الدليل</div>${links}<a href="/guide/" style="display:inline-block;margin:4px;padding:7px 10px;border-radius:999px;background:#0f7a55;color:white;text-decoration:none;font-size:12px;font-weight:700">كل الأدلة</a></nav><!-- NEXTJOB_TOPIC_LINKS_END -->`;
    if (html.includes('</article>')) html = html.replace('</article>', `${block}</article>`);
    else if (html.includes('</main>')) html = html.replace('</main>', `${block}</main>`);
    else html = html.replace('</body>', `${block}</body>`);
    fs.writeFileSync(file, html, 'utf8');
  }
}

function ensureSitemap() {
  if (!fs.existsSync(SITEMAP_FILE)) return;
  let xml = fs.readFileSync(SITEMAP_FILE, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const rows = [];
  for (const category of CATEGORIES) {
    const loc = `${SITE_URL}/guide/${category.slug}/`;
    if (!xml.includes(`<loc>${loc}</loc>`)) rows.push(`  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.75</priority></url>`);
  }
  if (rows.length && xml.includes('</urlset>')) {
    xml = xml.replace('</urlset>', `${rows.join('\n')}\n</urlset>`);
    fs.writeFileSync(SITEMAP_FILE, xml, 'utf8');
  }
}

const manifest = readJson(MANIFEST_FILE, []);
ensureCategoryPages(Array.isArray(manifest) ? manifest : []);
injectArticleLinks(Array.isArray(manifest) ? manifest : []);
ensureSitemap();
console.log(`Guide category hubs generated: ${CATEGORIES.length}.`);
