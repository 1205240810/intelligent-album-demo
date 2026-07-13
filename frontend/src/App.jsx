import { Aperture, FileJson, MapPinned, MoonStar, Trees } from 'lucide-react';
import { useEffect, useState } from 'react';
import FilterBar from './components/FilterBar';
import ImageGrid from './components/ImageGrid';
import InsightBoard from './components/InsightBoard';
import OverviewSection from './components/OverviewSection';
import PhotoModal from './components/PhotoModal';
import ProcessingTrail from './components/ProcessingTrail';
import { SEASON_OPTIONS, TIME_OPTIONS, TYPE_OPTIONS } from './constants/filters';
import { loadPhotoDataset } from './lib/data';
import { buildDatasetInsights } from './lib/insights';

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
        file: result.warningKind === 'api'
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
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
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

          <div className="hidden items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800 sm:flex">
            <FileJson className="h-3.5 w-3.5" />
            {dataSourceLabel(dataSource)}
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <OverviewSection
          loading={loading}
          photos={photos}
          filteredPhotos={filteredPhotos}
          analysis={analysis}
          filterSummary={filterSummary}
          dataMessage={dataMessage}
          dataSourceLabel={dataSourceLabel(dataSource)}
        />

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

        {!loading ? (
          <ProcessingTrail
            totalCount={photos.length}
            dataSourceLabel={dataSourceLabel(dataSource)}
          />
        ) : null}

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
