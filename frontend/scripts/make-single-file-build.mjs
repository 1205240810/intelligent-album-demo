import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = dirname(frontendRoot);
const buildDir = join(frontendRoot, 'single-dist');
const outputDir = join(repoRoot, 'output', 'cos-single');
const htmlPath = join(buildDir, 'index.html');

let html = readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/);
const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/);
if (!scriptMatch || !styleMatch) {
  throw new Error('Single-file build assets were not found in index.html.');
}

let script = readFileSync(join(buildDir, scriptMatch[1].replace(/^\.\//, '')), 'utf8');
const style = readFileSync(join(buildDir, styleMatch[1].replace(/^\.\//, '')), 'utf8');
const compactPhotos = JSON.parse(readFileSync(join(repoRoot, 'output', 'single-data.json'), 'utf8'));
const photos = compactPhotos.map(({ source_url: _sourceUrl, ...photo }) => photo);

for (const photo of compactPhotos) {
  script = script.split(photo.source_url).join(photo.url);
  script = script.split(`.${photo.source_url}`).join(photo.url);
}

const embeddedData = JSON.stringify(photos).replace(/</g, '\\u003c');
const dataTag = `<script id="photo-data" type="application/json">${embeddedData}</script>`;
const inlineScript = `<script type="module">${script.replace(/<\/script/gi, '<\\/script')}</script>`;
const inlineStyle = `<style>${style.replace(/<\/style/gi, '<\\/style')}</style>`;

html = html
  .replace(scriptMatch[0], () => `${dataTag}\n    ${inlineScript}`)
  .replace(styleMatch[0], () => inlineStyle);

const closingScriptTags = html.match(/<\/script>/gi)?.length ?? 0;
if (closingScriptTags !== 2 || html.includes(scriptMatch[0])) {
  throw new Error('Single-file script inlining produced malformed HTML.');
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'index.html'), html);
console.log(`wrote ${join(outputDir, 'index.html')} (${Buffer.byteLength(html)} bytes)`);
