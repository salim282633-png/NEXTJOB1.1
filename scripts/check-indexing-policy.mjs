import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const robots = read('public/robots.txt');
const sitemap = read('public/sitemap.xml');
const jobs = read('jobs/index.html');
const candidates = read('public/candidates/index.html');
const render = read('render.yaml');

const failures = [];
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) failures.push(`missing: ${label}`);
};
const forbidText = (text, needle, label) => {
  if (text.includes(needle)) failures.push(`forbidden: ${label}`);
};

for (const path of ['/admin', '/applications', '/saved']) {
  requireText(robots, `Disallow: ${path}`, `robots block for ${path}`);
}
forbidText(robots, 'Disallow: /jobs', 'robots must not block /jobs while noindex is active');
forbidText(robots, 'Disallow: /candidates', 'robots must not block /candidates while noindex is active');

requireText(jobs, 'content="noindex,follow"', '/jobs source-level noindex');
requireText(candidates, 'content="noindex,nofollow"', '/candidates source-level noindex');

for (const path of ['/jobs', '/jobs/*']) {
  requireText(render, `path: ${path}`, `Render X-Robots route ${path}`);
}
requireText(render, 'value: "noindex, follow"', 'Render jobs noindex header');
for (const path of ['/candidates', '/candidates/*']) {
  requireText(render, `path: ${path}`, `Render X-Robots route ${path}`);
}
requireText(render, 'value: "noindex, nofollow"', 'Render candidates noindex header');

forbidText(sitemap, '/jobs/', '/jobs excluded from sitemap');
forbidText(sitemap, '/candidates/', '/candidates excluded from sitemap');

if (failures.length) {
  console.error('Indexing policy guard failed:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('Indexing policy verified: paused/retired routes are crawlable for noindex, excluded from sitemap, and protected by Render headers.');
