import { ArrowUpRight, ImageOff } from 'lucide-react';
import ScenicImage from './ScenicImage';

function FeatureBadge({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default function ImageGrid({ photos, selectedPhotoId, onSelect }) {
  if (!photos.length) {
    return (
      <div className="glass-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/[0.15] bg-white/[0.02] text-center">
          <ImageOff className="h-10 w-10 text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-white">无匹配照片</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
            当前筛选组合下没有对应样本，可以切换景点类型、时段或季节重新查看。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
      {photos.map((photo, index) => {
        const isSelected = selectedPhotoId === photo.id;

        return (
          <button
            key={photo.id}
            type="button"
            onClick={() => onSelect(photo)}
            className={[
              'group relative overflow-hidden rounded-[28px] border text-left transition-all duration-300 animate-float-in',
              'bg-slate-950/50 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(8,18,31,0.3)]',
              isSelected
                ? 'border-cyan-300/60 shadow-[0_0_0_1px_rgba(103,232,249,0.24)]'
                : 'border-white/10',
            ].join(' ')}
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
              <span className="rounded-full border border-white/10 bg-slate-950/[0.55] px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                #{photo.id}
              </span>
              <span className="rounded-full border border-white/10 bg-slate-950/[0.55] px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                {photo.type}
              </span>
            </div>

            <ScenicImage
              src={photo.url}
              alt={`${photo.type} ${photo.time} ${photo.season}`}
              className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              fallbackTitle={`${photo.type} 图片不可用`}
              fallbackSubtitle="请确认图片路径正确，或将资源放入 public/images 后重新引用。"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/[0.88] to-transparent p-4 pt-14">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-slate-100">
                  {photo.time}
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-slate-100">
                  {photo.season}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <FeatureBadge
                  label="色彩分值"
                  value={`${Math.round(photo.features.color_score * 100)}%`}
                />
                <FeatureBadge
                  label="纹理复杂度"
                  value={`${Math.round(photo.features.texture_complexity * 100)}%`}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                <span>点击查看属性详情</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
