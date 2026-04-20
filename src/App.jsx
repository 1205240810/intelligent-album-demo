import {
  Aperture,
  Camera,
  Database,
  Filter,
  MapPinned,
  MoonStar,
  Trees,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import FilterBar from './components/FilterBar';
import ImageGrid from './components/ImageGrid';
import PhotoModal from './components/PhotoModal';
import { SEASON_OPTIONS, TIME_OPTIONS, TYPE_OPTIONS } from './constants/filters';
import { loadPhotoDataset } from './lib/data';

function MetricCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-300">{label}</div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}
        >
          <Icon className="h-5 w-5 text-slate-950" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

function matchesFilter(value, filter) {
  return filter === '全部' || value === filter;
}

function averageOf(items, picker) {
  if (!items.length) {
    return 0;
  }

  return items.reduce((sum, item) => sum + picker(item), 0) / items.length;
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
      setDataMessage(
        result.source === 'file'
          ? '当前读取 public/data.json，可直接替换数据源继续演示。'
          : '未检测到可用 data.json，已自动切换为内置 Mock 数据。',
      );
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

  const coveredTypes = new Set(filteredPhotos.map((photo) => photo.type)).size;
  const averageColor = averageOf(filteredPhotos, (photo) => photo.features.color_score);
  const averageTexture = averageOf(filteredPhotos, (photo) => photo.features.texture_complexity);

  useEffect(() => {
    if (selectedPhoto && !filteredPhotos.some((photo) => photo.id === selectedPhoto.id)) {
      setSelectedPhoto(null);
    }
  }, [filteredPhotos, selectedPhoto]);

  return (
    <div className="min-h-screen px-4 pb-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 py-6 sm:gap-8 sm:py-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-hero-glow p-6 shadow-glow sm:p-8 lg:p-10">
          <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="label-pill mb-4">
                <Aperture className="h-3.5 w-3.5" />
                Intelligent Album
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                旅游景点智能相册
                <span className="block text-cyan-200">前端可视化演示系统</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200/80 sm:text-base">
                面向课程大作业的交互式原型，支持三级筛选、实时图表联动和图片属性查看，
                用于展示旅游照片在景点类型、昼夜场景和季节维度上的分布情况。
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100">
                  React + Vite
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100">
                  Tailwind CSS
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-100">
                  ECharts 自适应图表
                </span>
              </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/[0.28] p-4 text-sm leading-7 text-slate-200/[0.85]">
                <div className="flex items-center gap-2 text-cyan-200">
                  <Database className="h-4 w-4" />
                  数据状态：{dataSource === 'file' ? 'public/data.json' : '内置 Mock 数据'}
                </div>
                <p className="mt-2 text-slate-300">{dataMessage}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                icon={Camera}
                label="当前照片数"
                value={loading ? '--' : filteredPhotos.length}
                accent="from-cyan-200 to-cyan-400"
              />
              <MetricCard
                icon={MapPinned}
                label="覆盖景点类型"
                value={loading ? '--' : coveredTypes}
                accent="from-amber-200 to-orange-300"
              />
              <MetricCard
                icon={MoonStar}
                label="平均色彩分值"
                value={loading ? '--' : `${Math.round(averageColor * 100)}%`}
                accent="from-emerald-200 to-green-400"
              />
              <MetricCard
                icon={Trees}
                label="平均纹理复杂度"
                value={loading ? '--' : `${Math.round(averageTexture * 100)}%`}
                accent="from-pink-200 to-rose-300"
              />
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[34px] p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="label-pill mb-3">
                <Filter className="h-3.5 w-3.5" />
                Filter Header
              </div>
              <h2 className="section-title">三级过滤控制栏</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              三个维度采用“且”逻辑，切换任意条件都会同步刷新图表和图片列表。
            </p>
          </div>

          <div className="grid gap-4">
            <FilterBar
              icon={MapPinned}
              label="景点类型"
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={setTypeFilter}
            />
            <FilterBar
              icon={MoonStar}
              label="时段"
              options={TIME_OPTIONS}
              value={timeFilter}
              onChange={setTimeFilter}
            />
            <FilterBar
              icon={Trees}
              label="季节"
              options={SEASON_OPTIONS}
              value={seasonFilter}
              onChange={setSeasonFilter}
            />
          </div>
        </section>

        <Dashboard photos={filteredPhotos} />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="label-pill mb-3">
                <Camera className="h-3.5 w-3.5" />
                Image Grid
              </div>
              <h2 className="section-title">照片展示网格</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              网格默认支持延迟加载，点击任意图片即可查看基础属性与图像特征。
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }, (_, index) => (
                <div
                  key={index}
                  className="glass-panel h-[360px] animate-pulse rounded-[28px] bg-white/[0.04]"
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
      </div>

      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </div>
  );
}
