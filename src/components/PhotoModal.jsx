import { X } from 'lucide-react';
import { useEffect } from 'react';
import ScenicImage from './ScenicImage';

function DetailRow({ label, value }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

export default function PhotoModal({ photo, onClose }) {
  useEffect(() => {
    if (!photo) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photo, onClose]);

  if (!photo) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="关闭详情弹窗"
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="glass-panel relative z-10 max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[34px]">
        <button
          type="button"
          className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-slate-950/60 p-2 text-slate-200 transition hover:bg-slate-900"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[320px] bg-slate-950">
            <ScenicImage
              src={photo.url}
              alt={`${photo.type} ${photo.time} ${photo.season}`}
              className="h-full w-full object-cover"
              loading="eager"
              fallbackTitle="预览图加载失败"
              fallbackSubtitle="可以关闭弹窗后检查 data.json 中的 url 字段。"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 to-transparent p-6">
              <div className="label-pill">Photo Insight</div>
              <h3 className="mt-3 text-3xl font-semibold text-white">{photo.type}</h3>
              <p className="mt-2 text-sm text-slate-300">
                展示当前图片的分类标签、采样时段与特征指标，适合在答辩时配合看板讲解。
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h4 className="text-lg font-semibold text-white">基础属性</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailRow label="照片编号" value={`#${photo.id}`} />
              <DetailRow label="景点类型" value={photo.type} />
              <DetailRow label="时段" value={photo.time} />
              <DetailRow label="季节" value={photo.season} />
            </div>

            <h4 className="mt-8 text-lg font-semibold text-white">图像特征</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailRow
                label="Color Score"
                value={`${Math.round(photo.features.color_score * 100)}%`}
              />
              <DetailRow
                label="Texture Complexity"
                value={`${Math.round(photo.features.texture_complexity * 100)}%`}
              />
            </div>

            <div className="mt-8 rounded-[28px] border border-cyan-300/[0.15] bg-cyan-300/[0.08] p-5 text-sm leading-7 text-cyan-50">
              可作为你汇报时的补充话术：这张图片已经被系统自动归类到
              <span className="font-semibold text-white">“{photo.type}”</span>，
              当前判断其更偏向
              <span className="font-semibold text-white">“{photo.time}”</span>场景，
              季节标签为
              <span className="font-semibold text-white">“{photo.season}”</span>，
              同时保留颜色与纹理特征，便于后续做更细的相似图片检索或推荐。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
