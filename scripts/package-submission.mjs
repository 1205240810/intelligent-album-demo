import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

process.on('uncaughtException', (error) => {
  console.error(`\n打包失败：${error.message}\n`);
  process.exitCode = 1;
});

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageName = '智能相册分析系统-课程作业';
const releaseDir = join(root, 'release');
const stageDir = join(releaseDir, packageName);
const defaultPpt = join(root, 'submission', '智能相册分析系统-答辩.pptx');
const pptPath = process.argv[2] ? join(root, process.argv[2]) : defaultPpt;
const zipPath = join(releaseDir, `${packageName}.zip`);

function requireFile(path, message) {
  if (!existsSync(path) || !statSync(path).isFile()) {
    throw new Error(message);
  }
}

function copy(relativeSource, relativeTarget = relativeSource) {
  const source = join(root, relativeSource);
  const target = join(stageDir, '02_项目源码', relativeTarget);
  requireFile(source, `缺少源码文件: ${relativeSource}`);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

function copyDirectory(relativeSource, relativeTarget = relativeSource) {
  const source = join(root, relativeSource);
  const target = join(stageDir, '02_项目源码', relativeTarget);
  if (!existsSync(source)) {
    throw new Error(`缺少源码目录: ${relativeSource}`);
  }
  cpSync(source, target, {
    recursive: true,
    filter: (entry) => !['.DS_Store', '__pycache__'].includes(basename(entry)),
  });
}

function filesUnder(directory) {
  const result = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) {
      result.push(...filesUnder(path));
    } else {
      result.push(path);
    }
  }
  return result;
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

requireFile(
  pptPath,
  `尚未找到答辩 PPT。请放到 ${relative(root, defaultPpt)}，或把 PPT 路径作为命令参数传入。`,
);
if (extname(pptPath).toLowerCase() !== '.pptx') {
  throw new Error('答辩材料必须是 .pptx 文件。');
}
execFileSync('/usr/bin/unzip', ['-t', pptPath], { stdio: 'ignore' });

execFileSync('npm', ['run', 'verify'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:single'], { cwd: root, stdio: 'inherit' });

const singleHtml = join(root, 'output', 'cos-single', 'index.html');
requireFile(singleHtml, '单文件演示构建失败。');
const photoCount = JSON.parse(
  readFileSync(join(root, 'frontend', 'public', 'data.json'), 'utf8'),
).length;
const embeddedImageCount = readFileSync(singleHtml, 'utf8').split('data:image/').length - 1;
if (embeddedImageCount < photoCount) {
  throw new Error(`单文件演示只检测到 ${embeddedImageCount} 个内嵌图片，预期至少 ${photoCount} 个。`);
}

rmSync(stageDir, { recursive: true, force: true });
rmSync(zipPath, { force: true });
mkdirSync(join(stageDir, '01_直接演示'), { recursive: true });
mkdirSync(join(stageDir, '03_项目文档'), { recursive: true });
mkdirSync(join(stageDir, '04_答辩材料'), { recursive: true });

copyFileSync(join(root, 'docs', 'SUBMISSION_README.md'), join(stageDir, '00_请先阅读.md'));
copyFileSync(singleHtml, join(stageDir, '01_直接演示', '智能相册分析.html'));

for (const file of ['README.md', 'package.json', 'vercel.json', '.gitignore']) {
  copy(file);
}
copyDirectory('frontend/src');
copyDirectory('frontend/public');
copyDirectory('frontend/scripts');
copyDirectory('frontend/tests');
for (const file of [
  'frontend/.env.example',
  'frontend/README.md',
  'frontend/index.html',
  'frontend/package.json',
  'frontend/package-lock.json',
  'frontend/postcss.config.js',
  'frontend/tailwind.config.js',
  'frontend/vite.config.js',
  'frontend/vite.single.config.js',
]) {
  copy(file);
}
copyDirectory('backend/tests');
copy('backend/README.md');
for (const name of readdirSync(join(root, 'backend', 'photo_album'))) {
  if (name.endsWith('.py') || name === 'requirements.txt' || name === '.env.example') {
    copy(`backend/photo_album/${name}`);
  }
}
copy('backend/photo_album/data/.gitkeep');
copy('backend/photo_album/users/.gitkeep');
copyDirectory('docs');
copyDirectory('scripts');

const documentCopies = [
  ['PROJECT_REPORT.md', '项目说明书.md'],
  ['TEST_REPORT.md', '测试报告.md'],
  ['DEMO_GUIDE.md', '演示与运行指南.md'],
  ['API_CONTRACT.md', 'API接口说明.md'],
];
for (const [source, target] of documentCopies) {
  copyFileSync(join(root, 'docs', source), join(stageDir, '03_项目文档', target));
}
copyFileSync(pptPath, join(stageDir, '04_答辩材料', '智能相册分析系统-答辩.pptx'));

const manifestPath = join(stageDir, '文件清单与校验值.txt');
const manifest = filesUnder(stageDir)
  .filter((path) => path !== manifestPath)
  .sort()
  .map((path) => {
    const name = relative(stageDir, path);
    return `${sha256(path)}  ${statSync(path).size.toString().padStart(10)}  ${name}`;
  });
writeFileSync(manifestPath, `SHA-256  大小(byte)  文件\n${manifest.join('\n')}\n`, 'utf8');

mkdirSync(releaseDir, { recursive: true });
execFileSync('/usr/bin/zip', ['-r', '-X', basename(zipPath), packageName], {
  cwd: releaseDir,
  stdio: 'inherit',
});

const zipSize = statSync(zipPath).size;
if (zipSize > 100 * 1024 * 1024) {
  rmSync(zipPath, { force: true });
  throw new Error(`压缩包为 ${(zipSize / 1024 / 1024).toFixed(1)}MB，超过 100MB 限制。`);
}

console.log(`最终压缩包: ${zipPath}`);
console.log(`大小: ${(zipSize / 1024 / 1024).toFixed(1)}MB`);
