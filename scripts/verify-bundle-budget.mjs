import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'dist/assets');

const limits = {
  mainRaw: 260 * 1024,
  mainGzip: 85 * 1024,
  appRaw: 70 * 1024,
  appGzip: 25 * 1024,
  criticalRaw: 350 * 1024,
  criticalGzip: 110 * 1024,
  cssRaw: 90 * 1024,
  cssGzip: 20 * 1024
};

function fail(message) {
  console.error(`Performance budget failed: ${message}`);
  process.exitCode = 1;
}

function matchingFile(prefix, extension) {
  if (!fs.existsSync(ASSETS_DIR)) return null;
  const matches = fs.readdirSync(ASSETS_DIR).filter(name => name.startsWith(prefix) && name.endsWith(extension));
  if (matches.length !== 1) {
    fail(`expected exactly one ${prefix}*${extension} asset, found ${matches.length}`);
    return null;
  }
  return path.join(ASSETS_DIR, matches[0]);
}

function sizes(file) {
  const content = fs.readFileSync(file);
  return { raw: content.byteLength, gzip: zlib.gzipSync(content, { level: 9 }).byteLength };
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

const mainFile = matchingFile('main-', '.js');
const appFile = matchingFile('App-', '.js');
const cssFile = matchingFile('main-', '.css');

if (mainFile && appFile && cssFile) {
  const main = sizes(mainFile);
  const app = sizes(appFile);
  const css = sizes(cssFile);
  const critical = { raw: main.raw + app.raw, gzip: main.gzip + app.gzip };

  if (main.raw > limits.mainRaw) fail(`main JS raw ${kb(main.raw)} > ${kb(limits.mainRaw)}`);
  if (main.gzip > limits.mainGzip) fail(`main JS gzip ${kb(main.gzip)} > ${kb(limits.mainGzip)}`);
  if (app.raw > limits.appRaw) fail(`App JS raw ${kb(app.raw)} > ${kb(limits.appRaw)}`);
  if (app.gzip > limits.appGzip) fail(`App JS gzip ${kb(app.gzip)} > ${kb(limits.appGzip)}`);
  if (critical.raw > limits.criticalRaw) fail(`homepage critical JS raw ${kb(critical.raw)} > ${kb(limits.criticalRaw)}`);
  if (critical.gzip > limits.criticalGzip) fail(`homepage critical JS gzip ${kb(critical.gzip)} > ${kb(limits.criticalGzip)}`);
  if (css.raw > limits.cssRaw) fail(`main CSS raw ${kb(css.raw)} > ${kb(limits.cssRaw)}`);
  if (css.gzip > limits.cssGzip) fail(`main CSS gzip ${kb(css.gzip)} > ${kb(limits.cssGzip)}`);

  if (!process.exitCode) {
    console.log(`Performance budget passed: main ${kb(main.raw)} (${kb(main.gzip)} gzip), App ${kb(app.raw)} (${kb(app.gzip)} gzip), critical JS ${kb(critical.raw)} (${kb(critical.gzip)} gzip), CSS ${kb(css.raw)} (${kb(css.gzip)} gzip).`);
  }
}
