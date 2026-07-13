import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ScenicImage from './ScenicImage';

function DetailRow({ label, value }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="text-sm text-zinc-600">{label}</div>
      <div className="mt-2 text-lg font-semibold text-zinc-950">{value}</div>
    </div>
  );
}

export default function PhotoModal({ photo, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!photo) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
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
        className="absolute inset-0 bg-zinc-950/[0.42] backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-dialog-title"
        aria-describedby="photo-dialog-description"
        className="surface-panel relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto overscroll-contain"
      >
        <button
          type="button"
          ref={closeButtonRef}
          className="absolute right-4 top-4 z-10 rounded-lg border border-zinc-200 bg-white p-2 text-zinc-800 transition hover:border-zinc-300 hover:text-zinc-950 focus:border-zinc-950/40 focus:outline-none focus:ring-2 focus:ring-zinc-950/10"
          onClick={onClose}
          aria-label="关闭图片详情"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[320px] bg-black">
            <ScenicImage
              src={photo.url}
              alt={`${photo.type} ${photo.time} ${photo.season}`}
              className="h-full w-full object-cover"
              loading="eager"
              fallbackTitle="预览图加载失败"
              fallbackSubtitle="可以关闭弹窗后检查 data.json 中的 url 字段。"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6">
              <h3 id="photo-dialog-title" className="text-3xl font-semibold text-white">
                {photo.type}
              </h3>
              <p id="photo-dialog-description" className="mt-2 text-sm text-zinc-200">
                展示当前图片的分类标签、采样时段与特征指标。
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h4 className="text-lg font-semibold text-zinc-950">基础属性</h4>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailRow label="照片编号" value={`#${photo.id}`} />
              <DetailRow label="景点类型" value={photo.type} />
              <DetailRow label="时段" value={photo.time} />
              <DetailRow label="季节" value={photo.season} />
            </div>

            <h4 className="mt-8 text-lg font-semibold text-zinc-950">图像特征</h4>
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

            <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm leading-7 text-zinc-800">
              这张图片被归类到
              <span className="font-semibold text-zinc-950">“{photo.type}”</span>，
              当前判断其更偏向
              <span className="font-semibold text-zinc-950">“{photo.time}”</span>场景，
              季节标签为
              <span className="font-semibold text-zinc-950">“{photo.season}”</span>，
              同时保留颜色与纹理特征，便于后续做更细的相似图片检索或推荐。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
