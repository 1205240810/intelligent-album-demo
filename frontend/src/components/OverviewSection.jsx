import { Camera, FileJson, Gauge, MapPinned, MoonStar, Trees } from 'lucide-react';
import { percent } from '../lib/insights';
import ScenicImage from './ScenicImage';

function MetricCard({ icon: Icon, label, value, detail, accent = false }) {
  return (
    <div className={`metric-card min-w-0 p-4 ${accent ? 'metric-card-accent' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">{label}</div>
        <Icon className={`h-4 w-4 shrink-0 ${accent ? 'text-teal-700' : 'text-zinc-700'}`} />
      </div>
      <div className="mt-3 text-2xl font-semibold text-zinc-950 sm:text-3xl">{value}</div>
      <div className="mt-1 truncate text-xs text-zinc-500">{detail}</div>
    </div>
  );
}

function HeroImage({ src, dominantType, summary }) {
  return (
    <figure className="relative isolate h-[280px] min-w-0 overflow-hidden rounded-lg bg-zinc-950 sm:h-[340px]">
      <ScenicImage
        src={src}
        alt={`${dominantType} 影像样本`}
        className="h-full w-full object-cover"
        loading="eager"
        fallbackTitle="影像不可用"
        fallbackSubtitle="请确认真实照片资源是否存在。"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
      <figcaption className="absolute inset-x-0 bottom-0 p-5">
        <div className="mb-2 inline-flex rounded-md bg-teal-500 px-2 py-1 text-xs font-semibold text-white">
          当前代表样本
        </div>
        <div className="text-2xl font-semibold text-white">{dominantType}</div>
        <div className="mt-1 text-xs leading-5 text-zinc-200">{summary}</div>
      </figcaption>
    </figure>
  );
}

export default function OverviewSection({
  loading,
  photos,
  filteredPhotos,
  analysis,
  filterSummary,
  dataMessage,
  dataSourceLabel,
}) {
  return (
    <section className="surface-panel overflow-hidden">
      <div className="grid min-w-0 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex min-w-0 flex-col justify-between p-5 sm:p-7 lg:p-8">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
              <span className="rounded-md bg-teal-50 px-2.5 py-1 font-medium text-teal-800">
                真实照片集
              </span>
              <span>{loading ? '加载中' : `${photos.length} 张照片 · 已脱敏`}</span>
            </div>

            <h1 className="max-w-3xl text-3xl font-semibold leading-[1.12] text-zinc-950 sm:text-4xl lg:text-[44px]">
              真实照片的筛选、归类与视觉证据。
              <span className="block text-teal-700">每一次筛选都同步改写指标、图表和照片池。</span>
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-700 sm:text-base">
              {loading
                ? '正在加载样本数据，准备生成分布、昼夜、季节与图像特征结论。'
                : analysis.conclusion}
            </p>
          </div>

          <div className="mt-7 grid gap-4 border-t border-zinc-200 pt-5 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <FileJson className="h-4 w-4 text-teal-700" />
                数据状态
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{dataMessage}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <Gauge className="h-4 w-4 text-amber-600" />
                当前筛选
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{filterSummary}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 p-4 lg:border-l lg:border-t-0">
          <HeroImage
            src={analysis.heroImage}
            dominantType={analysis.dominantType.name}
            summary={filterSummary}
          />

          <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
            <MetricCard
              icon={Camera}
              label="当前命中"
              value={loading ? '--' : filteredPhotos.length}
              detail={`总样本 ${loading ? '--' : photos.length} 张`}
              accent
            />
            <MetricCard
              icon={MapPinned}
              label="覆盖类型"
              value={loading ? '--' : `${analysis.coveredTypes}/10`}
              detail={analysis.typeSummary.value}
            />
            <MetricCard
              icon={MoonStar}
              label="平均色彩"
              value={loading ? '--' : percent(analysis.colorAverage)}
              detail={`${analysis.bestColorType.name} 最突出`}
            />
            <MetricCard
              icon={Trees}
              label="平均纹理"
              value={loading ? '--' : percent(analysis.textureAverage)}
              detail={`${analysis.richestTextureType.name} 最丰富`}
            />
          </div>

          <div className="mt-3 text-right text-xs text-zinc-500">{dataSourceLabel}</div>
        </div>
      </div>
    </section>
  );
}
