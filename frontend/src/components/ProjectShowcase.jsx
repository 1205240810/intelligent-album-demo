import {
  ArrowRight,
  Braces,
  Database,
  FolderTree,
  Image,
  MonitorSmartphone,
  Server,
  Terminal,
} from 'lucide-react';

const modules = [
  {
    icon: MonitorSmartphone,
    title: 'frontend/',
    tone: 'bg-sky-50 text-sky-700 ring-sky-100',
    summary: 'React + Vite 展示层，负责筛选交互、图表、照片证据库、离线打包预览。',
    items: ['src/ 页面与组件', 'public/data.json 展示数据', 'public/images/real 展示图片'],
  },
  {
    icon: Server,
    title: 'backend/photo_album/',
    tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    summary: 'Flask 服务层，负责上传、EXIF 解析、百度地图反查、统计文件和 /api/photos 合约。',
    items: ['app.py 服务入口', 'routes.py API 路由', 'users/ 本地运行态相册'],
  },
  {
    icon: Database,
    title: 'data/',
    tone: 'bg-amber-50 text-amber-700 ring-amber-100',
    summary: '本地数据源目录，存放原始照片库；生成脚本会输出脱敏压缩后的前端数据。',
    items: ['raw/photo-album-test 原始库', 'generate:data 生成静态集', 'raw/ 默认不提交 Git'],
  },
];

const flow = [
  ['原始照片', 'data/raw/photo-album-test'],
  ['生成脚本', 'frontend/scripts/generate_real_dataset.py'],
  ['展示数据', 'frontend/public/data.json'],
  ['分析界面', 'frontend/src/App.jsx'],
];

const commands = [
  ['前端开发', 'npm run dev'],
  ['重新生成数据', 'npm run generate:data'],
  ['静态打包', 'npm run build'],
  ['后端服务', 'npm run backend:dev'],
];

function ModuleCard({ icon: Icon, title, tone, summary, items }) {
  return (
    <article className="min-w-0 rounded-lg border border-zinc-200 bg-white p-5">
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg ring-1 ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-mono text-lg font-semibold text-zinc-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600">{summary}</p>
      <div className="mt-5 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex min-w-0 items-start gap-2 text-sm text-zinc-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-950" />
            <span className="min-w-0 break-words">{item}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function CommandRow({ label, command }) {
  return (
    <div className="grid gap-2 border-b border-zinc-200 py-3 last:border-b-0 sm:grid-cols-[108px_1fr] sm:items-center">
      <div className="text-sm font-medium text-zinc-700">{label}</div>
      <code className="min-w-0 break-all rounded-md bg-zinc-950 px-3 py-2 font-mono text-xs text-white">
        {command}
      </code>
    </div>
  );
}

export default function ProjectShowcase({ totalCount, dataSource }) {
  return (
    <section id="project" className="surface-panel overflow-hidden scroll-mt-24">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b border-zinc-200 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-7">
          <div className="section-kicker">项目展示</div>
          <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
            目录、数据流和运行入口已经整理成一张交付面。
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-700 sm:text-base">
            当前页面读取 {totalCount} 张真实展示照片；如果接入 Flask 接口，前端会优先使用
            API 数据，否则使用本地静态数据，打包后也能直接离线展示。
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Image className="h-4 w-4 text-zinc-950" />
                展示照片
              </div>
              <div className="mt-2 font-mono text-3xl font-semibold text-zinc-950">
                {totalCount}
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Braces className="h-4 w-4 text-zinc-950" />
                数据来源
              </div>
              <div className="mt-2 truncate text-lg font-semibold text-zinc-950">
                {dataSource === 'api' ? 'API' : dataSource === 'sample' ? '样本' : '本地 JSON'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 lg:p-7">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-950">
            <FolderTree className="h-4 w-4" />
            数据处理路径
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            {flow.map(([label, path], index) => (
              <div key={label} className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-950">{label}</span>
                  {index < flow.length - 1 ? (
                    <ArrowRight className="hidden h-4 w-4 shrink-0 text-zinc-400 md:block" />
                  ) : null}
                </div>
                <div className="mt-3 min-h-10 break-words font-mono text-xs leading-5 text-zinc-600">
                  {path}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-zinc-950">
              <Terminal className="h-4 w-4" />
              常用命令
            </div>
            {commands.map(([label, command]) => (
              <CommandRow key={label} label={label} command={command} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-zinc-200 bg-zinc-50 p-5 sm:p-6 lg:grid-cols-3 lg:p-7">
        {modules.map((item) => (
          <ModuleCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}
