import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';

const ROOT = process.cwd();
const KEYWORDS_FILE = path.join(ROOT, 'seo/yemeni-keywords.json');
const MANIFEST_FILE = path.join(ROOT, 'public/guide/articles.json');
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');
const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODEL = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
const MANUAL_KEYWORD = String(process.env.SEO_KEYWORD || '').trim();

const YEMEN_RE = /(يمنيين|اليمنيين|يمني|يمنية|اليمن)/;
const SAUDI_RE = /(السعودية|السعوديه|الرياض|جدة|جده|مكة|مكه|المدينة المنورة|المدينه المنوره|الدمام|الخبر|الأحساء|الاحساء|القصيم|أبها|ابها|خميس مشيط|جازان|تبوك|نجران|الطائف|حائل|الجبيل|ينبع)/;
const CAREER_RE = /(وظائف|وظيفة|فرص عمل|عمل|سيرة ذاتية|السيرة الذاتية|مقابلة|مقابلات|عقد|العقود|نقل الخدمات|مهارات|التقديم|باحث عن عمل|المسار المهني)/;
const COMMON_TOKENS = new Set(['وظائف','وظيفة','لليمنيين','اليمنيين','يمني','يمنية','في','من','إلى','الى','السعودية','السعوديه','عمل','عن','كيف','طريقة','دليل']);
const OPERATIONAL_CLAIMS = [
  'منصة NEXT JOB',
  'عرض الوظائف المنشورة',
  'استعراض الوظائف',
  'الوظائف المنشورة فعليًا على NEXT JOB',
  'الوظائف المنشورة فعلياً على NEXT JOB',
  'تلقي التنبيهات',
  'تحديث بياناتك باستمرار على المنصة',
  'التقديم عبر NEXT JOB',
  'التقديم على الوظائف عبر NEXT JOB',
  'وسيط عرض معلومات'
];

const TOPICS = [
  { slug: 'cv', title: 'السيرة الذاتية', match: seed => String(seed.intent).includes('cv') || /سيرة ذاتية|السيره الذاتيه|cv|سي في/i.test(seed.keyword) },
  { slug: 'interviews', title: 'المقابلات', match: seed => String(seed.intent).includes('interview') || /مقابلة|مقابلات/i.test(seed.keyword) },
  { slug: 'contracts', title: 'العقود', match: seed => String(seed.intent).includes('contract') || /عقد|العقود|التوقيع/i.test(seed.keyword) },
  { slug: 'sponsorship', title: 'نقل الخدمات', match: seed => String(seed.intent).includes('sponsorship') || /نقل الخدمات|نقل الكفالة/i.test(seed.keyword) },
  { slug: 'safety', title: 'الأمان وتجنب الاحتيال', match: seed => String(seed.intent).includes('safety') || /احتيال|نصب|وهمي|مشبوه|حماية البيانات|طلبت منه جهة مبلغ/i.test(seed.keyword) },
  { slug: 'cities', title: 'أدلة المدن', match: seed => Boolean(seed.city) || String(seed.intent).includes('city') },
  { slug: 'professions', title: 'أدلة المهن والقطاعات', match: seed => Boolean(seed.profession) || String(seed.intent).includes('profession') || seed.intent === 'sector' },
  { slug: 'job-search', title: 'البحث عن عمل', match: () => true }
];

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function normalizeArabic(value) {
  return String(value || '').normalize('NFKC').replace(/[\u064B-\u065F\u0670]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

function tokens(value) {
  return new Set(normalizeArabic(value).split(' ').filter(token => token.length > 1 && !COMMON_TOKENS.has(token)));
}

function jaccard(a, b) {
  const A = tokens(a); const B = tokens(b);
  if (!A.size || !B.size) return 0;
  const intersection = [...A].filter(token => B.has(token)).length;
  return intersection / new Set([...A, ...B]).size;
}

function isGuidanceScope(value) {
  const text = normalizeArabic(value);
  return YEMEN_RE.test(text) && SAUDI_RE.test(text) && CAREER_RE.test(text);
}

function topicFor(seed) {
  return TOPICS.find(topic => topic.match(seed)) || TOPICS[TOPICS.length - 1];
}

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function safeJson(value) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
function wordCount(value) { return String(value || '').trim().split(/\s+/).filter(Boolean).length; }

function articleText(article) {
  return [article.title, article.metaDescription, article.intro, ...(article.sections || []).flatMap(section => [section.heading, ...(section.paragraphs || [])]), ...(article.faq || []).flatMap(item => [item.question, item.answer]), article.conclusion].filter(Boolean).join('\n');
}

function keywordCovered(keyword, manifest) {
  const normalized = normalizeArabic(keyword);
  return manifest.some(item => normalizeArabic(item.keyword) === normalized || jaccard(keyword, `${item.keyword || ''} ${item.title || ''}`) >= 0.82);
}

function chooseKeyword(pool, manifest) {
  if (MANUAL_KEYWORD) {
    if (!isGuidanceScope(MANUAL_KEYWORD)) throw new Error('Manual keyword rejected: it must target Yemenis, Saudi Arabia, and a work/career guidance topic.');
    if (keywordCovered(MANUAL_KEYWORD, manifest)) throw new Error('Manual keyword rejected: a highly similar article is already published.');
    return { keyword: MANUAL_KEYWORD, intent: 'manual', priority: 1000 };
  }
  return [...pool]
    .filter(item => isGuidanceScope(item.keyword))
    .filter(item => !keywordCovered(item.keyword, manifest))
    .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))[0] || null;
}

