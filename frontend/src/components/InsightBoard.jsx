import { BarChart3, Compass, Layers3, Palette, SunMoon } from 'lucide-react';
import { TYPE_COLORS } from '../constants/filters';
import { percent } from '../lib/insights';
import Dashboard from './Dashboard';
import ScenicImage from './ScenicImage';

function HighlightTile({ icon: Icon, label, value, detail }) {
  return (
    <div className="metric-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">{label}</div>
        <Icon className="h-4 w-4 text-zinc-950" />
      </div>
      <div className="mt-3 text-xl font-semibold text-zinc-950">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{detail}</div>
    </div>
  );
}

function EvidenceRow({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-zinc-950">{value}</div>
      <div className="mt-1 text-sm leading-6 text-zinc-600">{detail}</div>
    </div>
  );
}

function TypeEvidence({ item, total }) {
  const ratio = total ? item.count / total : 0;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-zinc-200 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-1 rounded-full"
            style={{ backgroundColor: TYPE_COLORS[item.name] }}
          />
          <span className="font-medium text-zinc-900">{item.name}</span>
        </div>
        <div className="mt-1 text-xs text-zinc-500">占当前筛选池 {percent(ratio)}</div>
      </div>
      <div className="font-mono text-lg font-semibold text-zinc-950">{item.count}</div>
    </div>
  );
}

export default function InsightBoard({ analysis, photos }) {
  const takeaway = analysis.total
    ? analysis.typeSummary.isBalanced
      ? '当前样本覆盖结构均衡'
      : `${analysis.typeSummary.value} 是当前样本主视觉`
    : '等待筛选样本';

  return (
    <section id="insights" className="surface-panel overflow-hidden scroll-mt-24">
      <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="section-kicker">分析</div>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight text-zinc-950 sm:text-4xl">
            {takeaway}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-700 sm:text-base">
            {analysis.conclusion}
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {analysis.highlights.map((item, index) => {
              const icons = [BarChart3, Palette, Layers3];
              const Icon = icons[index] ?? BarChart3;

              return <HighlightTile key={item.label} icon={Icon} {...item} />;
            })}
          </div>
        </div>

        <figure className="border-t border-zinc-200 bg-white lg:border-l lg:border-t-0">
            <ScenicImage
            src={analysis.heroImage}
            alt={`${analysis.dominantType.name} 数据封面`}
            className="h-[260px] w-full object-cover sm:h-[360px] lg:h-full"
            fallbackTitle="主图不可用"
            fallbackSubtitle="请确认图片资源是否存在。"
          />
          <figcaption className="border-t border-zinc-200 px-5 py-4 text-sm leading-6 text-zinc-600">
            主图跟随当前筛选池变化，把分布结果连接到可见样本。
          </figcaption>
        </figure>
      </div>

      <div className="border-t border-zinc-200 p-5 sm:p-6 lg:p-7">
        <div className="section-heading">
          <div>
            <div className="section-kicker">证据</div>
            <h3 className="section-title">先读证据，再看图表</h3>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">
            这些摘要把筛选池的结构、昼夜样本和特征强项压缩成可核对的证据点。
          </p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-zinc-950">Top 景点类型</h4>
                <p className="mt-1 text-sm text-zinc-500">按当前筛选池照片数量排序</p>
              </div>
              <Compass className="h-5 w-5 text-zinc-950" />
            </div>
            {(analysis.topTypes.length ? analysis.topTypes : [{ name: '暂无数据', count: 0 }]).map(
              (item) => (
                <TypeEvidence key={item.name} item={item} total={analysis.total} />
              ),
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <EvidenceRow
              label="昼夜结构"
              value={`${analysis.daytimeCount}:${analysis.nightCount}`}
              detail="左侧为白天样本，右侧为黑夜样本。"
            />
            <EvidenceRow
              label="季节倾向"
              value={analysis.seasonSummary.value}
              detail={analysis.seasonSummary.detail}
            />
            <EvidenceRow
              label="纹理解释"
              value={percent(analysis.textureAverage)}
              detail={`${analysis.richestTextureType.name} 对纹理差异贡献更明显。`}
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-7 text-zinc-800">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <SunMoon className="h-4 w-4" />
            观测提示
          </div>
          昼夜比例会影响色彩分值解释：夜景更容易出现高反差纹理，白天样本更适合观察色彩覆盖。
        </div>
      </div>

      <Dashboard photos={photos} analysis={analysis} />
    </section>
  );
}
