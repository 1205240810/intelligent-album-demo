import { ArrowUpRight, ImageOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ScenicImage from './ScenicImage';

const INITIAL_VISIBLE_COUNT = 24;
const LOAD_MORE_COUNT = 24;

function FeatureValue({ label, value }) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

export default function ImageGrid({ photos, selectedPhotoId, onSelect }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visiblePhotos = useMemo(
    () => photos.slice(0, Math.min(visibleCount, photos.length)),
    [photos, visibleCount],
  );
  const hasMore = visiblePhotos.length < photos.length;

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [photos]);

  if (!photos.length) {
    return (
      <div className="surface-panel p-6 sm:p-8">
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-center">
          <ImageOff className="h-10 w-10 text-zinc-500" />
          <h3 className="mt-4 text-xl font-semibold text-zinc-950">无匹配照片</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
            当前筛选组合下没有对应样本，可以切换景点类型、时段或季节重新查看。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
      {visiblePhotos.map((photo, index) => {
        const isSelected = selectedPhotoId === photo.id;

        return (
          <button
            key={photo.id}
            type="button"
            onClick={() => onSelect(photo)}
            className={[
              'group overflow-hidden rounded-lg border text-left transition duration-300 animate-float-in',
              'bg-white hover:-translate-y-1 hover:border-zinc-300 hover:bg-zinc-50',
              isSelected
                ? 'border-zinc-950/45 shadow-[0_0_0_1px_rgba(24,24,27,0.12)]'
                : 'border-zinc-200',
            ].join(' ')}
            style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
          >
            <ScenicImage
              src={photo.url}
              alt={`${photo.type} ${photo.time} ${photo.season}`}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fallbackTitle={`${photo.type} 图片不可用`}
              fallbackSubtitle="请确认图片路径正确，或将资源放入 public/images 后重新引用。"
            />

            <div className="border-t border-zinc-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-zinc-950">{photo.type}</div>
                  <div className="mt-1 text-sm text-zinc-500">
                    #{photo.id} / {photo.time} / {photo.season}
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-950" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
                <FeatureValue
                  label="色彩"
                  value={`${Math.round(photo.features.color_score * 100)}%`}
                />
                <FeatureValue
                  label="纹理"
                  value={`${Math.round(photo.features.texture_complexity * 100)}%`}
                />
              </div>
            </div>
          </button>
        );
      })}
      </div>

      {hasMore ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <div className="text-sm font-medium text-zinc-950">
              已显示 {visiblePhotos.length} / {photos.length} 张
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              统计和图表已覆盖当前筛选池全部照片，网格按批次加载以保持流畅。
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 active:translate-y-px"
            onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
          >
            加载更多
          </button>
        </div>
      ) : null}
    </div>
  );
}