function slugFor(seed) {
  const topic = topicFor(seed).slug;
  const hash = crypto.createHash('sha1').update(String(seed.keyword)).digest('hex').slice(0, 8);
  return `guide-yemeni-${topic}-${hash}`;
}

function buildPrompt(seed, manifest) {
  const topic = topicFor(seed);
  const previousTitles = manifest.slice(0, 40).map(item => item.title).join(' | ');
  return `أنت محرر محتوى عربي لمدونة NEXT JOB الإرشادية المستقلة للعمل والمسار المهني. اكتب دليلًا عربيًا أصليًا ومفيدًا مخصصًا لليمنيين الموجودين داخل المملكة العربية السعودية، وموضوعه الأساسي: ${topic.title}.

الكلمة المستهدفة: ${seed.keyword}
نية البحث: ${seed.intent || 'إرشادي'}
المدينة إن وجدت: ${seed.city || 'السعودية عمومًا'}
المهنة/القطاع إن وجد: ${seed.profession || 'غير محدد'}

قواعد إلزامية:
1) العنوان يجب أن يكون طبيعيًا ومشكلة-محوره، ولا يلزم ذكر اليمني/اليمنيين في كل عنوان. حافظ على استهداف الجمهور اليمني داخل الكلمة المفتاحية والوصف والمحتوى، واذكر اليمنيين في العنوان فقط عندما يخدم نية البحث أو يزيل غموضًا. يجب أن يظهر سياق السعودية في العنوان أو الوصف.
2) اكتب محتوى people-first يجيب عن حاجة القارئ مباشرة، ولا تجعل المقال مجرد إعادة للكلمة المفتاحية.
3) لا تختلق وظائف حية، أرقام شواغر، رواتب حالية، إحصاءات، شركات، أشخاص، أرقام هواتف أو بيانات اتصال.
4) NEXT JOB مدونة إرشادية مستقلة وليست مكتب توظيف أو جهة استقدام أو وسيطًا، ولا تستقبل طلبات التوظيف نيابة عن أصحاب العمل ولا تعد القارئ بالحصول على وظيفة أو نقل الخدمات.
5) إذا كان الموضوع نظاميًا أو تعاقديًا، تجنب الجزم بمواد أو رسوم أو مدد أو شروط متغيرة، ووجّه القارئ إلى قوى ووزارة الموارد البشرية أو الجهة الرسمية المختصة للتحقق من المعلومات السارية.
6) اجعل النص عمليًا بخطوات، وأسئلة يراجعها القارئ، وأخطاء شائعة، وعلامات تحذيرية عندما يناسب الموضوع.
7) استخدم لغة عربية واضحة ومهنية ومباشرة، ولا تستخدم حشو SEO أو عبارات دعائية مبالغًا فيها.
8) لا توسع الجمهور إلى جنسيات أخرى؛ إذا ذكرت المقيمين فقل المقيمين اليمنيين.
9) لا تكرر عنوانًا أو زاوية معالجة قريبة من هذه العناوين السابقة: ${previousTitles || 'لا يوجد'}.
10) المحتوى من 850 إلى 1400 كلمة تقريبًا، 5 إلى 8 أقسام، و3 إلى 5 أسئلة شائعة.
11) الخاتمة تقترح على القارئ موضوعًا إرشاديًا مكملًا داخل المدونة، مثل السيرة الذاتية أو المقابلات أو العقود أو الأمان المهني، ولا توجه إلى صفحة وظائف أو توحي بوجود شواغر حية.
12) لا تقل إن NEXT JOB تعرض وظائف أو إعلانات أو تنبيهات أو تستقبل التقديم. دورها في هذا المقال هو المحتوى الإرشادي فقط.

أعد JSON صالحًا فقط دون Markdown:
{
  "title": "عنوان طبيعي لا يتجاوز 75 حرفًا",
  "metaDescription": "وصف 120-170 حرفًا يذكر اليمنيين والسعودية وفائدة الدليل",
  "intro": "مقدمة عملية من فقرتين في نص واحد",
  "sections": [{"heading":"عنوان القسم","paragraphs":["فقرة","فقرة"]}],
  "faq": [{"question":"سؤال","answer":"إجابة عملية"}],
  "conclusion": "خاتمة",
  "relatedKeywords": ["عبارة قريبة 1","عبارة قريبة 2"]
}`;
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) { console.log('Guidance publisher skipped: GEMINI_API_KEY is not configured.'); process.exit(0); }
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, topP: 0.9, maxOutputTokens: 8192, responseMimeType: 'application/json' } }) });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('') || '';
  if (!raw) throw new Error('Gemini returned no article content.');
  return JSON.parse(raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim());
}

