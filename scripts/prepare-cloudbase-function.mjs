import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'frontend', 'dist');
const output = join(root, 'output', 'cloudbase-function');
const staticOrigin = (
  process.env.CLOUDBASE_STATIC_ORIGIN
  || 'https://graduate-sim-d6gl5fih109ef4a1f-1424455477.tcloudbaseapp.com'
).replace(/\/$/, '');

const indexPath = join(dist, 'index.html');
if (!existsSync(indexPath)) {
  throw new Error('缺少 frontend/dist，请先运行 npm run build。');
}

let html = readFileSync(indexPath, 'utf8');
const cssMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)"\s*\/?>/);
if (!cssMatch) {
  throw new Error('未在构建页面中找到 CSS 资源。');
}

const cssPath = join(dist, cssMatch[1].replace(/^\.\//, ''));
if (!existsSync(cssPath)) {
  throw new Error(`CSS 文件不存在: ${cssPath}`);
}

html = html
  .replace(cssMatch[0], `<style>${readFileSync(cssPath, 'utf8')}</style>`)
  .replace(/(<script[^>]+src=")\.\/([^"#?]+)(")/g, `$1${staticOrigin}/$2$3`)
  .replace(/"\/images\/real\//g, `"${staticOrigin}/images/real/`);

const functionSource = `exports.main = async () => ({
  statusCode: 200,
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'public, max-age=300',
    'x-content-type-options': 'nosniff',
  },
  body: ${JSON.stringify(html)},
});
`;

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
writeFileSync(join(output, 'index.js'), functionSource, 'utf8');
writeFileSync(
  join(output, 'package.json'),
  `${JSON.stringify({ name: 'intelligent-album-cloudbase', version: '1.0.0', main: 'index.js' }, null, 2)}\n`,
  'utf8',
);

console.log(`CloudBase 函数目录: ${output}`);
console.log(`静态资源域名: ${staticOrigin}`);
