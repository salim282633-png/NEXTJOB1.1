import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const STYLE_ID = 'nextjob-article-polish';
const MOBILE_TOC_START = '<!-- NEXTJOB_MOBILE_TOC_START -->';
const MOBILE_TOC_END = '<!-- NEXTJOB_MOBILE_TOC_END -->';

const TOPIC_LABELS = {
  cv: 'السيرة الذاتية',
  interviews: 'المقابلات',
  contracts: 'العقود',
  sponsorship: 'نقل الخدمات',
  safety: 'الأمان المهني',
  cities: 'أدلة المدن',
  professions: 'أدلة المهن',
  'job-search': 'البحث عن عمل'
};

const TOPIC_JOURNEYS = {
  cv: ['interviews', 'job-search'],
  interviews: ['cv', 'job-search'],
  contracts: ['sponsorship', 'safety'],
  sponsorship: ['contracts', 'safety'],
  safety: ['job-search', 'contracts'],
  cities: ['job-search', 'professions'],
  professions: ['cv', 'interviews'],
  'job-search': ['cv', 'interviews']
};

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function readManifest() {
  try {
    const parsed = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function topicOf(item) {
  if (item?.topic && TOPIC_LABELS[item.topic]) return item.topic;
  const intent = String(item?.intent || '').toLowerCase();
  if (intent.includes('interview')) return 'interviews';
  if (intent.includes('contract')) return 'contracts';
  if (intent.includes('sponsorship')) return 'sponsorship';
  if (intent.includes('safety')) return 'safety';
  if (intent.includes('cv')) return 'cv';
  if (item?.city || intent.includes('city')) return 'cities';
  if (item?.profession || intent.includes('profession') || intent === 'sector') return 'professions';
  return 'job-search';
}

function relatedFor(item, manifest) {
  const currentTopic = topicOf(item);
  const journey = TOPIC_JOURNEYS[currentTopic] || [];
  return manifest
    .filter(candidate => candidate?.slug && candidate.slug !== item.slug)
    .map(candidate => {
      const candidateTopic = topicOf(candidate);
      let score = 0;
      if (candidateTopic === currentTopic) score += 7;
      const journeyIndex = journey.indexOf(candidateTopic);
      if (journeyIndex >= 0) score += 5 - journeyIndex;
      if (item.city && candidate.city === item.city) score += 3;
      if (item.profession && candidate.profession === item.profession) score += 3;
      if (item.intent && candidate.intent === item.intent) score += 1;
      return { candidate, candidateTopic, score };
    })
    .sort((a, b) => b.score - a.score || String(b.candidate.publishedAt || '').localeCompare(String(a.candidate.publishedAt || '')))
    .slice(0, 3);
}

function relatedMarkup(item, manifest) {
  return relatedFor(item, manifest).map(({ candidate, candidateTopic }) => `
          <a class="related-card" href="/guide/${escapeHtml(candidate.slug)}/">
            <span class="related-tag">${escapeHtml(TOPIC_LABELS[candidateTopic] || 'مقال إرشادي')}</span>
            <strong>${escapeHtml(candidate.title)}</strong>
            <small>${escapeHtml(candidate.publishedDate || '')} · ${candidate.wordCount ? `${escapeHtml(candidate.wordCount)} كلمة` : 'مقال إرشادي'}</small>
          </a>`).join('');
}

function extractSections(html) {
  const sections = [];
  const re = /<section class="content-section" id="(section-\d+)">[\s\S]*?<h2>([\s\S]*?)<\/h2>/g;
  let match;
  while ((match = re.exec(html))) {
    const label = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (label) sections.push({ id: match[1], label });
  }
  return sections;
}

function mobileToc(sections) {
  if (!sections.length) return '';
  const links = sections.map((section, index) =>
    `<a href="#${escapeHtml(section.id)}"><span>${index + 1}</span><b>${escapeHtml(section.label)}</b></a>`
  ).join('');
  return `${MOBILE_TOC_START}<details class="mobile-toc"><summary><span>محتويات المقال</span><small>${sections.length} أقسام</small></summary><nav aria-label="محتويات المقال على الجوال">${links}</nav></details>${MOBILE_TOC_END}`;
}

const css = `
<style id="${STYLE_ID}">
  :root{--reader-bg:#f8f7f3;--reader-surface:#fff;--reader-ink:#17211d;--reader-body:#35463f;--reader-muted:#74807b;--reader-line:#e5e8e5;--reader-green:#147154;--reader-green-dark:#0d513d;--reader-soft:#eef6f1;--reader-warm:#fbf6ea}
  body{background:linear-gradient(180deg,#fbfaf7 0,#f8f7f3 45%,#f6f7f5 100%)}
  .topbar{background:rgba(255,255,255,.93);border-bottom-color:#e8ebe8;box-shadow:0 1px 0 rgba(15,23,42,.02)}
  .brand-mark{box-shadow:none}.navlinks a{font-weight:700}
  .hero{padding:30px 0 22px}.hero-card{max-width:1040px;margin-inline:auto;border-radius:26px;background:linear-gradient(145deg,#fff,#fffdf8);border-color:var(--reader-line);box-shadow:0 10px 34px rgba(25,42,35,.035);padding:clamp(26px,4.4vw,44px)}
  .hero-card:after{opacity:.55}.hero h1{max-width:900px;font-size:clamp(29px,4.5vw,47px);line-height:1.42;letter-spacing:-.4px}.hero-description{max-width:780px;font-size:16px;line-height:2;color:#56655f}.kicker{background:var(--reader-soft);color:var(--reader-green-dark);border:1px solid #dce9e1;padding:6px 10px}.topic-tags span{border-radius:9px;background:#fbfcfb}.button{border-radius:11px}.button-primary{background:var(--reader-green)}
  .article-layout{grid-template-columns:minmax(0,760px) 280px;gap:24px;justify-content:center;padding-top:2px;padding-bottom:54px}.article-card{border-radius:24px;border-color:var(--reader-line);padding:clamp(24px,4vw,40px);box-shadow:0 8px 28px rgba(25,42,35,.03)}
  .article-body p{font-size:17px;line-height:2.08;color:var(--reader-body);margin-bottom:21px}.article-body .lead{font-size:19px;line-height:2.1;color:#263c33;font-weight:500}.intro{padding-bottom:19px;border-bottom-color:#edf0ee}
  .content-section{padding-top:34px;margin-top:8px;scroll-margin-top:96px}.content-section+.content-section{border-top:1px solid #f0f2f0}.content-section h2{font-size:clamp(22px,2.8vw,27px);line-height:1.58;margin-bottom:16px;padding-left:50px;letter-spacing:-.15px}.content-section h3,.article-body h3{font-size:19px;line-height:1.65;margin:25px 0 10px;color:var(--reader-green-dark)}.section-number{width:38px;height:38px;border-radius:11px;background:var(--reader-soft);color:var(--reader-green);font-size:11px}
  .summary-box{position:relative;margin-top:36px;background:linear-gradient(145deg,#f1f7f3,#f8fbf9);border:1px solid #d5e5dc;border-right:4px solid var(--reader-green);border-radius:18px;padding:22px 23px}.summary-box:before{content:"الخلاصة";display:inline-flex;margin-bottom:7px;border-radius:999px;background:#fff;color:var(--reader-green-dark);border:1px solid #d8e7df;padding:4px 9px;font-size:10px;font-weight:900}.summary-box h2{font-size:21px;margin:0 0 8px;color:var(--reader-green-dark)}.summary-box p{font-size:15.5px;line-height:2;margin:0;color:#42564d}
  .safety{background:var(--reader-warm);border-color:#eee1c4;border-radius:15px;color:#6f6244}.safety strong{color:#625232}
  .faq-section{margin-top:40px;padding-top:2px}.faq-section>h2{font-size:25px;letter-spacing:-.1px}.faq-item{border-radius:14px;border-color:var(--reader-line);margin-bottom:8px;box-shadow:0 3px 12px rgba(25,42,35,.018)}.faq-item summary{padding:15px 16px;font-size:14.5px;line-height:1.7}.faq-item[open]{border-color:#cfe0d7}.faq-item[open] summary{background:#f8fbf9;color:var(--reader-green-dark)}.faq-answer{background:#fff;padding:13px 16px 3px}.faq-answer p{font-size:15px;line-height:1.95}
  .cta{margin-top:34px;border:1px solid #d6e5dd;background:#f1f7f3;color:var(--reader-ink);border-radius:18px;padding:22px}.cta h2{font-size:21px;color:var(--reader-green-dark)}.cta p{color:#586a62;font-size:13.5px}.cta .button-primary{background:var(--reader-green);color:#fff}.cta .button-secondary{background:#fff;border-color:#d8e4de;color:var(--reader-green-dark)}
  .sidebar{top:86px;gap:12px}.side-card{border-radius:17px;border-color:var(--reader-line);padding:16px;box-shadow:0 5px 18px rgba(25,42,35,.025)}.side-card h2{font-size:13px}.toc a{grid-template-columns:22px 1fr;gap:7px;padding:7px;border-radius:9px;font-size:11.5px}.toc a span{width:21px;height:21px;border-radius:7px}.toc a:hover,.toc a.active{background:var(--reader-soft);color:var(--reader-green-dark)}
  .mobile-toc{display:none;margin:0 0 22px;border:1px solid #dce5df;border-radius:15px;background:#fafcfb;overflow:hidden}.mobile-toc summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 15px;color:var(--reader-green-dark);font-size:13px;font-weight:900}.mobile-toc summary::-webkit-details-marker{display:none}.mobile-toc summary small{font-size:10px;color:var(--reader-muted);font-weight:700}.mobile-toc nav{display:grid;gap:3px;padding:0 10px 11px}.mobile-toc a{display:grid;grid-template-columns:25px minmax(0,1fr);align-items:start;gap:8px;border-radius:9px;padding:8px;color:#56675f;font-size:11.5px;line-height:1.65}.mobile-toc a:hover{background:var(--reader-soft);color:var(--reader-green-dark)}.mobile-toc a span{display:grid;place-items:center;width:23px;height:23px;border-radius:7px;background:#edf4f0;color:var(--reader-green);font-size:10px}.mobile-toc a b{font-weight:700}
  .related{padding-bottom:50px}.related-head h2{font-size:25px}.related-grid{gap:12px}.related-card{min-height:155px;border-radius:17px;border-color:var(--reader-line);padding:17px;box-shadow:0 4px 16px rgba(25,42,35,.02)}.related-card:hover{transform:translateY(-2px);border-color:#cbdcd2;box-shadow:0 10px 25px rgba(25,58,44,.05)}.related-tag{display:inline-flex;align-self:flex-start;background:var(--reader-soft);padding:4px 7px;border-radius:7px;font-size:9.5px}.related-card strong{font-size:14.5px;line-height:1.7}.related-card small{font-size:10px}
  a:focus-visible,summary:focus-visible,button:focus-visible{outline:3px solid rgba(20,113,84,.2);outline-offset:3px}
  @media(max-width:920px){.article-layout{display:flex;flex-direction:column;max-width:790px;margin-inline:auto}.sidebar{position:static;width:100%;order:2}.side-card.toc-card{display:none}.mobile-toc{display:block}.article-card{width:100%}.related-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:640px){.hero{padding-top:18px}.hero-card{padding:23px 19px;border-radius:20px}.hero h1{font-size:29px}.hero-description{font-size:14.5px}.article-card{padding:22px 18px;border-radius:20px}.article-body p{font-size:16px;line-height:2}.article-body .lead{font-size:17.5px}.content-section{padding-top:29px}.content-section h2{padding-left:0;font-size:21px}.section-number{float:none;margin:0 0 9px}.summary-box{padding:19px;border-right-width:3px}.faq-section>h2,.related-head h2{font-size:22px}.related-grid{grid-template-columns:1fr}.related-head{align-items:flex-start;flex-direction:column}.hero-actions .button{width:100%}}
  @media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.related-card,.faq-item,.button{transition:none!important}.related-card:hover{transform:none!important}}
</style>`;

function polishArticle(file, item, manifest) {
  let html = fs.readFileSync(file, 'utf8');
  const sections = extractSections(html);

  html = html.replace(new RegExp(`<style id="${STYLE_ID}">[\\s\\S]*?<\\/style>`, 'g'), '');
  html = html.replace(new RegExp(`${MOBILE_TOC_START}[\\s\\S]*?${MOBILE_TOC_END}`, 'g'), '');

  const toc = mobileToc(sections);
  if (toc && html.includes('<div class="intro">')) {
    html = html.replace('<div class="intro">', `${toc}\n        <div class="intro">`);
  }

  const recommendations = relatedMarkup(item, manifest);
  if (recommendations) {
    html = html.replace(/<div class="related-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, `<div class="related-grid">${recommendations}\n        </div>\n      </div>\n    </section>`);
  }

  html = html.replace(/دليل وظائف اليمنيين في السعودية/g, 'مدونة NEXT JOB للعمل والمسار المهني');
  html = html.replace(/دليل الوظائف/g, 'المدونة');
  html = html.replace(/دليل NEXT JOB/g, 'مدونة NEXT JOB');
  html = html.replace(/وظائف لليمنيين في السعودية/g, 'المسار المهني لليمنيين في السعودية');
  html = html.replace(/>العودة إلى دليل المقالات</g, '>العودة إلى المدونة<');
  html = html.replace(/>دليل المقالات</g, '>المدونة<');
  html = html.replace(/>مركز الأدلة المهنية</g, '>المدونة<');
  html = html.replace('</head>', `${css}\n</head>`);
  fs.writeFileSync(file, html, 'utf8');
}

const manifest = readManifest();
let count = 0;
for (const item of manifest) {
  if (!item?.slug) continue;
  const file = path.join(GUIDE_DIR, item.slug, 'index.html');
  if (!fs.existsSync(file)) continue;
  polishArticle(file, item, manifest);
  count += 1;
}

console.log(`Guidance article UI polished: ${count} article(s), topic journeys linked.`);