function validateArticle(article, seed, manifest) {
  const errors = [];
  const title = String(article?.title || '').trim();
  const meta = String(article?.metaDescription || '').trim();
  const content = articleText(article);
  const normalized = normalizeArabic(content);
  const topic = topicFor(seed);

  if (!title || title.length < 20 || title.length > 80) errors.push('title length');
  if (!SAUDI_RE.test(normalizeArabic(`${title} ${meta}`))) errors.push('title/meta must identify Saudi context');
  if (!meta || meta.length < 100 || meta.length > 190) errors.push('meta description length');
  if (!YEMEN_RE.test(normalizeArabic(meta))) errors.push('meta must mention Yemenis');
  if (!Array.isArray(article.sections) || article.sections.length < 5 || article.sections.length > 9) errors.push('sections count');
  if (!Array.isArray(article.faq) || article.faq.length < 3 || article.faq.length > 6) errors.push('FAQ count');

  const words = wordCount(content);
  if (words < 750 || words > 1700) errors.push(`word count ${words}`);

  for (const phrase of ['منصة توظيف تقنية مرخصة','مطابقة للأنظمة','وظيفة مضمونة','التوظيف مضمون','راتب مضمون','نضمن لك وظيفة','نضمن التوظيف','نضمن نقل الخدمات', ...OPERATIONAL_CLAIMS]) {
    if (normalized.includes(normalizeArabic(phrase))) errors.push(`banned claim: ${phrase}`);
  }
  if (/\b(?:05|9665)\d{7,10}\b/.test(content.replace(/\s/g, ''))) errors.push('phone-like number detected');
  if (!isGuidanceScope(`${seed.keyword} ${title} ${meta}`)) errors.push('out of Yemen/Saudi/career scope');
  if (['contracts','sponsorship'].includes(topic.slug) && !/(قوى|وزارة الموارد البشرية|الجهة الرسمية|المصدر الرسمي)/.test(content)) errors.push('official-source reminder required');

  for (const previous of manifest) {
    if (jaccard(title, `${previous.title || ''} ${previous.keyword || ''}`) >= 0.82) { errors.push('too similar to a published article'); break; }
  }
  return { ok: errors.length === 0, errors, words };
}

async function generateValidatedArticle(seed, manifest) {
  let feedback = '';
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const article = await callGemini(`${buildPrompt(seed, manifest)}\n\n${feedback}`);
    const validation = validateArticle(article, seed, manifest);
    if (validation.ok) return { article, words: validation.words };
    feedback = `المحاولة السابقة رُفضت للأسباب التالية: ${validation.errors.join(', ')}. أصلح جميع النقاط وأعد JSON كاملًا فقط.`;
    console.warn(`Guidance quality gate attempt ${attempt} rejected: ${validation.errors.join('; ')}`);
  }
  throw new Error('Article failed production quality gates after two Gemini attempts.');
}

