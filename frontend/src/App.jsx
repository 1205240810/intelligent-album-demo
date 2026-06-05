import {
  Aperture,
  Camera,
  Cpu,
  FileJson,
  Gauge,
  MapPinned,
  MoonStar,
  ScanLine,
  Sparkles,
  Tags,
  Trees,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import FilterBar from './components/FilterBar';
import ImageGrid from './components/ImageGrid';
import InsightBoard from './components/InsightBoard';
import PhotoModal from './components/PhotoModal';
import ScenicImage from './components/ScenicImage';
import { SEASON_OPTIONS, TIME_OPTIONS, TYPE_OPTIONS } from './constants/filters';
import { loadPhotoDataset } from './lib/data';
import { buildDatasetInsights, percent } from './lib/insights';

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="metric-card min-w-0 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">{label}</div>
        <Icon className="h-4 w-4 shrink-0 text-zinc-950" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-zinc-950 sm:text-3xl">{value}</div>
      <div className="mt-1 truncate text-xs text-zinc-500">{detail}</div>
    </div>
  );
}

function HeroImagePanel({ src, dominantType, summary, compact = false }) {
  return (
    <figure
      className={[
        'relative isolate min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-black',
        compact ? 'h-52' : 'h-[300px]',
      ].join(' ')}
    >
      <ScenicImage
        src={src}
        alt={`${dominantType} 影像样本`}
        className="h-full w-full object-cover"
        loading="eager"
        fallbackTitle="影像不可用"
        fallbackSubtitle="请确认真实照片资源是否存在。"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
      <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="text-xs font-medium text-zinc-300">影像样本</div>
        <div className="mt-1 truncate text-xl font-semibold text-white">{dominantType}</div>
        <div className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-200">{summary}</div>
      </figcaption>
    </figure>
  );
}

