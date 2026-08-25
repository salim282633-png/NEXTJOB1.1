import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLISHED_DIR = path.join(ROOT, 'seo/published');
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://nextjob1-1.onrender.com').replace(/\/$/, '');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return String(value).slice(0, 10);
  }
}

function paragraphs(value) {
  return String(value || '')
    .split(/\n\s*\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function relatedArticles(meta, manifest) {
  return manifest
    .filter(item => item.slug && item.slug !== meta.slug)
    .map(item => {
      let score = 0;
      if (meta.city && item.city === meta.city) score += 3;
      if (meta.profession && item.profession === meta.profession) score += 3;
      if (meta.intent && item.intent === meta.intent) score += 1;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || String(b.item.publishedAt || '').localeCompare(String(a.item.publishedAt || '')))
    .slice(0, 3)
    .map(({ item }) => item);
}

function renderArticlePage(meta, article, manifest) {
  const canonical = meta.canonical || `${SITE_URL}/guide/${meta.slug}/`;
  const title = article.title || meta.title || '';
  const description = article.metaDescription || meta.description || '';
  const wordCount = Number(meta.wordCount || 0);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 190));
  const publishedDate = formatDate(meta.publishedAt || meta.publishedDate);
  const sections = Array.isArray(article.sections) ? article.sections : [];
  const faq = Array.isArray(article.faq) ? article.faq : [];
  const related = relatedArticles(meta, manifest);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished: meta.publishedAt || meta.publishedDate,
    dateModified: meta.publishedAt || meta.publishedDate,
    inLanguage: 'ar-SA',
    mainEntityOfPage: canonical,
    wordCount: wordCount || undefined,
    keywords: [meta.keyword, ...(article.relatedKeywords || [])].filter(Boolean),
    author: { '@type': 'Organization', name: 'NEXT JOB' },
    publisher: { '@type': 'Organization', name: 'NEXT JOB' },
    about: ['وظائف لليمنيين في السعودية', meta.keyword].filter(Boolean)
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'NEXT JOB', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'دليل الوظائف', item: `${SITE_URL}/guide/` },
      { '@type': 'ListItem', position: 3, name: title, item: canonical }
    ]
  };

  const toc = sections.map((section, index) => `
          <a href="#section-${index + 1}" data-toc="section-${index + 1}">
            <span>${index + 1}</span>${escapeHtml(section.heading)}
          </a>`).join('');

  const sectionMarkup = sections.map((section, index) => `
        <section class="content-section" id="section-${index + 1}">
          <div class="section-number">${String(index + 1).padStart(2, '0')}</div>
          <h2>${escapeHtml(section.heading)}</h2>
          ${(section.paragraphs || []).map(p => `<p>${escapeHtml(p)}</p>`).join('\n          ')}
        </section>`).join('\n');

  const introMarkup = paragraphs(article.intro).map((p, index) =>
    `<p${index === 0 ? ' class="lead"' : ''}>${escapeHtml(p)}</p>`
  ).join('\n          ');

  const faqMarkup = faq.map((item, index) => `
          <details class="faq-item"${index === 0 ? ' open' : ''}>
            <summary>${escapeHtml(item.question)}<span aria-hidden="true">＋</span></summary>
            <div class="faq-answer"><p>${escapeHtml(item.answer)}</p></div>
          </details>`).join('\n');

  const relatedMarkup = related.length ? related.map(item => `
          <a class="related-card" href="/guide/${escapeHtml(item.slug)}/">
            <span class="related-tag">${escapeHtml(item.city || item.profession || 'دليل الوظائف')}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.publishedDate || '')} · ${item.wordCount ? `${escapeHtml(item.wordCount)} كلمة` : 'مقال إرشادي'}</small>
          </a>`).join('\n') : `
          <a class="related-card" href="/guide/">
            <span class="related-tag">دليل NEXT JOB</span>
            <strong>استعرض بقية المقالات المهنية</strong>
            <small>محتوى مخصص لليمنيين داخل السعودية</small>
          </a>`;

  const topicTags = [meta.keyword, meta.city, meta.profession]
    .filter(Boolean)
    .map(value => `<span>${escapeHtml(value)}</span>`)
    .join('');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#0f7a55">
  <title>${escapeHtml(title)} | NEXT JOB</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:site_name" content="NEXT JOB">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <script type="application/ld+json">${safeJsonForScript(articleSchema)}</script>
  ${faq.length ? `<script type="application/ld+json">${safeJsonForScript(faqSchema)}</script>` : ''}
  <script type="application/ld+json">${safeJsonForScript(breadcrumbSchema)}</script>
  <style>
    :root{--bg:#f5f8f6;--surface:#fff;--ink:#10221d;--body:#344942;--muted:#70817a;--line:#dfe8e3;--green:#0f7a55;--green-dark:#0a513b;--green-soft:#eaf6f0;--amber:#a66a12;--amber-soft:#fff7e7;--shadow:0 18px 50px rgba(16,34,29,.07)}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:100px}body{margin:0;background:var(--bg);color:var(--ink);font-family:Tahoma,"IBM Plex Sans Arabic",Arial,sans-serif;line-height:1.95;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}.reading-progress{position:fixed;top:0;right:0;z-index:60;height:3px;width:0;background:var(--green);transition:width .08s linear}.shell{max-width:1180px;margin:auto;padding:0 20px}.topbar{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.96);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}.topbar-inner{height:70px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:10px;font-size:20px;font-weight:900}.brand-mark{width:39px;height:39px;border-radius:12px;display:grid;place-items:center;background:var(--green);color:#fff;font-size:13px;box-shadow:0 8px 20px rgba(15,122,85,.2)}.navlinks{display:flex;align-items:center;gap:6px;font-size:13px}.navlinks a{padding:9px 11px;border-radius:10px;color:#43564f}.navlinks a:hover{background:var(--green-soft);color:var(--green-dark)}.hero{padding:38px 0 24px}.breadcrumbs{display:flex;align-items:center;gap:7px;flex-wrap:wrap;color:var(--muted);font-size:12px;margin-bottom:16px}.breadcrumbs a:hover{color:var(--green)}.hero-card{background:linear-gradient(145deg,#fff 0%,#f7fcf9 100%);border:1px solid var(--line);border-radius:30px;padding:clamp(26px,5vw,48px);box-shadow:var(--shadow);position:relative;overflow:hidden}.hero-card:after{content:"NJ";position:absolute;left:26px;bottom:-34px;font-size:150px;line-height:1;font-weight:900;color:rgba(15,122,85,.035);pointer-events:none}.kicker{display:inline-flex;align-items:center;gap:7px;background:var(--green-soft);color:var(--green-dark);font-size:12px;font-weight:900;padding:7px 11px;border-radius:999px}.hero h1{max-width:940px;font-size:clamp(30px,5vw,52px);line-height:1.35;letter-spacing:-.6px;margin:17px 0 14px}.hero-description{max-width:850px;color:#52665f;font-size:17px;line-height:1.9;margin:0}.hero-meta{display:flex;align-items:center;flex-wrap:wrap;gap:8px 18px;margin-top:22px;color:var(--muted);font-size:12px}.hero-meta span{display:inline-flex;align-items:center;gap:6px}.topic-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:18px}.topic-tags span{border:1px solid #d6e6de;background:#fff;color:#496158;border-radius:999px;padding:5px 9px;font-size:11px}.hero-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:24px}.button{border:0;cursor:pointer;font:inherit;display:inline-flex;align-items:center;justify-content:center;gap:7px;border-radius:13px;padding:11px 16px;font-size:13px;font-weight:900}.button-primary{background:var(--green);color:#fff}.button-primary:hover{background:var(--green-dark)}.button-secondary{background:#fff;color:var(--green-dark);border:1px solid var(--line)}.article-layout{display:grid;grid-template-columns:minmax(0,790px) minmax(250px,1fr);gap:28px;align-items:start;padding:4px 0 60px}.article-card{background:var(--surface);border:1px solid var(--line);border-radius:28px;padding:clamp(22px,4vw,42px);box-shadow:0 10px 34px rgba(16,34,29,.035)}.article-body p{font-size:17px;color:var(--body);margin:0 0 19px}.article-body .lead{font-size:20px;line-height:2;color:#213b32}.intro{padding-bottom:12px;border-bottom:1px solid #edf2ef}.content-section{position:relative;padding-top:32px;margin-top:12px}.content-section h2{font-size:clamp(23px,3vw,29px);line-height:1.5;margin:0 0 15px;color:var(--ink);padding-left:58px}.section-number{float:left;margin-right:12px;margin-top:2px;width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--green-soft);color:var(--green);font-weight:900;font-size:12px}.safety{margin:34px 0 6px;background:var(--amber-soft);border:1px solid #f0d9a8;border-radius:18px;padding:17px 18px;color:#76581d;font-size:13px}.safety strong{display:block;color:#6b4b10;margin-bottom:4px}.summary-box{margin-top:34px;background:#f0f8f4;border:1px solid #d0e7dc;border-radius:20px;padding:22px}.summary-box h2{font-size:23px;margin:0 0 8px;color:var(--green-dark)}.summary-box p{margin:0}.faq-section{margin-top:38px}.faq-section>h2{font-size:27px;margin:0 0 14px}.faq-item{border:1px solid var(--line);border-radius:16px;background:#fff;margin-bottom:9px;overflow:hidden}.faq-item summary{list-style:none;cursor:pointer;padding:16px 17px;font-size:15px;font-weight:900;display:flex;align-items:center;justify-content:space-between;gap:16px}.faq-item summary::-webkit-details-marker{display:none}.faq-item summary span{color:var(--green);font-size:19px;transition:transform .2s}.faq-item[open] summary span{transform:rotate(45deg)}.faq-answer{border-top:1px solid #edf2ef;padding:14px 17px 2px;background:#fbfdfc}.faq-answer p{font-size:15px}.cta{margin-top:34px;background:linear-gradient(135deg,#0b4f3b,#0f7a55);color:#fff;border-radius:22px;padding:25px}.cta h2{font-size:24px;margin:0 0 7px}.cta p{color:#d7eee5;margin:0 0 16px;font-size:14px}.cta-actions{display:flex;gap:9px;flex-wrap:wrap}.cta .button-primary{background:#fff;color:var(--green-dark)}.cta .button-secondary{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.25);color:#fff}.sidebar{position:sticky;top:92px;display:flex;flex-direction:column;gap:14px}.side-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px}.side-card h2{font-size:14px;margin:0 0 12px}.toc{display:flex;flex-direction:column;gap:4px}.toc a{display:grid;grid-template-columns:24px 1fr;gap:7px;padding:7px 8px;border-radius:10px;color:#60716b;font-size:12px;line-height:1.55}.toc a span{width:22px;height:22px;border-radius:7px;display:grid;place-items:center;background:#f0f5f2;color:#789087;font-size:10px}.toc a:hover,.toc a.active{background:var(--green-soft);color:var(--green-dark)}.toc a.active span{background:var(--green);color:#fff}.side-note{font-size:12px;color:var(--muted);margin:0}.side-jobs{display:block;background:var(--green);color:#fff;border-radius:13px;padding:11px;text-align:center;font-size:12px;font-weight:900;margin-top:12px}.related{padding:0 0 54px}.related-head{display:flex;align-items:end;justify-content:space-between;gap:14px;margin-bottom:15px}.related-head h2{font-size:27px;margin:0}.related-head a{font-size:12px;color:var(--green);font-weight:900}.related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.related-card{background:#fff;border:1px solid var(--line);border-radius:19px;padding:18px;display:flex;flex-direction:column;gap:8px;min-height:150px;transition:.2s ease}.related-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(16,34,29,.05);border-color:#c8dbd1}.related-tag{font-size:10px;color:var(--green);font-weight:900}.related-card strong{font-size:15px;line-height:1.65}.related-card small{color:var(--muted);font-size:10px;margin-top:auto}.footer{border-top:1px solid var(--line);background:#fff;padding:28px 0 38px;color:var(--muted);font-size:11px}.footer-inner{display:flex;align-items:center;justify-content:space-between;gap:20px}.footer-links{display:flex;gap:14px}.footer-links a:hover{color:var(--green)}@media(max-width:920px){.article-layout{grid-template-columns:1fr}.sidebar{position:static;order:-1}.side-card.toc-card{display:none}.related-grid{grid-template-columns:1fr 1fr}.hero-card:after{display:none}}@media(max-width:640px){.shell{padding:0 13px}.topbar-inner{height:62px}.navlinks a:not(:first-child){display:none}.hero{padding-top:22px}.hero-card{border-radius:22px;padding:24px 20px}.hero h1{font-size:31px}.hero-description{font-size:15px}.article-card{border-radius:22px;padding:22px 18px}.article-body p{font-size:16px;line-height:1.95}.article-body .lead{font-size:18px}.content-section h2{font-size:22px;padding-left:0}.section-number{float:none;margin:0 0 10px}.related-grid{grid-template-columns:1fr}.footer-inner{align-items:flex-start;flex-direction:column}.hero-actions .button{width:100%}}
  </style>
</head>
<body>
  <div class="reading-progress" id="readingProgress" aria-hidden="true"></div>
  <header class="topbar">
    <div class="shell topbar-inner">
      <a class="brand" href="/"><span class="brand-mark">NJ</span><span>NEXT JOB</span></a>
      <nav class="navlinks" aria-label="التنقل الرئيسي">
        <a href="/guide/">المقالات</a>
        <a href="/jobs/">فرص العمل</a>
        <a href="/candidates/">الباحثون</a>
        <a href="/">المنصة</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="shell">
        <nav class="breadcrumbs" aria-label="مسار الصفحة">
          <a href="/">NEXT JOB</a><span>←</span><a href="/guide/">المقالات</a><span>←</span><span>هذا المقال</span>
        </nav>
        <div class="hero-card">
          <span class="kicker">دليل وظائف اليمنيين في السعودية</span>
          <h1>${escapeHtml(title)}</h1>
          <p class="hero-description">${escapeHtml(description)}</p>
          <div class="hero-meta">
            <span>تاريخ النشر: ${escapeHtml(publishedDate)}</span>
            <span>${readingMinutes} دقائق قراءة تقريبًا</span>
            ${wordCount ? `<span>${escapeHtml(wordCount)} كلمة</span>` : ''}
          </div>
          ${topicTags ? `<div class="topic-tags">${topicTags}</div>` : ''}
          <div class="hero-actions">
            <a class="button button-primary" href="/jobs/">عرض الوظائف المنشورة</a>
            <button class="button button-secondary" type="button" id="shareArticle">مشاركة المقال</button>
          </div>
        </div>
      </div>
    </section>

    <div class="shell article-layout">
      <article class="article-card article-body" id="articleContent">
        <div class="intro">
          ${introMarkup}
        </div>
        ${sectionMarkup}

        ${faq.length ? `<section class="faq-section" id="faq"><h2>أسئلة شائعة</h2>${faqMarkup}</section>` : ''}

        <section class="summary-box" id="summary">
          <h2>الخلاصة</h2>
          <p>${escapeHtml(article.conclusion || '')}</p>
        </section>

        <div class="safety">
          <strong>تنبيه مهم قبل التقديم</strong>
          هذا المحتوى إرشادي عام للباحثين اليمنيين عن العمل داخل السعودية. تحقّق من تفاصيل الإعلان وصاحب العمل، وراجع إجراءات التعاقد أو نقل الخدمات عبر الجهات الرسمية المختصة. لا تدفع مبلغًا مقابل وعد بالحصول على وظيفة.
        </div>

        <section class="cta">
          <h2>هل تبحث عن فرصة مناسبة الآن؟</h2>
          <p>راجع الوظائف المنشورة فعليًا على NEXT JOB واستخدم فلاتر المدينة والمهنة للوصول إلى الفرص الأقرب لملفك.</p>
          <div class="cta-actions">
            <a class="button button-primary" href="/jobs/">استعراض الوظائف</a>
            <a class="button button-secondary" href="/guide/">العودة إلى دليل المقالات</a>
          </div>
        </section>
      </article>

      <aside class="sidebar">
        <section class="side-card toc-card">
          <h2>محتويات المقال</h2>
          <nav class="toc" aria-label="فهرس المقال">${toc}</nav>
        </section>
        <section class="side-card">
          <h2>وظائف فعلية وليست وعودًا</h2>
          <p class="side-note">المقال للتوجيه فقط. فرص العمل الفعلية تجدها في قسم الوظائف ويمكنك تصفيتها حسب المدينة والمهنة.</p>
          <a class="side-jobs" href="/jobs/">اذهب إلى الوظائف</a>
        </section>
      </aside>
    </div>

    <section class="related">
      <div class="shell">
        <div class="related-head"><h2>مقالات قد تفيدك أيضًا</h2><a href="/guide/">عرض كل المقالات</a></div>
        <div class="related-grid">${relatedMarkup}</div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="shell footer-inner">
      <div>© ${new Date().getFullYear()} NEXT JOB · منصة تقنية للتواصل المباشر حول فرص العمل دون عمولات توظيف.</div>
      <div class="footer-links"><a href="/guide/">المقالات</a><a href="/jobs/">الوظائف</a><a href="/">الرئيسية</a></div>
    </div>
  </footer>

  <script>
    (() => {
      const progress = document.getElementById('readingProgress');
      const article = document.getElementById('articleContent');
      const shareButton = document.getElementById('shareArticle');
      const tocLinks = Array.from(document.querySelectorAll('[data-toc]'));
      const sections = Array.from(document.querySelectorAll('.content-section'));

      const updateProgress = () => {
        if (!progress || !article) return;
        const rect = article.getBoundingClientRect();
        const start = window.scrollY + rect.top - window.innerHeight * 0.2;
        const end = start + article.offsetHeight - window.innerHeight * 0.55;
        const value = end <= start ? 0 : Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
        progress.style.width = (value * 100).toFixed(2) + '%';
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
      updateProgress();

      if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver(entries => {
          const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible) return;
          tocLinks.forEach(link => link.classList.toggle('active', link.dataset.toc === visible.target.id));
        }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, .25, .5] });
        sections.forEach(section => observer.observe(section));
      }

      shareButton?.addEventListener('click', async () => {
        const data = { title: document.title.replace(' | NEXT JOB', ''), url: window.location.href };
        try {
          if (navigator.share) await navigator.share(data);
          else if (navigator.clipboard) {
            await navigator.clipboard.writeText(window.location.href);
            shareButton.textContent = 'تم نسخ الرابط';
            setTimeout(() => { shareButton.textContent = 'مشاركة المقال'; }, 1800);
          }
        } catch (error) {
          if (error?.name !== 'AbortError') console.warn('Article share unavailable', error);
        }
      });
    })();
  </script>
</body>
</html>`;
}

function main() {
  const manifest = readJson(MANIFEST_FILE, []);
  if (!fs.existsSync(PUBLISHED_DIR)) {
    console.log('Article styler: no published article source directory yet.');
    return;
  }

  const files = fs.readdirSync(PUBLISHED_DIR).filter(name => name.endsWith('.json'));
  let written = 0;

  for (const name of files) {
    const source = readJson(path.join(PUBLISHED_DIR, name), null);
    if (!source?.slug || !source?.article) continue;
    const targetDir = path.join(GUIDE_DIR, source.slug);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), renderArticlePage(source, source.article, manifest), 'utf8');
    written += 1;
  }

  console.log(`Article styler: rebuilt ${written} article page(s).`);
}

main();