function renderArticleHtml(article, meta, topic) {
  const canonical = `${SITE_URL}/guide/${meta.slug}/`;
  const modifiedAt = meta.modifiedAt || meta.publishedAt;
  const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.metaDescription, datePublished: meta.publishedAt, dateModified: modifiedAt, inLanguage: 'ar-SA', mainEntityOfPage: canonical, author: { '@type': 'Organization', name: 'NEXT JOB' }, publisher: { '@type': 'Organization', name: 'NEXT JOB' }, about: [topic.title, 'المسار المهني لليمنيين في السعودية', meta.keyword] };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: article.faq.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) };
  const sections = article.sections.map(section => `<section><h2>${escapeHtml(section.heading)}</h2>${(section.paragraphs || []).map(p => `<p>${escapeHtml(p)}</p>`).join('')}</section>`).join('');
  const faq = article.faq.map(item => `<div class="faq"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></div>`).join('');
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(article.title)} | NEXT JOB</title><meta name="description" content="${escapeHtml(article.metaDescription)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:locale" content="ar_SA"><meta property="og:title" content="${escapeHtml(article.title)}"><meta property="og:description" content="${escapeHtml(article.metaDescription)}"><meta property="og:url" content="${canonical}"><script type="application/ld+json">${safeJson(articleSchema)}</script><script type="application/ld+json">${safeJson(faqSchema)}</script><style>body{margin:0;background:#f8fafc;color:#0f172a;font-family:Tahoma,Arial,sans-serif;line-height:2}.wrap{max-width:900px;margin:auto;padding:32px 18px 64px}header,article{background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:26px;margin-bottom:18px}h1{font-size:clamp(28px,5vw,44px);line-height:1.35;margin:8px 0 16px}h2{font-size:24px;margin:34px 0 8px;color:#065f46}h3{font-size:18px;margin:18px 0 4px}p{font-size:17px;color:#334155}.eyebrow{color:#047857;font-weight:700}.meta{font-size:14px;color:#64748b}.notice{background:#fffbeb;border:1px solid #fde68a;padding:14px 16px;border-radius:14px}.faq{border-top:1px solid #e2e8f0;padding:8px 0}.cta{background:#eef6f1;color:#123d2e;padding:18px;border-radius:16px;margin-top:30px}.cta a{color:#065f46;font-weight:700}.links a{margin-left:14px;color:#047857}a{color:#047857}</style></head><body><main class="wrap"><header><div class="eyebrow">${escapeHtml(topic.title)} · مدونة NEXT JOB الإرشادية</div><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.metaDescription)}</p><div class="meta">نُشر: ${escapeHtml(meta.publishedDate)} · ${meta.wordCount} كلمة تقريبًا</div></header><article><p>${escapeHtml(article.intro)}</p>${sections}<section><h2>أسئلة شائعة</h2>${faq}</section><section><h2>الخلاصة</h2><p>${escapeHtml(article.conclusion)}</p></section><div class="notice">المحتوى إرشادي عام لليمنيين داخل السعودية. تحقق من المعلومات النظامية أو التعاقدية المتغيرة عبر الجهة الرسمية المختصة، ولا تدفع مقابل وعد بالتوظيف.</div><div class="cta">واصل القراءة في <a href="/guide/${topic.slug}/">قسم ${escapeHtml(topic.title)}</a> أو انتقل إلى <a href="/guide/">المدونة</a> لاستكشاف موضوع إرشادي مكمل.</div><p class="links"><a href="/guide/">المدونة</a><a href="/">الرئيسية</a></p></article></main></body></html>`;
}

async function main() {
  const pool = readJson(KEYWORDS_FILE, []);
  const manifest = readJson(MANIFEST_FILE, []);
  const seed = chooseKeyword(Array.isArray(pool) ? pool : [], Array.isArray(manifest) ? manifest : []);
  if (!seed) { console.log('Guidance publisher: all approved topics are already covered. No article published.'); return; }

  const topic = topicFor(seed);
  console.log(`Guidance publisher selected: ${seed.keyword} [${topic.slug}]`);
  const { article, words } = await generateValidatedArticle(seed, manifest);
  const slug = slugFor(seed);
  const publishedAt = new Date().toISOString();
  const publishedDate = publishedAt.slice(0, 10);
  const meta = { slug, title: article.title.trim(), description: article.metaDescription.trim(), keyword: seed.keyword, intent: seed.intent || 'guidance', topic: topic.slug, city: seed.city || null, profession: seed.profession || null, publishedAt, publishedDate, modifiedAt: publishedAt, canonical: `${SITE_URL}/guide/${slug}/`, wordCount: words, source: 'gemini-guidance-publisher' };

  fs.mkdirSync(path.join(GUIDE_DIR, slug), { recursive: true });
  fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
  fs.writeFileSync(path.join(GUIDE_DIR, slug, 'index.html'), renderArticleHtml(article, meta, topic), 'utf8');
  fs.writeFileSync(path.join(PUBLISHED_DIR, `${slug}.json`), JSON.stringify({ ...meta, article }, null, 2) + '\n', 'utf8');
  const nextManifest = [meta, ...manifest].sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(nextManifest, null, 2) + '\n', 'utf8');
  console.log(`Guidance article published locally: ${meta.canonical}`);
  console.log(`SEO_PUBLISHED_SLUG=${slug}`);
}

main().catch(error => { console.error('Guidance publisher failed:', error); process.exit(1); });
