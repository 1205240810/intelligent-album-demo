import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ScenicImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fallbackTitle = '图片加载失败',
  fallbackSubtitle = '请检查 data.json 中的 url 路径或图片文件是否存在。',
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={[
          'flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 text-center',
          className,
        ].join(' ')}
      >
        <ImageOff className="h-9 w-9 text-slate-500" />
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-100">{fallbackTitle}</div>
          <div className="text-xs leading-5 text-slate-400">{fallbackSubtitle}</div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
