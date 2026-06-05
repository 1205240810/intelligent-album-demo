import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(projectRoot, 'dist');
const indexPath = join(distDir, 'index.html');
const dataPath = join(distDir, 'data.json');

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html not found. Run vite build first.');
}

let html = readFileSync(indexPath, 'utf8');

html = html.replace(
  /<script\s+type="module"\s+crossorigin\s+src="([^"]+)"><\/script>/,
  '<script defer src="$1"></script>',
);

if (existsSync(dataPath) && !html.includes('id="photo-data"')) {
  const dataJson = readFileSync(dataPath, 'utf8').replace(/</g, '\\u003c');
  const dataTag = `    <script id="photo-data" type="application/json">${dataJson}</script>\n`;

  html = html.replace(/(\s*<script defer src="\.\/assets\/[^"]+"><\/script>)/, `\n${dataTag}$1`);
}

writeFileSync(indexPath, html);
