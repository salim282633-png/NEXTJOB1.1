import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';

const ROOT = process.cwd();
const KEYWORDS_FILE = path.join(ROOT, 'seo/yemeni-keywords.json');
const MANIFEST_FILE = path.join(ROOT, 'public/guide/articles.json');
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const SITEMAP_FILE = path.join(ROOT, 'public/sitemap.xml');
const GUIDE_INDEX_FILE = path.join(ROOT, 'public/guide/index.html');

const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');
const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
const MANUAL_KEYWORD = String(process.env.SEO_KEYWORD || '').trim();

const YEMEN_RE = /(يمنيين|اليمنيين|يمني|يمنية|اليمن)/;
const JOB_RE = /(وظائف|وظيفة|مطلوب|شاغر|شاغرة|فرص عمل|عمل)/;
const SAUDI_RE = /(السعودية|السعوديه|الرياض|جدة|جده|مكة|مكه|المدينة المنورة|المدينه المنوره|الدمام|الخبر|الأحساء|الاحساء|القصيم|أبها|ابها|خميس مشيط|جازان|تبوك|نجران|الطائف|حائل|الجبيل|ينبع)/;

const COMMON_TOKENS = new Set([
  'وظائف', 'وظيفة', 'لليمنيين', 'اليمنيين', 'يمني', 'يمنية', 'في', 'من', 'إلى', 'الى',
  'السعودية', 'السعوديه', 'مطلوب', 'مطلوبه', 'شاغرة', 'شاغر', 'فرص', 'عمل', 'مع', 'عن'
]);

const CITY_SLUGS = new Map([
  ['الرياض', 'riyadh'], ['جدة', 'jeddah'], ['جده', 'jeddah'], ['الدمام', 'dammam'],
  ['جازان', 'jazan'], ['مكة المكرمة', 'makkah'], ['مكة', 'makkah'], ['المدينة المنورة', 'madinah'],
  ['الخبر', 'khobar'], ['الجبيل', 'jubail'], ['القصيم', 'qassim'], ['أبها وخميس مشيط', 'abha-khamis'],
  ['تبوك', 'tabuk'], ['نجران', 'najran'], ['الطائف', 'taif'], ['حائل', 'hail'], ['ينبع', 'yanbu']
]);

