import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'public/guide/index.html');
if (!fs.existsSync(file)) {
  console.log('Blog index not found; visual polish skipped.');
  process.exit(0);
}

const marker = 'nextjob-blog-polish';
const css = `
<style id="${marker}">
  :root{
    --bg:#f8f7f3;
    --surface:#ffffff;
    --ink:#17211d;
    --muted:#69746f;
    --line:#e4e7e3;
    --green:#147154;
    --green-dark:#0d513d;
    --soft:#eef6f1;
    --warm:#f7f1e5;
  }
  body{background:linear-gradient(180deg,#fbfaf7 0,#f8f7f3 42%,#f6f7f5 100%);color:var(--ink)}
  .topbar{background:rgba(255,255,255,.92);border-bottom-color:#e8ebe8;box-shadow:0 1px 0 rgba(15,23,42,.02)}
  .topbar-inner{height:68px}.brand-mark{border-radius:13px;box-shadow:none}.navlinks{gap:4px}.navlinks a{font-weight:700;font-size:13px}
  .hero{padding:46px 0 24px}.hero-grid{grid-template-columns:minmax(0,1.65fr) minmax(220px,.45fr);gap:18px}
  .hero-main,.hero-stat{border-radius:26px;box-shadow:0 8px 30px rgba(32,51,43,.035)}
  .hero-main{padding:38px;background:linear-gradient(145deg,#fff 0%,#fffdf8 100%)}
  .eyebrow{background:#f0f6f2;border:1px solid #dcebe2;padding:6px 11px}
  .hero h1{font-size:clamp(31px,4.4vw,49px);letter-spacing:-.45px;margin-top:14px}
  .hero-main>p{font-size:16px;line-height:2;max-width:720px}
  .hero-actions{margin-top:21px}.primary-btn,.secondary-btn{border-radius:12px;padding:11px 17px;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease}
  .primary-btn:hover,.secondary-btn:hover{transform:translateY(-1px)}.primary-btn{box-shadow:0 7px 18px rgba(20,113,84,.13)}
  .hero-stat{padding:26px;background:#edf5f0;color:var(--green-dark);border-color:#dbe9e0}
  .stat-number{font-size:44px;color:var(--green-dark)}.stat-label{color:#47705f}.stat-note{color:#647c72;border-top-color:#d6e5dc}
  .notice{background:#fbf7ee;border-color:#eee3c9;color:#695d40;border-radius:14px}

  .blog-categories-section{max-width:1180px;margin:8px auto 34px;padding:0 20px;scroll-margin-top:90px}
  .blog-categories-shell{background:#fff;border:1px solid var(--line);border-radius:26px;padding:28px;box-shadow:0 10px 34px rgba(25,42,35,.035)}
  .blog-categories-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:18px}
  .blog-categories-kicker{font-size:11px;font-weight:900;color:var(--green);letter-spacing:.02em}
  .blog-categories-head h2{font-size:26px;margin:4px 0 0;color:var(--ink)}
  .blog-categories-head p{margin:5px 0 0;color:var(--muted);font-size:13px}
  .blog-categories-all{flex:none;color:var(--green-dark);font-size:12px;font-weight:900;padding:8px 11px;border-radius:10px;background:var(--soft)}
  .blog-category-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
  .blog-category-card{position:relative;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;min-height:112px;padding:17px;border:1px solid #e5e9e6;border-radius:18px;background:#fff;color:var(--ink);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease}
  .blog-category-card:hover{transform:translateY(-2px);border-color:#c9ddd2;background:#fcfefd;box-shadow:0 10px 24px rgba(20,71,54,.06)}
  .blog-category-number{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:#f1f6f3;color:#648073;font-size:10px;font-weight:900}
  .blog-category-copy{display:block;min-width:0}.blog-category-copy strong{display:block;font-size:15px;color:var(--green-dark);margin-bottom:3px}.blog-category-copy>span{display:block;font-size:11.5px;color:var(--muted);line-height:1.7}
  .blog-category-arrow{font-size:17px;color:#a4b1ab;transition:transform .18s ease,color .18s ease}.blog-category-card:hover .blog-category-arrow{transform:translateX(-3px);color:var(--green)}

  .section{padding:18px 0 36px}.section-head{margin-bottom:16px}.section-head h2{font-size:26px}.section-head p{font-size:13px}
  .featured{position:relative;overflow:hidden;border-radius:25px;padding:31px 32px;background:linear-gradient(135deg,#fff 0%,#fbfaf5 100%);border-color:#e4e7e3;border-right:4px solid var(--green);box-shadow:0 10px 32px rgba(25,42,35,.04)}
  .featured:after{content:"";position:absolute;left:-70px;bottom:-95px;width:210px;height:210px;border-radius:50%;background:rgba(20,113,84,.035);pointer-events:none}
  .featured h2{font-size:clamp(23px,3.4vw,33px);line-height:1.55;margin:7px 0 9px}.featured p{font-size:14px;line-height:1.9;max-width:760px}.kicker{display:inline-flex;background:var(--soft);padding:5px 9px;border-radius:999px;font-size:10.5px}.featured-meta{margin:10px 0 17px;color:#7c8882}
  .featured-mark{width:124px;height:124px;justify-self:center;border-radius:50%;background:#f1f5f2;color:#759285;border:1px solid #e0e8e3;font-size:31px;box-shadow:inset 0 0 0 8px #f8faf8}

  .tools{margin:20px 0 17px;border-radius:15px;padding:8px 12px;box-shadow:0 5px 18px rgba(20,40,31,.025)}.tools:focus-within{border-color:#a9cab8;box-shadow:0 0 0 3px rgba(20,113,84,.07)}
  .article-grid{gap:14px}.article-card{position:relative;min-height:272px;border-radius:20px;padding:23px;border-color:#e3e7e4;box-shadow:0 5px 20px rgba(25,42,35,.025);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
  .article-card:hover{transform:translateY(-3px);border-color:#c7d9cf;box-shadow:0 13px 30px rgba(25,58,44,.065)}
  .card-topline{margin-bottom:14px}.tag{background:#f1f6f3;color:#3e6a57;padding:5px 9px;border-radius:9px;font-size:10px}.date{color:#9aa39f;font-size:10px}
  .article-card h2{font-size:19px;line-height:1.62;margin-bottom:9px}.article-card h2 a{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}.article-card p{font-size:13px;line-height:1.9;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
  .details{display:inline-flex;align-self:flex-start;margin-top:11px;padding:4px 8px;border-radius:8px;background:#faf8f2;color:#7a7466;font-size:10.5px}
  .card-footer{padding-top:14px;margin-top:18px;color:#8b9490}.read{display:inline-flex;align-items:center;gap:5px;padding:6px 9px;border-radius:9px;background:#f0f6f2;color:var(--green-dark);transition:background .18s ease,color .18s ease}.read:hover{background:var(--green);color:#fff}
  .empty-state,.no-results{border-radius:18px;background:#fff}.trust{border-radius:24px;background:#173b30;padding:25px 28px}.trust a{border-radius:11px}
  .footer{padding-top:28px}

  a:focus-visible,input:focus-visible{outline:3px solid rgba(20,113,84,.22);outline-offset:3px}
  @media(max-width:980px){.blog-category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hero-grid{grid-template-columns:minmax(0,1.35fr) minmax(190px,.5fr)}}
  @media(max-width:800px){.hero{padding-top:24px}.hero-main{padding:24px}.hero-stat{min-height:150px;padding:22px}.hero h1{font-size:32px}.featured{padding:24px;border-right-width:3px}.blog-categories-section{padding:0 14px}.blog-categories-shell{padding:20px}.blog-categories-head{align-items:flex-start;flex-direction:column}.blog-categories-all{display:none}.article-card{min-height:0;padding:20px}}
  @media(max-width:560px){.blog-category-grid{grid-template-columns:1fr}.blog-category-card{min-height:96px}.hero-actions{flex-direction:column}.hero-actions a{width:100%}.card-footer{align-items:center}.featured h2{font-size:23px}}
  @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}.blog-category-card,.blog-category-arrow,.article-card,.primary-btn,.secondary-btn{transition:none!important}.blog-category-card:hover,.article-card:hover,.primary-btn:hover,.secondary-btn:hover{transform:none!important}}
</style>`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(new RegExp(`<style id="${marker}">[\\s\\S]*?<\\/style>`, 'g'), '');
html = html.replace('</head>', `${css}\n</head>`);
fs.writeFileSync(file, html, 'utf8');
console.log('Blog UI polish applied.');
