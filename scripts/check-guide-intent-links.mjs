import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const GUIDE_DIR = path.join(ROOT, 'public/guide');
const MANIFEST_FILE = path.join(GUIDE_DIR, 'articles.json');
const MAP_FILE = path.join(ROOT, 'seo/intent-internal-links.json');
const errors = [];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fail(message) {
  errors.push(message);
}

for (const file of [MANIFEST_FILE, MAP_FILE]) {
  if (!fs.existsSync(file)) fail(`missing required file: ${path.relative(ROOT, file)}`);
}

if (!errors.length) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  const knownSlugs = new Set(manifest.map(item => item.slug).filter(Boolean));
  const inboundPages = new Map(Object.keys(map.targets || {}).map(slug => [slug, new Set()]));

  for (const targetSlug of Object.keys(map.targets || {})) {
    if (!knownSlugs.has(targetSlug)) fail(`target is missing from the guide manifest: ${targetSlug}`);
  }

  for (const [sourceSlug, links] of Object.entries(map.pages || {})) {
    if (!knownSlugs.has(sourceSlug)) {
      fail(`source is missing from the guide manifest: ${sourceSlug}`);
      continue;
    }
    if (!Array.isArray(links) || !links.length) {
      fail(`${sourceSlug}: must define at least one contextual link`);
      continue;
    }
    const duplicateTargets = new Set();
    const htmlFile = path.join(GUIDE_DIR, sourceSlug, 'index.html');
    if (!fs.existsSync(htmlFile)) {
      fail(`${sourceSlug}: generated HTML page is missing`);
      continue;
    }
    const html = fs.readFileSync(htmlFile, 'utf8');

    for (const link of links) {
      const targetSlug = String(link.targetSlug || '').trim();
      const anchor = String(link.anchor || '').trim();
      const note = String(link.note || '').trim();
      if (!knownSlugs.has(targetSlug)) fail(`${sourceSlug}: unknown target ${targetSlug}`);
      if (!inboundPages.has(targetSlug)) fail(`${sourceSlug}: target ${targetSlug} is not a guarded intent page`);
      if (targetSlug === sourceSlug) fail(`${sourceSlug}: contextual link cannot target itself`);
      if (duplicateTargets.has(targetSlug)) fail(`${sourceSlug}: duplicate contextual target ${targetSlug}`);
      duplicateTargets.add(targetSlug);
      if (anchor.length < 20 || anchor.length > 90) fail(`${sourceSlug}: anchor length must be 20-90 characters`);
      if (/^(?:اضغط هنا|اقرأ المزيد|المزيد|التفاصيل)$/u.test(anchor)) fail(`${sourceSlug}: generic anchor text is not allowed`);
      if (note.length < 35 || note.length > 180) fail(`${sourceSlug}: link note length must be 35-180 characters`);

      const expectedLink = `<a href="/guide/${escapeHtml(targetSlug)}/">${escapeHtml(anchor)}</a>`;
      if (!html.includes(expectedLink)) fail(`${sourceSlug}: generated page is missing its exact anchor for ${targetSlug}`);
      if (!html.includes(`<span>${escapeHtml(note)}</span>`)) fail(`${sourceSlug}: generated page is missing the context note for ${targetSlug}`);
      inboundPages.get(targetSlug)?.add(sourceSlug);
    }
  }

  for (const [targetSlug, settings] of Object.entries(map.targets || {})) {
    const required = Number(settings.minimumInboundPages || 0);
    const actual = inboundPages.get(targetSlug)?.size || 0;
    if (actual < required) fail(`${targetSlug}: has ${actual} curated inbound page(s), expected at least ${required}`);
  }
}

if (errors.length) {
  console.error(`Guide intent-link check failed with ${errors.length} issue(s):`);
  errors.slice(0, 80).forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Guide intent links verified: 4 distinct targets receive contextual anchors from 20 relevant donor pages plus guided cross-links.');