function ProcessingTrail({ totalCount, dataSource }) {
  const steps = [
    {
      icon: ScanLine,
      title: '读取图片库',
      detail: `当前载入 ${totalCount} 张照片；接口返回多少张，统计就覆盖多少张。`,
    },
    {
      icon: MapPinned,
      title: '解析元数据',
      detail: '读取 EXIF 时间、机型、GPS；缺失时用文件时间补齐基础字段。',
    },
    {
      icon: Tags,
      title: '生成标签',
      detail: 'GPS 地址反查后结合关键词映射景点类型，并由拍摄时间得到季节与昼夜。',
    },
    {
      icon: Sparkles,
      title: '估算特征',
      detail: '缺少算法分数时，从像素饱和度、亮度和边缘强度估算色彩与纹理。',
    },
  ];

  return (
    <section className="surface-panel p-4 sm:p-5" aria-label="数据处理链路">
      <div className="section-heading">
        <div>
          <div className="section-kicker">处理链路</div>
          <h2 className="section-title">照片变成指标的过程</h2>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          <Cpu className="h-4 w-4 text-zinc-950" />
          {dataSourceLabel(dataSource)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-950">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-zinc-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">{detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function matchesFilter(value, filter) {
  return filter === '全部' || value === filter;
}

function buildFilterSummary(typeFilter, timeFilter, seasonFilter) {
  const typeText = typeFilter === '全部' ? '全部景点' : typeFilter;
  const timeText = timeFilter === '全部' ? '昼夜不限' : timeFilter;
  const seasonText = seasonFilter === '全部' ? '季节不限' : `${seasonFilter}季`;

  return `${typeText} / ${timeText} / ${seasonText}`;
}

function dataSourceLabel(source) {
  return {
    api: '实时数据',
    file: '真实照片',
    sample: '临时样本',
  }[source];
}

export default function App() {
  const [typeFilter, setTypeFilter] = useState('全部');
  const [timeFilter, setTimeFilter] = useState('全部');
  const [seasonFilter, setSeasonFilter] = useState('全部');
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('file');
  const [dataMessage, setDataMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      setLoading(true);
      const result = await loadPhotoDataset();

      if (!active) {
        return;
      }

      setPhotos(result.photos);
      setDataSource(result.source);
      setDataMessage({
        api: `实时数据源已连接，当前载入 ${result.photos.length} 张照片。`,
        file: result.warning
          ? `实时接口未连接，当前展示本地真实照片集，共 ${result.photos.length} 张。`
          : `当前展示本地真实照片集，共 ${result.photos.length} 张。`,
        sample: '数据文件不可用，当前展示临时样本。',
      }[result.source]);
      setLoading(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const filteredPhotos = photos.filter(
    (photo) =>
      matchesFilter(photo.type, typeFilter) &&
      matchesFilter(photo.time, timeFilter) &&
      matchesFilter(photo.season, seasonFilter),
  );

  const analysis = buildDatasetInsights(filteredPhotos);
  const filterSummary = buildFilterSummary(typeFilter, timeFilter, seasonFilter);
  const hasActiveFilters =
    typeFilter !== '全部' || timeFilter !== '全部' || seasonFilter !== '全部';

  const resetFilters = () => {
    setTypeFilter('全部');
    setTimeFilter('全部');
    setSeasonFilter('全部');
  };

  useEffect(() => {
    if (selectedPhoto && !filteredPhotos.some((photo) => photo.id === selectedPhoto.id)) {
      setSelectedPhoto(null);
    }
  }, [filteredPhotos, selectedPhoto]);

  useEffect(() => {
    if (loading || !window.location.hash) {
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
    });
  }, [loading]);

  return (
    <div className="min-h-[100dvh] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-950">
              <Aperture className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-zinc-950">
                智能相册分析
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 text-sm text-zinc-600 md:flex">
            <a className="nav-link" href="#insights">
              分析
            </a>
            <a className="nav-link" href="#gallery">
              照片
            </a>
          </nav>

          <div className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 sm:flex">
            <FileJson className="h-3.5 w-3.5 text-zinc-950" />
            {dataSourceLabel(dataSource)}
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <section className="surface-panel p-5 sm:p-6 lg:p-7">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
            <div className="flex min-w-0 flex-col justify-between gap-6">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                  <span className="rounded-md border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-zinc-900">
                    真实照片集
                  </span>
                  <span>{loading ? '加载中' : `${photos.length} 张照片 · 已脱敏`}</span>
                </div>

                <h1 className="max-w-4xl break-words text-3xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
                  真实照片的筛选、归类与视觉证据。
                  <span className="block text-zinc-700">每一次筛选都同步改写指标、图表和照片池。</span>
                </h1>

                <p className="mt-5 max-w-3xl break-words text-sm leading-7 text-zinc-700 sm:text-base">
                  {loading
                    ? '正在加载样本数据，准备生成分布、昼夜、季节与图像特征结论。'
                    : analysis.conclusion}
                </p>

                <div className="mt-5 lg:hidden">
                  <HeroImagePanel
                    src={analysis.heroImage}
                    dominantType={analysis.dominantType.name}
                    summary={filterSummary}
                    compact
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_1.15fr]">
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                    <FileJson className="h-4 w-4 text-zinc-950" />
                    数据状态
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{dataMessage}</p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                    <Gauge className="h-4 w-4 text-zinc-950" />
                    当前筛选摘要
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{filterSummary}</p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-3">
              <div className="hidden lg:block">
                <HeroImagePanel
                  src={analysis.heroImage}
                  dominantType={analysis.dominantType.name}
                  summary={filterSummary}
                />
              </div>

              <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <MetricCard
                  icon={Camera}
                  label="当前命中"
                  value={loading ? '--' : filteredPhotos.length}
                  detail={`总样本 ${loading ? '--' : photos.length} 张`}
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
            </div>
          </div>
        </section>

        <FilterBar
          filters={[
            {
              id: 'query-type',
              icon: MapPinned,
              label: '景点类型',
              options: TYPE_OPTIONS,
              value: typeFilter,
              onChange: setTypeFilter,
            },
            {
              id: 'query-time',
              icon: MoonStar,
              label: '时段',
              options: TIME_OPTIONS,
              value: timeFilter,
              onChange: setTimeFilter,
            },
            {
              id: 'query-season',
              icon: Trees,
              label: '季节',
              options: SEASON_OPTIONS,
              value: seasonFilter,
              onChange: setSeasonFilter,
            },
          ]}
          hasActiveFilters={hasActiveFilters}
          resultCount={filteredPhotos.length}
          totalCount={photos.length}
          summary={filterSummary}
          onReset={resetFilters}
        />

        {!loading ? <ProcessingTrail totalCount={photos.length} dataSource={dataSource} /> : null}

        {!loading ? <InsightBoard analysis={analysis} photos={filteredPhotos} /> : null}

        <section id="gallery" className="space-y-4 scroll-mt-24">
          <div className="section-heading">
            <div>
              <div className="section-kicker">图片证据库</div>
              <h2 className="section-title">真实照片证据库</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-zinc-600">
              点击样本查看分类、时段、季节和图像特征，所有卡片均来自真实照片。
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }, (_, index) => (
                <div
                  key={index}
                  className="surface-panel h-[330px] animate-pulse bg-zinc-50"
                />
              ))}
            </div>
          ) : (
            <ImageGrid
              photos={filteredPhotos}
              selectedPhotoId={selectedPhoto?.id}
              onSelect={setSelectedPhoto}
            />
          )}
        </section>
      </main>

      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}
