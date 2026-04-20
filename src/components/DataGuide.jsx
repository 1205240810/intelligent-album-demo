import { Database, FolderOpen, Rocket } from 'lucide-react';

function GuideCard({ icon: Icon, title, description, chips }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DataGuide() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label-pill mb-3">
            <Database className="h-3.5 w-3.5" />
            Data Guide
          </div>
          <h2 className="section-title">数据接入说明</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-400">
          这一块是给队友交接用的说明。后续只要替换图片资源和 `public/data.json`，
          就可以保持当前前端页面不变，直接完成数据演示。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GuideCard
          icon={Database}
          title="JSON 数据文件"
          description="运行时默认读取 public/data.json，字段最少包含 id、url、type、time、season 和 features。"
          chips={['id', 'url', 'type', 'time', 'season', 'features']}
        />

        <GuideCard
          icon={FolderOpen}
          title="图片资源放置"
          description="本地图片建议统一放在 public/images 下，再在 data.json 里用 /images/文件名 这种路径引用。"
          chips={['/images/xxx.jpg', 'jpg', 'png', 'webp', 'svg']}
        />

        <GuideCard
          icon={Rocket}
          title="更新上线流程"
          description="改完 data.json 或图片后提交到 GitHub，Vercel 会自动重新部署，不需要重复手动配置。"
          chips={['GitHub push', 'Vercel Auto Deploy', 'main 分支同步']}
        />
      </div>

      <div className="glass-panel rounded-[30px] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/30 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-100">推荐 JSON 结构</div>
            <pre className="overflow-x-auto text-xs leading-6 text-slate-300">
              <code>{`[
  {
    "id": 1,
    "url": "/images/mountain.jpg",
    "type": "山景",
    "time": "白天",
    "season": "春",
    "features": {
      "color_score": 0.86,
      "texture_complexity": 0.55
    }
  }
]`}</code>
            </pre>
          </div>

          <div className="rounded-[24px] border border-cyan-300/15 bg-cyan-300/[0.08] p-4 text-sm leading-7 text-cyan-50">
            推荐图片格式为 JPG、PNG、WEBP 或 SVG。为了让瀑布流和弹窗展示更稳定，
            建议尽量统一横图比例，优先使用 4:3 或 16:9，单张分辨率建议不低于 1200px 宽。
            如果使用本地图片，请放入 `public/images/`，然后在 `data.json` 中写成
            `"/images/文件名.jpg"`。
          </div>
        </div>
      </div>
    </section>
  );
}
