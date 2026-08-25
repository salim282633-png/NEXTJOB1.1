import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const MARKER = 'nextjob-static-typography';

const FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">`;

const TYPOGRAPHY_STYLE = `
  <style id="${MARKER}">
    html,body,button,input,select,textarea{font-family:"IBM Plex Sans Arabic","Tajawal",Tahoma,Arial,sans-serif!important}
    h1,h2,h3,h4,h5,h6,.font-display{font-family:"Tajawal","IBM Plex Sans Arabic",Tahoma,Arial,sans-serif!important;font-synthesis:none}
    body{font-feature-settings:"kern" 1;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  </style>`;

function collectHtmlFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith('.html') ? [target] : [];

  const files = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const fullPath = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...collectHtmlFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function applyTypography(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (!/<\/head>/i.test(html)) return false;

  let changed = false;
  if (!html.includes('fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic')) {
    html = html.replace(/<\/head>/i, `${FONT_LINKS}\n</head>`);
    changed = true;
  }

  if (!html.includes(`id="${MARKER}"`)) {
    html = html.replace(/<\/head>/i, `${TYPOGRAPHY_STYLE}\n</head>`);
    changed = true;
  }

  if (changed) fs.writeFileSync(file, html, 'utf8');
  return changed;
}

const requestedTargets = process.argv.slice(2).map(item => path.resolve(ROOT, item));
const defaultTargets = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'admin/index.html'),
  path.join(ROOT, 'jobs/index.html'),
  PUBLIC_DIR
];

const files = [...new Set((requestedTargets.length ? requestedTargets : defaultTargets).flatMap(collectHtmlFiles))];
let updated = 0;
for (const file of files) {
  if (applyTypography(file)) updated += 1;
}

console.log(`Static typography: checked ${files.length} HTML page(s), updated ${updated}.`);
