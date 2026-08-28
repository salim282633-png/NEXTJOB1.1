import fs from 'node:fs';
import path from 'node:path';

const GUIDE_DIR = path.join(process.cwd(), 'public/guide');
const SHOW_OPPORTUNITIES = false;

if (SHOW_OPPORTUNITIES || !fs.existsSync(GUIDE_DIR)) {
  console.log('Opportunities UI visibility filter skipped.');
  process.exit(0);
}

function hideLinks(html) {
  let next = html;
  next = next.replace(/<a\b[^>]*href=["']\/jobs\/?[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '');
  next = next.replace(/<button\b[^>]*data-(?:tab|target)=["']jobs["'][^>]*>[\s\S]*?<\/button>/gi, '');
  return next;
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      const source = fs.readFileSync(target, 'utf8');
      const next = hideLinks(source);
      if (next !== source) fs.writeFileSync(target, next, 'utf8');
    }
  }
}

walk(GUIDE_DIR);
console.log('Temporary opportunities links hidden from static guide pages.');