const PROFESSION_SLUGS = new Map([
  ['شيف مشويات', 'grill-chef'], ['معلم بوفيه', 'buffet-worker'], ['مطاعم', 'restaurants'],
  ['مبيعات', 'sales'], ['محاسب', 'accounting'], ['سائق', 'drivers'], ['كاشير', 'cashier'],
  ['باريستا', 'barista'], ['فني تكييف', 'hvac'], ['كهربائي', 'electrician'],
  ['مستودعات', 'warehouse'], ['توصيل', 'delivery']
]);

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function normalizeArabic(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function tokens(value) {
  return new Set(normalizeArabic(value).split(' ').filter(t => t.length > 1 && !COMMON_TOKENS.has(t)));
}

function jaccard(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;
  const intersection = [...A].filter(token => B.has(token)).length;
  const union = new Set([...A, ...B]).size;
  return union ? intersection / union : 0;
}

function isYemeniSaudiJobScope(value) {
  const text = normalizeArabic(value);
  return YEMEN_RE.test(text) && JOB_RE.test(text) && SAUDI_RE.test(text);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function wordCount(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function articleText(article) {
  return [
    article.title,
    article.metaDescription,
    article.intro,
    ...(article.sections || []).flatMap(section => [section.heading, ...(section.paragraphs || [])]),
    ...(article.faq || []).flatMap(item => [item.question, item.answer]),
    article.conclusion
  ].filter(Boolean).join('\n');
}

function cleanGeneratedJson(raw) {
  const text = String(raw || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  return JSON.parse(text);
}

function keywordCovered(keyword, manifest) {
  const normalized = normalizeArabic(keyword);
  return manifest.some(item => {
    if (normalizeArabic(item.keyword) === normalized) return true;
    return jaccard(keyword, `${item.keyword || ''} ${item.title || ''}`) >= 0.86;
  });
}

function chooseKeyword(pool, manifest) {
  if (MANUAL_KEYWORD) {
    if (!isYemeniSaudiJobScope(MANUAL_KEYWORD)) {
      throw new Error('Manual keyword rejected: it must explicitly target Yemenis and jobs in Saudi Arabia.');
    }
    if (keywordCovered(MANUAL_KEYWORD, manifest)) {
      throw new Error('Manual keyword rejected: a highly similar article is already published.');
    }
    return { keyword: MANUAL_KEYWORD, intent: 'manual', priority: 1000 };
  }

  const candidates = [...pool]
    .filter(item => isYemeniSaudiJobScope(item.keyword))
    .filter(item => !keywordCovered(item.keyword, manifest))
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));

  return candidates[0] || null;
}

function slugFor(seed) {
  const city = seed.city ? (CITY_SLUGS.get(seed.city) || 'saudi') : 'saudi';
  const profession = seed.profession ? (PROFESSION_SLUGS.get(seed.profession) || 'jobs') : 'jobs';
  const hash = crypto.createHash('sha1').update(normalizeArabic(seed.keyword)).digest('hex').slice(0, 8);
  return `yemeni-jobs-${city}-${profession}-${hash}`;
}

function buildPrompt(seed, previousTitles) {
  return `أنت محرر SEO عربي لمنصة NEXT JOB. اكتب مقالًا عربيًا أصليًا ومفيدًا مخصصًا حصريًا لليمنيين الموجودين داخل المملكة العربية السعودية والباحثين عن فرص عمل فيها.

الكلمة المستهدفة: ${seed.keyword}
المدينة: ${seed.city || 'السعودية عمومًا'}
المهنة/القطاع: ${seed.profession || 'متعدد'}
نية البحث: ${seed.intent || 'وظائف'}

قواعد إلزامية:
1) يجب أن يذكر العنوان بوضوح اليمنيين/اليمني، وأن يكون موضوع المقال عن العمل داخل السعودية فقط.
2) لا توسّع الاستهداف إلى جنسيات أخرى ولا تجعل المقال عامًا للمقيمين؛ إذا ذكرت المقيمين فقل "المقيمين اليمنيين".
3) لا تختلق وظائف حية أو أعداد شواغر أو نسب توظيف أو رواتب حالية. لا تقل إن وظيفة متاحة الآن إلا إذا كانت معلومة مقدمة لك، وهي غير مقدمة هنا.
4) لا تدّعِ أن NEXT JOB مكتب توظيف أو جهة استقدام أو منصة مرخصة، ولا تعد القارئ بالتوظيف أو نقل الخدمات.
5) استخدم "نقل الخدمات" في الشرح. يمكن ذكر "نقل الكفالة" فقط كصيغة بحث شائعة مع توضيح أن الإجراءات الفعلية تُراجع عبر المصادر الرسمية.
6) لا تذكر مواد قانونية أو مددًا أو رسومًا أو شروطًا نظامية محددة على أنها حقائق مؤكدة؛ عند الحديث النظامي استخدم صياغة عامة واطلب الرجوع إلى قوى/وزارة الموارد البشرية/المصدر الحكومي المختص.
7) لا تضع أرقام هواتف أو بيانات أشخاص أو شركات وهمية.
8) تجنب حشو الكلمات المفتاحية. استخدم مرادفات طبيعية مثل فرص عمل، وظائف لليمنيين، الباحث اليمني، المدينة الحالية، المهارات، التقديم المباشر.
9) اجعل المقال عمليًا: أين يبحث اليمني، كيف يجهز ملفه، ما المهارات المهمة، أسئلة يسألها قبل الانتقال أو نقل الخدمات، علامات الاحتيال، خطوات تقديم واضحة.
10) لا تكرر عنوانًا قريبًا من العناوين السابقة التالية: ${previousTitles.slice(0, 20).join(' | ') || 'لا يوجد'}.
11) المحتوى بين 850 و1400 كلمة عربية تقريبًا، 5 إلى 8 أقسام، و3 إلى 5 أسئلة شائعة.
12) الخاتمة تدعو القارئ لمراجعة الوظائف المنشورة فعليًا على NEXT JOB دون الادعاء بوجود عدد معين من الوظائف.

أعد JSON صالحًا فقط بهذا الشكل دون Markdown:
{
  "title": "عنوان SEO طبيعي لا يتجاوز 75 حرفًا",
  "metaDescription": "وصف 120-170 حرفًا يذكر اليمنيين والسعودية ويصف فائدة المقال دون ادعاءات",
  "intro": "مقدمة من فقرتين كنص واحد",
  "sections": [
    {"heading": "عنوان القسم", "paragraphs": ["فقرة", "فقرة"]}
  ],
  "faq": [
    {"question": "سؤال", "answer": "إجابة عملية مختصرة"}
  ],
  "conclusion": "خاتمة",
  "relatedKeywords": ["عبارة قريبة 1", "عبارة قريبة 2"]
}`;
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    console.log('SEO publisher skipped: GEMINI_API_KEY is not configured.');
    process.exit(0);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        topP: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '';
  if (!text) throw new Error('Gemini returned no article content.');
  return cleanGeneratedJson(text);
}

function validateArticle(article, seed, manifest) {
  const errors = [];
  const title = String(article?.title || '').trim();
  const meta = String(article?.metaDescription || '').trim();
  const content = articleText(article);
  const normalizedContent = normalizeArabic(content);

  if (!title || title.length < 20 || title.length > 80) errors.push('title length');
  if (!YEMEN_RE.test(normalizeArabic(title))) errors.push('title must explicitly mention Yemenis');
  if (!SAUDI_RE.test(normalizeArabic(`${title} ${meta}`))) errors.push('title/meta must identify Saudi context');
  if (!JOB_RE.test(normalizeArabic(title))) errors.push('title must clearly be job-search related');
  if (!meta || meta.length < 100 || meta.length > 190) errors.push('meta description length');
  if (!YEMEN_RE.test(normalizeArabic(meta))) errors.push('meta must mention Yemenis');
  if (!Array.isArray(article.sections) || article.sections.length < 5 || article.sections.length > 9) errors.push('sections count');
  if (!Array.isArray(article.faq) || article.faq.length < 3 || article.faq.length > 6) errors.push('FAQ count');

  const words = wordCount(content);
  if (words < 750 || words > 1700) errors.push(`word count ${words}`);

  const banned = [
    'منصة توظيف تقنية مرخصة', 'مطابقة للأنظمة', 'وظيفة مضمونة', 'التوظيف مضمون',
    'راتب مضمون', 'نضمن لك وظيفة', 'نضمن التوظيف', 'نضمن نقل الخدمات'
  ];
  for (const phrase of banned) {
    if (normalizedContent.includes(normalizeArabic(phrase))) errors.push(`banned claim: ${phrase}`);
  }

  if (/\b(?:05|9665)\d{7,10}\b/.test(content.replace(/\s/g, ''))) errors.push('phone-like number detected');

  if (!isYemeniSaudiJobScope(`${seed.keyword} ${title} ${meta}`)) errors.push('out of Yemen/Saudi/job scope');

  for (const previous of manifest) {
    if (jaccard(title, `${previous.title || ''} ${previous.keyword || ''}`) >= 0.86) {
      errors.push('too similar to a published article');
      break;
    }
  }

  return { ok: errors.length === 0, errors, words };
}

async function generateValidatedArticle(seed, manifest) {
  let feedback = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const prompt = `${buildPrompt(seed, manifest.map(item => item.title))}\n\n${feedback}`;
    const article = await callGemini(prompt);
    const validation = validateArticle(article, seed, manifest);
    if (validation.ok) return { article, words: validation.words };
    feedback = `المحاولة السابقة رُفضت للأسباب التالية: ${validation.errors.join(', ')}. أصلح جميع النقاط وأعد JSON كاملًا فقط.`;
    console.warn(`SEO quality gate attempt ${attempt} rejected:`, validation.errors.join('; '));
  }
  throw new Error('Article failed production quality gates after two Gemini attempts.');
}

function renderArticleHtml(article, meta) {
  const canonical = `${SITE_URL}/guide/${meta.slug}/`;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    datePublished: meta.publishedAt,
    dateModified: meta.publishedAt,
    inLanguage: 'ar-SA',
    mainEntityOfPage: canonical,
    author: { '@type': 'Organization', name: 'NEXT JOB' },
    publisher: { '@type': 'Organization', name: 'NEXT JOB' },
    about: ['وظائف لليمنيين في السعودية', meta.keyword]
  };

  const sections = article.sections.map(section => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${(section.paragraphs || []).map(p => `<p>${escapeHtml(p)}</p>`).join('\n')}
    </section>`).join('\n');

  const faq = article.faq.map(item => `
    <div class="faq-item"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`).join('\n');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(article.title)} | NEXT JOB</title>
  <meta name="description" content="${escapeHtml(article.metaDescription)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(article.metaDescription)}">
  <meta property="og:url" content="${canonical}">
  <script type="application/ld+json">${safeJsonForScript(articleSchema)}</script>
  <script type="application/ld+json">${safeJsonForScript(faqSchema)}</script>
  <style>
    :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f8fafc;color:#0f172a;font-family:Tahoma,Arial,sans-serif;line-height:2}.wrap{max-width:900px;margin:auto;padding:32px 18px 64px}header,article{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:26px;margin-bottom:18px}h1{font-size:clamp(28px,5vw,44px);line-height:1.35;margin:8px 0 16px}h2{font-size:24px;margin:34px 0 8px;color:#065f46}h3{font-size:18px;margin:18px 0 4px}p{font-size:17px;color:#334155}.eyebrow{color:#047857;font-weight:700}.meta{font-size:14px;color:#64748b}.notice{background:#fffbeb;border:1px solid #fde68a;padding:14px 16px;border-radius:14px}.faq-item{border-top:1px solid #e2e8f0;padding:8px 0}.cta{background:#064e3b;color:#fff;padding:18px;border-radius:16px;margin-top:30px}.cta a{color:#a7f3d0;font-weight:700}.links a{margin-left:14px;color:#047857}a{color:#047857}
  </style>
</head>
<body>
  <main class="wrap">
    <header>
      <div class="eyebrow">دليل وظائف اليمنيين في السعودية · NEXT JOB</div>
      <h1>${escapeHtml(article.title)}</h1>
      <p>${escapeHtml(article.metaDescription)}</p>
      <div class="meta">نُشر: ${escapeHtml(meta.publishedDate)} · ${meta.wordCount} كلمة تقريبًا</div>
    </header>
    <article>
      <p>${escapeHtml(article.intro)}</p>
      ${sections}
      <section><h2>أسئلة شائعة</h2>${faq}</section>
      <section><h2>الخلاصة</h2><p>${escapeHtml(article.conclusion)}</p></section>
      <div class="notice">المحتوى إرشادي عام للباحثين اليمنيين عن العمل داخل السعودية. تحقّق من تفاصيل أي إعلان وإجراءات التعاقد أو نقل الخدمات عبر الجهات الرسمية المختصة، ولا تدفع مبالغ مقابل وعد بالتوظيف.</div>
      <div class="cta">راجع <a href="/jobs/">الوظائف المنشورة فعليًا على NEXT JOB</a> واستخدم الفلاتر بحسب المدينة والمهنة.</div>
      <p class="links"><a href="/guide/">كل المقالات</a><a href="/">NEXT JOB</a></p>
    </article>
  </main>
</body>
</html>`;
}

function renderGuideIndex(manifest) {
  const cards = manifest.map(item => `
    <article class="card">
      <div class="meta">${escapeHtml(item.publishedDate)} · ${escapeHtml(item.keyword)}</div>
      <h2><a href="/guide/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></h2>
      <p>${escapeHtml(item.description)}</p>
      <a class="read" href="/guide/${escapeHtml(item.slug)}/">قراءة المقال</a>
    </article>`).join('\n');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>دليل وظائف اليمنيين في السعودية | NEXT JOB</title>
  <meta name="description" content="مقالات عملية مخصصة لليمنيين الباحثين عن وظائف وفرص عمل داخل السعودية حسب المدن والمهن ونقل الخدمات والتقديم الآمن.">
  <link rel="canonical" href="${SITE_URL}/guide/"><meta name="robots" content="index,follow">
  <style>body{font-family:Tahoma,Arial,sans-serif;background:#f8fafc;color:#0f172a;line-height:1.9;margin:0}.wrap{max-width:960px;margin:auto;padding:34px 18px}.hero,.card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;margin-bottom:16px}h1{font-size:38px;line-height:1.4}h2{line-height:1.5}a{color:#047857}.read{font-weight:700}.meta{font-size:13px;color:#64748b}.notice{background:#fffbeb;border:1px solid #fde68a;padding:14px;border-radius:14px}</style>
</head>
<body><main class="wrap">
  <section class="hero"><h1>دليل وظائف اليمنيين في السعودية</h1><p>محتوى مهني مخصص لليمنيين الموجودين داخل المملكة، يركز على المدن والمهن والبحث الآمن والتواصل مع أصحاب العمل.</p><div class="notice">لا تمثل المقالات إعلانًا عن شواغر بعينها ولا ضمانًا للتوظيف. راجع الوظائف الفعلية المنشورة في المنصة وتحقق من أي إجراء نظامي عبر المصدر الرسمي.</div><p><a href="/jobs/">عرض الوظائف الفعلية</a> · <a href="/">العودة إلى NEXT JOB</a></p></section>
  ${cards || '<p>سيتم نشر المقالات بعد تفعيل محرك النشر الإنتاجي.</p>'}
</main></body></html>`;
}

function renderSitemap(manifest) {
  const now = new Date().toISOString().slice(0, 10);
  const base = [
    ['/', 'daily', '1.0'], ['/jobs/', 'daily', '0.9'], ['/candidates/', 'daily', '0.7'], ['/guide/', 'daily', '0.8']
  ];
  const rows = base.map(([url, freq, priority]) => `  <url><loc>${SITE_URL}${url}</loc><lastmod>${now}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`);
  for (const item of manifest) {
    rows.push(`  <url><loc>${SITE_URL}/guide/${item.slug}/</loc><lastmod>${item.publishedDate}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
}

async function main() {
  const pool = readJson(KEYWORDS_FILE, []);
  const manifest = readJson(MANIFEST_FILE, []);
  const seed = chooseKeyword(pool, manifest);

  if (!seed) {
    console.log('SEO publisher: all approved Yemen-focused keywords are already covered. No article published.');
    return;
  }

  console.log(`SEO publisher selected: ${seed.keyword}`);
  const { article, words } = await generateValidatedArticle(seed, manifest);
  const slug = slugFor(seed);
  const publishedAt = new Date().toISOString();
  const publishedDate = publishedAt.slice(0, 10);
  const canonical = `${SITE_URL}/guide/${slug}/`;
  const meta = {
    slug,
    title: article.title.trim(),
    description: article.metaDescription.trim(),
    keyword: seed.keyword,
    intent: seed.intent || 'jobs',
    city: seed.city || null,
    profession: seed.profession || null,
    publishedAt,
    publishedDate,
    canonical,
    wordCount: words,
    source: 'gemini-production-publisher'
  };

  fs.mkdirSync(path.join(GUIDE_DIR, slug), { recursive: true });
  fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
  fs.writeFileSync(path.join(GUIDE_DIR, slug, 'index.html'), renderArticleHtml(article, meta), 'utf8');
  fs.writeFileSync(path.join(PUBLISHED_DIR, `${slug}.json`), JSON.stringify({ ...meta, article }, null, 2) + '\n', 'utf8');

  const nextManifest = [meta, ...manifest].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(nextManifest, null, 2) + '\n', 'utf8');
  fs.writeFileSync(GUIDE_INDEX_FILE, renderGuideIndex(nextManifest), 'utf8');
  fs.writeFileSync(SITEMAP_FILE, renderSitemap(nextManifest), 'utf8');

  console.log(`SEO article published locally: ${canonical}`);
  console.log(`SEO_PUBLISHED_SLUG=${slug}`);
}

main().catch(error => {
  console.error('SEO publisher failed:', error);
  process.exit(1);
});
